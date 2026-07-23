import "./style.css";

// ---------------------------------------------------------------------------
// Content map: tab -> sub -> loader returning the fragment's HTML
// ---------------------------------------------------------------------------
const content = {
  sql: {
    setup: () => fetch("/sql/setup.html").then((r) => r.text()),
    select: () => fetch("/sql/select.html").then((r) => r.text()),
    where: () => fetch("/sql/where.html").then((r) => r.text()),
    join: () => fetch("/sql/join.html").then((r) => r.text()),
    groupby: () => fetch("/sql/groupby.html").then((r) => r.text()),
    having: () => fetch("/sql/having.html").then((r) => r.text()),
    subquery: () => fetch("/sql/subquery.html").then((r) => r.text()),
    cte: () => fetch("/sql/cte.html").then((r) => r.text()),
    case: () => fetch("/sql/case.html").then((r) => r.text()),
    union: () => fetch("/sql/union.html").then((r) => r.text()),
    window: () => fetch("/sql/window.html").then((r) => r.text()),
    questions: () => fetch("/sql/questions.html").then((r) => r.text()),
    analysis: () => fetch("/sql/analysis.html").then((r) => r.text()),
    abtesting: () => fetch("/sql/abtesting.html").then((r) => r.text()),
  },
  excel: {
    // Foundations
    setup: () => fetch("/excel/setup.html").then((r) => r.text()),
    formulas: () => fetch("/excel/formulas.html").then((r) => r.text()),
    references: () => fetch("/excel/references.html").then((r) => r.text()),
    // Core functions
    logical: () => fetch("/excel/logical.html").then((r) => r.text()),
    aggregation: () => fetch("/excel/aggregation.html").then((r) => r.text()),
    lookup: () => fetch("/excel/lookup.html").then((r) => r.text()),
    text: () => fetch("/excel/text.html").then((r) => r.text()),
    dates: () => fetch("/excel/dates.html").then((r) => r.text()),
    arrays: () => fetch("/excel/arrays.html").then((r) => r.text()),
    // Working with datasets
    tables: () => fetch("/excel/tables.html").then((r) => r.text()),
    validation: () => fetch("/excel/validation.html").then((r) => r.text()),
    powerquery: () => fetch("/excel/powerquery.html").then((r) => r.text()),
    pivot: () => fetch("/excel/pivot.html").then((r) => r.text()),
    // Communicating results
    charts: () => fetch("/excel/charts.html").then((r) => r.text()),
    chartdecision: () => fetch("/excel/chartdecision.html").then((r) => r.text()),
    dashboard: () => fetch("/excel/dashboard.html").then((r) => r.text()),
    // Reference
    shortcuts: () => fetch("/excel/shortcuts.html").then((r) => r.text()),
  },
  tableau: {
    setup: () => fetch("/tableau/setup.html").then((r) => r.text()),
    interface: () => fetch("/tableau/interface.html").then((r) => r.text()),
    charts: () => fetch("/tableau/charts.html").then((r) => r.text()),
    filters: () => fetch("/tableau/filters.html").then((r) => r.text()),
    calculated: () => fetch("/tableau/calculated.html").then((r) => r.text()),
    dashboards: () => fetch("/tableau/dashboards.html").then((r) => r.text()),
    maps: () => fetch("/tableau/maps.html").then((r) => r.text()),
  },
  powerbi: {
    setup: () => fetch("/powerbi/setup.html").then((r) => r.text()),
    interface: () => fetch("/powerbi/interface.html").then((r) => r.text()),
    visuals: () => fetch("/powerbi/visuals.html").then((r) => r.text()),
    filters: () => fetch("/powerbi/filters.html").then((r) => r.text()),
    dax: () => fetch("/powerbi/dax.html").then((r) => r.text()),
    modeling: () => fetch("/powerbi/modeling.html").then((r) => r.text()),
    reports: () => fetch("/powerbi/reports.html").then((r) => r.text()),
  },
  math: {
    statistics: () => fetch("/math/statistics.html").then((r) => r.text()),
  },
  python: {
    pandas: () => fetch("/python/pandas.html").then((r) => r.text()),
    seaborn: () => fetch("/python/seaborn.html").then((r) => r.text()),
    basics: () => fetch("/python/basics.html").then((r) => r.text()),
    streamlit: () => fetch("/python/streamlit.html").then((r) => r.text()),
    geospatial: () => fetch("/python/geospatial.html").then((r) => r.text()),
    maps: () => fetch("/python/maps.html").then((r) => r.text()),
    geojson: () => fetch("/python/geojson.html").then((r) => r.text()),
    folium: () => fetch("/python/folium.html").then((r) => r.text()),
    nominatim: () => fetch("/python/nominatim.html").then((r) => r.text()),
  },
  ml: {
    // Foundations
    guide: () => fetch("/ml/guide.html").then((r) => r.text()),
    basics: () => fetch("/ml/basics.html").then((r) => r.text()),
    sklearn: () => fetch("/ml/sklearn.html").then((r) => r.text()),
    // Data understanding & prep
    eda: () => fetch("/ml/eda.html").then((r) => r.text()),
    stats: () => fetch("/ml/stats.html").then((r) => r.text()),
    missingdata: () => fetch("/ml/missingdata.html").then((r) => r.text()),
    preprocessing: () => fetch("/ml/preprocessing.html").then((r) => r.text()),
    outliers: () => fetch("/ml/outliers.html").then((r) => r.text()),
    assumptions: () => fetch("/ml/assumptions.html").then((r) => r.text()),
    featureselectionengineering: () =>
      fetch("/ml/featureselectionengineering.html").then((r) => r.text()),
    // Splitting & validation setup
    datasplits: () => fetch("/ml/datasplits.html").then((r) => r.text()),
    stratification: () => fetch("/ml/stratification.html").then((r) => r.text()),
    workflow: () => fetch("/ml/workflow.html").then((r) => r.text()),
    // Supervised models
    models: () => fetch("/ml/models.html").then((r) => r.text()),
    regression: () => fetch("/ml/regression.html").then((r) => r.text()),
    trees: () => fetch("/ml/trees.html").then((r) => r.text()),
    boosting: () => fetch("/ml/boosting.html").then((r) => r.text()),
    // Evaluation & interpretation
    evaluation: () => fetch("/ml/evaluation.html").then((r) => r.text()),
    importance: () => fetch("/ml/importance.html").then((r) => r.text()),
    // Unsupervised & similarity
    clustering: () => fetch("/ml/clustering.html").then((r) => r.text()),
    anomaly: () => fetch("/ml/anomaly.html").then((r) => r.text()),
    association: () => fetch("/ml/association.html").then((r) => r.text()),
    similarity: () => fetch("/ml/similarity.html").then((r) => r.text()),
  },
};

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

