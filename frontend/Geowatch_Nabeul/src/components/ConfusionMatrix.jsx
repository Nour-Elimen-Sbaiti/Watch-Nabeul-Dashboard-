import { useState, useMemo } from "react";
import { LAND_USE_CLASSES } from "../services/rasterConfig";

/* ─── Default confusion matrix data (4-class example) ────────── */
const DEFAULT_CONFUSION_MATRIX = {
  labels: ["Water", "Built_up", "Forest", "Agricultural_area"],
  matrix: [
    // Water, Built_up, Forest, Agricultural (predicted columns)
    [48, 2, 0, 3],      // Water (actual row)
    [1, 62, 3, 8],      // Built_up
    [0, 4, 156, 12],    // Forest
    [2, 6, 8, 245],     // Agricultural_area
  ],
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

const hCell = {
  padding: "0.7rem 0.9rem",
  textAlign: "center",
  background: "var(--color-bg-secondary)",
  color: "var(--color-text-secondary)",
  borderBottom: "2px solid var(--color-border-light)",
  fontSize: "0.68rem",
  fontWeight: 800,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  fontFamily: "var(--font-body)",
  whiteSpace: "nowrap",
};

const labelCell = {
  padding: "0.7rem 0.9rem",
  textAlign: "left",
  background: "var(--color-bg-secondary)",
  color: "var(--color-text-secondary)",
  borderRight: "2px solid var(--color-border-light)",
  fontSize: "0.68rem",
  fontWeight: 800,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  fontFamily: "var(--font-body)",
  whiteSpace: "nowrap",
  writingMode: "horizontal-tb",
};

const dataCell = {
  padding: "0.65rem 0.85rem",
  textAlign: "center",
  borderBottom: "1px solid var(--color-border-light)",
  borderRight: "1px solid var(--color-border-light)",
  fontSize: "0.88rem",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  fontFamily: "var(--font-body)",
};

const metricCard = {
  padding: "1rem",
  background: "var(--color-bg-secondary)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-light)",
};

/* ─── Color scale for heatmap ────────────────────────────────── */
const getColorIntensity = (value, max, isDiagonal) => {
  const intensity = max > 0 ? value / max : 0;
  if (isDiagonal) {
    // Green scale for correct classifications (diagonal)
    const alpha = 0.15 + 0.5 * intensity;
    return `rgba(22, 163, 74, ${alpha})`;
  } else {
    // Orange/red scale for errors (off-diagonal)
    const alpha = 0.08 + 0.35 * intensity;
    return `rgba(220, 38, 38, ${alpha})`;
  }
};

const getTextColor = (value, max, isDiagonal) => {
  const intensity = max > 0 ? value / max : 0;
  if (intensity > 0.6) return "#fff";
  return isDiagonal ? "#15803d" : "#dc2626";
};

/* ─── Calculate per-class metrics ────────────────────────────── */
const calculateMetrics = (matrix, labels) => {
  if (!matrix || !labels) return { perClass: [], overall: {} };

  const n = labels.length;
  let totalCorrect = 0;
  let totalSamples = 0;

  const perClass = labels.map((label, i) => {
    // True Positives (diagonal)
    const tp = matrix[i][i] || 0;
    // False Positives (column sum minus diagonal)
    const colSum = matrix.reduce((sum, row) => sum + (row[i] || 0), 0);
    const fp = colSum - tp;
    // False Negatives (row sum minus diagonal)
    const rowSum = matrix[i].reduce((sum, val) => sum + (val || 0), 0);
    const fn = rowSum - tp;
    // True Negatives
    const tn = totalSamples - tp - fp - fn; // Will be calculated after

    // Producer's Accuracy (Recall / Sensitivity)
    const producersAccuracy = rowSum > 0 ? tp / rowSum : 0;
    // User's Accuracy (Precision)
    const usersAccuracy = colSum > 0 ? tp / colSum : 0;
    // F1-Score
    const f1Score =
      producersAccuracy + usersAccuracy > 0
        ? (2 * producersAccuracy * usersAccuracy) /
          (producersAccuracy + usersAccuracy)
        : 0;

    totalCorrect += tp;
    totalSamples += rowSum;

    return {
      label: label.replace(/_/g, " "),
      tp,
      fp,
      fn,
      rowSum,
      colSum,
      producersAccuracy: producersAccuracy * 100,
      usersAccuracy: usersAccuracy * 100,
      f1Score: f1Score * 100,
      support: rowSum,
    };
  });

  // Overall Accuracy
  const overallAccuracy = totalSamples > 0 ? (totalCorrect / totalSamples) * 100 : 0;

  // Kappa Coefficient (simplified)
  const expectedAccuracy = labels.reduce((sum, _, i) => {
    const rowSum = matrix[i].reduce((s, v) => s + (v || 0), 0);
    const colSum = matrix.reduce((s, row) => s + (row[i] || 0), 0);
    return sum + (rowSum * colSum) / (totalSamples * totalSamples);
  }, 0);

  const kappa =
    overallAccuracy / 100 !== expectedAccuracy
      ? (overallAccuracy / 100 - expectedAccuracy) / (1 - expectedAccuracy)
      : 0;

  return {
    perClass,
    overall: {
      accuracy: overallAccuracy,
      kappa: kappa * 100,
      totalSamples,
      totalCorrect,
    },
  };
};

/* ─── Metric display card ────────────────────────────────────── */
function MetricCard({ label, value, sublabel, color = "var(--color-primary)" }) {
  return (
    <div style={metricCard}>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-body)" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800, color, lineHeight: 1.2, fontFamily: "var(--font-body)", marginTop: "0.25rem" }}>
        {value}
      </div>
      {sublabel && (
        <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", marginTop: "0.2rem", fontFamily: "var(--font-body)" }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

/* ─── Per-class metrics table ────────────────────────────────── */
function PerClassTable({ metrics }) {
  const thStyle = {
    ...hCell,
    textAlign: "center",
    fontSize: "0.65rem",
    padding: "0.5rem 0.6rem",
  };
  const tdStyle = {
    ...dataCell,
    fontSize: "0.8rem",
    padding: "0.5rem 0.6rem",
  };

  return (
    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: "left" }}>Class</th>
            <th style={thStyle}>Producer's Acc.</th>
            <th style={thStyle}>User's Acc.</th>
            <th style={thStyle}>F1-Score</th>
            <th style={thStyle}>Support</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => (
            <tr key={i}>
              <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600, color: "var(--color-text)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: LAND_USE_CLASSES.find((lc) => lc.key === m.label.replace(/ /g, "_"))?.color || "#666",
                      flexShrink: 0,
                    }}
                  />
                  {m.label}
                </div>
              </td>
              <td style={{ ...tdStyle, color: m.producersAccuracy >= 80 ? "#16a34a" : m.producersAccuracy >= 60 ? "#d97706" : "#dc2626" }}>
                {m.producersAccuracy.toFixed(1)}%
              </td>
              <td style={{ ...tdStyle, color: m.usersAccuracy >= 80 ? "#16a34a" : m.usersAccuracy >= 60 ? "#d97706" : "#dc2626" }}>
                {m.usersAccuracy.toFixed(1)}%
              </td>
              <td style={{ ...tdStyle, color: m.f1Score >= 80 ? "#16a34a" : m.f1Score >= 60 ? "#d97706" : "#dc2626" }}>
                {m.f1Score.toFixed(1)}%
              </td>
              <td style={{ ...tdStyle, color: "var(--color-text-secondary)" }}>{m.support}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main Confusion Matrix Component ────────────────────────── */
export default function ConfusionMatrix({ confusionMatrix, modelVariant = "cnn", year = "2025" }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const { labels, matrix } = confusionMatrix || DEFAULT_CONFUSION_MATRIX;
  const maxValue = Math.max(...matrix.flat());

  const metrics = useMemo(() => calculateMetrics(matrix, labels), [matrix, labels]);

  return (
    <div>
      <h3 style={sectionTitle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 3v18" />
        </svg>
        Confusion Matrix — {modelVariant?.toUpperCase()} ({year})
      </h3>

      {/* Overall Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <MetricCard
          label="Overall Accuracy"
          value={`${metrics.overall.accuracy.toFixed(1)}%`}
          sublabel={`${metrics.overall.totalCorrect} / ${metrics.overall.totalSamples} correct`}
          color="#15803d"
        />
        <MetricCard
          label="Kappa Coefficient"
          value={metrics.overall.kappa.toFixed(2)}
          sublabel={metrics.overall.kappa > 0.8 ? "Excellent agreement" : metrics.overall.kappa > 0.6 ? "Good agreement" : "Moderate agreement"}
          color="#0891b2"
        />
        <MetricCard
          label="Total Samples"
          value={metrics.overall.totalSamples}
          sublabel="Reference points"
          color="var(--color-primary)"
        />
      </div>

      {/* Confusion Matrix Heatmap */}
      <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "0.5rem", fontSize: "0.78rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}>
          Rows = Actual class | Columns = Predicted class. Diagonal cells (green) are correct classifications.
        </div>
        <table style={{ width: "auto", minWidth: "100%", borderCollapse: "collapse", fontSize: "0.85rem", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <thead>
            <tr>
              <th style={{ ...hCell, background: "transparent", border: "none" }}>Actual \\ Predicted</th>
              {labels.map((label, i) => (
                <th key={`header-${i}`} style={{ ...hCell, textAlign: "center" }}>
                  {label.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, ri) => (
              <tr key={`row-${ri}`}>
                <td style={{ ...labelCell, fontWeight: 700, color: "var(--color-text)" }}>
                  {labels[ri].replace(/_/g, " ")}
                </td>
                {row.map((val, ci) => {
                  const isDiagonal = ri === ci;
                  const bg = getColorIntensity(val, maxValue, isDiagonal);
                  const textColor = getTextColor(val, maxValue, isDiagonal);
                  const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;

                  return (
                    <td
                      key={`cell-${ri}-${ci}`}
                      style={{
                        ...dataCell,
                        background: bg,
                        color: textColor,
                        border: isHovered ? "2px solid var(--color-primary)" : dataCell.border,
                        transition: "all 0.15s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={
                        isDiagonal
                          ? `Correctly classified: ${val} samples`
                          : `Misclassified: ${val} samples (actual: ${labels[ri]}, predicted: ${labels[ci]})`
                      }
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-Class Metrics */}
      <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "0.75rem" }}>
        Per-Class Accuracy Metrics
      </h4>
      <PerClassTable metrics={metrics.perClass} />

      {/* Legend */}
      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: 16, height: 16, borderRadius: 3, background: "rgba(22,163,74,0.5)", border: "1px solid rgba(22,163,74,0.3)" }} />
          Correct classification (diagonal)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: 16, height: 16, borderRadius: 3, background: "rgba(220,38,38,0.3)", border: "1px solid rgba(220,38,38,0.2)" }} />
          Misclassification (error)
        </div>
      </div>
    </div>
  );
}