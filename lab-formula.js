// ---------------------------------------------------------------------------
// A small spreadsheet formula engine.
//
// Enough of Excel to make the lessons *runnable*: the learner types the same
// formula the page is teaching, against the same grid it's showing, and sees
// the real answer — including the real error when they get it wrong. That last
// part matters. A lesson that says "#VALUE! means you did maths on text" is
// worth much less than one where you can produce a #VALUE! yourself.
//
// Deliberately not implemented: iteration, volatile recalculation chains,
// array broadcasting beyond what the dynamic-array lesson needs, and locale
// handling. Anything unsupported returns #NAME? rather than a silent wrong
// answer, because a wrong answer in a teaching tool is the worst outcome.
// ---------------------------------------------------------------------------

import { DateValue, fromSerial, toSerial } from "./lab-data.js";

// --- Values ----------------------------------------------------------------
// A cell value is: number | string | boolean | ErrValue | DateValue.
// A range evaluates to a Matrix (2D array) so array functions can walk it.

// An error optionally carries `why`: the specific reason this one was raised.
// Excel shows you #VALUE! and leaves you guessing; a teaching tool shouldn't.
// Callers that know the cause pass it, and the widget prefers it over the
// generic per-code explanation.
export class ErrValue {
  constructor(code, why) {
    this.code = code;
    this.why = why;
  }
  toString() {
    return this.code;
  }
}
export const ERR = {
  div0: (why) => new ErrValue("#DIV/0!", why),
  value: (why) => new ErrValue("#VALUE!", why),
  ref: (why) => new ErrValue("#REF!", why),
  name: (why) => new ErrValue("#NAME?", why),
  na: (why) => new ErrValue("#N/A", why),
  num: (why) => new ErrValue("#NUM!", why),
  calc: (why) => new ErrValue("#CALC!", why),
  spill: (why) => new ErrValue("#SPILL!", why),
};
export const isErr = (v) => v instanceof ErrValue;

export class Matrix {
  constructor(cells) {
    this.cells = cells; // array of rows
  }
  get rows() {
    return this.cells.length;
  }
  get cols() {
    return this.cells[0] ? this.cells[0].length : 0;
  }
  flat() {
    return this.cells.flat();
  }
}
const isMatrix = (v) => v instanceof Matrix;

// --- Tokenizer -------------------------------------------------------------

const REF_RE = /^\$?[A-Z]{1,3}\$?\d+/;
const COL_RE = /^\$?[A-Z]{1,3}(?=:\$?[A-Z]{1,3}(?![A-Z0-9]))/;
const NAME_RE = /^[A-Za-z_][A-Za-z0-9_.]*/;

function tokenize(src) {
  const out = [];
  let i = 0;
  const rest = () => src.slice(i);

  while (i < src.length) {
    const ch = src[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === '"') {
      let j = i + 1;
      let str = "";
      while (j < src.length) {
        if (src[j] === '"' && src[j + 1] === '"') {
          str += '"';
          j += 2;
          continue;
        }
        if (src[j] === '"') break;
        str += src[j++];
      }
      if (j >= src.length) throw new SyntaxError("Unclosed quote");
      out.push({ t: "str", v: str });
      i = j + 1;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] || ""))) {
      const m = rest().match(/^\d*\.?\d+(?:[eE][+-]?\d+)?/);
      out.push({ t: "num", v: parseFloat(m[0]) });
      i += m[0].length;
      continue;
    }

    // Whole-column ranges (M:M) are consumed in one bite. Emitting the two
    // halves separately would leave the second "M" looking like a name, which
    // is exactly the bug this shape avoids.
    const colM = rest().toUpperCase().match(COL_RE);
    if (colM) {
      const whole = rest().toUpperCase().match(/^\$?([A-Z]{1,3}):\$?([A-Z]{1,3})/);
      out.push({ t: "colrange", from: whole[1], to: whole[2] });
      i += whole[0].length;
      continue;
    }

    const refM = rest().toUpperCase().match(REF_RE);
    if (refM && !/^[A-Za-z0-9_.]/.test(src[i + refM[0].length] || "")) {
      out.push({ t: "ref", v: refM[0] });
      i += refM[0].length;
      continue;
    }

    const nameM = rest().match(NAME_RE);
    if (nameM) {
      out.push({ t: "name", v: nameM[0] });
      i += nameM[0].length;
      continue;
    }

    const two = src.slice(i, i + 2);
    if (two === "<=" || two === ">=" || two === "<>") {
      out.push({ t: "op", v: two });
      i += 2;
      continue;
    }

    if ("+-*/^&=<>(),:%".includes(ch)) {
      out.push({ t: ch === "(" || ch === ")" || ch === "," ? ch : "op", v: ch });
      i++;
      continue;
    }

    if (ch === ";") {
      // Some locales use ; as the argument separator. Accept it either way.
      out.push({ t: ",", v: "," });
      i++;
      continue;
    }

    throw new SyntaxError(`Unexpected character "${ch}"`);
  }
  return out;
}

