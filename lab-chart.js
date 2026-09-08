// ---------------------------------------------------------------------------
// lab-chart.js — the interactive chart widgets for the Excel charts lesson.
//
// Reading "don't put seventeen slices in a pie" teaches almost nothing. Making
// a seventeen-slice pie, seeing it, and then switching it to a sorted bar in
// one click teaches it permanently. So these widgets are built the way the
// formula lab is built: real data, real controls, and an explanation of what
// just happened rather than a picture of it.
//
// Three widgets live here:
//
//   [data-chart-studio]    the studio — pick data, pick a chart type, then
//                          turn every formatting dial Excel gives you and
//                          watch the chart, the critique, and the matching
//                          Excel menu path update together.
//   [data-chart-anatomy]   the named parts of a chart, and how to select and
//                          format each one.
//   [data-chart-compare]   a fixed pair of specs shown side by side, for the
//                          before/after points the prose makes.
//
// The numbers are the real Sample Superstore figures from lab-data.js, so a
// chart built here matches the one the learner builds in Excel.
//
// Colours come from CSS custom properties (`--kc-*`) set on `.chartlab` rather
// than from hard-coded hex, so the charts follow the site's dark theme without
// the fragment palette remap in style.css having to know about them.
// ---------------------------------------------------------------------------

import { FULL, ROWS, REGIONS, CATEGORIES } from "./lab-data.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------------------------------------------------------------------------
// The datasets you can chart
//
// `kind` is the fact that decides which charts are honest:
//   nominal — unordered names. Nothing joins them, so nothing should be drawn
//             joining them: no line, no area.
//   ordinal — ordered bands. The order means something but the spacing may not.
//   time    — ordered and evenly spaced. A line is reading the shape of it.
//   xy      — two numbers per row. Only a scatter shows both.
// ---------------------------------------------------------------------------

const CAT_PROFIT = FULL.byCategoryProfit;

export const CHART_DATA = {
  region: {
    name: "Sales by Region",
    story: "Four regions, one number each. The reader's question is 'who is biggest, and by how much?'",
    kind: "nominal",
    catLabel: "Region",
    valLabel: "Sales",
    format: "money",
    categories: REGIONS.slice(),
    series: [{ name: "Sales", values: REGIONS.map((r) => FULL.byRegion[r]) }],
    defaultType: "column",
    good: ["column", "bar"],
    avoid: ["line", "area", "stacked100"],
  },

  category: {
    name: "Sales by Category",
    story: "Three categories that make up the whole business — so this one can legitimately be a pie.",
    kind: "nominal",
    catLabel: "Category",
    valLabel: "Sales",
    format: "money",
    categories: CATEGORIES.slice(),
    series: [{ name: "Sales", values: CATEGORIES.map((c) => FULL.byCategory[c]) }],
    defaultType: "column",
    good: ["column", "bar", "pie", "donut"],
    avoid: ["line", "area"],
  },

  mix: {
    name: "Sales by Region × Category",
    story: "Two questions at once: how big is each region, and what is each region made of?",
    kind: "nominal",
    catLabel: "Region",
    valLabel: "Sales",
    format: "money",
    categories: REGIONS.slice(),
    series: CATEGORIES.map((c) => ({ name: c, values: REGIONS.map((r) => FULL.crosstab[r][c]) })),
    defaultType: "stacked",
    good: ["stacked", "column", "bar", "stacked100"],
    avoid: ["pie", "donut", "line"],
  },

  trend: {
    name: "Monthly sales, 2017",
    story: "Twelve points in order. The question is the shape — where it climbs, where it dips.",
    kind: "time",
    catLabel: "Month",
    valLabel: "Sales",
    format: "money",
    categories: MONTHS.slice(),
    series: [{ name: "2017", values: FULL.monthly[2017].slice() }],
    defaultType: "line",
    good: ["line", "area", "column"],
    avoid: ["pie", "donut", "stacked100", "bar"],
  },

  trend4: {
    name: "Monthly sales, 2014–2017",
    story: "The same twelve months, four years deep. Is the seasonal shape repeating, and is the level rising?",
    kind: "time",
    catLabel: "Month",
    valLabel: "Sales",
    format: "money",
    categories: MONTHS.slice(),
    series: [2014, 2015, 2016, 2017].map((y) => ({ name: String(y), values: FULL.monthly[y].slice() })),
    defaultType: "line",
    good: ["line"],
    avoid: ["pie", "donut", "bar", "stacked"],
  },

  subprofit: {
    name: "Profit by Sub-Category",
    story: "Seventeen names, and three of them lose money. The chart has to make the losers unmissable.",
    kind: "nominal",
    catLabel: "Sub-Category",
    valLabel: "Profit",
    format: "money",
    categories: FULL.subCategoryProfit.map((p) => p[0]),
    series: [{ name: "Profit", values: FULL.subCategoryProfit.map((p) => p[1]) }],
    defaultType: "bar",
    good: ["bar"],
    avoid: ["pie", "donut", "line", "area", "stacked100"],
  },

  discount: {
    name: "Average margin by discount band",
    story: "Ordered bands, and a number that crosses zero. This is the chart that found the Superstore's problem.",
    kind: "ordinal",
    catLabel: "Discount band",
    valLabel: "Avg margin",
    format: "pct",
    categories: FULL.discountBands.map((d) => d[0]),
    series: [{ name: "Avg margin", values: FULL.discountBands.map((d) => d[1]) }],
    defaultType: "column",
    good: ["column", "line", "bar"],
    avoid: ["pie", "donut", "stacked100"],
  },

  combo: {
    name: "Sales and margin by Category",
    story: "Dollars and a percentage on one chart. Two units means two axes — or a misleading picture.",
    kind: "nominal",
    catLabel: "Category",
    valLabel: "Sales",
    format: "money",
    categories: CATEGORIES.slice(),
    series: [
      { name: "Sales", values: CATEGORIES.map((c) => FULL.byCategory[c]) },
      {
        name: "Margin %",
        format: "pct",
        secondary: true,
        values: CATEGORIES.map((c) => CAT_PROFIT[c] / FULL.byCategory[c]),
      },
    ],
    defaultType: "combo",
    good: ["combo"],
    avoid: ["pie", "donut", "stacked", "stacked100", "area"],
  },

  scatter: {
    name: "Discount vs Profit (32 orders)",
    story: "Two numbers per order. Neither one is a category, so neither one belongs on a category axis.",
    kind: "xy",
    xLabel: "Discount",
    yLabel: "Profit",
    xFormat: "pct",
    format: "money",
    points: ROWS.map((r) => ({ x: r.T, y: r.U, label: r.P })),
    defaultType: "scatter",
    good: ["scatter"],
    avoid: ["column", "bar", "line", "area", "pie", "donut", "stacked", "stacked100", "combo"],
  },
};

// ---------------------------------------------------------------------------
// Chart types
// ---------------------------------------------------------------------------

export const CHART_TYPES = [
  { id: "column", name: "Column", family: "cartesian", ribbon: "Insert ▸ Column or Bar Chart ▸ Clustered Column" },
  { id: "bar", name: "Bar", family: "cartesian", ribbon: "Insert ▸ Column or Bar Chart ▸ Clustered Bar" },
  { id: "line", name: "Line", family: "cartesian", ribbon: "Insert ▸ Line or Area Chart ▸ Line with Markers" },
  { id: "area", name: "Area", family: "cartesian", ribbon: "Insert ▸ Line or Area Chart ▸ Area" },
  { id: "stacked", name: "Stacked", family: "cartesian", ribbon: "Insert ▸ Column or Bar Chart ▸ Stacked Column" },
  { id: "stacked100", name: "100% stacked", family: "cartesian", ribbon: "Insert ▸ Column or Bar Chart ▸ 100% Stacked Column" },
  { id: "combo", name: "Combo", family: "cartesian", ribbon: "Insert ▸ Combo Chart ▸ Clustered Column – Line on Secondary Axis" },
  { id: "pie", name: "Pie", family: "radial", ribbon: "Insert ▸ Pie or Doughnut Chart ▸ Pie" },
  { id: "donut", name: "Doughnut", family: "radial", ribbon: "Insert ▸ Pie or Doughnut Chart ▸ Doughnut" },
  { id: "scatter", name: "Scatter", family: "xy", ribbon: "Insert ▸ Scatter (X, Y) ▸ Scatter" },
];

const TYPE_BY_ID = Object.fromEntries(CHART_TYPES.map((t) => [t.id, t]));

// Thumbnails for the type strip. Deliberately drawn in the same 36×24 box so
// the strip reads as one row of options, the way Excel's gallery does.
const TYPE_ICON = {
  column: '<rect x="4" y="12" width="5" height="9"/><rect x="12" y="6" width="5" height="15"/><rect x="20" y="15" width="5" height="6"/><rect x="28" y="9" width="5" height="12"/>',
  bar: '<rect x="4" y="4" width="16" height="4"/><rect x="4" y="10" width="26" height="4"/><rect x="4" y="16" width="9" height="4"/>',
  line: '<polyline points="4,18 12,13 20,16 28,6 33,9" fill="none" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>',
  area: '<path d="M4,18 12,13 20,16 28,6 33,9 33,21 4,21Z" fill-opacity=".45"/><polyline points="4,18 12,13 20,16 28,6 33,9" fill="none" stroke-width="1.8"/>',
  stacked: '<rect x="5" y="13" width="7" height="8"/><rect x="5" y="8" width="7" height="5" opacity=".5"/><rect x="15" y="10" width="7" height="11"/><rect x="15" y="4" width="7" height="6" opacity=".5"/><rect x="25" y="15" width="7" height="6"/><rect x="25" y="9" width="7" height="6" opacity=".5"/>',
  stacked100: '<rect x="5" y="12" width="7" height="9"/><rect x="5" y="3" width="7" height="9" opacity=".5"/><rect x="15" y="9" width="7" height="12"/><rect x="15" y="3" width="7" height="6" opacity=".5"/><rect x="25" y="14" width="7" height="7"/><rect x="25" y="3" width="7" height="11" opacity=".5"/>',
  combo: '<rect x="5" y="12" width="6" height="9" opacity=".5"/><rect x="14" y="8" width="6" height="13" opacity=".5"/><rect x="23" y="14" width="6" height="7" opacity=".5"/><polyline points="8,9 17,13 26,5" fill="none" stroke-width="2" stroke-linejoin="round"/>',
  pie: '<path d="M18,12 L18,3 A9,9 0 0,1 25.8,16.5 Z"/><path d="M18,12 L25.8,16.5 A9,9 0 1,1 18,3 Z" opacity=".45"/>',
  donut: '<path d="M18,12 L18,3 A9,9 0 0,1 25.8,16.5 Z"/><path d="M18,12 L25.8,16.5 A9,9 0 1,1 18,3 Z" opacity=".45"/><circle cx="18" cy="12" r="4.2" fill="var(--kc-plot)"/>',
  scatter: '<circle cx="8" cy="17" r="2"/><circle cx="13" cy="13" r="2"/><circle cx="18" cy="15" r="2"/><circle cx="22" cy="9" r="2"/><circle cx="27" cy="11" r="2"/><circle cx="31" cy="6" r="2"/>',
};

