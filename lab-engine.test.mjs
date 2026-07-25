// ---------------------------------------------------------------------------
// Regression tests for the lab formula engine.
//
// Run with `npm test` (plain node, no framework — the project has no test
// dependencies and this doesn't add any).
//
// Every expected value here was verified against the 32-row extract by
// computing it independently from the raw rows, not by reading it off the
// engine. That distinction is the whole point: these lock in *correct*
// behaviour, so a future change that breaks a lesson's printed formula fails
// here first.
// ---------------------------------------------------------------------------

import { COLUMNS, ROWS, DateValue } from "./lab-data.js";
import { compute, isErr } from "./lab-formula.js";
import { formatValue } from "./lab-functions.js";

// The sheet the widgets present: row 1 is the header, rows 2..33 the data.
const sheet = {
  maxRow: ROWS.length + 1,
  colKeys: COLUMNS.map((c) => c.key),
  get(col, row) {
    if (row === 1) {
      const c = COLUMNS.find((x) => x.key === col);
      return c ? c.name : "";
    }
    const r = ROWS[row - 2];
    if (!r) return "";
    return r[col] === undefined ? "" : r[col];
  },
};

const show = (v) => {
  if (v === null || v === undefined) return "(blank)";
  if (isErr(v)) return v.code;
  if (v instanceof DateValue) return `date:${v.serial}`;
  if (v && v.cells) return `[${v.rows}x${v.cols}]`;
  if (typeof v === "number") return String(Math.round(v * 1e6) / 1e6);
  return JSON.stringify(v);
};

let pass = 0;
const failures = [];

function t(formula, expected) {
  const { value, syntax } = compute(formula, sheet);
  const got = show(value);
  if (String(got) === String(expected)) pass++;
  else failures.push({ formula, expected, got, syntax });
}

// --- Arithmetic & operators -------------------------------------------------
t("=2+3*4", 14);
t("=(2+3)*4", 20);
t("=2^3^2", 512); // right-associative
t("=-3^2", 9); // unary minus binds first, as Excel does
t("=50%", 0.5);
t('="a"&"b"', '"ab"');
t("=1/0", "#DIV/0!");
t('="x"+1', "#VALUE!");
t("=SUM(1,2)+LEN(\"ab\")", 5);

// --- Refs, ranges, aggregation ----------------------------------------------
t("=R2", 261.96);
t("=SUM(R2:R33)", 13239.86);
t("=COUNT(R2:R33)", 32);
t("=COUNTA(M2:M33)", 32);
t("=MAX(R2:R33)", 1799.99);
t("=MIN(U2:U33)", -459.55);
t("=ROUND(AVERAGE(R2:R33),2)", 413.75);
t("=ROUND(MEDIAN(R2:R33),2)", 114.12); // mean of the 16th/17th sales values

// Whole-column ranges — the tokenizer's awkward case (M:M must not read as a name).
t("=COUNTA(M:M)", 33); // header + 32 rows
t('=COUNTIF(M:M,"West")', 14);

// --- Criteria family --------------------------------------------------------
t('=SUMIF(M2:M33,"West",R2:R33)', 5073.7);
t('=COUNTIF(O2:O33,"Furniture")', 9);
t('=COUNTIF(O2:O33,"*Supplies")', 16); // wildcard
t('=COUNTIF(U2:U33,"<0")', 7); // operator inside the criteria string
t('=SUMIFS(R2:R33,M2:M33,"West",O2:O33,"Technology")', 2577.99);
t('=ROUND(AVERAGEIF(M2:M33,"East",R2:R33),2)', 599.48);
t('=MAXIFS(R2:R33,M2:M33,"Central")', 665.88);
t('=SUMPRODUCT((M2:M33="West")*(R2:R33))', 5073.7);

// --- Lookup -----------------------------------------------------------------
t('=VLOOKUP("CG-12520",F2:R33,13,FALSE)', 261.96);
t('=VLOOKUP("ZZ-99999",F2:R33,13,FALSE)', "#N/A");
t('=XLOOKUP("Copiers",P2:P33,R2:R33)', 1799.99);
t('=XLOOKUP("Nope",P2:P33,R2:R33,"none")', '"none"');
t('=MATCH("Copiers",P2:P33,0)', 29);
t('=INDEX(R2:R33,MATCH("Copiers",P2:P33,0))', 1799.99);

