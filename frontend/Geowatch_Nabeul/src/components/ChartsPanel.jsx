import { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { LAND_USE_CLASSES } from "../services/rasterConfig";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const DEFAULT = {
  Water:             [7.9,  7.3 ],
  Built_up:          [15.0, 21.2],
  Forest:            [20.2, 18.3],
  Agricultural_area: [56.9, 53.2]
};

const COLORS = Object.fromEntries(LAND_USE_CLASSES.map((c) => [c.key, c.color]));

export default function ChartsPanel({ stats }) {
  const data = stats || DEFAULT;
  const [yearRange, setYearRange] = useState("all"); // "all", "2020", "2025"

  const years = ["2020", "2025"];
  const filteredYears = yearRange === "all" ? years : [yearRange];
  const yearIndices = yearRange === "all" ? [0, 1] : [yearRange === "2020" ? 0 : 1];

  // Build line chart data - merged stacked area chart
  const lineData = {
    labels: filteredYears,
    datasets: LAND_USE_CLASSES.map((cls) => ({
      label: cls.key.replace(/_/g, " "),
      data: yearIndices.map(i => {
        const classData = data[cls.key] || [0, 0];
        return classData[i] !== undefined ? classData[i] : 0;
      }),
      borderColor: cls.color,
      backgroundColor: `${cls.color}22`,
      fill: true, 
      tension: 0.4,
      pointRadius: yearRange === "all" ? 5 : 7, 
      pointHoverRadius: yearRange === "all" ? 7 : 9,
      pointBackgroundColor: cls.color, 
      pointBorderColor: "#fff", 
      pointBorderWidth: 2,
      stack: "stack1", // Enable stacking
    }))
  };

  const lineOpts = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom", 
        labels: { 
          usePointStyle: true, 
          pointStyle: "circle", 
          padding: 18, 
          font: { size: 11, weight: "500" },
          generateLabels: (chart) => {
            return LAND_USE_CLASSES.map((cls) => ({
              text: cls.key.replace(/_/g, " "),
              fillStyle: cls.color,
              strokeStyle: cls.color,
              lineWidth: 2,
              hidden: false,
              index: 0,
            }));
          }
        } 
      },
      tooltip: { 
        backgroundColor: "rgba(28,25,23,0.9)", 
        padding: 12, 
        cornerRadius: 8, 
        callbacks: { 
          label: (c) => `${c.dataset.label}: ${c.parsed.y}%`,
          footer: (items) => {
            const total = items.reduce((sum, item) => sum + item.parsed.y, 0);
            return `Total: ${total.toFixed(1)}%`;
          }
        } 
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100, 
        stacked: true,
        ticks: { callback: (v) => `${v}%`, font: { size: 11 } }, 
        grid: { color: "rgba(217,119,6,0.08)" } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { font: { size: 12, weight: "600" } } 
      }
    },
    animation: { duration: 1400, easing: "easeOutQuart" }
  };

  // Calculate change summary for the delta cards
  const changeSummary = LAND_USE_CLASSES.map((cls) => {
    const [v20, v25] = data[cls.key] || [0, 0];
    const diff = v25 - v20;
    return {
      key: cls.key,
      name: cls.key.replace(/_/g, " "),
      color: cls.color,
      value2020: v20,
      value2025: v25,
      diff,
      pctChange: v20 > 0 ? ((diff / v20) * 100) : 0,
    };
  });

  return (
    <div style={{ padding: "0.25rem 0" }}>
      {/* Year Range Selector */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "1rem" 
      }}>
        <h3 style={{ 
          fontFamily: "var(--font-display)", 
          fontSize: "1rem", 
          fontWeight: 600,
          color: "var(--color-text)",
          margin: 0
        }}>
          Land Use Distribution Trends
        </h3>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {[
            { key: "all", label: "2020–2025" },
            { key: "2020", label: "2020" },
            { key: "2025", label: "2025" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setYearRange(opt.key)}
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: "var(--radius-sm)",
                border: `1.5px solid ${yearRange === opt.key ? "var(--color-primary)" : "var(--color-border-light)"}`,
                background: yearRange === opt.key ? "rgba(217,119,6,0.1)" : "transparent",
                color: yearRange === opt.key ? "var(--color-primary)" : "var(--color-text-secondary)",
                fontWeight: "700",
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Merged Stacked Area Chart */}
      <div style={{ 
        height: yearRange === "all" ? "240px" : "280px", 
        background: "var(--color-bg-secondary)", 
        borderRadius: "var(--radius-md)", 
        padding: "1rem", 
        border: "1px solid var(--color-border-light)",
        marginBottom: "1rem"
      }}>
        <Line data={lineData} options={lineOpts} />
      </div>

      {/* Enhanced Change Summary Cards (replacing thin delta strips) */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", 
        gap: "0.75rem" 
      }}>
        {changeSummary.map((cls) => {
          const isPositive = cls.diff >= 0;
          const deltaColor = isPositive ? "#16a34a" : "#dc2626";
          const deltaSign = isPositive ? "+" : "";
          
          return (
            <div 
              key={cls.key}
              style={{
                padding: "0.85rem 1rem",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-light)",
                borderLeft: `3px solid ${cls.color}`,
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.4rem", 
                marginBottom: "0.35rem" 
              }}>
                <div style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "2px", 
                  background: cls.color,
                  flexShrink: 0 
                }} />
                <span style={{ 
                  fontSize: "0.72rem", 
                  fontWeight: 700, 
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em"
                }}>
                  {cls.name}
                </span>
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "baseline", 
                gap: "0.4rem",
                flexWrap: "wrap"
              }}>
                <span style={{ 
                  fontSize: "1.3rem", 
                  fontWeight: 800, 
                  color: deltaColor,
                  fontFamily: "var(--font-body)",
                  fontVariantNumeric: "tabular-nums"
                }}>
                  {deltaSign}{cls.diff.toFixed(1)}%
                </span>
                <span style={{ 
                  fontSize: "0.68rem", 
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-body)"
                }}>
                  ({deltaSign}{cls.pctChange.toFixed(1)}%)
                </span>
              </div>
              <div style={{ 
                fontSize: "0.65rem", 
                color: "var(--color-text-muted)", 
                marginTop: "0.25rem",
                fontFamily: "var(--font-body)"
              }}>
                {cls.value2020.toFixed(1)}% → {cls.value2025.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}