// --- Parser ----------------------------------------------------------------
// Precedence, loosest first: comparison, &, +-, */, ^, unary, postfix %.

function parse(tokens) {
  let p = 0;
  const peek = () => tokens[p];
  const eat = (t, v) => {
    const tok = tokens[p];
    if (!tok || tok.t !== t || (v !== undefined && tok.v !== v)) {
      throw new SyntaxError(`Expected ${v || t}`);
    }
    p++;
    return tok;
  };

  function parseExpr() {
    let left = parseConcat();
    while (peek() && peek().t === "op" && ["=", "<>", "<", ">", "<=", ">="].includes(peek().v)) {
      const op = tokens[p++].v;
      left = { k: "bin", op, l: left, r: parseConcat() };
    }
    return left;
  }

  function parseConcat() {
    let left = parseAdd();
    while (peek() && peek().t === "op" && peek().v === "&") {
      p++;
      left = { k: "bin", op: "&", l: left, r: parseAdd() };
    }
    return left;
  }

  function parseAdd() {
    let left = parseMul();
    while (peek() && peek().t === "op" && (peek().v === "+" || peek().v === "-")) {
      const op = tokens[p++].v;
      left = { k: "bin", op, l: left, r: parseMul() };
    }
    return left;
  }

  function parseMul() {
    let left = parsePow();
    while (peek() && peek().t === "op" && (peek().v === "*" || peek().v === "/")) {
      const op = tokens[p++].v;
      left = { k: "bin", op, l: left, r: parsePow() };
    }
    return left;
  }

  function parsePow() {
    const left = parseUnary();
    if (peek() && peek().t === "op" && peek().v === "^") {
      p++;
      return { k: "bin", op: "^", l: left, r: parsePow() };
    }
    return left;
  }

  function parseUnary() {
    if (peek() && peek().t === "op" && (peek().v === "-" || peek().v === "+")) {
      const op = tokens[p++].v;
      return { k: "unary", op, x: parseUnary() };
    }
    return parsePostfix();
  }

  function parsePostfix() {
    let node = parsePrimary();
    while (peek() && peek().t === "op" && peek().v === "%") {
      p++;
      node = { k: "pct", x: node };
    }
    return node;
  }

  function parsePrimary() {
    const tok = peek();
    if (!tok) throw new SyntaxError("Formula ends early");

    if (tok.t === "num") {
      p++;
      return { k: "num", v: tok.v };
    }
    if (tok.t === "str") {
      p++;
      return { k: "str", v: tok.v };
    }
    if (tok.t === "(") {
      p++;
      const inner = parseExpr();
      eat(")");
      return inner;
    }
    if (tok.t === "colrange") {
      p++;
      return { k: "colrange", from: tok.from, to: tok.to };
    }
    if (tok.t === "ref") {
      p++;
      if (peek() && peek().t === "op" && peek().v === ":") {
        p++;
        const end = peek();
        if (!end || end.t !== "ref") throw new SyntaxError("Bad range");
        p++;
        return { k: "range", from: tok.v, to: end.v };
      }
      return { k: "ref", v: tok.v };
    }
    if (tok.t === "name") {
      p++;
      const upper = tok.v.toUpperCase();
      if (peek() && peek().t === "(") {
        p++;
        const args = [];
        if (peek() && peek().t !== ")") {
          args.push(parseExpr());
          while (peek() && peek().t === ",") {
            p++;
            // IFS and friends allow trailing gaps; treat an empty slot as blank.
            if (peek() && peek().t === ")") break;
            args.push(parseExpr());
          }
        }
        eat(")");
        return { k: "call", name: upper, args };
      }
      if (upper === "TRUE") return { k: "bool", v: true };
      if (upper === "FALSE") return { k: "bool", v: false };
      return { k: "named", v: tok.v };
    }
    throw new SyntaxError(`Unexpected "${tok.v}"`);
  }

  const ast = parseExpr();
  if (p < tokens.length) throw new SyntaxError(`Unexpected "${tokens[p].v}"`);
  return ast;
}