// --- Logic ------------------------------------------------------------------
t('=IF(U2>0,"profit","loss")', '"profit"');
t('=IFERROR(1/0,"safe")', '"safe"'); // lazy: the error is never raised
t('=IFS(R2>1000,"big",R2>100,"mid",TRUE,"small")', '"mid"');
t("=AND(R2>100,U2>0)", true);
t("=OR(FALSE,FALSE)", false);
t("=NOT(ISBLANK(R2))", true);
t("=ISNUMBER(C2)", true); // a date is a number

// --- Text -------------------------------------------------------------------
t('=LEFT("Furniture",4)', '"Furn"');
t('=RIGHT("Furniture",4)', '"ture"');
t('=MID("Furniture",4,3)', '"nit"');
t("=LEN(Q2)", 17);
t("=UPPER(M2)", '"SOUTH"');
t('=PROPER("claire gute")', '"Claire Gute"');
t('=TRIM("  a   b  ")', '"a b"');
t('=SUBSTITUTE("a-b-c","-","+",2)', '"a-b+c"');
t('=TEXTJOIN(", ",TRUE,"a","","b")', '"a, b"');
t('=FIND("nit","Furniture")', 4);
t('=SEARCH("NIT","Furniture")', 4); // case-insensitive, unlike FIND
t('=VALUE("$1,234.50")', 1234.5);

// --- Dates ------------------------------------------------------------------
t("=YEAR(C2)", 2016);
t("=MONTH(C2)", 11);
t("=DAY(C2)", 8);
t("=D2-C2", 3);
t('=TEXT(C2,"yyyy-mm")', '"2016-11"');
t('=TEXT(C2,"mmm dd, yyyy")', '"Nov 08, 2016"');
t('=DATEDIF(C2,D2,"d")', 3);
t("=NETWORKDAYS(C2,D2)", 4);
t("=WEEKDAY(C2)", 3);
t("=EOMONTH(C2,0)", "date:42704");

// --- Dynamic arrays ---------------------------------------------------------
t('=ROWS(FILTER(R2:R33,M2:M33="West"))', 14);
t("=ROWS(UNIQUE(M2:M33))", 4);
t("=SUM(SEQUENCE(10))", 55);
t("=ROWS(SORT(R2:R33))", 32);
t("=COUNT(TAKE(R2:R33,5))", 5);

// --- Grid display formatting ------------------------------------------------
const fmt = (v, f, expected) => {
  const got = formatValue(v, f);
  if (String(got) === expected) pass++;
  else failures.push({ formula: `formatValue(${JSON.stringify(v)}, ${JSON.stringify(f)})`, expected, got });
};
fmt(1234.5, "$#,##0.00", "$1,234.50");
fmt(-59.93, "$#,##0.00", "-$59.93");
fmt(0.2, "0%", "20%");
// Quoted literals survive the d/m/y substitutions intact.
fmt(ROWS[0].C, 'mmm " of " yyyy', "Nov  of  2016");
fmt(ROWS[0].C, "dddd", "Tuesday");

// --- Errors explain themselves ----------------------------------------------
// The widget shows `why` when it's there, so the specific causes the lessons
// teach must arrive with one rather than falling back to the generic blurb.
const why = (formula, needle) => {
  const { value } = compute(formula, sheet);
  const got = isErr(value) ? value.why || "" : `(not an error: ${show(value)})`;
  if (got.toLowerCase().includes(needle.toLowerCase())) pass++;
  else failures.push({ formula: `why: ${formula}`, expected: `…${needle}…`, got: got || "(no reason given)" });
};
// The size-mismatch trap the aggregation lesson calls out by name, in both
// the places it can bite: sum-range vs criteria-range…
why('=SUMIFS(R2:R33,M2:M5000,"West")', "sum range is 32 rows");
// …and one criteria range against another.
why('=SUMIFS(R2:R33,M2:M33,"West",O2:O20,"Technology")', "different heights");
why('=SUMPRODUCT(R2:R33,M2:M20)', "different sizes");
why('=FILTER(R2:R33,M2:M20="West")', "line up");
why('="x"+1', "is text");

// --- Report -----------------------------------------------------------------
for (const f of failures) {
  console.error(`FAIL  ${f.formula}\n      expected: ${f.expected}\n      got:      ${f.got}${f.syntax ? `  (${f.syntax})` : ""}`);
}
console.log(`${pass} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
