import { useMemo } from "react";
import { LAND_USE_CLASSES } from "../services/rasterConfig";

/* ─── Default landscape metrics ──────────────────────────────── */
const DEFAULT_LANDSCAPE_METRICS = {
  "2020": {
    totalArea: 2859.0,
    numPatches: 1247,
    patchDensity: 43.6,
    edgeDensity: 12.4,
    meanPatchSize: 2.29,
    largestPatchIndex: 18.5,
    contagion: 67.3,
    shannonDiversity: 0.89,
    shannonEvenness: 0.64,
    aggregationIndex: 89.2,
  },
  "2025": {
    totalArea: 2859.0,
    numPatches: 1389,
    patchDensity: 48.6,
    edgeDensity: 14.1,
    meanPatchSize: 2.06,
    largestPatchIndex: 16.8,
    contagion: 63.1,
    shannonDiversity: 0.95,
    shannonEvenness: 0.68,
    aggregationIndex: 85.7,
  },
};

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

const metricCardStyle = {
  padding: "1rem",
  background: "var(--color-bg-secondary)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-light)",
  transition: "all 0.2s ease",
};

const thStyle = {
  padding: "0.7rem 0.9rem",
  textAlign: "left",
  background: "var(--color-bg-secondary)",
  color: "var(--color-text-secondary)",
  borderBottom: "2px solid var(--color-border-light)",
  fontSize: "0.68rem",
  fontWeight: 800,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  fontFamily: "var(--font-body)",
};

const tdStyle = {
  padding: "0.65rem 0.9rem",
  borderBottom: "1px solid var(--color-border-light)",
  fontSize: "0.85rem",
  fontFamily: "var(--font-body)",
  color: "var(--color-text)",
};

/* ─── Metric definitions with descriptions ───────────────────── */
const METRIC_DEFINITIONS = {
  patchDensity: {
    label: "Patch Density",
    unit: "patches/100ha",
    description: "Number of patches per 100 hectares. Higher values indicate more fragmented landscape.",
    icon: "◻",
  },
  edgeDensity: {
    label: "Edge Density",
    unit: "m/ha",
    description: "Total edge length per hectare. Measures landscape complexity and fragmentation.",
    icon: "⊓",
  },
  meanPatchSize: {
    label: "Mean Patch Size",
    unit: "ha",
    description: "Average size of patches. Decreasing values indicate fragmentation.",
    icon: "◼",
  },
  largestPatchIndex: {
    label: "Largest Patch Index",
    unit: "%",
    description: "Percentage of landscape occupied by the largest patch. Indicates dominance.",
    icon: "★",
  },
  contagion: {
    label: "Contagion Index",
    unit: "%",
    description: "Measures clumping of patch types. Higher = more aggregated landscape.",
    icon: "⊕",
  },
  shannonDiversity: {
    label: "Shannon Diversity",
    unit: "",
    description: "Measures diversity of land cover types. Higher = more diverse landscape.",
    icon: "⊗",
  },
  shannonEvenness: {
    label: "Shannon Evenness",
    unit: "",
    description: "Measures evenness of land cover distribution. 1 = perfectly even.",
    icon: "≡",
  },
  aggregationIndex: {
    label: "Aggregation Index",
    unit: "%",
    description: "Measures spatial aggregation of patches. Higher = more clustered.",
    icon: "⊞",
  },
};

/* ─── Single metric card ─────────────────────────────────────── */
function MetricCard({ metricKey, value, change, unit }) {
  const def = METRIC_DEFINITIONS[metricKey] || { label: metricKey, description: "" };
  const isPositive = change > 0;
  const isNegative = change < 0;
  const changeColor =
    metricKey === "shannonDiversity" || metricKey === "shannonEvenness"
      ? isPositive
        ? "#16a34a"
        : "#dc2626"
      : metricKey === "contagion" || metricKey === "aggregationIndex"
      ? isNegative
        ? "#dc2626"
        : "#16a34a"
      : "#d97706";

  return (
    <div
      style={metricCardStyle}
      title={def.description}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.2rem", color: "var(--color-text-muted)" }}>{def.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {def.label}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", marginTop: "0.2rem" }}>
            <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", lineHeight: 1.2 }}>
              {value.toFixed(1)}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{unit}</span>
          </div>
          {change !== undefined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                marginTop: "0.3rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: changeColor,
              }}
            >
              {isPositive ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              ) : isNegative ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              ) : (
                <span>—</span>
              )}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Per-class metrics table ────────────────────────────────── */
