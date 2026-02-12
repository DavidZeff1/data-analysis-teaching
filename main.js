import "./style.css";

// Helper function to render math - waits for KaTeX to be ready
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
    // KaTeX not ready yet, retry after a short delay
    setTimeout(() => renderMath(element), 100);
  }
}

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
  excel: {
    shortcuts: () => fetch("/excel/shortcuts.html").then((r) => r.text()),
    setup: () => fetch("/excel/setup.html").then((r) => r.text()),
    formulas: () => fetch("/excel/formulas.html").then((r) => r.text()),
    references: () => fetch("/excel/references.html").then((r) => r.text()),
    logical: () => fetch("/excel/logical.html").then((r) => r.text()),
    lookup: () => fetch("/excel/lookup.html").then((r) => r.text()),
    text: () => fetch("/excel/text.html").then((r) => r.text()),
    pivot: () => fetch("/excel/pivot.html").then((r) => r.text()),
    charts: () => fetch("/excel/charts.html").then((r) => r.text()),
    powerquery: () => fetch("/excel/powerquery.html").then((r) => r.text()),
    validation: () => fetch("/excel/validation.html").then((r) => r.text()),
    chartdecision: () => fetch("/excel/chartdecision.html").then((r) => r.text()),
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
  ml: {
    guide: () => fetch("/ml/guide.html").then((r) => r.text()),
    basics: () => fetch("/ml/basics.html").then((r) => r.text()),
    trees: () => fetch("/ml/trees.html").then((r) => r.text()),
  },
};

document.querySelectorAll(".tab").forEach((btn) => {
  btn.onclick = () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("bg-blue-500", "text-white"));
    document
      .querySelectorAll(".content")
      .forEach((c) => c.classList.add("hidden"));
    btn.classList.add("bg-blue-500", "text-white");
    const tabId = btn.dataset.tab;
    document.getElementById(tabId).classList.remove("hidden");

    if (content[tabId]) {
      const firstSub = Object.keys(content[tabId])[0];
      content[tabId][firstSub]().then((html) => {
        const el = document.getElementById(`${tabId}-${firstSub}`);
        el.innerHTML = html;
        renderMath(el);
      });
    }
  };
});

document.querySelectorAll(".subtab").forEach((btn) => {
  btn.onclick = async () => {
    const tab = btn.dataset.tab;
    const sub = btn.dataset.sub;

    document.querySelectorAll(`.subtab[data-tab="${tab}"]`).forEach((t) => {
      t.classList.remove("bg-green-500", "text-white");
      t.classList.add("bg-gray-200");
    });
    btn.classList.remove("bg-gray-200");
    btn.classList.add("bg-green-500", "text-white");

    document
      .querySelectorAll(`[id^="${tab}-"]`)
      .forEach((c) => c.classList.add("hidden"));
    const el = document.getElementById(`${tab}-${sub}`);
    el.innerHTML = await content[tab][sub]();
    renderMath(el);
    el.classList.remove("hidden");
  };
});

content.sql
  .setup()
  .then((html) => (document.getElementById("sql-setup").innerHTML = html));
