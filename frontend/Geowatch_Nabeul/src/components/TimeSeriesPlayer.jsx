import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

import { LAND_USE_CLASSES } from "../services/rasterConfig";

/* ─── Styles ─────────────────────────────────────────────────── */
const sectionTitle = {
  fontFamily: "var(--font-display)",
  fontSize: "1.05rem",
  fontWeight: 400,
  color: "var(--color-text)",
  marginBottom: "1rem",
  paddingBottom: "0.65rem",
  borderBottom: "1px solid var(--color-border-light)",
};

/* ─── Year Indicator ───────────────────────────────────────── */
function YearIndicator({ year, isCurrent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.5rem 1rem",
        background: isCurrent ? "var(--color-primary)" : "var(--color-bg-secondary)",
        color: isCurrent ? "#fff" : "var(--color-text-secondary)",
        border: isCurrent ? "2px solid var(--color-primary)" : "1px solid var(--color-border-light)",
        borderRadius: "var(--radius-md)",
        fontSize: "0.85rem",
        fontWeight: isCurrent ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
        minWidth: "60px",
      }}
    >
      {year}
    </button>
  );
}

/* ─── KPI Card for Comparison ───────────────────────────────── */
function ComparisonKPICard({ label, value2020, value2025, color, icon }) {
  const change = value2020 > 0 ? ((value2025 - value2020) / value2020 * 100) : 0;
  return (
    <div
      style={{
        padding: "1rem",
        background: "var(--color-bg-secondary)",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>2020</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text)" }}>{value2020.toFixed(1)} km²</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>2025</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text)" }}>{value2025.toFixed(1)} km²</div>
        </div>
      </div>
      <div
        style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          color: change >= 0 ? "#16a34a" : "#dc2626",
          marginTop: "0.5rem",
          textAlign: "center",
          padding: "0.25rem",
          background: change >= 0 ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)",
          borderRadius: "4px",
        }}
      >
        {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}% change
      </div>
    </div>
  );
}

/* ─── Default fallback data ─────────────────────────────────── */
const DEFAULT_COMPARISON_DATA = {
  Water: { val2020: 55.9, val2025: 16.6 },
  Built_up: { val2020: 71.7, val2025: 128.6 },
  Forest: { val2020: 800.2, val2025: 867.7 },
  Agricultural_area: { val2020: 1931.2, val2025: 1846.2 },
};