// --- Coercion --------------------------------------------------------------

const stripDollars = (ref) => ref.replace(/\$/g, "");

export function parseRef(ref) {
  const m = stripDollars(ref).match(/^([A-Z]{1,3})(\d+)$/);
  if (!m) return null;
  return { col: m[1], row: parseInt(m[2], 10) };
}

const colToIndex = (letters) =>
  [...letters].reduce((acc, c) => acc * 26 + (c.charCodeAt(0) - 64), 0);
const indexToCol = (n) => {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};
export { colToIndex, indexToCol };

function toNumber(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (isErr(v)) return v;
  if (v instanceof DateValue) return v.serial;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (t === "") return 0;
    const n = Number(t.replace(/[$,]/g, ""));
    return Number.isNaN(n) ? ERR.value(`"${t}" is text, and it can't be used as a number here.`) : n;
  }
  return ERR.value();
}

function toText(v) {
  if (v === null || v === undefined) return "";
  if (isErr(v)) return v.code;
  if (v instanceof DateValue) return String(v.serial);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return String(Math.round(v * 1e10) / 1e10);
  return String(v);
}

function toBool(v) {
  if (isErr(v)) return v;
  if (typeof v === "boolean") return v;
  const n = toNumber(v);
  if (isErr(n)) return n;
  return n !== 0;
}

const isBlank = (v) => v === null || v === undefined || v === "";

// --- Evaluator -------------------------------------------------------------
//
// `sheet` is the environment: { get(col, row), maxRow, colKeys }.

export function evaluate(ast, sheet) {
  const ev = (node) => {
    switch (node.k) {
      case "num":
        return node.v;
      case "str":
        return node.v;
      case "bool":
        return node.v;
      case "named":
        return ERR.name();
      case "ref": {
        const r = parseRef(node.v);
        if (!r) return ERR.ref();
        return sheet.get(r.col, r.row);
      }
      case "range":
        return rangeMatrix(node.from, node.to, sheet);
      case "colrange":
        return colMatrix(node.from, node.to, sheet);
      case "unary": {
        const x = ev(node.x);
        // `--(A1:A9>0)` is the classic way to turn TRUE/FALSE into 1/0 across a
        // whole range, so unary minus has to work elementwise too.
        const one = (v) => {
          const n = toNumber(v);
          if (isErr(n)) return n;
          return node.op === "-" ? -n : n;
        };
        return isMatrix(x) ? mapMatrix(x, one) : one(single(x));
      }
      case "pct": {
        const n = toNumber(single(ev(node.x)));
        return isErr(n) ? n : n / 100;
      }
      case "bin":
        return binop(node.op, ev(node.l), ev(node.r));
      case "call":
        return callFn(node.name, node.args, ev, sheet);
      default:
        return ERR.value();
    }
  };
  return ev(ast);
}

// A range used where a single value is expected collapses to its first cell.
function single(v) {
  if (isMatrix(v)) {
    const flat = v.flat();
    return flat.length ? flat[0] : "";
  }
  return v;
}

