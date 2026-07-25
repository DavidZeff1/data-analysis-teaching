// ---------------------------------------------------------------------------
// The interactive lab widget.
//
// Lessons already show a static `.sheet` — a picture of a spreadsheet. This
// turns that same picture into a live one: the learner types a formula against
// the 32-row practice extract and sees the real answer, the real error, and
// exactly which cells the formula touched.
//
// The highlighting is the part that teaches. Reading "=SUMIF(M2:M33,"West",
// R2:R33) adds up Sales where Region is West" is one thing; watching the
// Region column light up as the criteria range and the Sales column light up
// as the sum range is what makes the argument order stick.
//
// Usage from a lesson fragment:
//   <div data-lab data-formula='=SUMIF(M2:M33,"West",R2:R33)'></div>
// Optional attributes:
//   data-cols="M,R,U"   columns to show ("*" for all; referenced columns are
//                       revealed automatically whatever this says)
//   data-examples="=A|=B"  one-click formulas offered under the bar
//   data-note="..."     replaces the default caption
// ---------------------------------------------------------------------------

import { COLUMNS, COL_BY_KEY, ROWS, DateValue } from "./lab-data.js";
import { compute, isErr, isMatrix, colToIndex } from "./lab-formula.js";
import { formatValue } from "./lab-functions.js";

// Columns worth showing before the formula tells us otherwise: the ones the
// analysis lessons actually aggregate on. The rest stay hidden until referenced.
const DEFAULT_COLS = ["C", "G", "H", "M", "O", "P", "R", "S", "T", "U"];

// How each column type renders in the grid, mirroring the real import's formats.
const DISPLAY_FORMAT = {
  money: "$#,##0.00",
  pct: "0%",
  date: "mm/dd/yyyy",
};

// Plain-English cause for each error. A teaching tool that shows #VALUE! and
// stops there has taught nothing; the point is why it happened.
const ERROR_HELP = {
  "#DIV/0!": "Something was divided by zero — often an empty cell used as the divisor.",
  "#VALUE!": "A text value turned up where a number was needed.",
  "#REF!": "A reference points at a cell or column that isn't there.",
  "#NAME?": "Unknown function or a typo in the name — check the spelling.",
  "#N/A": "A lookup ran but found no match.",
  "#NUM!": "The maths can't produce a number (a negative square root, say).",
  "#CALC!": "An array function came back empty.",
  "#SPILL!": "The result is too large to spill into this grid.",
};