// Render math once KaTeX has finished loading (scripts are deferred).
function renderMath(element) {
  if (window.renderMathInElement) {
    window.renderMathInElement(element, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
    });
  } else {
    setTimeout(() => renderMath(element), 100);
  }
}

// Apply syntax highlighting to any code blocks in the freshly loaded fragment.
function highlightCode(element) {
  if (window.hljs) {
    element.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  }
}

// Give every lesson code block a hover-reveal "Copy" button. Lesson samples
// are formulas people are meant to paste into a spreadsheet, so this saves a
// lot of error-prone retyping.
function addCopyButtons(element) {
  element.querySelectorAll(".lesson pre").forEach((pre) => {
    if (pre.parentElement.classList.contains("pre-wrap")) return;

    const wrap = document.createElement("div");
    wrap.className = "pre-wrap";
    pre.replaceWith(wrap);
    wrap.appendChild(pre);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        btn.textContent = "Copied";
        btn.classList.add("is-done");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("is-done");
        }, 1400);
      } catch {
        btn.textContent = "Press ⌘C";
      }
    });
    wrap.appendChild(btn);
  });
}

// Track which panes have already been fetched so we don't refetch on revisit.
const loaded = new Set();

function defaultSub(tab) {
  const first = document.querySelector(`.subtab[data-tab="${tab}"]`);
  return first ? first.dataset.sub : Object.keys(content[tab] || {})[0];
}