function rangeMatrix(from, to, sheet) {
  const a = parseRef(from);
  const b = parseRef(to);
  if (!a || !b) return ERR.ref();
  const c1 = Math.min(colToIndex(a.col), colToIndex(b.col));
  const c2 = Math.max(colToIndex(a.col), colToIndex(b.col));
  const r1 = Math.min(a.row, b.row);
  const r2 = Math.max(a.row, b.row);
  const cells = [];
  for (let r = r1; r <= r2; r++) {
    const row = [];
    for (let c = c1; c <= c2; c++) row.push(sheet.get(indexToCol(c), r));
    cells.push(row);
  }
  return new Matrix(cells);
}

function colMatrix(from, to, sheet) {
  const c1 = Math.min(colToIndex(from), colToIndex(to));
  const c2 = Math.max(colToIndex(from), colToIndex(to));
  const cells = [];
  for (let r = 1; r <= sheet.maxRow; r++) {
    const row = [];
    for (let c = c1; c <= c2; c++) row.push(sheet.get(indexToCol(c), r));
    cells.push(row);
  }
  return new Matrix(cells);
}

export function mapMatrix(m, fn) {
  return new Matrix(m.cells.map((row) => row.map(fn)));
}

// An operator with a range on either side applies elementwise and returns an
// array. This is what makes `M2:M99="West"` produce a column of TRUE/FALSE —
// the raw material for FILTER's condition and for SUMPRODUCT.
function binop(op, l, r) {
  if (isMatrix(l) || isMatrix(r)) {
    const rows = Math.max(isMatrix(l) ? l.rows : 1, isMatrix(r) ? r.rows : 1);
    const cols = Math.max(isMatrix(l) ? l.cols : 1, isMatrix(r) ? r.cols : 1);
    if (isMatrix(l) && isMatrix(r) && (l.rows !== r.rows || l.cols !== r.cols)) {
      const compatible =
        (l.rows === r.rows && (l.cols === 1 || r.cols === 1)) ||
        (l.cols === r.cols && (l.rows === 1 || r.rows === 1));
      if (!compatible) {
        return ERR.value(
          `Those ranges are different shapes (${l.rows}×${l.cols} and ${r.rows}×${r.cols}), so they can't be combined cell by cell.`,
        );
      }
    }
    const pick = (m, i, j) =>
      isMatrix(m) ? m.cells[m.rows === 1 ? 0 : i][m.cols === 1 ? 0 : j] : m;
    const out = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) row.push(scalarOp(op, pick(l, i, j), pick(r, i, j)));
      out.push(row);
    }
    return new Matrix(out);
  }
  return scalarOp(op, single(l), single(r));
}

function scalarOp(op, l, r) {
  const lv = single(l);
  const rv = single(r);
  if (isErr(lv)) return lv;
  if (isErr(rv)) return rv;

  if (op === "&") return toText(lv) + toText(rv);

  if (["=", "<>", "<", ">", "<=", ">="].includes(op)) {
    const bothText = typeof lv === "string" && typeof rv === "string";
    const a = bothText ? lv.toLowerCase() : toNumber(lv);
    const b = bothText ? rv.toLowerCase() : toNumber(rv);
    if (isErr(a)) return a;
    if (isErr(b)) return b;
    switch (op) {
      case "=": return a === b;
      case "<>": return a !== b;
      case "<": return a < b;
      case ">": return a > b;
      case "<=": return a <= b;
      default: return a >= b;
    }
  }

  const a = toNumber(lv);
  const b = toNumber(rv);
  if (isErr(a)) return a;
  if (isErr(b)) return b;
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? ERR.div0() : a / b;
    case "^": return Math.pow(a, b);
    default: return ERR.value();
  }
}

// --- Criteria matching (the SUMIF / COUNTIF family) -------------------------
//
// Criteria are the part people get wrong most often, so this mirrors Excel's
// real behaviour closely: operators inside the string, case-insensitive text,
// and * / ? wildcards on text only.

