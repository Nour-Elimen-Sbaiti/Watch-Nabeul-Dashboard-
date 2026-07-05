
import { useState } from "react";
import AccuracyPanel from "./AccuracyPanel";
import ChangeStats from "./ChangeStats";
import ChartsPanel from "./ChartsPanel";
import StatsTable from "./StatsTable";
import EnhancedStatsTable from "./EnhancedStatsTable";
import ConfusionMatrix from "./ConfusionMatrix";
import LandscapeMetrics from "./LandscapeMetrics";
import EnvironmentalIndicators, { CarbonStorageDetail, BiodiversityDetail, UrbanHeatDetail, SoilErosionDetail } from "./EnvironmentalIndicators";
import ScenarioPlanner from "./ScenarioPlanner";
import TimeSeriesPlayer from "./TimeSeriesPlayer";
import KPICard from "./KPICard";
import AutoInsights from "./AutoInsights";
import PairedBarChart from "./PairedBarChart";
import { LAND_USE_CLASSES } from "../services/rasterConfig";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend as ChartLegend, Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, ChartLegend, Filler
);

/* ─── Shared styles ──────────────────────────────────────────── */
const sectionTitle = {
  fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 400,
  color: "var(--color-text)", marginBottom: "1rem", paddingBottom: "0.65rem",
  borderBottom: "1px solid var(--color-border-light)",
};

const tabBtn = (active) => ({
  minHeight: 36, padding: "0.45rem 0.85rem",
  borderRadius: "var(--radius-sm)",
  border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border-light)"}`,
  background: active ? "rgba(217,119,6,0.1)" : "var(--color-surface)",
  color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
  fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
});

const hCell = {
  padding: "0.8rem 1rem", textAlign: "left",
  background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)",
  borderBottom: "2px solid var(--color-border-light)",
  fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.05em",
  textTransform: "uppercase", fontFamily: "var(--font-body)",
};
const bCell = {
  padding: "0.75rem 1rem", borderBottom: "1px solid var(--color-border-light)",
  color: "var(--color-text-secondary)", fontFamily: "var(--font-body)",
};

/* ─── Fallback data ─────────────────────────────────────────── */
const DEFAULT_STATS = {
  "2020": { Water: { area: 55.9, percentage: 1.96 }, Built_up: { area: 71.7, percentage: 2.51 }, Forest: { area: 800.2, percentage: 27.99 }, Agricultural_area: { area: 1931.2, percentage: 67.55 } },
  "2025": { Water: { area: 16.6, percentage: 0.58 }, Built_up: { area: 128.6, percentage: 4.50 }, Forest: { area: 867.7, percentage: 30.35 }, Agricultural_area: { area: 1846.2, percentage: 64.57 } },
};
const DEFAULT_ACC = {
  "2020": { oa: 91.5, kappa: 0.884 },
  "2025": { oa: 88.0, kappa: 0.851 },
};

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyState({ msg }) {
  return (
    <div style={{
      padding: "2rem", borderRadius: "var(--radius-md)",
      background: "var(--color-bg-secondary)",
      border: "1px dashed var(--color-border-light)",
      color: "var(--color-text-secondary)", textAlign: "center",
      fontFamily: "var(--font-body)", fontWeight: 600,
    }}>
      {msg}
    </div>
  );
}

