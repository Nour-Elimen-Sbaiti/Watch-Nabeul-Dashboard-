import { memo } from "react";
import { LAND_USE_CLASSES } from "../services/rasterConfig";

/* ─── Paired Horizontal Bar Chart (replaces pie charts) ────────── */
const PairedBarChart = memo(function PairedBarChart({ stats }) {
  if (!stats || !stats["2020"] || !stats["2025"]) {
    return (
      <div style={{ 
        padding: "2rem", 
        textAlign: "center", 
        color: "var(--color-text-muted)",
        fontFamily: "var(--font-body)"
      }}>
        Data not available for comparison.
      </div>
    );
  }

  const classes = LAND_USE_CLASSES;
  const maxPercentage = 100; // Fixed scale for percentages

  return (
    <div style={{ padding: "0.5rem 0" }}>
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
          Land Use Distribution Comparison (2020 vs 2025)
        </h3>
        <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "rgba(0,0,0,0.15)" }} />
            <span style={{ color: "var(--color-text-secondary)" }}>2020</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "var(--color-primary)" }} />
            <span style={{ color: "var(--color-text-secondary)" }}>2025</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {classes.map((cls) => {
          const data2020 = stats["2020"][cls.key];
          const data2025 = stats["2025"][cls.key];
          const pct2020 = data2020?.percentage || 0;
          const pct2025 = data2025?.percentage || 0;
          const delta = pct2025 - pct2020;
          const deltaColor = delta >= 0 ? "#16a34a" : "#dc2626";
          const deltaSign = delta >= 0 ? "+" : "";

          return (
            <div 
              key={cls.key}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr 1fr 80px",
                gap: "0.75rem",
                alignItems: "center",
                padding: "0.65rem 0.85rem",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-light)",
              }}
            >
              {/* Class label with color dot */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ 
                  width: "10px", 
                  height: "10px", 
                  borderRadius: "2px", 
                  background: cls.color,
                  flexShrink: 0 
                }} />
                <span style={{ 
                  fontSize: "0.85rem", 
                  fontWeight: 600, 
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {cls.key.replace(/_/g, " ")}
                </span>
              </div>

              {/* 2020 bar */}
              <div style={{ position: "relative" }}>
                <div style={{ 
                  height: "20px", 
                  background: "var(--color-bg-secondary)", 
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <div style={{ 
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    width: `${(pct2020 / maxPercentage) * 100}%`,
                    background: `${cls.color}55`,
                    borderRadius: "var(--radius-sm)",
                    transition: "width 0.6s ease"
                  }} />
                </div>
                <span style={{ 
                  position: "absolute",
                  right: "4px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  fontVariantNumeric: "tabular-nums"
                }}>
                  {pct2020.toFixed(1)}%
                </span>
              </div>

              {/* 2025 bar */}
              <div style={{ position: "relative" }}>
                <div style={{ 
                  height: "20px", 
                  background: "var(--color-bg-secondary)", 
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <div style={{ 
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    width: `${(pct2025 / maxPercentage) * 100}%`,
                    background: cls.color,
                    borderRadius: "var(--radius-sm)",
                    transition: "width 0.6s ease"
                  }} />
                </div>
                <span style={{ 
                  position: "absolute",
                  right: "4px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  fontVariantNumeric: "tabular-nums"
                }}>
                  {pct2025.toFixed(1)}%
                </span>
              </div>

              {/* Delta pill */}
              <div style={{ 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.2rem 0.5rem",
                background: `${deltaColor}15`,
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: deltaColor,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap"
              }}>
                {deltaSign}{delta.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "0.75rem",
        padding: "0.5rem 0.85rem",
        background: "var(--color-bg-secondary)",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.75rem",
        color: "var(--color-text-muted)",
        fontFamily: "var(--font-body)"
      }}>
        <span>Period: 2020 → 2025</span>
        <span>Values shown as percentage of total area</span>
      </div>
    </div>
  );
});

export default PairedBarChart;