// Load (or reveal) a single sub-page, updating the active states and hash.
async function showSub(tab, sub, { updateHash = true, scroll = false } = {}) {
  if (!content[tab] || !content[tab][sub]) sub = defaultSub(tab);
  const el = document.getElementById(`${tab}-${sub}`);
  if (!el) return;

  // Highlight the matching subtab pill.
  document.querySelectorAll(`.subtab[data-tab="${tab}"]`).forEach((b) => {
    b.classList.toggle("is-active", b.dataset.sub === sub);
  });

  // Show this pane, hide the others within the tab.
  document
    .querySelectorAll(`#${tab} .subcontent`)
    .forEach((c) => c.classList.add("hidden"));
  el.classList.remove("hidden");

  // Fetch content the first time this pane is opened.
  if (!loaded.has(`${tab}-${sub}`)) {
    try {
      el.innerHTML = await content[tab][sub]();
      loaded.add(`${tab}-${sub}`);
      renderMath(el);
      highlightCode(el);
      addCopyButtons(el);
    } catch (err) {
      el.innerHTML = `<div class="load-error">
          <p><strong>Couldn't load this page.</strong></p>
          <p>Check your connection and try again.</p>
        </div>`;
      console.error(`Failed to load ${tab}/${sub}.html`, err);
    }
  }

  if (updateHash) history.replaceState(null, "", `#${tab}/${sub}`);
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

// Switch to a top-level tab, then reveal one of its sub-pages.
function showTab(tab, sub, opts = {}) {
  if (!content[tab]) tab = "sql";

  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("is-active", t.dataset.tab === tab);
  });
  document.querySelectorAll(".content").forEach((c) => {
    c.classList.toggle("hidden", c.id !== tab);
  });

  showSub(tab, sub || defaultSub(tab), opts);
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => showTab(btn.dataset.tab, null, { scroll: true }));
});

document.querySelectorAll(".subtab").forEach((btn) => {
  btn.addEventListener("click", () =>
    showSub(btn.dataset.tab, btn.dataset.sub, { scroll: true }),
  );
});

// Deep-linking: open the tab/sub named in the URL hash (#tab/sub).
function routeFromHash({ scroll = false } = {}) {
  const raw = location.hash.replace(/^#/, "");
  const [tab, sub] = raw.split("/");

  if (tab && content[tab]) {
    showTab(tab, sub, { updateHash: false, scroll });
    return;
  }

  // A bare `#anchor` is an in-page link (a lesson's table of contents), not a
  // route. Scroll to it and leave the current tab alone rather than falling
  // through to the default tab.
  if (raw && document.getElementById(raw)) {
    document.getElementById(raw).scrollIntoView({ behavior: "smooth" });
    return;
  }

  showTab("sql", "setup", { updateHash: false });
}

// Following a lesson's prev/next pager changes the hash from the bottom of the
// page, so scroll back to the top on any hash-driven route change.
window.addEventListener("hashchange", () => routeFromHash({ scroll: true }));
routeFromHash();

// In-page anchors inside a loaded fragment: scroll without touching the hash,
// so the URL keeps pointing at the lesson rather than the section.
document.addEventListener("click", (e) => {
  const link = e.target.closest('.subcontent a[href^="#"]');
  if (!link) return;

  const id = link.getAttribute("href").slice(1);
  if (!id || content[id.split("/")[0]]) return; // let real routes through

  const target = document.getElementById(id);
  if (!target) return;

  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth" });
});

// Live filtering for long reference lists (the shortcuts table). An input with
// `data-filter="<scope-id>"` hides any `[data-filter-item]` in that scope that
// doesn't match, and drops group headings that end up with nothing under them.
document.addEventListener("input", (e) => {
  const input = e.target.closest("input[data-filter]");
  if (!input) return;

  const scope = document.getElementById(input.dataset.filter);
  if (!scope) return;

  const query = input.value.trim().toLowerCase();
  const rows = [...scope.querySelectorAll("[data-filter-item], [data-filter-group]")];

  let shown = 0;
  let group = null;
  let groupHits = 0;

  const closeGroup = () => {
    if (group) group.classList.toggle("is-filtered", groupHits === 0);
  };

  rows.forEach((row) => {
    if (row.hasAttribute("data-filter-group")) {
      closeGroup();
      group = row;
      groupHits = 0;
      return;
    }
    const hit = !query || row.textContent.toLowerCase().includes(query);
    row.classList.toggle("is-filtered", !hit);
    if (hit) {
      shown++;
      groupHits++;
    }
  });
  closeGroup();

  scope.classList.toggle("is-empty", shown === 0);

  const counter = document.querySelector(`[data-filter-count="${input.dataset.filter}"]`);
  if (counter) {
    counter.textContent = query
      ? `${shown} match${shown === 1 ? "" : "es"}`
      : counter.dataset.total || "";
  }
});

// Back-to-top button: reveal after scrolling down a bit.
const toTop = document.getElementById("to-top");
if (toTop) {
  const onScroll = () => toTop.classList.toggle("is-visible", window.scrollY > 400);
  window.addEventListener("scroll", onScroll, { passive: true });
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
  onScroll();
}