function typeIcon(id) {
  return `<svg viewBox="0 0 36 24" aria-hidden="true" focusable="false">${TYPE_ICON[id] || ""}</svg>`;
}

// A chart type is offered only where it can say something true about the data.
function typeAllowed(data, type) {
  if (data.kind === "xy") return type === "scatter";
  if (type === "scatter") return false;
  if (type === "combo") return data.series.length >= 2;
  if (type === "stacked" || type === "stacked100") return data.series.length >= 2;
  return true;
}

// ---------------------------------------------------------------------------
// Number formatting
//
// Excel's "Display units" on the value axis is the thing being modelled here:
// 725458 shown as 725K is the same number with less noise in front of it.
// ---------------------------------------------------------------------------

const thousands = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Rounding for display only. The exponent-string trick is tempting here and
// wrong: once a value is small enough that JS prints it as 2.5e-8, "2.5e-8e1"
// parses to NaN — which is exactly what happens to a margin percentage sharing
// a dollar axis.
function round(n, dp) {
  if (!Number.isFinite(n)) return 0;
  const f = Math.pow(10, Math.max(0, Math.min(12, dp)));
  const r = Math.round(n * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

function makeFormatter(format, mode, magnitude) {
  const money = format === "money";
  const pct = format === "pct";

  if (pct || (money === false && mode === "pct") || mode === "pct") {
    return (v) => {
      const p = v * 100;
      const dp = Math.abs(p) < 10 && p !== 0 ? 1 : 0;
      return `${round(p, dp).toFixed(dp)}%`;
    };
  }

  // Which display unit the axis should carry. `auto` picks one, `k` forces
  // thousands, `plain` refuses to abbreviate at all.
  let div = 1;
  let suffix = "";
  if (mode === "k") {
    div = 1000;
    suffix = "K";
  } else if (mode !== "plain") {
    if (magnitude >= 1e6) {
      div = 1e6;
      suffix = "M";
    } else if (magnitude >= 1e4) {
      div = 1e3;
      suffix = "K";
    }
  }

  return (v) => {
    const scaled = v / div;
    const dp = div > 1 ? (Math.abs(scaled) < 10 && scaled !== 0 ? 1 : 0) : Math.abs(v) < 100 && !Number.isInteger(v) ? 2 : 0;
    if (scaled === 0) return `${money ? "$" : ""}0`;
    const body = thousands(round(scaled, dp).toFixed(dp));
    const sign = body.startsWith("-") ? "-" : "";
    const bare = sign ? body.slice(1) : body;
    return `${sign}${money ? "$" : ""}${bare}${suffix}`;
  };
}

// ---------------------------------------------------------------------------
// Scales
// ---------------------------------------------------------------------------

function niceNum(range, round) {
  const exp = Math.floor(Math.log10(Math.abs(range) || 1));
  const f = Math.abs(range) / Math.pow(10, exp);
  let nf;
  if (round) nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  else nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * Math.pow(10, exp);
}

function niceScale(lo, hi, ticks = 5) {
  if (!isFinite(lo) || !isFinite(hi)) return { min: 0, max: 1, step: 1 };
  if (lo === hi) {
    hi = lo + Math.abs(lo || 1);
    lo = Math.min(0, lo);
  }
  const step = niceNum((hi - lo) / Math.max(1, ticks - 1), true);
  return {
    min: Math.floor(lo / step) * step,
    max: Math.ceil(hi / step) * step,
    step,
  };
}

function ticksOf(scale) {
  const out = [];
  // Walk in integer steps to keep floating-point drift out of the labels, and
  // round to a precision the step size justifies rather than a fixed one.
  const n = Math.round((scale.max - scale.min) / scale.step);
  const dp = Math.max(0, Math.min(12, -Math.floor(Math.log10(Math.abs(scale.step) || 1)) + 2));
  for (let i = 0; i <= n; i++) out.push(round(scale.min + i * scale.step, dp));
  return out;
}

// ---------------------------------------------------------------------------
// SVG plumbing
// ---------------------------------------------------------------------------

const VB_W = 780;
const VB_H = 470;

const F_TITLE = 15;
const F_AXIS = 11;
const F_TITLE_AX = 11.5;
const CHAR_W = 6.1; // ≈ width of a digit at font-size 11 in the site's stack

function tag(name, attrs, inner) {
  const a = Object.entries(attrs || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${typeof v === "number" ? round(v, 2) : esc(v)}"`)
    .join("");
  return inner === undefined ? `<${name}${a}/>` : `<${name}${a}>${inner}</${name}>`;
}

const kc = (i) => `var(--kc-${i % 8})`;

// Which colour each mark takes. This is the control that most often does no
// work at all — six colours for six bars encodes nothing the labels don't
// already say — so the options here are the decisions actually worth making.
//
// `plotted` is the whole values matrix, because what "highlight" should pick
// out depends on the shape: with one series the subject is a single bar, with
// several it is a single line among the others.
function paletteFor(spec, plotted, seriesCount) {
  const p = spec.palette;
  const multi = seriesCount > 1;
  const idx = (si, ci) => (multi ? si : ci);

  if (p === "mono") return () => "var(--kc-mono)";
  if (p === "cbsafe") return (si, ci) => `var(--kc-cb-${idx(si, ci) % 6})`;

  if (p === "highlight") {
    const weight = multi
      ? plotted.map((row) => row.reduce((a, v) => a + Math.abs(v || 0), 0))
      : (plotted[0] || []).map((v) => Math.abs(v || 0));
    let best = 0;
    weight.forEach((v, i) => {
      if (v > weight[best]) best = i;
    });
    return (si, ci) => (idx(si, ci) === best ? "var(--kc-hi)" : "var(--kc-mute)");
  }

  if (p === "sign" && !multi) {
    const row = plotted[0] || [];
    return (si, ci) => ((row[ci] || 0) < 0 ? "var(--kc-neg)" : "var(--kc-pos)");
  }

  return (si, ci) => kc(idx(si, ci));
}

// ---------------------------------------------------------------------------
// The renderer
// ---------------------------------------------------------------------------

function prepare(data, spec) {
  if (data.kind === "xy") return { points: data.points };

  let cats = data.categories.slice();
  let series = data.series.map((s) => ({ ...s, values: s.values.slice() }));

  // Sorting is a property of the *view*, not the data — which is exactly why
  // Excel makes you sort the source range. Here it is a switch, so the reader
  // can see how much a ranking gains from it.
  if (spec.sort !== "none" && data.kind === "nominal") {
    const total = cats.map((_, i) => series.reduce((a, s) => a + (s.values[i] || 0), 0));
    const order = cats.map((_, i) => i).sort((a, b) => (spec.sort === "desc" ? total[b] - total[a] : total[a] - total[b]));
    cats = order.map((i) => cats[i]);
    series = series.map((s) => ({ ...s, values: order.map((i) => s.values[i]) }));
  }

  return { cats, series };
}

export function renderChart(data, spec) {
  // A spec can arrive from a lesson's data attributes, so don't trust that the
  // type suits the data — fall back rather than throwing on the page.
  const type = typeAllowed(data, spec.type) ? spec.type : data.defaultType;
  if (type !== spec.type) spec = { ...spec, type };
  if (type === "scatter") return renderXY(data, spec);
  if (type === "pie" || type === "donut") return renderRadial(data, spec);
  return renderCartesian(data, spec);
}

function legendBox(names, colours, spec, plot) {
  if (spec.legend === "none" || !names.length) return "";
  const swatch = 9;
  if (spec.legend === "right") {
    let y = plot.y0 + 4;
    return names
      .map((n, i) => {
        const row =
          tag("rect", { x: plot.x1 + 16, y, width: swatch, height: swatch, rx: 2, style: `fill:${colours[i]}` }) +
          tag("text", { x: plot.x1 + 16 + swatch + 6, y: y + swatch - 1, "font-size": F_AXIS, style: "fill:var(--kc-ink)" }, esc(n));
        y += 18;
        return row;
      })
      .join("");
  }
  // Bottom: centre the run of entries under the plot.
  const widths = names.map((n) => swatch + 6 + n.length * CHAR_W + 16);
  const total = widths.reduce((a, b) => a + b, 0) - 16;
  let x = plot.x0 + (plot.x1 - plot.x0 - total) / 2;
  const y = VB_H - 12;
  return names
    .map((n, i) => {
      const row =
        tag("rect", { x, y: y - swatch + 1, width: swatch, height: swatch, rx: 2, style: `fill:${colours[i]}` }) +
        tag("text", { x: x + swatch + 6, y, "font-size": F_AXIS, style: "fill:var(--kc-ink)" }, esc(n));
      x += widths[i];
      return row;
    })
    .join("");
}

function chartTitle(spec) {
  if (!spec.title) return "";
  return tag(
    "text",
    { x: 14, y: 26, "font-size": F_TITLE, "font-weight": 700, style: "fill:var(--kc-ink)" },
    esc(spec.title),
  );
}

// The shape of a cartesian chart, worked out once. The renderer draws from it
// and the critique reads from it, so a note about "the axis starts at 300K" is
// quoting the axis that is actually on screen rather than re-deriving one that
// might disagree. A lesson about misleading numbers cannot afford to print
// numbers of its own that don't match the picture.
function cartesianModel(data, spec) {
  const { cats, series } = prepare(data, spec);
  const type = spec.type;
  const horizontal = type === "bar";
  const stacked = type === "stacked" || type === "stacked100";
  const percent = type === "stacked100";
  const combo = type === "combo";
  const n = cats.length;

  // --- values, and the scale that has to hold them ------------------------
  let plotted = series.map((s) => s.values.slice());
  if (percent) {
    plotted = series.map((s) =>
      s.values.map((v, i) => {
        const t = series.reduce((a, x) => a + Math.abs(x.values[i] || 0), 0);
        return t ? v / t : 0;
      }),
    );
  }

  // Combo splits the series across two scales; everything else shares one.
  const primaryIdx = combo ? [0] : series.map((_, i) => i);
  const secondaryIdx = combo ? series.slice(1).map((_, i) => i + 1) : [];

  function extent(idxs) {
    let lo = 0;
    let hi = 0;
    if (stacked) {
      for (let i = 0; i < n; i++) {
        let pos = 0;
        let neg = 0;
        idxs.forEach((si) => {
          const v = plotted[si][i] || 0;
          if (v >= 0) pos += v;
          else neg += v;
        });
        hi = Math.max(hi, pos);
        lo = Math.min(lo, neg);
      }
    } else {
      idxs.forEach((si) =>
        plotted[si].forEach((v) => {
          hi = Math.max(hi, v);
          lo = Math.min(lo, v);
        }),
      );
    }
    return [lo, hi];
  }

  let [lo, hi] = extent(primaryIdx);
  if (percent) {
    lo = 0;
    hi = 1;
  }
  // "From zero" is the default because a length only means something measured
  // from zero. Trimming the axis is the switch that shows why.
  if (!spec.zeroBase && !percent) {
    const span = hi - lo || Math.abs(hi) || 1;
    lo = lo > 0 ? lo - span * 0.06 : lo;
    hi = hi < 0 ? hi + span * 0.06 : hi;
    const dataLo = Math.min(...primaryIdx.flatMap((si) => plotted[si]));
    if (dataLo > 0) lo = dataLo - (hi - dataLo) * 0.12;
  }
  const scale = percent ? { min: 0, max: 1, step: 0.25 } : niceScale(lo, hi, 6);
  const scale2 = combo ? niceScale(...extent(secondaryIdx), 6) : null;

  return { cats, series, plotted, n, type, horizontal, stacked, percent, combo, primaryIdx, secondaryIdx, scale, scale2 };
}

function renderCartesian(data, spec) {
  const { cats, series, plotted, n, type, horizontal, stacked, percent, combo, secondaryIdx, scale, scale2 } =
    cartesianModel(data, spec);

  const magnitude = Math.max(Math.abs(scale.min), Math.abs(scale.max));
  const fmtV = percent
    ? makeFormatter("pct", "pct", 1)
    : makeFormatter(data.format, spec.numfmt, magnitude);
  const fmt2 = combo
    ? makeFormatter(series[1].format || data.format, series[1].format === "pct" ? "pct" : spec.numfmt, Math.max(Math.abs(scale2.min), Math.abs(scale2.max)))
    : null;

  // Number format is a property of the series in Excel, not of the axis — so a
  // margin series keeps its % even when it is sharing a dollar scale. Watching
  // "17%" sit on a bar one pixel tall is the whole argument for a second axis.
  const pctFmt = makeFormatter("pct", "pct", 1);
  const fmtOf = (si) => (series[si].format === "pct" && !percent ? pctFmt : fmtV);

  const vTicks = ticksOf(scale);
  const vLabels = vTicks.map(fmtV);

  // --- layout -------------------------------------------------------------
  const axisTitles = spec.axisTitles !== "off";
  const legendNames = series.length > 1 || combo ? series.map((s) => s.name) : [];
  const showLegend = spec.legend !== "none" && legendNames.length > 0;

  const vLabelW = Math.max(...vLabels.map((s) => s.length)) * CHAR_W + 8;
  const catLabelW = Math.max(...cats.map((c) => String(c).length)) * CHAR_W + 8;

  let padL = horizontal ? Math.min(150, catLabelW) + 6 : vLabelW + 6;
  let padR = 18;
  let padT = spec.title ? 44 : 16;
  let padB = horizontal ? 34 : 40;

  if (axisTitles) {
    padL += 16;
    padB += 16;
  }
  if (combo) padR += Math.max(...ticksOf(scale2).map((t) => fmt2(t).length)) * CHAR_W + 14;
  if (showLegend && spec.legend === "right") padR += Math.max(...legendNames.map((s) => s.length)) * CHAR_W + 34;
  if (showLegend && spec.legend === "bottom") padB += 26;

  // Long category names on a vertical chart have to tilt; that is itself the
  // signal that the chart wanted to be horizontal.
  const tilt = !horizontal && catLabelW * n > (VB_W - padL - padR) * 0.95;
  if (tilt) padB += 26;

  const plot = { x0: padL, y0: padT, x1: VB_W - padR, y1: VB_H - padB };

  // Excel draws the *first* category at the bottom of a bar chart, which is why
  // a range sorted high-to-low comes out as a ranking running upwards. Matching
  // that here means "Categories in reverse order" — Excel's own fix — is a real
  // control below rather than a footnote.
  const flip = spec.reverse === "on";
  const cPix = (t) =>
    horizontal
      ? flip
        ? plot.y0 + t * (plot.y1 - plot.y0)
        : plot.y1 - t * (plot.y1 - plot.y0)
      : plot.x0 + t * (plot.x1 - plot.x0);
  const vPixOn = (sc) => (v) => {
    const f = (v - sc.min) / (sc.max - sc.min || 1);
    return horizontal ? plot.x0 + f * (plot.x1 - plot.x0) : plot.y1 - f * (plot.y1 - plot.y0);
  };
  const vPix = vPixOn(scale);
  const vPix2 = combo ? vPixOn(scale2) : null;
  const px = (t, v, vp = vPix) => (horizontal ? { x: vp(v), y: cPix(t) } : { x: cPix(t), y: vp(v) });

  let out = "";

  // --- gridlines ----------------------------------------------------------
  if (spec.gridlines !== "none") {
    out += vTicks
      .map((t) => {
        const a = px(0, t);
        const b = px(1, t);
        return tag("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, style: "stroke:var(--kc-grid)", "stroke-width": 1 });
      })
      .join("");
  }
  if (spec.gridlines === "both") {
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const a = px(t, scale.min);
      const b = px(t, scale.max);
      out += tag("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, style: "stroke:var(--kc-grid)", "stroke-width": 1 });
    }
  }

  // --- marks --------------------------------------------------------------
  const colourOf = paletteFor(spec, plotted, series.length);
  const seriesColour = (si) => colourOf(si, 0);

  const bandT = 1 / n;
  const barTypes = type === "column" || type === "bar" || stacked || combo;
  const labels = [];

  if (barTypes) {
    // Excel's own geometry: gap width is a percentage of bar width, and
    // overlap slides the bars in a cluster over each other. Stacked forces
    // overlap to 100%, which is the only reason the segments line up.
    const g = spec.gap / 100;
    const o = stacked ? 1 : combo ? 1 : spec.overlap / 100;
    const barSeries = combo ? [0] : series.map((_, i) => i);
    const m = barSeries.length;
    const b = bandT / (m - (m - 1) * o + g);
    const clusterW = b * (m - (m - 1) * o);

    const baseV = Math.max(scale.min, Math.min(scale.max, 0));

    cats.forEach((cat, ci) => {
      const start = bandT * ci + (bandT - clusterW) / 2;
      const running = { pos: baseV, neg: baseV };

      barSeries.forEach((si, j) => {
        const v = plotted[si][ci] || 0;
        const t0 = start + j * b * (1 - o);
        const t1 = t0 + b;

        let from = baseV;
        let to = v;
        if (stacked) {
          from = v >= 0 ? running.pos : running.neg;
          to = from + v;
          if (v >= 0) running.pos = to;
          else running.neg = to;
        }

        const a = px(t0, from);
        const c = px(t1, to);
        const x = Math.min(a.x, c.x);
        const y = Math.min(a.y, c.y);
        const w = Math.abs(c.x - a.x);
        const h = Math.abs(c.y - a.y);
        out += tag("rect", {
          x,
          y,
          width: Math.max(w, 0.5),
          height: Math.max(h, 0.5),
          rx: 1,
          style: `fill:${colourOf(si, ci)}`,
        });

        if (spec.labels !== "none") {
          const mid = px((t0 + t1) / 2, stacked ? (from + to) / 2 : to);
          labels.push({
            ci,
            si,
            v,
            x: horizontal ? (stacked ? mid.x : mid.x + (v >= 0 ? 6 : -6)) : mid.x,
            y: horizontal ? mid.y + 4 : stacked ? mid.y + 4 : mid.y + (v >= 0 ? -6 : 13),
            anchor: horizontal ? (stacked ? "middle" : v >= 0 ? "start" : "end") : "middle",
            inside: stacked,
            text: percent ? fmtV(plotted[si][ci]) : fmtOf(si)(series[si].values[ci]),
          });
        }
      });
    });
  }

  if (type === "line" || type === "area" || combo) {
    const lineSeries = combo ? secondaryIdx : series.map((_, i) => i);
    lineSeries.forEach((si) => {
      const vp = combo ? vPix2 : vPix;
      const pts = plotted[si].map((v, ci) => px(bandT * (ci + 0.5), v, vp));
      const colour = combo ? kc(si) : seriesColour(si);

      if (type === "area") {
        const base = px(bandT * 0.5, Math.max(scale.min, Math.min(scale.max, 0)));
        const endBase = px(bandT * (n - 0.5), Math.max(scale.min, Math.min(scale.max, 0)));
        const d =
          `M${round(pts[0].x, 2)},${round(pts[0].y, 2)}` +
          pts.slice(1).map((p) => `L${round(p.x, 2)},${round(p.y, 2)}`).join("") +
          `L${round(endBase.x, 2)},${round(endBase.y, 2)}L${round(base.x, 2)},${round(base.y, 2)}Z`;
        out += tag("path", { d, style: `fill:${colour}`, "fill-opacity": series.length > 1 ? 0.45 : 0.35 });
      }

      out += tag("polyline", {
        points: pts.map((p) => `${round(p.x, 2)},${round(p.y, 2)}`).join(" "),
        fill: "none",
        style: `stroke:${colour}`,
        "stroke-width": 2.4,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
      });

      if (spec.markers !== "off" && n <= 24) {
        pts.forEach((p) => {
          out += tag("circle", { cx: p.x, cy: p.y, r: 3, style: `fill:${colour}` });
        });
      }

      if (spec.labels !== "none") {
        plotted[si].forEach((v, ci) => {
          labels.push({
            ci,
            si,
            v,
            x: pts[ci].x,
            y: pts[ci].y - 8,
            anchor: "middle",
            text: (combo && si === 1 ? fmt2 : fmtOf(si))(series[si].values[ci]),
          });
        });
      }
    });

    // A trendline is Excel's own answer to "is that a pattern or is that noise?"
    if (spec.trendline === "on" && !combo) {
      const xs = [];
      const ys = [];
      plotted[0].forEach((v, i) => {
        xs.push(i);
        ys.push(v);
      });
      const fit = leastSquares(xs, ys);
      const a = px(bandT * 0.5, fit.m * 0 + fit.b);
      const c = px(bandT * (n - 0.5), fit.m * (n - 1) + fit.b);
      out += tag("line", {
        x1: a.x, y1: a.y, x2: c.x, y2: c.y,
        style: "stroke:var(--kc-trend)",
        "stroke-width": 1.8,
        "stroke-dasharray": "6 4",
      });
    }
  }

  // --- axes ---------------------------------------------------------------
  const zeroV = Math.max(scale.min, Math.min(scale.max, 0));
  const axA = px(0, zeroV);
  const axB = px(1, zeroV);
  out += tag("line", { x1: axA.x, y1: axA.y, x2: axB.x, y2: axB.y, style: "stroke:var(--kc-axis)", "stroke-width": 1.4 });

  // Value axis labels
  out += vTicks
    .map((t, i) => {
      const p = px(0, t);
      return horizontal
        ? tag("text", { x: p.x, y: plot.y1 + 16, "font-size": F_AXIS, "text-anchor": "middle", style: "fill:var(--kc-dim)" }, esc(vLabels[i]))
        : tag("text", { x: plot.x0 - 7, y: p.y + 4, "font-size": F_AXIS, "text-anchor": "end", style: "fill:var(--kc-dim)" }, esc(vLabels[i]));
    })
    .join("");

  if (combo) {
    out += ticksOf(scale2)
      .map((t) => {
        const y = vPix2(t);
        return tag("text", { x: plot.x1 + 8, y: y + 4, "font-size": F_AXIS, "text-anchor": "start", style: "fill:var(--kc-dim)" }, esc(fmt2(t)));
      })
      .join("");
  }

  // Category axis labels
  out += cats
    .map((c, i) => {
      const p = px(bandT * (i + 0.5), zeroV);
      if (horizontal) {
        return tag("text", { x: plot.x0 - 7, y: p.y + 4, "font-size": F_AXIS, "text-anchor": "end", style: "fill:var(--kc-dim)" }, esc(c));
      }
      if (tilt) {
        return tag(
          "text",
          { x: p.x, y: plot.y1 + 14, "font-size": F_AXIS, "text-anchor": "end", style: "fill:var(--kc-dim)", transform: `rotate(-38 ${round(p.x, 2)} ${round(plot.y1 + 14, 2)})` },
          esc(c),
        );
      }
      return tag("text", { x: p.x, y: plot.y1 + 16, "font-size": F_AXIS, "text-anchor": "middle", style: "fill:var(--kc-dim)" }, esc(c));
    })
    .join("");

  if (axisTitles) {
    const valTitle = percent ? "Share of sales" : data.valLabel;
    const vx = horizontal ? (plot.x0 + plot.x1) / 2 : 16;
    const vy = horizontal ? VB_H - (showLegend && spec.legend === "bottom" ? 34 : 8) : (plot.y0 + plot.y1) / 2;
    out += tag(
      "text",
      {
        x: vx, y: vy,
        "font-size": F_TITLE_AX, "font-weight": 600, "text-anchor": "middle",
        style: "fill:var(--kc-dim)",
        transform: horizontal ? undefined : `rotate(-90 ${round(vx, 2)} ${round(vy, 2)})`,
      },
      esc(valTitle),
    );
    const cx = horizontal ? 16 : (plot.x0 + plot.x1) / 2;
    const cy = horizontal ? (plot.y0 + plot.y1) / 2 : VB_H - (showLegend && spec.legend === "bottom" ? 34 : 8);
    out += tag(
      "text",
      {
        x: cx, y: cy,
        "font-size": F_TITLE_AX, "font-weight": 600, "text-anchor": "middle",
        style: "fill:var(--kc-dim)",
        transform: horizontal ? `rotate(-90 ${round(cx, 2)} ${round(cy, 2)})` : undefined,
      },
      esc(data.catLabel),
    );
  }

  // --- data labels (drawn last so nothing covers them) ---------------------
  const keep =
    spec.labels === "max"
      ? (l) => {
          const col = series.length === 1 ? plotted[0] : cats.map((_, i) => plotted.reduce((a, p) => a + p[i], 0));
          let best = 0;
          col.forEach((v, i) => {
            if (Math.abs(v) > Math.abs(col[best])) best = i;
          });
          return l.ci === best;
        }
      : () => true;

  out += labels
    .filter(keep)
    .map((l) =>
      tag(
        "text",
        {
          x: l.x, y: l.y,
          "font-size": 10.5, "font-weight": 600,
          "text-anchor": l.anchor,
          style: `fill:${l.inside ? "var(--kc-label-in)" : "var(--kc-ink)"}`,
        },
        esc(l.text),
      ),
    )
    .join("");

  out += chartTitle(spec);
  out += legendBox(legendNames, legendNames.map((_, i) => (combo ? kc(i) : seriesColour(i))), spec, plot);

  return frame(out, spec.title);
}

function leastSquares(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const m = den ? num / den : 0;
  const b = my - m * mx;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    ssTot += (ys[i] - my) ** 2;
    ssRes += (ys[i] - (m * xs[i] + b)) ** 2;
  }
  return { m, b, r2: ssTot ? 1 - ssRes / ssTot : 0 };
}

function renderRadial(data, spec) {
  const { cats, series } = prepare(data, spec);
  const values = series[0].values.map((v) => Math.abs(v));
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const fmt = makeFormatter(data.format, spec.numfmt, Math.max(...values));

  const showLegend = spec.legend !== "none";
  const legendW = showLegend && spec.legend === "right" ? Math.max(...cats.map((c) => String(c).length)) * CHAR_W + 40 : 0;
  const top = spec.title ? 44 : 16;
  const bottom = showLegend && spec.legend === "bottom" ? 40 : 16;
  const cx = (VB_W - legendW) / 2;
  const cy = top + (VB_H - top - bottom) / 2;
  const r = Math.min((VB_W - legendW) / 2, (VB_H - top - bottom) / 2) - 14;
  const inner = spec.type === "donut" ? r * 0.55 : 0;

  const colourOf = paletteFor(spec, [series[0].values], 1);
  let angle = -Math.PI / 2;
  let out = "";
  const labelBits = [];

  values.forEach((v, i) => {
    const sweep = (v / total) * Math.PI * 2;
    const a0 = angle;
    const a1 = angle + sweep;
    angle = a1;
    const large = sweep > Math.PI ? 1 : 0;
    const p = (rad, ang) => `${round(cx + rad * Math.cos(ang), 2)},${round(cy + rad * Math.sin(ang), 2)}`;
    const d = inner
      ? `M${p(r, a0)}A${r},${r} 0 ${large} 1 ${p(r, a1)}L${p(inner, a1)}A${inner},${inner} 0 ${large} 0 ${p(inner, a0)}Z`
      : `M${cx},${cy}L${p(r, a0)}A${r},${r} 0 ${large} 1 ${p(r, a1)}Z`;
    out += tag("path", { d, style: `fill:${colourOf(0, i)};stroke:var(--kc-plot)`, "stroke-width": 1.5 });

    if (spec.labels !== "none" && v / total > 0.02) {
      const mid = (a0 + a1) / 2;
      const lr = inner ? (r + inner) / 2 : r * 0.68;
      labelBits.push(
        tag(
          "text",
          {
            x: cx + lr * Math.cos(mid), y: cy + lr * Math.sin(mid) + 4,
            "font-size": 10.5, "font-weight": 600, "text-anchor": "middle",
            style: "fill:var(--kc-label-in)",
          },
          esc(spec.numfmt === "pct" ? `${Math.round((v / total) * 100)}%` : fmt(series[0].values[i])),
        ),
      );
    }
  });

  out += labelBits.join("");

  if (inner && spec.title) {
    out += tag(
      "text",
      { x: cx, y: cy + 5, "font-size": 13, "font-weight": 700, "text-anchor": "middle", style: "fill:var(--kc-ink)" },
      esc(fmt(series[0].values.reduce((a, b) => a + b, 0))),
    );
  }

  out += chartTitle(spec);
  out += legendBox(cats, cats.map((_, i) => colourOf(0, i)), spec, {
    x0: 16, x1: VB_W - legendW, y0: top, y1: VB_H - bottom,
  });

  return frame(out, spec.title);
}

function renderXY(data, spec) {
  const pts = data.points;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const sx = niceScale(Math.min(0, ...xs), Math.max(...xs), 6);
  const sy = niceScale(Math.min(...ys), Math.max(...ys), 6);
  const fmtX = makeFormatter(data.xFormat, data.xFormat === "pct" ? "pct" : spec.numfmt, Math.max(...xs.map(Math.abs)));
  const fmtY = makeFormatter(data.format, spec.numfmt, Math.max(Math.abs(sy.min), Math.abs(sy.max)));

  const yLabels = ticksOf(sy).map(fmtY);
  const padL = Math.max(...yLabels.map((s) => s.length)) * CHAR_W + 26;
  const plot = { x0: padL, y0: spec.title ? 44 : 16, x1: VB_W - 24, y1: VB_H - 54 };

  const X = (v) => plot.x0 + ((v - sx.min) / (sx.max - sx.min)) * (plot.x1 - plot.x0);
  const Y = (v) => plot.y1 - ((v - sy.min) / (sy.max - sy.min)) * (plot.y1 - plot.y0);

  let out = "";
  if (spec.gridlines !== "none") {
    out += ticksOf(sy)
      .map((t) => tag("line", { x1: plot.x0, y1: Y(t), x2: plot.x1, y2: Y(t), style: "stroke:var(--kc-grid)", "stroke-width": 1 }))
      .join("");
    if (spec.gridlines === "both") {
      out += ticksOf(sx)
        .map((t) => tag("line", { x1: X(t), y1: plot.y0, x2: X(t), y2: plot.y1, style: "stroke:var(--kc-grid)", "stroke-width": 1 }))
        .join("");
    }
  }

  const colour = spec.palette === "sign" ? null : spec.palette === "mono" ? "var(--kc-mono)" : "var(--kc-0)";
  pts.forEach((p) => {
    out += tag("circle", {
      cx: X(p.x), cy: Y(p.y), r: 4.5,
      style: `fill:${colour || (p.y < 0 ? "var(--kc-neg)" : "var(--kc-pos)")}`,
      "fill-opacity": 0.78,
    });
  });

  let r2Note = "";
  if (spec.trendline === "on") {
    const fit = leastSquares(xs, ys);
    out += tag("line", {
      x1: X(sx.min), y1: Y(fit.m * sx.min + fit.b),
      x2: X(sx.max), y2: Y(fit.m * sx.max + fit.b),
      style: "stroke:var(--kc-trend)", "stroke-width": 2, "stroke-dasharray": "6 4",
    });
    r2Note = tag(
      "text",
      { x: plot.x1 - 4, y: plot.y0 + 14, "font-size": 11, "text-anchor": "end", style: "fill:var(--kc-trend)", "font-weight": 600 },
      `R² = ${fit.r2.toFixed(2)}`,
    );
  }

  // Axes: draw at zero if zero is in range, which is what makes the negative
  // half of the profit axis obvious.
  const yZero = sy.min <= 0 && sy.max >= 0 ? Y(0) : plot.y1;
  out += tag("line", { x1: plot.x0, y1: yZero, x2: plot.x1, y2: yZero, style: "stroke:var(--kc-axis)", "stroke-width": 1.4 });
  out += tag("line", { x1: plot.x0, y1: plot.y0, x2: plot.x0, y2: plot.y1, style: "stroke:var(--kc-axis)", "stroke-width": 1.4 });

  out += ticksOf(sy)
    .map((t, i) => tag("text", { x: plot.x0 - 7, y: Y(t) + 4, "font-size": F_AXIS, "text-anchor": "end", style: "fill:var(--kc-dim)" }, esc(yLabels[i])))
    .join("");
  out += ticksOf(sx)
    .map((t) => tag("text", { x: X(t), y: plot.y1 + 16, "font-size": F_AXIS, "text-anchor": "middle", style: "fill:var(--kc-dim)" }, esc(fmtX(t))))
    .join("");

  if (spec.axisTitles !== "off") {
    out += tag("text", { x: (plot.x0 + plot.x1) / 2, y: VB_H - 12, "font-size": F_TITLE_AX, "font-weight": 600, "text-anchor": "middle", style: "fill:var(--kc-dim)" }, esc(data.xLabel));
    const vy = (plot.y0 + plot.y1) / 2;
    out += tag("text", { x: 16, y: vy, "font-size": F_TITLE_AX, "font-weight": 600, "text-anchor": "middle", style: "fill:var(--kc-dim)", transform: `rotate(-90 16 ${round(vy, 2)})` }, esc(data.yLabel));
  }

  out += r2Note;
  out += chartTitle(spec);
  return frame(out, spec.title);
}

function frame(inner, label) {
  return `<svg viewBox="0 0 ${VB_W} ${VB_H}" role="img" aria-label="${esc(label || "Chart")}" preserveAspectRatio="xMidYMid meet">${
    tag("rect", { x: 0, y: 0, width: VB_W, height: VB_H, rx: 10, style: "fill:var(--kc-plot)" })
  }${inner}</svg>`;
}

// ---------------------------------------------------------------------------
// The critique
//
// Every rule here is a thing an experienced person would say leaning over your
// shoulder. They fire on the chart as configured, so the reader hears the note
// at the moment they cause it rather than in a list of rules read cold.
// ---------------------------------------------------------------------------

const RANK = { bad: 0, warn: 1, tip: 2, good: 3 };

export function diagnose(data, spec) {
  const out = [];
  const add = (level, text) => out.push({ level, text });
  const type = spec.type;
  const nSeries = data.kind === "xy" ? 1 : data.series.length;
  const nCats = data.kind === "xy" ? data.points.length : data.categories.length;
  const values = data.kind === "xy" ? data.points.map((p) => p.y) : data.series[0].values;
  const hasNeg = values.some((v) => v < 0);
  const radial = type === "pie" || type === "donut";
  const barish = type === "column" || type === "bar" || type === "stacked" || type === "stacked100" || type === "combo";

  // --- the chart type is wrong for the data -------------------------------
  if (radial && nCats > 5) {
    add("bad", `${nCats} slices. Nobody can rank ${nCats} angles — a sorted bar chart gives the same answer in a glance.`);
  }
  if (radial && hasNeg) {
    add("bad", "There is a negative value in here. A pie draws its size and silently drops its sign, so the chart says the opposite of the data.");
  }
  if (radial && nSeries > 1) {
    add("warn", `A pie shows one series. The other ${nSeries - 1} are simply not on the chart.`);
  }
  if ((type === "line" || type === "area") && data.kind === "nominal") {
    add("warn", `A line says "and then". ${data.catLabel} → ${data.catLabel} is not a journey, so the slope between two bars means nothing.`);
  }
  if (type === "column" && data.kind === "time" && nCats >= 12 && nSeries === 1) {
    add("tip", "Twelve columns of a time series read as a fence. A line reads as a shape — which is the thing you actually want to see.");
  }
  if (type === "line" && nSeries > 4) {
    add("warn", `${nSeries} lines is spaghetti. Grey the others and colour the one you're talking about, or give each its own small chart.`);
  }
  if (type === "bar" && data.kind === "time") {
    add("warn", "Time is running down the page. Readers expect it left to right — use a column or line chart.");
  }

  // --- the axis is lying ---------------------------------------------------
  if (!spec.zeroBase && barish && type !== "stacked100") {
    const model = cartesianModel(data, spec);
    const axMin = model.scale.min;
    // What a reader compares is the total height of each category.
    const totals = model.cats.map((_, i) => model.plotted.reduce((a, p) => a + (p[i] || 0), 0));
    const lo = Math.min(...totals);
    const hi = Math.max(...totals);
    const fmt = makeFormatter(data.format, "plain", Math.abs(axMin));

    if (axMin <= 0) {
      add("tip", "You trimmed the axis, but Excel's rounding put the minimum back at zero — so nothing actually changed. It won't always be that forgiving.");
    } else if (lo > axMin && hi > lo) {
      const trueRatio = hi / lo;
      const drawnRatio = (hi - axMin) / (lo - axMin);
      add(
        "bad",
        `The value axis starts at ${fmt(axMin)}, not zero. The biggest bar is ${trueRatio.toFixed(2)}× the smallest, but it is drawn ${drawnRatio.toFixed(1)}× longer — this chart exaggerates the gap by about ${(drawnRatio / trueRatio).toFixed(1)}×.`,
      );
    } else {
      add("bad", "The value axis doesn't start at zero. A bar means its length, and a length is only honest measured from zero.");
    }
  }
  if (!spec.zeroBase && type === "line" && data.kind === "time") {
    add("tip", "A line encodes position, not length, so trimming its axis is defensible here — as long as you say so. Bars never get that licence.");
  }

  // --- composition ---------------------------------------------------------
  if (type === "stacked100") {
    add("tip", "100% stacked answers “what is the mix?” and deliberately destroys “how big?”. If both matter, you need two charts.");
  }
  if ((type === "stacked" || type === "stacked100") && nSeries > 3) {
    add("warn", `Only the bottom segment sits on a straight baseline. Comparing the other ${nSeries - 1} across categories is guesswork.`);
  }

  // --- geometry ------------------------------------------------------------
  if (barish && spec.gap < 30) {
    add("warn", "Bars touching is the convention for a histogram — continuous data. For separate categories, leave a gap.");
  }
  if (barish && spec.gap > 380) {
    add("tip", "Hairline bars. The length is the message, so give it some ink — Excel's default gap is 219%.");
  }
  if (type === "column" && nCats >= 8) {
    const longest = Math.max(...data.categories.map((c) => String(c).length));
    if (longest > 9) add("tip", `Category names up to ${longest} characters are being tilted to fit. Switch to a horizontal bar chart and they read straight.`);
  }

  // --- ink -----------------------------------------------------------------
  if (spec.labels === "none" && spec.gridlines === "none") {
    add("warn", "No gridlines and no data labels — there is no way to recover a value from this chart, only a vague sense of bigger and smaller.");
  }
  if (spec.labels === "all" && spec.gridlines !== "none" && nCats <= 8 && nSeries === 1) {
    add("tip", "Every bar is labelled, so the gridlines are now repeating information. Removing them is free clarity.");
  }
  if (spec.labels === "all" && nCats * nSeries > 24) {
    add("warn", `${nCats * nSeries} data labels is more text than chart. Label the points you're making a point about.`);
  }
  if (spec.legend !== "none" && nSeries === 1 && !radial) {
    add("warn", "A legend for one series names a colour that means nothing. The title already says what is being measured.");
  }
  if (spec.legend === "none" && nSeries > 1 && !radial && type !== "combo") {
    add("bad", "Multiple series and no legend — the colours are unexplained.");
  }

  // --- colour --------------------------------------------------------------
  if (nSeries === 1 && spec.palette === "series" && !radial) {
    add("tip", "Each bar is a different colour, and the colour encodes nothing the label doesn't already say. One colour — or one highlighted colour — carries more meaning.");
  }
  if (spec.palette === "highlight") {
    add(
      "good",
      nSeries > 1
        ? "One line in colour, the rest in grey. The others still give context, but only one of them is making an argument."
        : "Greying everything except the one bar you're talking about is the single highest-leverage move in chart design.",
    );
  }
  if (spec.palette === "sign" && !hasNeg) {
    add("tip", "Colour-by-sign with no negatives in the data is just one colour with extra steps.");
  }
  if (spec.palette === "sign" && hasNeg) {
    add("good", "Red for losses, green for gains — colour is carrying real information here.");
  }
  if (spec.palette === "cbsafe") {
    add("good", "Okabe–Ito palette: still distinguishable to the ~8% of men with red–green colour blindness.");
  }

  // --- combo ---------------------------------------------------------------
  if (type === "combo") {
    add("tip", "Two scales on one chart. Label both axes and match each one's colour to its series, or half your readers will read the line against the wrong numbers.");
  }

  // --- story ---------------------------------------------------------------
  const t = (spec.title || "").trim();
  if (!t) {
    add("warn", "No title. “Chart 1” is what Excel calls it; the reader needs to be told what they're looking at.");
  } else if (/^(chart|sheet|total|sum of|untitled)\b/i.test(t) || t.toLowerCase() === (data.name || "").toLowerCase()) {
    add("tip", "The title names the fields. A title that states the finding — “Three sub-categories lose money” — does far more work.");
  } else if (t.length > 12) {
    add("good", "The title is a sentence, not a field name. That's the difference between a chart and a picture of some data.");
  }

  if (spec.sort === "none" && data.kind === "nominal" && nSeries === 1 && (type === "column" || type === "bar")) {
    add("tip", "Unsorted. A ranking that isn't in rank order makes the reader do the sorting in their head.");
  }
  if (spec.sort !== "none" && data.kind === "time") {
    add("bad", "This is a time series — sorting it by value destroys the only thing it had to say.");
  }
  if (spec.sort === "desc" && data.kind === "nominal") {
    if (type === "bar" && spec.reverse !== "on") {
      add("warn", "Sorted high to low, but a bar chart draws the first row at the bottom — so the ranking climbs instead of descending. Format Axis ▸ Categories in reverse order fixes it without touching the data.");
    } else {
      add("good", "Sorted descending — the ranking now reads straight off the chart.");
    }
  }

  if (spec.trendline === "on" && data.kind === "xy") {
    const fit = leastSquares(data.points.map((p) => p.x), data.points.map((p) => p.y));
    add(
      fit.r2 > 0.25 ? "good" : "tip",
      `Trendline slope ${fit.m > 0 ? "+" : ""}${Math.round(fit.m)} per unit of ${data.xLabel.toLowerCase()}, R² = ${fit.r2.toFixed(2)}. R² is the share of the variation the line explains — the rest is everything else going on.`,
    );
  }

  out.sort((a, b) => RANK[a.level] - RANK[b.level]);
  return out.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Where each control lives in Excel
//
// The point of the studio is muscle memory, not just taste: every time a dial
// moves, this says what you would have clicked to move it in the real thing.
// ---------------------------------------------------------------------------

const EXCEL_PATH = {
  dataset: { path: "Select the range, then Insert ▸ Recommended Charts", extra: "Selecting one cell inside a Table is enough — Excel takes the whole Table." },
  type: { path: "Chart Design ▸ Change Chart Type", extra: "Right-click the chart ▸ Change Chart Type gets there in one step." },
  title: { path: "Click the title ▸ type", extra: "Or select the title and type =$B$1 in the formula bar to link it to a cell, so it updates itself." },
  sort: { path: "Sort the source range: Data ▸ Sort, or the Table header dropdown", extra: "A chart has no sort of its own — it draws the range in the order the range is in." },
  palette: { path: "Chart Design ▸ Change Colors", extra: "For one bar in a different colour: click the bar once to select the series, again to select just that point, then Format ▸ Shape Fill." },
  labels: { path: "The ⊕ button ▸ Data Labels, or Chart Design ▸ Add Chart Element ▸ Data Labels", extra: "Format Data Labels ▸ Label Options can show the category name, or a cell's value via Value From Cells." },
  gridlines: { path: "⊕ ▸ Gridlines ▸ Primary Major Horizontal", extra: "Format Gridlines ▸ Line ▸ lighten the colour rather than deleting them outright." },
  legend: { path: "⊕ ▸ Legend ▸ Right / Bottom", extra: "Delete key removes a selected legend. One series never needs one." },
  zeroBase: { path: "Right-click the value axis ▸ Format Axis ▸ Bounds ▸ Minimum", extra: "Set it back to Auto and Excel starts a bar chart at zero for you — trust that default." },
  gap: { path: "Right-click a bar ▸ Format Data Series ▸ Gap Width", extra: "Excel's default is 219%. Gap width is a percentage of bar width, so 0% means bars touching." },
  overlap: { path: "Right-click a bar ▸ Format Data Series ▸ Series Overlap", extra: "Default −27% for clustered. Stacked charts force it to 100%, which is why the segments line up." },
  numfmt: { path: "Format Axis ▸ Number, and Display units ▸ Thousands", extra: "Display units shrink 725,458 to 725 and put “Thousands” on the axis, instead of six digits on every tick." },
  axisTitles: { path: "⊕ ▸ Axis Titles", extra: "Include the unit: “Sales ($)” or “Sales (thousands)” — a bare number is an invitation to misread." },
  trendline: { path: "⊕ ▸ Trendline ▸ Linear", extra: "Format Trendline ▸ Display R-squared value puts the fit on the chart." },
  reverse: { path: "Right-click the category axis ▸ Format Axis ▸ Categories in reverse order", extra: "Tick it and Excel also moves the value axis to the top; Format Axis ▸ Horizontal axis crosses ▸ At maximum category puts it back at the bottom." },
  markers: { path: "Format Data Series ▸ Marker ▸ Built-in", extra: "Markers help when points are sparse and clutter when they aren't." },
};

// ---------------------------------------------------------------------------
// The studio
// ---------------------------------------------------------------------------

export const DEFAULT_SPEC = {
  dataset: "region",
  type: "column",
  title: "",
  sort: "none",
  palette: "series",
  labels: "none",
  gridlines: "h",
  legend: "right",
  zeroBase: true,
  gap: 219,
  overlap: -27,
  numfmt: "auto",
  axisTitles: "on",
  trendline: "off",
  markers: "on",
  reverse: "off",
};

// Deliberately broken starting points. Each one is a chart people really make,
// paired with the question it fails to answer.
const PRESETS = [
  {
    id: "misleading",
    label: "The misleading one",
    task: "The gap between West and South is real, but this chart doubles it. Find the dial that's lying and fix it.",
    spec: { dataset: "region", type: "column", zeroBase: false, palette: "series", labels: "none", gridlines: "none", legend: "right", title: "Sales by Region" },
  },
  {
    id: "pie",
    label: "The 17-slice pie",
    task: "Which three sub-categories lose money? The answer is in here somewhere. Get it out.",
    spec: { dataset: "subprofit", type: "pie", palette: "series", labels: "none", legend: "right", sort: "none", title: "Profit by Sub-Category" },
  },
  {
    id: "spaghetti",
    label: "The spaghetti",
    task: "Four years of monthly sales, all shouting at once. Make one year the point.",
    spec: { dataset: "trend4", type: "line", palette: "series", legend: "right", labels: "none", gridlines: "h", title: "Sales by month" },
  },
  {
    id: "fence",
    label: "The picket fence",
    task: "Twelve columns hide the shape of the year. Show the shape instead.",
    spec: { dataset: "trend", type: "column", palette: "series", labels: "all", gridlines: "both", legend: "right", title: "Monthly Sales 2017" },
  },
  {
    id: "twounits",
    label: "Two units, one axis",
    task: "Sales in dollars and margin as a percentage, sharing one scale. The margin line is flat on the floor. Give it its own axis.",
    spec: { dataset: "combo", type: "column", palette: "series", legend: "right", labels: "none", gridlines: "h", title: "Sales and margin by Category" },
  },
];

const SEG = (name, options, value) =>
  `<div class="cl-seg" role="group">${options
    .map(
      (o) =>
        `<button type="button" class="cl-segb${String(o.v) === String(value) ? " is-on" : ""}" data-ctl="${name}" data-val="${esc(o.v)}"${
          o.title ? ` title="${esc(o.title)}"` : ""
        }>${esc(o.t)}</button>`,
    )
    .join("")}</div>`;

function mountStudio(host) {
  const spec = { ...DEFAULT_SPEC };
  if (host.dataset.dataset && CHART_DATA[host.dataset.dataset]) spec.dataset = host.dataset.dataset;
  spec.type = CHART_DATA[spec.dataset].defaultType;
  spec.title = CHART_DATA[spec.dataset].name;

  host.classList.add("chartlab");
  host.innerHTML = `
    <div class="cl-head">
      <label class="cl-field">
        <span>Data</span>
        <select class="cl-data" data-ctl="dataset">${Object.entries(CHART_DATA)
          .map(([k, d]) => `<option value="${k}">${esc(d.name)}</option>`)
          .join("")}</select>
      </label>
      <p class="cl-story"></p>
    </div>

    <div class="cl-types" role="group" aria-label="Chart type"></div>

    <div class="cl-body">
      <div class="cl-stage">
        <div class="cl-canvas"></div>
        <div class="cl-verdict" role="status" aria-live="polite"></div>
        <div class="cl-presets">
          <span class="cl-pl">Fix a broken chart:</span>
          ${PRESETS.map((p) => `<button type="button" class="cl-preset" data-preset="${p.id}">${esc(p.label)}</button>`).join("")}
          <button type="button" class="cl-preset cl-reset" data-preset="reset">Reset</button>
        </div>
        <p class="cl-task" hidden></p>
      </div>

      <div class="cl-rail">
        <div class="cl-group">
          <h4>Story</h4>
          <label class="cl-field wide"><span>Chart title</span>
            <input class="cl-title" type="text" data-ctl="title" spellcheck="false" placeholder="Say the finding, not the fields">
          </label>
          <div class="cl-row" data-row="sort"><span class="cl-lab">Sort</span><span class="cl-ctl"></span></div>
        </div>

        <div class="cl-group">
          <h4>Marks</h4>
          <div class="cl-row" data-row="palette"><span class="cl-lab">Colour</span><span class="cl-ctl"></span></div>
          <div class="cl-row" data-row="gap"><span class="cl-lab">Gap width <b class="cl-num"></b></span><span class="cl-ctl"></span></div>
          <div class="cl-row" data-row="overlap"><span class="cl-lab">Series overlap <b class="cl-num"></b></span><span class="cl-ctl"></span></div>
          <div class="cl-row" data-row="markers"><span class="cl-lab">Markers</span><span class="cl-ctl"></span></div>
          <div class="cl-row" data-row="trendline"><span class="cl-lab">Trendline</span><span class="cl-ctl"></span></div>
        </div>

        <div class="cl-group">
          <h4>Ink</h4>
          <div class="cl-row" data-row="labels"><span class="cl-lab">Data labels</span><span class="cl-ctl"></span></div>
          <div class="cl-row" data-row="gridlines"><span class="cl-lab">Gridlines</span><span class="cl-ctl"></span></div>
          <div class="cl-row" data-row="legend"><span class="cl-lab">Legend</span><span class="cl-ctl"></span></div>
          <div class="cl-row" data-row="axisTitles"><span class="cl-lab">Axis titles</span><span class="cl-ctl"></span></div>
        </div>

        <div class="cl-group">
          <h4>Axes</h4>
          <div class="cl-row" data-row="zeroBase"><span class="cl-lab">Value axis</span><span class="cl-ctl"></span></div>
          <div class="cl-row" data-row="reverse"><span class="cl-lab">Categories in reverse order</span><span class="cl-ctl"></span></div>
          <div class="cl-row" data-row="numfmt"><span class="cl-lab">Number format</span><span class="cl-ctl"></span></div>
        </div>

        <div class="cl-xl">
          <div class="cl-xl-h">In Excel</div>
          <p class="cl-xl-p"></p>
          <p class="cl-xl-x"></p>
        </div>
      </div>
    </div>

  `;

  const q = (sel) => host.querySelector(sel);
  const canvas = q(".cl-canvas");
  const verdict = q(".cl-verdict");
  const story = q(".cl-story");
  const typeStrip = q(".cl-types");
  const titleInput = q(".cl-title");
  const dataSel = q(".cl-data");
  const task = q(".cl-task");
  const xlPath = q(".cl-xl-p");
  const xlExtra = q(".cl-xl-x");

  let lastTouched = "dataset";

  function controlsFor(data) {
    const type = spec.type;
    const barish = ["column", "bar", "stacked", "stacked100", "combo"].includes(type);
    const radial = type === "pie" || type === "donut";
    return {
      sort: data.kind === "nominal",
      palette: true,
      gap: barish,
      overlap: type === "column" || type === "bar",
      markers: type === "line" || type === "area",
      trendline: type === "scatter" || (type === "line" && data.series && data.series.length === 1),
      labels: true,
      gridlines: !radial,
      legend: true,
      axisTitles: !radial,
      zeroBase: !radial && type !== "stacked100",
      reverse: type === "bar",
      numfmt: true,
    };
  }

  function paint() {
    const data = CHART_DATA[spec.dataset];
    story.textContent = data.story;
    dataSel.value = spec.dataset;
    if (document.activeElement !== titleInput) titleInput.value = spec.title;

    // The good/risky/disabled marks depend only on the dataset, so once the
    // strip is built for a dataset only the selected state needs to move.
    if (typeStrip.dataset.builtFor === spec.dataset) {
      typeStrip.querySelectorAll(".cl-type").forEach((b) => {
        b.classList.toggle("is-on", b.dataset.val === spec.type);
      });
    } else {
    typeStrip.dataset.builtFor = spec.dataset;
    typeStrip.innerHTML = CHART_TYPES.map((t) => {
      const allowed = typeAllowed(data, t.id);
      const cls = [
        "cl-type",
        spec.type === t.id ? "is-on" : "",
        !allowed ? "is-off" : (data.good || []).includes(t.id) ? "is-good" : (data.avoid || []).includes(t.id) ? "is-risky" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const hint = !allowed
        ? "Not possible with this data"
        : (data.good || []).includes(t.id)
          ? "Well suited to this data"
          : (data.avoid || []).includes(t.id)
            ? "Possible, but it will misrepresent this data — try it and read why"
            : t.ribbon;
      return `<button type="button" class="${cls}" data-ctl="type" data-val="${t.id}"${allowed ? "" : " disabled"} title="${esc(hint)}">${typeIcon(t.id)}<span>${esc(t.name)}</span></button>`;
    }).join("");
    }

    const show = controlsFor(data);
    host.querySelectorAll(".cl-row").forEach((row) => {
      row.hidden = !show[row.dataset.row];
    });

    // Controls are synced in place, not re-rendered. Replacing the node under
    // the pointer would kill the interaction that caused the update — dragging
    // the gap-width slider would break on its first pixel of movement.
    const put = (name, options, value) => {
      const cell = host.querySelector(`.cl-row[data-row="${name}"] .cl-ctl`);
      if (!cell) return;
      const existing = [...cell.querySelectorAll(".cl-segb")];
      const sameControl =
        existing.length === options.length &&
        existing.every((b, i) => b.dataset.val === String(options[i].v));
      if (!sameControl) {
        cell.innerHTML = SEG(name, options, value);
        return;
      }
      existing.forEach((b) => b.classList.toggle("is-on", b.dataset.val === String(value)));
    };

    const putRange = (name, attrs, value) => {
      const cell = host.querySelector(`.cl-row[data-row="${name}"] .cl-ctl`);
      if (!cell) return;
      let input = cell.querySelector("input[type='range']");
      if (!input) {
        cell.innerHTML = `<input class="cl-range" type="range" ${attrs} data-ctl="${name}">`;
        input = cell.querySelector("input[type='range']");
      }
      // Only write when it actually differs, so a drag in progress is untouched.
      if (input.value !== String(value)) input.value = value;
    };

    put("sort", [
      { v: "none", t: "Source order" },
      { v: "desc", t: "High → low" },
      { v: "asc", t: "Low → high" },
    ], spec.sort);

    put("palette", [
      { v: "series", t: "By item", title: "A different colour per bar — Excel's habit, and usually meaningless" },
      { v: "mono", t: "One colour", title: "Colour encodes nothing, so use one" },
      { v: "highlight", t: "Highlight", title: "Grey everything except the point you're making" },
      { v: "sign", t: "By sign", title: "Green above zero, red below" },
      { v: "cbsafe", t: "Okabe–Ito", title: "Colour-blind-safe categorical palette" },
    ], spec.palette);

    put("labels", [
      { v: "none", t: "Off" },
      { v: "all", t: "All" },
      { v: "max", t: "Biggest only" },
    ], spec.labels);

    put("gridlines", [
      { v: "none", t: "None" },
      { v: "h", t: "Value" },
      { v: "both", t: "Both" },
    ], spec.gridlines);

    put("legend", [
      { v: "right", t: "Right" },
      { v: "bottom", t: "Bottom" },
      { v: "none", t: "Off" },
    ], spec.legend);

    put("axisTitles", [
      { v: "on", t: "On" },
      { v: "off", t: "Off" },
    ], spec.axisTitles);

    put("zeroBase", [
      { v: "true", t: "From zero" },
      { v: "false", t: "Trimmed", title: "Set a minimum above the data — the classic way to make a small difference look big" },
    ], String(spec.zeroBase));

    put("numfmt", [
      { v: "auto", t: "Auto" },
      { v: "k", t: "Thousands" },
      { v: "pct", t: "Percent" },
      { v: "plain", t: "Full number" },
    ], spec.numfmt);

    put("reverse", [
      { v: "off", t: "Excel default", title: "First row of the range at the bottom — Excel's default, and the reason sorted bar charts read upside down" },
      { v: "on", t: "Reversed", title: "Format Axis ▸ Categories in reverse order" },
    ], spec.reverse);

    put("markers", [{ v: "on", t: "On" }, { v: "off", t: "Off" }], spec.markers);
    put("trendline", [{ v: "off", t: "Off" }, { v: "on", t: "Linear" }], spec.trendline);

    putRange("gap", 'min="0" max="500" step="5" aria-label="Gap width"', spec.gap);
    putRange("overlap", 'min="-100" max="100" step="5" aria-label="Series overlap"', spec.overlap);
    const gapNum = host.querySelector('.cl-row[data-row="gap"] .cl-num');
    if (gapNum) gapNum.textContent = `${spec.gap}%`;
    const ovNum = host.querySelector('.cl-row[data-row="overlap"] .cl-num');
    if (ovNum) ovNum.textContent = `${spec.overlap}%`;

    canvas.innerHTML = renderChart(data, spec);

    const notes = diagnose(data, spec);
    verdict.innerHTML = notes.length
      ? notes
          .map(
            (nt) =>
              `<div class="cl-note is-${nt.level}"><span class="cl-ni">${
                { bad: "⛔", warn: "⚠️", tip: "💡", good: "✓" }[nt.level]
              }</span><span>${nt.text}</span></div>`,
          )
          .join("")
      : `<div class="cl-note is-good"><span class="cl-ni">✓</span><span>Nothing to argue with.</span></div>`;

    const xl = lastTouched === "type" ? { path: TYPE_BY_ID[spec.type].ribbon, extra: EXCEL_PATH.type.extra } : EXCEL_PATH[lastTouched] || EXCEL_PATH.dataset;
    xlPath.textContent = xl.path;
    xlExtra.textContent = xl.extra;
  }

  function set(name, value) {
    lastTouched = name;
    if (name === "dataset") {
      const d = CHART_DATA[value];
      spec.dataset = value;
      if (!typeAllowed(d, spec.type)) spec.type = d.defaultType;
      spec.title = d.name;
      task.hidden = true;
    } else if (name === "zeroBase") {
      spec.zeroBase = value === "true";
    } else if (name === "gap" || name === "overlap") {
      spec[name] = Number(value);
    } else {
      spec[name] = value;
    }
    paint();
  }

  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-ctl][data-val]");
    if (btn && !btn.disabled) {
      set(btn.dataset.ctl, btn.dataset.val);
      return;
    }
    const preset = e.target.closest("[data-preset]");
    if (!preset) return;
    if (preset.dataset.preset === "reset") {
      Object.assign(spec, DEFAULT_SPEC, { type: CHART_DATA[DEFAULT_SPEC.dataset].defaultType, title: CHART_DATA[DEFAULT_SPEC.dataset].name });
      task.hidden = true;
      lastTouched = "dataset";
      paint();
      return;
    }
    const p = PRESETS.find((x) => x.id === preset.dataset.preset);
    if (!p) return;
    Object.assign(spec, DEFAULT_SPEC, p.spec);
    task.hidden = false;
    task.innerHTML = `<b>Your turn:</b> ${esc(p.task)}`;
    lastTouched = "type";
    paint();
  });

  host.addEventListener("input", (e) => {
    const ctl = e.target.closest("[data-ctl]");
    if (!ctl) return;
    if (ctl.tagName === "INPUT" && ctl.type === "range") set(ctl.dataset.ctl, ctl.value);
    else if (ctl.tagName === "INPUT") {
      spec.title = ctl.value;
      lastTouched = "title";
      paint();
    } else if (ctl.tagName === "SELECT") set(ctl.dataset.ctl, ctl.value);
  });

  paint();
}

// ---------------------------------------------------------------------------
// The anatomy explorer
//
// Excel formats whatever is selected, so "how do I change this?" is really
// "what is this called and how do I select it?". This answers both at once.
// ---------------------------------------------------------------------------

const PARTS = [
  {
    id: "chartarea",
    name: "Chart Area",
    select: "Click any empty space inside the chart's border.",
    format: "Format ▸ Shape Fill / Shape Outline, or Format Chart Area (Ctrl+1).",
    tip: "Setting Fill to No Fill and Border to No Line lets the chart sit on a dashboard without a box round it.",
  },
  {
    id: "title",
    name: "Chart Title",
    select: "Click the title text once.",
    format: "Type over it, or select it and enter =Sheet1!$B$1 in the formula bar to link it to a cell.",
    tip: "A linked title can restate the finding automatically — “West leads with $725K” recalculating as the data changes.",
  },
  {
    id: "plotarea",
    name: "Plot Area",
    select: "Click just inside the axes but not on a bar.",
    format: "Format Plot Area, or drag its handles to resize it inside the chart area.",
    tip: "Widening the plot area is how you claw back the space Excel gives to margins by default.",
  },
  {
    id: "vaxis",
    name: "Vertical (Value) Axis",
    select: "Click any of the numbers up the side.",
    format: "Format Axis ▸ Bounds, Units, Number, Display units.",
    tip: "Bounds ▸ Minimum is the single most abused setting in Excel. Leave it on Auto for anything drawn as a length.",
  },
  {
    id: "haxis",
    name: "Horizontal (Category) Axis",
    select: "Click the labels along the bottom.",
    format: "Format Axis ▸ Axis Type, Labels, Tick Marks.",
    tip: "Axis Type ▸ Text axis vs Date axis matters: a Date axis leaves a gap for missing months, a Text axis pretends they never existed.",
  },
  {
    id: "grid",
    name: "Major Gridlines",
    select: "Click any one of the horizontal lines.",
    format: "Format Gridlines ▸ Line, or ⊕ ▸ Gridlines to toggle them.",
    tip: "Lighten them rather than deleting them — they're the only way to read a value off an unlabelled bar.",
  },
  {
    id: "series",
    name: "Data Series",
    select: "Click any bar once — all bars of that colour get handles.",
    format: "Format Data Series ▸ Gap Width, Series Overlap, Fill, Plot on Secondary Axis.",
    tip: "This is the panel people never find. Gap Width and Series Overlap live here and nowhere else.",
  },
  {
    id: "point",
    name: "Data Point",
    select: "Click the bar once to get the series, then again to get just that bar.",
    format: "Format Data Point ▸ Fill.",
    tip: "This is how you make one bar orange and the rest grey — the whole highlight technique is two clicks and a fill.",
  },
  {
    id: "labels",
    name: "Data Labels",
    select: "Click any label; click again for a single one.",
    format: "Format Data Labels ▸ Label Options, Label Position, Number.",
    tip: "Value From Cells lets a label show anything — a growth %, a note, a name — not just the plotted number.",
  },
  {
    id: "legend",
    name: "Legend",
    select: "Click it once.",
    format: "⊕ ▸ Legend ▸ position, or drag it anywhere.",
    tip: "Delete it whenever there's one series, and prefer labelling the lines directly when there are few.",
  },
];

// The diagram the hotspots sit on. Hand-laid rather than generated so every
// pin lands exactly on the part it names.
function anatomySvg() {
  const W = 640;
  const H = 380;
  const plot = { x0: 92, y0: 62, x1: 500, y1: 300 };
  const bars = [
    { c: "Central", v: 501240 },
    { c: "East", v: 678781 },
    { c: "South", v: 391722 },
    { c: "West", v: 725458 },
  ];
  const max = 800000;
  const bw = 52;
  const band = (plot.x1 - plot.x0) / bars.length;
  const yOf = (v) => plot.y1 - (v / max) * (plot.y1 - plot.y0);

  let s = "";
  s += tag("rect", { x: 8, y: 8, width: W - 16, height: H - 16, rx: 10, style: "fill:var(--kc-plot);stroke:var(--kc-grid)", "stroke-width": 1 });
  s += tag("rect", { x: plot.x0, y: plot.y0, width: plot.x1 - plot.x0, height: plot.y1 - plot.y0, style: "fill:var(--kc-plotarea)" });

  for (let v = 0; v <= max; v += 200000) {
    s += tag("line", { x1: plot.x0, y1: yOf(v), x2: plot.x1, y2: yOf(v), style: "stroke:var(--kc-grid)", "stroke-width": 1, "data-part": "grid" });
    s += tag("text", { x: plot.x0 - 8, y: yOf(v) + 4, "font-size": 11, "text-anchor": "end", style: "fill:var(--kc-dim)", "data-part": "vaxis" }, v ? `$${v / 1000}K` : "$0");
  }

  bars.forEach((b, i) => {
    const x = plot.x0 + band * i + (band - bw) / 2;
    s += tag("rect", { x, y: yOf(b.v), width: bw, height: plot.y1 - yOf(b.v), rx: 1, style: `fill:${i === 3 ? "var(--kc-hi)" : "var(--kc-0)"}`, "data-part": i === 3 ? "point" : "series" });
    s += tag("text", { x: x + bw / 2, y: yOf(b.v) - 7, "font-size": 10.5, "font-weight": 600, "text-anchor": "middle", style: "fill:var(--kc-ink)", "data-part": "labels" }, `$${Math.round(b.v / 1000)}K`);
    s += tag("text", { x: x + bw / 2, y: plot.y1 + 17, "font-size": 11, "text-anchor": "middle", style: "fill:var(--kc-dim)", "data-part": "haxis" }, b.c);
  });

  s += tag("line", { x1: plot.x0, y1: plot.y1, x2: plot.x1, y2: plot.y1, style: "stroke:var(--kc-axis)", "stroke-width": 1.4 });
  s += tag("text", { x: 26, y: 34, "font-size": 15, "font-weight": 700, style: "fill:var(--kc-ink)", "data-part": "title" }, "West leads on sales, the South trails by $334K");
  s += tag("text", { x: 34, y: (plot.y0 + plot.y1) / 2, "font-size": 11.5, "font-weight": 600, "text-anchor": "middle", style: "fill:var(--kc-dim)", transform: `rotate(-90 34 ${(plot.y0 + plot.y1) / 2})`, "data-part": "vaxis" }, "Sales");
  s += tag("text", { x: (plot.x0 + plot.x1) / 2, y: plot.y1 + 42, "font-size": 11.5, "font-weight": 600, "text-anchor": "middle", style: "fill:var(--kc-dim)", "data-part": "haxis" }, "Region");
  s += tag("rect", { x: 524, y: 76, width: 10, height: 10, rx: 2, style: "fill:var(--kc-0)", "data-part": "legend" });
  s += tag("text", { x: 540, y: 85, "font-size": 11, style: "fill:var(--kc-ink)", "data-part": "legend" }, "Sales");

  // Hotspots, drawn last so they take the clicks. Chart Area is first in the
  // DOM among them so anything more specific stacked on top wins.
  const spots = [
    { id: "chartarea", x: 8, y: 8, w: W - 16, h: H - 16 },
    { id: "title", x: 20, y: 18, w: 420, h: 24 },
    { id: "plotarea", x: plot.x0, y: plot.y0, w: plot.x1 - plot.x0, h: plot.y1 - plot.y0 },
    { id: "grid", x: plot.x0, y: plot.y0, w: plot.x1 - plot.x0, h: plot.y1 - plot.y0 },
    { id: "vaxis", x: 24, y: plot.y0 - 8, w: 66, h: plot.y1 - plot.y0 + 16 },
    { id: "haxis", x: plot.x0, y: plot.y1 + 4, w: plot.x1 - plot.x0, h: 48 },
    { id: "legend", x: 516, y: 68, w: 108, h: 28 },
    { id: "series", x: plot.x0 + 6, y: plot.y0, w: band * 3 - 6, h: plot.y1 - plot.y0 },
    { id: "point", x: plot.x0 + band * 3 + (band - bw) / 2 - 6, y: yOf(bars[3].v) - 4, w: bw + 12, h: plot.y1 - yOf(bars[3].v) + 4 },
    { id: "labels", x: plot.x0, y: plot.y0 - 6, w: plot.x1 - plot.x0, h: 26 },
  ];
  s += spots
    .map((sp) => tag("rect", { class: "ca-hot", "data-part": sp.id, x: sp.x, y: sp.y, width: sp.w, height: sp.h, rx: 3, tabindex: "0", role: "button", "aria-label": PARTS.find((p) => p.id === sp.id).name }))
    .join("");

  return `<svg viewBox="0 0 ${W} ${H}" class="ca-svg">${s}</svg>`;
}

function mountAnatomy(host) {
  host.classList.add("chartlab", "chartanat");
  host.innerHTML = `
    <div class="ca-wrap">
      <div class="ca-stage">${anatomySvg()}</div>
      <aside class="ca-info">
        <div class="ca-name">Every part has a name</div>
        <p class="ca-lead">Excel formats whatever is selected — so half of formatting a chart is knowing what a thing is called and how to click it. Pick a part of the chart.</p>
        <dl class="ca-dl" hidden>
          <dt>Select it</dt><dd class="ca-select"></dd>
          <dt>Format it</dt><dd class="ca-format"></dd>
          <dt>Worth knowing</dt><dd class="ca-tip"></dd>
        </dl>
      </aside>
    </div>
    <ol class="ca-chips">${PARTS.map((p) => `<li><button type="button" class="ca-chip" data-part="${p.id}">${esc(p.name)}</button></li>`).join("")}</ol>
    <p class="sheet-note">In Excel, <b>Ctrl+1</b> opens the format pane for whatever is selected, and the <b>↑ / ↓</b> arrow keys walk through every chart element in turn — the fastest way to find a part you can't click.</p>`;

  const svg = host.querySelector(".ca-svg");
  const dl = host.querySelector(".ca-dl");

  function select(id) {
    const part = PARTS.find((p) => p.id === id);
    if (!part) return;
    host.querySelectorAll("[data-part]").forEach((n) => n.classList.toggle("is-on", n.dataset.part === id));
    host.querySelector(".ca-name").textContent = part.name;
    host.querySelector(".ca-lead").hidden = true;
    dl.hidden = false;
    host.querySelector(".ca-select").textContent = part.select;
    host.querySelector(".ca-format").textContent = part.format;
    host.querySelector(".ca-tip").textContent = part.tip;
    svg.setAttribute("data-active", id);
  }

  host.addEventListener("click", (e) => {
    const t = e.target.closest("[data-part]");
    if (t) select(t.dataset.part);
  });
  host.addEventListener("keydown", (e) => {
    const t = e.target.closest(".ca-hot");
    if (t && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      select(t.dataset.part);
    }
  });
}

// ---------------------------------------------------------------------------
// Fixed before/after pairs
//
//   <div data-chart-compare
//        data-left='{"dataset":"subprofit","type":"pie"}'
//        data-left-caption="…" data-right='…' data-right-caption="…"></div>
// ---------------------------------------------------------------------------

function mountCompare(host) {
  let left;
  let right;
  try {
    left = { ...DEFAULT_SPEC, ...JSON.parse(host.dataset.left || "{}") };
    right = { ...DEFAULT_SPEC, ...JSON.parse(host.dataset.right || "{}") };
  } catch (err) {
    host.innerHTML = `<p class="sheet-note">This comparison couldn't start.</p>`;
    return;
  }
  host.classList.add("chartlab", "chartcmp");
  const side = (spec, caption, cls) =>
    `<figure class="cc-side ${cls}">
       <figcaption class="cc-cap">${esc(caption)}</figcaption>
       <div class="cc-canvas">${renderChart(CHART_DATA[spec.dataset], spec)}</div>
     </figure>`;
  host.innerHTML =
    side(left, host.dataset.leftCaption || "Before", "is-bad") +
    side(right, host.dataset.rightCaption || "After", "is-good");
}

// ---------------------------------------------------------------------------

export function mountCharts(root = document) {
  const mounts = [
    ["[data-chart-studio]", mountStudio],
    ["[data-chart-anatomy]", mountAnatomy],
    ["[data-chart-compare]", mountCompare],
  ];
  mounts.forEach(([sel, fn]) => {
    root.querySelectorAll(sel).forEach((host) => {
      if (host.dataset.chartReady) return;
      host.dataset.chartReady = "1";
      try {
        fn(host);
      } catch (err) {
        host.innerHTML = `<p class="sheet-note">This interactive couldn't start.</p>`;
        console.error("chart mount failed", err);
      }
    });
  });
}