// The environment the evaluator reads: row 1 is the header, rows 2..33 the data.
export function makeSheet(rows = ROWS) {
  return {
    maxRow: rows.length + 1,
    colKeys: COLUMNS.map((c) => c.key),
    hiddenRows: new Set(),
    get(col, row) {
      if (row === 1) return COL_BY_KEY[col] ? COL_BY_KEY[col].name : "";
      const r = rows[row - 2];
      if (!r) return "";
      return r[col] === undefined ? "" : r[col];
    },
  };
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// How a single cell reads in the grid.
function displayCell(value, colKey) {
  if (value === "" || value === null || value === undefined) return "";
  if (isErr(value)) return value.code;
  const col = COL_BY_KEY[colKey];
  const fmt = col ? DISPLAY_FORMAT[col.type] : null;
  const out = fmt ? formatValue(value, fmt) : value;
  return isErr(out) ? out.code : String(out);
}

// How the computed answer reads in the result strip. Arrays get shown as the
// spill they are, because "this returns 14 rows" is the lesson in FILTER.
function displayResult(value) {
  // A reason attached at the point the error was raised beats the generic
  // per-code blurb — it can name the actual ranges that didn't line up.
  if (isErr(value)) return { kind: "err", text: value.code, help: value.why || ERROR_HELP[value.code] || "" };
  if (value === "" || value === null || value === undefined) return { kind: "empty", text: "(blank)" };

  if (isMatrix(value)) {
    const flat = value.flat();
    const shown = flat.slice(0, 8).map((v) => displayCell(v, null) || "(blank)");
    const more = flat.length > shown.length ? ` … +${flat.length - shown.length} more` : "";
    return {
      kind: "spill",
      text: shown.join("  ·  ") + more,
      help: `Spilled array — ${value.rows} row${value.rows === 1 ? "" : "s"} × ${value.cols} column${value.cols === 1 ? "" : "s"}.`,
    };
  }

  if (value instanceof DateValue) {
    const out = formatValue(value, "mm/dd/yyyy");
    return { kind: "ok", text: isErr(out) ? out.code : String(out), help: `Date serial ${value.serial}.` };
  }
  if (typeof value === "boolean") return { kind: "ok", text: value ? "TRUE" : "FALSE", help: "" };
  if (typeof value === "number") {
    const rounded = Math.round(value * 1e10) / 1e10;
    // Big non-integers are almost always money in this dataset.
    const text =
      Number.isInteger(rounded) || Math.abs(rounded) < 1
        ? String(rounded)
        : formatValue(rounded, "#,##0.00");
    return { kind: "ok", text: isErr(text) ? String(rounded) : String(text), help: "" };
  }
  return { kind: "ok", text: String(value), help: "" };
}

function buildGrid(visibleCols, refMap) {
  const head = visibleCols
    .map((k) => `<th class="${refMap.cols.has(k) ? "hl" : ""}">${k}</th>`)
    .join("");

  const headerRow = `<tr class="hd"><th>1</th>${visibleCols
    .map((k) => `<td class="hd${refMap.cols.has(k) ? " hl" : ""}">${esc(COL_BY_KEY[k].name)}</td>`)
    .join("")}</tr>`;

  const body = ROWS.map((row, i) => {
    const rowNum = i + 2;
    const cells = visibleCols
      .map((k) => {
        const col = COL_BY_KEY[k];
        const numeric = col.type === "num" || col.type === "money" || col.type === "pct";
        const key = `${k}${rowNum}`;
        const hit = refMap.cells.get(key);
        const cls = [numeric ? "num" : "", hit === "cell" ? "sel" : hit ? "hl" : ""]
          .filter(Boolean)
          .join(" ");
        return `<td class="${cls}">${esc(displayCell(row[k], k))}</td>`;
      })
      .join("");
    return `<tr><th>${rowNum}</th>${cells}</tr>`;
  }).join("");

  return `<table><thead><tr><th></th>${head}</tr></thead><tbody>${headerRow}${body}</tbody></table>`;
}

function mountOne(host) {
  const sheet = makeSheet();

  const baseCols =
    host.dataset.cols === "*"
      ? COLUMNS.map((c) => c.key)
      : (host.dataset.cols || DEFAULT_COLS.join(","))
          .split(",")
          .map((s) => s.trim())
          .filter((k) => COL_BY_KEY[k]);

  const examples = (host.dataset.examples || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const startFormula = host.dataset.formula || '=SUMIF(M2:M33,"West",R2:R33)';

  host.classList.add("sheet", "lab");
  host.innerHTML = `
    <div class="sheet-bar">
      <span class="sheet-fx">fx</span>
      <input class="lab-input" type="text" spellcheck="false" autocomplete="off"
             aria-label="Formula" value="${esc(startFormula)}">
    </div>
    <div class="lab-out" role="status" aria-live="polite"></div>
    ${
      examples.length
        ? `<div class="lab-chips">${examples
            .map((f) => `<button type="button" class="lab-chip">${esc(f)}</button>`)
            .join("")}</div>`
        : ""
    }
    <div class="sheet-scroll lab-scroll"></div>
    <p class="sheet-note">${esc(
      host.dataset.note ||
        "Live sheet — edit the formula and the answer and highlighting update as you type. Referenced cells are tinted; the column a formula reads is revealed automatically.",
    )}</p>`;

  const input = host.querySelector(".lab-input");
  const out = host.querySelector(".lab-out");
  const scroll = host.querySelector(".lab-scroll");

  function render() {
    const src = input.value;
    const { value, refs, syntax } = compute(src, sheet);

    // Which cells did it touch? Exact cell refs outrank range membership so a
    // single referenced cell still reads as the selected one.
    const refMap = { cells: new Map(), cols: new Set() };
    refs.forEach((r) => {
      const key = `${r.col}${r.row}`;
      if (r.kind === "cell" || !refMap.cells.has(key)) refMap.cells.set(key, r.kind);
      refMap.cols.add(r.col);
    });

    // Reveal any column the formula reads, then restore the lesson's order.
    const cols = [...new Set([...baseCols, ...refMap.cols])]
      .filter((k) => COL_BY_KEY[k])
      .sort((a, b) => colToIndex(a) - colToIndex(b));

    scroll.innerHTML = buildGrid(cols, refMap);

    if (!src.trim()) {
      out.className = "lab-out";
      out.innerHTML = `<span class="lab-hint">Type a formula to see it run.</span>`;
      return;
    }

    const res = displayResult(value);
    // A syntax error and an unknown name both surface as #NAME?; say which.
    const help = syntax ? `Couldn't parse that: ${syntax}.` : res.help;
    out.className = `lab-out is-${res.kind}`;
    out.innerHTML =
      `<span class="lab-eq">=</span><span class="lab-val">${esc(res.text)}</span>` +
      (help ? `<span class="lab-help">${esc(help)}</span>` : "");
  }

  input.addEventListener("input", render);
  host.querySelectorAll(".lab-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.textContent;
      input.focus();
      render();
    });
  });

  render();
}

// Mount every lab in a freshly loaded fragment. Idempotent: a pane that gets
// revealed again keeps the lab the learner was already typing in.
export function mountLabs(root = document) {
  root.querySelectorAll("[data-lab]").forEach((host) => {
    if (host.dataset.labReady) return;
    host.dataset.labReady = "1";
    try {
      mountOne(host);
    } catch (err) {
      host.innerHTML = `<p class="sheet-note">This interactive couldn't start.</p>`;
      console.error("lab mount failed", err);
    }
  });
}
