import { memo } from "react";
import { LAND_USE_CLASSES } from "../services/rasterConfig";

/* ─── Icon mapping for insight types ────────────────────────────── */
const INSIGHT_ICONS = {
  growth: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  decline: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  stable: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

/* ─── Generate insights from stats data ─────────────────────────── */
function generateInsights(stats, changeData) {
  const insights = [];
  
  if (!stats || !stats["2020"] || !stats["2025"]) return insights;
  
  const classes = LAND_USE_CLASSES;
  
  classes.forEach((cls) => {
    const data2020 = stats["2020"][cls.key];
    const data2025 = stats["2025"][cls.key];
    
    if (!data2020 || !data2025) return;
    
    const pct2020 = data2020.percentage || 0;
    const pct2025 = data2025.percentage || 0;
    const area2020 = data2020.area || 0;
    const area2025 = data2025.area || 0;
    const change = pct2025 - pct2020;
    const areaChange = area2025 - area2020;
    const pctChange = pct2020 > 0 ? ((change / pct2020) * 100) : 0;
    
    const className = cls.key.replace(/_/g, " ");
    
    // Significant growth (>5% relative change or >2pp absolute)
    if (Math.abs(change) >= 2 || Math.abs(pctChange) >= 5) {
      if (change > 0) {
        insights.push({
          type: change > 5 ? "alert" : "growth",
          color: cls.color,
          value: `+${change.toFixed(1)}%`,
          message: `${className} increased from ${pct2020.toFixed(1)}% to ${pct2025.toFixed(1)}% (${areaChange > 0 ? "+" : ""}${areaChange.toFixed(1)} km²) between 2020 and 2025.`,
          priority: Math.abs(change),
        });
      } else {
        insights.push({
          type: "decline",
          color: cls.color,
          value: `${change.toFixed(1)}%`,
          message: `${className} decreased from ${pct2020.toFixed(1)}% to ${pct2025.toFixed(1)}% (${areaChange > 0 ? "+" : ""}${areaChange.toFixed(1)} km²) between 2020 and 2025.`,
          priority: Math.abs(change),
        });
      }
    }
  });
  
  // Add summary insight about overall changes
  const totalBuiltUp2020 = stats["2020"]["Built_up"]?.percentage || 0;
  const totalBuiltUp2025 = stats["2025"]["Built_up"]?.percentage || 0;
  const urbanChange = totalBuiltUp2025 - totalBuiltUp2020;
  
  if (urbanChange > 1) {
    insights.push({
      type: "alert",
      color: "#dc2626",
      value: `+${urbanChange.toFixed(1)}%`,
      message: `Urban expansion detected: Built-up areas grew by ${urbanChange.toFixed(1)} percentage points over 5 years.`,
      priority: urbanChange * 1.5, // Higher priority for urban growth
    });
  }
  
  // Check for forest changes
  const forest2020 = stats["2020"]["Forest"]?.percentage || 0;
  const forest2025 = stats["2025"]["Forest"]?.percentage || 0;
  const forestChange = forest2025 - forest2020;
  
  if (forestChange < -1) {
    insights.push({
      type: "alert",
      color: "#dc2626",
      value: `${forestChange.toFixed(1)}%`,
      message: `Forest cover declined by ${Math.abs(forestChange).toFixed(1)} percentage points, indicating potential deforestation.`,
      priority: Math.abs(forestChange) * 1.5,
    });
  } else if (forestChange > 1) {
    insights.push({
      type: "growth",
      color: "#15803d",
      value: `+${forestChange.toFixed(1)}%`,
      message: `Forest cover expanded by ${forestChange.toFixed(1)} percentage points, suggesting reforestation efforts.`,
      priority: forestChange,
    });
  }
  
  // Sort by priority and return top insights
  return insights
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4); // Top 4 insights
}

/* ─── Single Insight Card ──────────────────────────────────────── */
const InsightCard = memo(function InsightCard({ insight }) {
  const icon = INSIGHT_ICONS[insight.type] || INSIGHT_ICONS.info;
  
  return (
    <div 
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "0.85rem 1rem",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border-light)",
        borderLeft: `3px solid ${insight.color}`,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ 
        color: insight.color, 
        flexShrink: 0,
        marginTop: "0.1rem"
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          marginBottom: "0.25rem" 
        }}>
          <span style={{ 
            fontSize: "0.9rem", 
            fontWeight: 700, 
            color: insight.color,
            fontFamily: "var(--font-body)",
            fontVariantNumeric: "tabular-nums"
          }}>
            {insight.value}
          </span>
        </div>
        <p style={{ 
          fontSize: "0.82rem", 
          color: "var(--color-text-secondary)", 
          lineHeight: 1.5,
          fontFamily: "var(--font-body)",
          margin: 0
        }}>
          {insight.message}
        </p>
      </div>
    </div>
  );
});

/* ─── Auto-Generated Insights Strip ────────────────────────────── */
export default function AutoInsights({ stats, changeData }) {
  const insights = generateInsights(stats, changeData);
  
  if (insights.length === 0) {
    return (
      <div style={{ 
        padding: "1rem", 
        borderRadius: "var(--radius-md)", 
        background: "var(--color-bg-secondary)",
        border: "1px dashed var(--color-border-light)",
        textAlign: "center",
        color: "var(--color-text-muted)",
        fontSize: "0.85rem",
        fontFamily: "var(--font-body)"
      }}>
        No significant changes detected in the data.
      </div>
    );
  }
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "0.5rem",
        marginBottom: "0.25rem"
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <h3 style={{ 
          fontFamily: "var(--font-display)", 
          fontSize: "1rem", 
          fontWeight: 600,
          color: "var(--color-text)",
          margin: 0
        }}>
          Auto-Generated Insights
        </h3>
      </div>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "0.75rem" 
      }}>
        {insights.map((insight, idx) => (
          <InsightCard key={idx} insight={insight} />
        ))}
      </div>
    </div>
  );
}