export function matchCriteria(value, criteria) {
  let crit = criteria;
  if (crit instanceof DateValue) crit = crit.serial;
  let op = "=";
  if (typeof crit === "string") {
    const m = crit.match(/^(<=|>=|<>|<|>|=)(.*)$/);
    if (m) {
      op = m[1];
      const rest = m[2];
      const asNum = rest === "" ? "" : Number(rest);
      crit = rest !== "" && !Number.isNaN(asNum) ? asNum : rest;
    }
  }

  const val = value instanceof DateValue ? value.serial : value;

  if (op === "=" || op === "<>") {
    let hit;
    if (typeof crit === "string" && /[*?]/.test(crit)) {
      const rx = new RegExp(
        "^" + crit.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$",
        "i",
      );
      hit = typeof val === "string" && rx.test(val);
    } else if (typeof crit === "string" && typeof val === "string") {
      hit = val.toLowerCase() === crit.toLowerCase();
    } else if (crit === "") {
      hit = isBlank(val);
    } else {
      const a = toNumber(val);
      const b = toNumber(crit);
      hit = !isErr(a) && !isErr(b) && a === b;
    }
    return op === "=" ? hit : !hit;
  }

  const a = typeof val === "string" && typeof crit === "string" ? val.toLowerCase() : toNumber(val);
  const b = typeof val === "string" && typeof crit === "string" ? crit.toLowerCase() : toNumber(crit);
  if (isErr(a) || isErr(b)) return false;
  switch (op) {
    case "<": return a < b;
    case ">": return a > b;
    case "<=": return a <= b;
    default: return a >= b;
  }
}

export { toNumber, toText, toBool, single, isMatrix, isBlank };

// --- Function library ------------------------------------------------------

import { FUNCTIONS } from "./lab-functions.js";

function callFn(name, argNodes, ev, sheet) {
  const fn = FUNCTIONS[name];
  if (!fn) return ERR.name();
  // IF / IFS / IFERROR need their arguments unevaluated so the untaken branch
  // never runs — that's what makes IFERROR able to swallow a division by zero.
  if (fn.lazy) return fn.call(argNodes, ev, sheet);
  const args = argNodes.map(ev);
  const bad = args.find((a) => isErr(a) && !fn.passErrors);
  if (bad) return bad;
  // Scalar functions handed a range map over it, so `LEN(M2:M99)` gives a
  // column of lengths rather than the length of the first cell.
  if (fn.elementwise && isMatrix(args[0])) {
    return mapMatrix(args[0], (v) => fn.call([v, ...args.slice(1)], sheet));
  }
  return fn.call(args, sheet);
}

// --- Public entry point ----------------------------------------------------

export function compute(formula, sheet) {
  let src = String(formula || "").trim();
  if (src.startsWith("=")) src = src.slice(1);
  if (!src) return { value: "", refs: [] };
  try {
    const ast = parse(tokenize(src));
    const value = evaluate(ast, sheet);
    return { value, refs: collectRefs(ast, sheet), ast };
  } catch (err) {
    return { value: ERR.name(), refs: [], syntax: err.message };
  }
}

// Which cells does this formula touch? Used to light up the grid while you
// type — the single most useful thing a teaching spreadsheet can show.
export function collectRefs(ast, sheet) {
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (node.k === "ref") {
      const r = parseRef(node.v);
      if (r) out.push({ col: r.col, row: r.row, kind: "cell" });
    } else if (node.k === "range") {
      const a = parseRef(node.from);
      const b = parseRef(node.to);
      if (a && b) {
        const c1 = Math.min(colToIndex(a.col), colToIndex(b.col));
        const c2 = Math.max(colToIndex(a.col), colToIndex(b.col));
        for (let r = Math.min(a.row, b.row); r <= Math.max(a.row, b.row); r++) {
          for (let c = c1; c <= c2; c++) out.push({ col: indexToCol(c), row: r, kind: "range" });
        }
      }
    } else if (node.k === "colrange") {
      const c1 = Math.min(colToIndex(node.from), colToIndex(node.to));
      const c2 = Math.max(colToIndex(node.from), colToIndex(node.to));
      for (let r = 1; r <= (sheet ? sheet.maxRow : 0); r++) {
        for (let c = c1; c <= c2; c++) out.push({ col: indexToCol(c), row: r, kind: "range" });
      }
    }
    Object.values(node).forEach((v) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") walk(v);
    });
  };
  walk(ast);
  return out;
}

export { tokenize, parse, fromSerial, toSerial };