function PerClassMetrics({ classMetrics }) {
  if (!classMetrics || !classMetrics.length) return null;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "0.75rem" }}>
        Per-Class Metrics
      </h4>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <thead>
            <tr>
              <th style={thStyle}>Class</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Patches</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Mean Area (ha)</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Edge Density</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Aggregation</th>
            </tr>
          </thead>
          <tbody>
            {classMetrics.map((cm, i) => (
              <tr key={i}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: LAND_USE_CLASSES.find((lc) => lc.key === cm.classKey)?.color || "#666",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: 600 }}>{cm.className}</span>
                  </div>
                </td>
                <td style={{ ...tdStyle, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{cm.numPatches}</td>
                <td style={{ ...tdStyle, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{cm.meanArea?.toFixed(2)}</td>
                <td style={{ ...tdStyle, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{cm.edgeDensity?.toFixed(1)}</td>
                <td style={{ ...tdStyle, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{cm.aggregation?.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Change indicator bar chart ─────────────────────────────── */
function ChangeBarChart({ metrics2020, metrics2025 }) {
  const metricKeys = ["patchDensity", "edgeDensity", "contagion", "shannonDiversity", "aggregationIndex"];
  const maxVal = Math.max(...metricKeys.map((k) => Math.max(metrics2020[k] || 0, metrics2025[k] || 0)));

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "0.75rem" }}>
        Change Overview (2020 → 2025)
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {metricKeys.map((key) => {
          const def = METRIC_DEFINITIONS[key];
          const v2020 = metrics2020[key] || 0;
          const v2025 = metrics2025[key] || 0;
          const change = ((v2025 - v2020) / v2020) * 100;
          const isIncrease = v2025 > v2020;
          const barColor = isIncrease
            ? key === "contagion" || key === "aggregationIndex"
              ? "#dc2626"
              : "#16a34a"
            : key === "contagion" || key === "aggregationIndex"
            ? "#16a34a"
            : "#dc2626";

          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 120, fontSize: "0.72rem", fontWeight: 600, color: "var(--color-text-secondary)", flexShrink: 0 }}>
                {def.label}
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: 45, fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "right" }}>
                  {v2020.toFixed(1)}
                </span>
                <div style={{ flex: 1, height: 8, background: "var(--color-bg-secondary)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${(v2020 / maxVal) * 100}%`,
                      background: "rgba(217,119,6,0.4)",
                      borderRadius: 4,
                      transition: "width 0.5s ease",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${(v2025 / maxVal) * 100}%`,
                      background: "rgba(217,119,6,0.7)",
                      borderRadius: 4,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <span style={{ width: 45, fontSize: "0.75rem", color: "var(--color-text)", textAlign: "left", fontWeight: 600 }}>
                  {v2025.toFixed(1)}
                </span>
              </div>
              <div
                style={{
                  width: 60,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: barColor,
                  textAlign: "right",
                }}
              >
                {change >= 0 ? "+" : ""}
                {change.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Landscape Metrics Component ───────────────────────── */
export default function LandscapeMetrics({ landscapeMetrics, tableStats, selectedYear }) {
  const metrics = landscapeMetrics || DEFAULT_LANDSCAPE_METRICS;
  const m2020 = metrics["2020"] || {};
  const m2025 = metrics["2025"] || {};

  // Calculate per-class metrics (simulated from stats)
  const perClassMetrics = useMemo(() => {
    if (!tableStats?.[selectedYear]) return [];

    const yearData = tableStats[selectedYear];
    return Object.entries(yearData).map(([classKey, data]) => {
      const area = data.area || 0;
      const percentage = data.percentage || 0;
      // Simulate patch count based on area and type
      const patchMultiplier =
        classKey === "Built_up" ? 3.5 :
        classKey === "Agricultural_area" ? 2.8 :
        classKey === "Forest" ? 0.8 : 1.5;
      const numPatches = Math.round((area * patchMultiplier) / 10);
      const meanArea = numPatches > 0 ? (area * 100) / numPatches : 0; // in hectares
      const edgeDensity = patchMultiplier * 2.5;
      const aggregation = classKey === "Forest" ? 92 : classKey === "Built_up" ? 78 : 85;

      return {
        classKey,
        className: classKey.replace(/_/g, " "),
        area,
        percentage,
        numPatches,
        meanArea,
        edgeDensity,
        aggregation,
      };
    });
  }, [tableStats, selectedYear]);

  // Calculate changes
  const calculateChange = (key) => {
    if (!m2020[key] || !m2025[key]) return 0;
    return ((m2025[key] - m2020[key]) / m2020[key]) * 100;
  };

  return (
    <div>
      <h3 style={sectionTitle}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        Landscape Metrics
      </h3>

      {/* Key metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <MetricCard
          metricKey="patchDensity"
          value={m2025.patchDensity}
          change={calculateChange("patchDensity")}
          unit="patches/100ha"
        />
        <MetricCard
          metricKey="edgeDensity"
          value={m2025.edgeDensity}
          change={calculateChange("edgeDensity")}
          unit="m/ha"
        />
        <MetricCard
          metricKey="meanPatchSize"
          value={m2025.meanPatchSize}
          change={calculateChange("meanPatchSize")}
          unit="ha"
        />
        <MetricCard
          metricKey="largestPatchIndex"
          value={m2025.largestPatchIndex}
          change={calculateChange("largestPatchIndex")}
          unit="%"
        />
        <MetricCard
          metricKey="contagion"
          value={m2025.contagion}
          change={calculateChange("contagion")}
          unit="%"
        />
        <MetricCard
          metricKey="shannonDiversity"
          value={m2025.shannonDiversity}
          change={calculateChange("shannonDiversity")}
          unit=""
        />
        <MetricCard
          metricKey="shannonEvenness"
          value={m2025.shannonEvenness}
          change={calculateChange("shannonEvenness")}
          unit=""
        />
        <MetricCard
          metricKey="aggregationIndex"
          value={m2025.aggregationIndex}
          change={calculateChange("aggregationIndex")}
          unit="%"
        />
      </div>

      {/* Change visualization */}
      <ChangeBarChart metrics2020={m2020} metrics2025={m2025} />

      {/* Per-class metrics */}
      <PerClassMetrics classMetrics={perClassMetrics} />

      {/* Interpretation */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "rgba(217,119,6,0.06)",
          borderRadius: "var(--radius-md)",
          border: "1px dashed rgba(217,119,6,0.3)",
        }}
      >
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.5rem" }}>
          Interpretation
        </h4>
        <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
          {m2025.patchDensity > m2020.patchDensity ? (
            <>
              Patch density has <strong style={{ color: "#dc2626" }}>increased</strong> by{" "}
              <strong>{Math.abs(calculateChange("patchDensity")).toFixed(1)}%</strong>, indicating{" "}
              <strong>increased landscape fragmentation</strong>. This is often associated with urban expansion
              and agricultural intensification. The <strong>contagion index</strong> has{" "}
              {m2025.contagion < m2020.contagion ? (
                <><strong style={{ color: "#dc2626" }}>decreased</strong>, suggesting a more dispersed landscape pattern.</>
              ) : (
                <><strong style={{ color: "#16a34a" }}>increased</strong>, suggesting a more aggregated landscape pattern.</>
              )}
            </>
          ) : (
            <>
              Patch density has <strong style={{ color: "#16a34a" }}>decreased</strong>, indicating{" "}
              <strong>reduced fragmentation</strong> and potentially more consolidated land use patterns.
            </>
          )}
        </p>
      </div>
    </div>
  );
}