/* ─── KPI row ────────────────────────────────────────────────── */
function KpiRow({ items }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
      gap: "0.75rem", marginBottom: "1.25rem",
    }}>
      {items.map((c) => (
        <div
          key={c.label}
          style={{
            padding: "0.9rem 1rem", background: "var(--color-bg-secondary)",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${c.color}22`, borderLeft: `3px solid ${c.color}`,
          }}
        >
          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: c.color, lineHeight: 1.1, fontFamily: "var(--font-body)" }}>
            {c.value}
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text)", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>
            {c.label}
          </div>
          {c.sub && (
            <div style={{ fontSize: "0.67rem", color: "var(--color-text-muted)", marginTop: "0.15rem", fontFamily: "var(--font-body)" }}>
              {c.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Transition Matrix ──────────────────────────────────────── */
function matrixCellBg(value, maxValue, stable) {
  if (stable)    return `rgba(22,163,74,${0.08 + 0.3 * (value / maxValue)})`;
  if (!value)    return "transparent";
  return `rgba(217,119,6,${0.06 + 0.22 * (value / maxValue)})`;
}

function TransitionMatrix({ matrix }) {
  const classes = matrix?.classes    || LAND_USE_CLASSES.map((c) => c.key);
  const rows    = matrix?.matrix_km2 || [];

  if (!rows.length || !Array.isArray(rows))
    return <EmptyState msg="Transition matrix data is not available." />;

  const maxValue = Math.max(...rows.flat().filter(Boolean), 1);

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ marginBottom: "0.75rem", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
        Land-use transitions between 2020 and 2025 (km²). Diagonal cells show stable areas.
      </div>
      <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", fontSize: "0.84rem", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <thead>
          <tr>
            <th style={hCell}>From / To</th>
            {classes.map((n) => (
              <th key={n} style={{ ...hCell, textAlign: "center" }}>{n.replace("_", " ")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <td style={{ ...bCell, fontWeight: 700, color: "var(--color-text)", whiteSpace: "nowrap" }}>
                {classes[ri]?.replace("_", " ")}
              </td>
              {row.map((val, ci) => {
                const stable = ri === ci;
                return (
                  <td
                    key={ci}
                    style={{
                      ...bCell, textAlign: "center", fontVariantNumeric: "tabular-nums",
                      color: stable ? "var(--color-success)" : val > 0 ? "var(--color-primary)" : "var(--color-text-muted)",
                      fontWeight: stable ? 800 : 600,
                      background: matrixCellBg(Number(val) || 0, maxValue, stable),
                    }}
                  >
                    {typeof val === "number" ? val.toFixed(1) : val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── LULC stats ─────────────────────────────────────────────── */
function LulcStats({ tableStats, chartStats, accuracy, selectedYear, setSelectedYear, transitionMatrix, modelVariant }) {
  const [tab, setTab] = useState("overview");

  const stats    = tableStats || DEFAULT_STATS;
  const acc      = accuracy   || DEFAULT_ACC;
  const yearData = stats[selectedYear] || {};

  const totalArea = Object.values(yearData).reduce((s, v) => s + (v.area || 0), 0);
  const builtPct  = yearData.Built_up?.percentage  ?? 0;
  const forestPct = yearData.Forest?.percentage    ?? 0;
  const oa        = acc[selectedYear]?.oa           ?? 0;

  const otherYear = selectedYear === "2025" ? "2020" : "2025";
  const otherYearData = stats[otherYear] || {};
  const builtDelta = builtPct - (otherYearData.Built_up?.percentage ?? 0);
  const forestDelta = forestPct - (otherYearData.Forest?.percentage ?? 0);

  return (
    <div>
      {/* KPI Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "0.75rem",
        marginBottom: "1.25rem",
      }}>
        <KPICard
          value={`${totalArea.toFixed(1)}`}
          label="Total Area"
          subLabel="km²"
          color="var(--color-primary)"
          delta={`${selectedYear} data`}
          size="medium"
        />
        <KPICard
          value={`${builtPct.toFixed(1)}%`}
          label="Built-up Cover"
          subLabel={`${yearData.Built_up?.area?.toFixed(0) ?? "—"} km²`}
          color="#dc2626"
          delta={builtDelta !== 0 ? `${builtDelta >= 0 ? "+" : ""}${builtDelta.toFixed(1)}%` : undefined}
          deltaValue={builtDelta}
          size="medium"
        />
        <KPICard
          value={`${forestPct.toFixed(1)}%`}
          label="Forest Cover"
          subLabel={`${yearData.Forest?.area?.toFixed(0) ?? "—"} km²`}
          color="#15803d"
          delta={forestDelta !== 0 ? `${forestDelta >= 0 ? "+" : ""}${forestDelta.toFixed(1)}%` : undefined}
          deltaValue={forestDelta}
          size="medium"
        />
        <KPICard
          value={`${oa.toFixed(1)}%`}
          label={`Accuracy (${(modelVariant || "cnn").toUpperCase()})`}
          subLabel={`κ = ${acc[selectedYear]?.kappa?.toFixed(3) ?? "—"}`}
          color="#0891b2"
          size="medium"
        />
      </div>

      {/* Tab buttons */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {[
          { key: "overview",      label: "Overview"          },
          { key: "timeseries",    label: "Time Series"       },
          { key: "scenario",      label: "Scenario Planner"  },
          { key: "accuracy",      label: "Accuracy"          },
          { key: "confusion",     label: "Confusion Matrix"  },
          { key: "landscape",     label: "Landscape Metrics" },
          { key: "matrix",        label: "Transition Matrix" },
          { key: "environmental", label: "Environmental"     },
          { key: "carbon",        label: "Carbon Storage"    },
          { key: "biodiversity",  label: "Biodiversity"      },
          { key: "urbanheat",     label: "Urban Heat"        },
          { key: "soilerosion",   label: "Soil Erosion"      },
        ].map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} style={tabBtn(tab === t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab — single ChartsPanel only, no duplicate */}
      {tab === "overview" && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <ChartsPanel stats={chartStats} />

          {/* Paired Bar Chart */}
          {stats && Object.keys(stats).length > 0 && (
            <div className="card" style={{ animationDelay: "0.15s" }}>
              <PairedBarChart stats={stats} />
            </div>
          )}

          {/* Auto-Generated Insights */}
          {stats && Object.keys(stats).length > 0 && (
            <div className="card" style={{ animationDelay: "0.2s" }}>
              <AutoInsights stats={stats} changeData={null} />
            </div>
          )}

          {/* Enhanced Stats Table */}
          <EnhancedStatsTable stats={tableStats} year={selectedYear} />
        </div>
      )}

      {tab === "timeseries"    && <TimeSeriesPlayer tableStats={tableStats} />}
      {tab === "scenario"      && <ScenarioPlanner tableStats={tableStats} />}
      {tab === "accuracy"      && <AccuracyPanel accuracy={accuracy} year={selectedYear} setYear={setSelectedYear} />}
      {tab === "confusion"     && <ConfusionMatrix confusionMatrix={accuracy?.confusionMatrix} modelVariant={modelVariant} year={selectedYear} />}
      {tab === "landscape"     && <LandscapeMetrics tableStats={tableStats} selectedYear={selectedYear} />}
      {tab === "matrix"        && <TransitionMatrix matrix={transitionMatrix} />}
      {tab === "environmental" && <EnvironmentalIndicators />}
      {tab === "carbon"        && <CarbonStorageDetail tableStats={tableStats} />}
      {tab === "biodiversity"  && <BiodiversityDetail tableStats={tableStats} />}
      {tab === "urbanheat"     && <UrbanHeatDetail tableStats={tableStats} />}
      {tab === "soilerosion"   && <SoilErosionDetail tableStats={tableStats} />}
    </div>
  );
}

/* ─── NDVI stats ─────────────────────────────────────────────── */
const NDVI_SERIES = {
  labels: ["2015", "2017", "2019", "2020", "2021", "2022", "2023", "2025"],
  mean:   [0.31, 0.33, 0.29, 0.28, 0.30, 0.27, 0.26, 0.25],
  max:    [0.72, 0.74, 0.71, 0.70, 0.73, 0.69, 0.68, 0.66],
  min:    [0.04, 0.05, 0.04, 0.03, 0.04, 0.03, 0.03, 0.02],
};
const NDVI_BY_CLASS = {
  labels: ["Water", "Built-up", "Forest", "Agricultural Area"],
  data:   [0.05, 0.08, 0.62, 0.38],
  colors: ["#0891b2cc", "#dc2626cc", "#15803dcc", "#65a30dcc"],
};

function NdviStats({ selectedYear }) {
  const idx   = selectedYear === "2020" ? 3 : 7;
  const mean  = NDVI_SERIES.mean[idx];
  const max   = NDVI_SERIES.max[idx];
  const trend = ((NDVI_SERIES.mean[7] - NDVI_SERIES.mean[3]) / NDVI_SERIES.mean[3] * 100).toFixed(1);

  const kpis = [
    { label: `Mean NDVI ${selectedYear}`, value: mean.toFixed(2), color: "#15803d", sub: "Nabeul region average" },
    { label: `Max NDVI ${selectedYear}`,  value: max.toFixed(2),  color: "#22c55e", sub: "Peak vegetation"       },
    { label: "5-yr Trend",               value: `${trend}%`,     color: Number(trend) < 0 ? "#dc2626" : "#15803d", sub: "2020 to 2025 mean" },
  ];

  const lineData = {
    labels: NDVI_SERIES.labels,
    datasets: [
      { label: "Mean NDVI", data: NDVI_SERIES.mean, borderColor: "#15803d", backgroundColor: "rgba(21,128,61,0.12)", fill: true,  tension: 0.4, pointRadius: 5, pointBackgroundColor: "#15803d" },
      { label: "Max NDVI",  data: NDVI_SERIES.max,  borderColor: "#22c55e", backgroundColor: "transparent", borderDash: [5, 3], tension: 0.4, pointRadius: 3 },
      { label: "Min NDVI",  data: NDVI_SERIES.min,  borderColor: "#86efac", backgroundColor: "transparent", borderDash: [3, 3], tension: 0.4, pointRadius: 3 },
    ],
  };
  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 14, font: { size: 11, family: "var(--font-body)" } } },
      tooltip: { backgroundColor: "rgba(15,23,42,0.9)", padding: 10, cornerRadius: 8 },
    },
    scales: {
      y: { min: 0, max: 0.85, ticks: { callback: (v) => v.toFixed(2), font: { size: 10 } }, grid: { color: "rgba(21,128,61,0.07)" } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  };

  return (
    <div>
      <KpiRow items={kpis} />
      <div style={{ height: 240, background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "1rem", border: "1px solid var(--color-border-light)", marginBottom: "1.25rem" }}>
        <Line data={lineData} options={lineOpts} />
      </div>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.65rem", fontFamily: "var(--font-body)" }}>
        Mean NDVI by Land Cover Class ({selectedYear})
      </div>
      <div style={{ height: 160, background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "0.85rem", border: "1px solid var(--color-border-light)" }}>
        <Bar
          data={{ labels: NDVI_BY_CLASS.labels, datasets: [{ label: "Mean NDVI", data: NDVI_BY_CLASS.data, backgroundColor: NDVI_BY_CLASS.colors, borderRadius: 5 }] }}
          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: "rgba(15,23,42,0.9)", padding: 10 } }, scales: { y: { min: 0, max: 0.75, ticks: { callback: (v) => v.toFixed(2), font: { size: 10 } }, grid: { color: "rgba(0,0,0,0.04)" } }, x: { grid: { display: false }, ticks: { font: { size: 10 } } } } }}
        />
      </div>
    </div>
  );
}

/* ─── Change Detection stats ─────────────────────────────────── */
const DEFAULT_CHANGE_CLASSES = [
  { name: "Built_up",          area2020: 71.7,   area2025: 128.6,  color: "#dc2626" },
  { name: "Agricultural_area", area2020: 1931.2, area2025: 1846.2, color: "#65a30d" },
  { name: "Forest",            area2020: 800.2,  area2025: 867.7,  color: "#15803d" },
  { name: "Water",             area2020: 55.9,   area2025: 16.6,   color: "#0891b2" },
];

function ChangeDetectionStats({ changeData, transitionMatrix, tableStats }) {
  const [tab, setTab] = useState("summary");

  const changeClasses = (() => {
    const s = tableStats;
    if (s?.["2020"] && s?.["2025"]) {
      return LAND_USE_CLASSES.map((lc) => ({
        name:     lc.key,
        area2020: s["2020"][lc.key]?.area ?? 0,
        area2025: s["2025"][lc.key]?.area ?? 0,
        color:    lc.color,
      }));
    }
    return DEFAULT_CHANGE_CLASSES;
  })();

  const kpis = changeClasses.map((c) => {
    const diff = c.area2025 - c.area2020;
    const pct  = c.area2020 > 0 ? ((diff / c.area2020) * 100).toFixed(1) : "0.0";
    return {
      label: c.name.replace("_", " "),
      value: `${diff >= 0 ? "+" : ""}${pct}%`,
      color: c.color,
      sub:   `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} km²`,
    };
  });

  const barData = {
    labels: changeClasses.map((c) => c.name.replace("_", " ")),
    datasets: [
      { label: "2020", data: changeClasses.map((c) => c.area2020), backgroundColor: changeClasses.map((c) => c.color + "88"), borderRadius: 4 },
      { label: "2025", data: changeClasses.map((c) => c.area2025), backgroundColor: changeClasses.map((c) => c.color),        borderRadius: 4 },
    ],
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 14, font: { size: 11, family: "var(--font-body)" } } },
      tooltip: { backgroundColor: "rgba(15,23,42,0.9)", padding: 10 },
    },
    scales: {
      y: { ticks: { font: { size: 10 } }, grid: { color: "rgba(0,0,0,0.04)" } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  };

  return (
    <div>
      <KpiRow items={kpis} />
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {["summary", "classes", "matrix"].map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} style={tabBtn(tab === t)}>
            {t === "summary" ? "Change Summary" : t === "classes" ? "By Class" : "Transition Matrix"}
          </button>
        ))}
      </div>

      {tab === "summary" && <ChangeStats changeData={changeData} />}

      {tab === "classes" && (
        <div>
          <div style={{ height: 240, background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "1rem", border: "1px solid var(--color-border-light)", marginBottom: "1.25rem" }}>
            <Bar data={barData} options={barOpts} />
          </div>
          <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--color-border-light)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  {["Class", "Area 2020 (km²)", "Area 2025 (km²)", "Change (km²)", "Change (%)"].map((h) => (
                    <th key={h} style={hCell}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {changeClasses.map((c) => {
                  const diff = c.area2025 - c.area2020;
                  const pct  = c.area2020 > 0 ? ((diff / c.area2020) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={c.name}>
                      <td style={bCell}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{c.name.replace("_", " ")}</span>
                        </div>
                      </td>
                      <td style={{ ...bCell, fontVariantNumeric: "tabular-nums" }}>{c.area2020.toLocaleString()}</td>
                      <td style={{ ...bCell, fontVariantNumeric: "tabular-nums" }}>{c.area2025.toLocaleString()}</td>
                      <td style={{ ...bCell, fontVariantNumeric: "tabular-nums", color: diff >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                        {diff >= 0 ? "+" : ""}{diff.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td style={{ ...bCell, fontVariantNumeric: "tabular-nums", color: diff >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                        {diff >= 0 ? "+" : ""}{pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "matrix" && <TransitionMatrix matrix={transitionMatrix} />}
    </div>
  );
}

/* ─── All tabs ───────────────────────────────────────────────── */
const ALL_TABS = [
  { key: "overview",      label: "Overview"                    },
  { key: "change",        label: "Change Detection"            },
  { key: "ndvi",          label: "NDVI Trend"                  },
  { key: "environmental", label: "Environmental Indicators"    },
  { key: "accuracy",      label: "Accuracy"                    },
  { key: "confusion",     label: "Confusion Matrix"            },
  { key: "landscape",     label: "Landscape Metrics"           },
  { key: "matrix",        label: "Transition Matrix"           },
];

/* ─── Main export ────────────────────────────────────────────── */
export default function StatisticsTabs({
  chartStats, tableStats, accuracy, changeData,
  transitionMatrix, selectedYear, setSelectedYear,
  layerType, modelVariant = "cnn",
}) {
  const [allTab, setAllTab] = useState("overview");

  const titleMap = {
    classification: `LULC Statistics — ${selectedYear} (${modelVariant.toUpperCase()})`,
    ndvi:           `NDVI Statistics — ${selectedYear}`,
    change:         "Change Detection — 2020 to 2025",
  };

  return (
    <section className="card" style={{ animationDelay: "0.25s" }}>
      <h3 style={sectionTitle}>{titleMap[layerType] || "Statistics"}</h3>

      {/* LULC layer */}
      {layerType === "classification" && (
        <LulcStats
          tableStats={tableStats}
          chartStats={chartStats}
          accuracy={accuracy}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          transitionMatrix={transitionMatrix}
          modelVariant={modelVariant}
        />
      )}

      {/* NDVI layer */}
      {layerType === "ndvi" && <NdviStats selectedYear={selectedYear} />}

      {/* Change Detection layer */}
      {layerType === "change" && (
        <ChangeDetectionStats
          changeData={changeData}
          transitionMatrix={transitionMatrix}
          tableStats={tableStats}
        />
      )}

      {/* Fallback full view */}
      {!["classification", "ndvi", "change"].includes(layerType) && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {ALL_TABS.map((t) => (
              <button key={t.key} type="button" onClick={() => setAllTab(t.key)} style={tabBtn(allTab === t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          {allTab === "overview"      && <div style={{ display: "grid", gap: "1.25rem" }}><ChartsPanel stats={chartStats} /><StatsTable stats={tableStats} year={selectedYear} /></div>}
          {allTab === "change"        && <ChangeStats changeData={changeData} />}
          {allTab === "ndvi"          && <NdviStats selectedYear={selectedYear} />}
          {allTab === "environmental" && <EnvironmentalIndicators />}
          {allTab === "accuracy"      && <AccuracyPanel accuracy={accuracy} year={selectedYear} setYear={setSelectedYear} />}
          {allTab === "confusion"     && <ConfusionMatrix modelVariant={modelVariant} year={selectedYear} />}
          {allTab === "landscape"     && <LandscapeMetrics tableStats={tableStats} selectedYear={selectedYear} />}
          {allTab === "matrix"        && <TransitionMatrix matrix={transitionMatrix} />}
        </>
      )}
    </section>
  );
}