/* ─── Main Time Series Comparison Component ──────────────────── */
export default function TimeSeriesPlayer({ tableStats }) {
  const years = ["2020", "2025"];
  const [selectedView, setSelectedView] = useState("comparison");

  // Extract data from tableStats for 2020 and 2025
  const getComparisonData = () => {
    if (!tableStats || !tableStats["2020"] || !tableStats["2025"]) {
      return DEFAULT_COMPARISON_DATA;
    }
    const data = {};
    LAND_USE_CLASSES.forEach((lc) => {
      const val2020 = tableStats["2020"][lc.key]?.area || 0;
      const val2025 = tableStats["2025"][lc.key]?.area || 0;
      data[lc.key] = { val2020, val2025 };
    });
    return data;
  };

  const comparisonData = getComparisonData();

  // Chart data for trends (just 2 years)
  const trendChartData = {
    labels: years,
    datasets: LAND_USE_CLASSES.map((lc) => ({
      label: lc.name,
      data: [comparisonData[lc.key]?.val2020 || 0, comparisonData[lc.key]?.val2025 || 0],
      borderColor: lc.color,
      backgroundColor: lc.color + "22",
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: lc.color,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
    })),
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.9)",
        padding: 10,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} km²`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        ticks: { callback: (v) => v + " km²", font: { size: 10 } },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  };


  // Calculate total changes
  const totalChanges = LAND_USE_CLASSES.map((lc) => {
    const val2020 = comparisonData[lc.key]?.val2020 || 0;
    const val2025 = comparisonData[lc.key]?.val2025 || 0;
    const change = val2025 - val2020;
    const changePercent = val2020 > 0 ? (change / val2020) * 100 : 0;
    return {
      ...lc,
      val2020,
      val2025,
      change,
      changePercent,
    };
  }).sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

  const icons = {
    Water: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>,
    Built_up: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /></svg>,
    Forest: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L8 8h3v4h2V8h3z" /><path d="M12 12v10" /><path d="M8 22h8" /></svg>,
    Agricultural_area: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22v-5" /><path d="M5 17h14" /><path d="M12 17V7" /><path d="M5 7h14" /><path d="M12 2L8 7h8z" /></svg>,
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h3 style={sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Land Use Comparison (2020 vs 2025)
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Compare land-use changes between 2020 and 2025. View trends and analyze the magnitude of changes across all land-use classes.
        </p>
      </div>

      {/* View Toggle */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => setSelectedView("comparison")}
          style={{
            padding: "0.5rem 1rem",
            background: selectedView === "comparison" ? "var(--color-primary)" : "var(--color-bg-secondary)",
            color: selectedView === "comparison" ? "#fff" : "var(--color-text-secondary)",
            border: selectedView === "comparison" ? "1px solid var(--color-primary)" : "1px solid var(--color-border-light)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Side-by-Side Comparison
        </button>
        <button
          onClick={() => setSelectedView("trends")}
          style={{
            padding: "0.5rem 1rem",
            background: selectedView === "trends" ? "var(--color-primary)" : "var(--color-bg-secondary)",
            color: selectedView === "trends" ? "#fff" : "var(--color-text-secondary)",
            border: selectedView === "trends" ? "1px solid var(--color-primary)" : "1px solid var(--color-border-light)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Trend Charts
        </button>
      </div>

      {/* Comparison KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
        {LAND_USE_CLASSES.map((lc) => (
          <ComparisonKPICard
            key={lc.key}
            label={lc.name}
            value2020={comparisonData[lc.key]?.val2020 || 0}
            value2025={comparisonData[lc.key]?.val2025 || 0}
            color={lc.color}
            icon={icons[lc.key]}
          />
        ))}
      </div>

      {selectedView === "trends" && (
        <div className="card" style={{ animationDelay: "0.1s" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
            Land-Use Trends (2020 → 2025)
          </h4>
          <div style={{ height: 350 }}>
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </div>
      )}

      {/* Change Summary Table */}
      <div className="card" style={{ animationDelay: "0.15s" }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
          Detailed Change Summary (2020 → 2025)
        </h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase" }}>Class</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase" }}>2020 (km²)</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase" }}>2025 (km²)</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase" }}>Absolute Change (km²)</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase" }}>Relative Change (%)</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase" }}>Direction</th>
              </tr>
            </thead>
            <tbody>
              {totalChanges.map((lc) => (
                <tr key={lc.key}>
                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--color-border-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: lc.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{lc.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", borderBottom: "1px solid var(--color-border-light)", fontVariantNumeric: "tabular-nums" }}>
                    {lc.val2020.toFixed(1)}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", borderBottom: "1px solid var(--color-border-light)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                    {lc.val2025.toFixed(1)}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", borderBottom: "1px solid var(--color-border-light)", fontVariantNumeric: "tabular-nums", color: lc.change >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                    {lc.change >= 0 ? "+" : ""}{lc.change.toFixed(1)}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", borderBottom: "1px solid var(--color-border-light)", fontVariantNumeric: "tabular-nums", color: lc.changePercent >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                    {lc.changePercent >= 0 ? "+" : ""}{lc.changePercent.toFixed(1)}%
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "center", borderBottom: "1px solid var(--color-border-light)" }}>
                    <span style={{ color: lc.change >= 0 ? "#16a34a" : "#dc2626", fontSize: "1.2rem" }}>
                      {lc.change >= 0 ? "↗" : "↘"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div
        style={{
          padding: "1.25rem",
          background: "rgba(217,119,6,0.06)",
          borderRadius: "var(--radius-md)",
          border: "1px dashed rgba(217,119,6,0.3)",
        }}
      >
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.75rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Key Insights
        </h4>
        <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          <p style={{ marginBottom: "0.5rem" }}>
            <strong>Urban Expansion:</strong> Built-up areas have changed by {totalChanges.find(lc => lc.key === "Built_up")?.changePercent.toFixed(1) || 0}% since 2020, reflecting urbanization trends in the Nabeul region.
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            <strong>Forest Cover:</strong> Forest areas have {totalChanges.find(lc => lc.key === "Forest")?.change >= 0 ? "increased" : "decreased"} by {Math.abs(totalChanges.find(lc => lc.key === "Forest")?.changePercent || 0).toFixed(1)}%, indicating {"conservation efforts or natural changes"}.
          </p>
          <p>
            <strong>Water Bodies:</strong> Water surface area has {totalChanges.find(lc => lc.key === "Water")?.change >= 0 ? "increased" : "decreased"} by {Math.abs(totalChanges.find(lc => lc.key === "Water")?.changePercent || 0).toFixed(1)}%, which may be attributed to environmental or management factors.
          </p>
        </div>
      </div>
    </div>
  );
}