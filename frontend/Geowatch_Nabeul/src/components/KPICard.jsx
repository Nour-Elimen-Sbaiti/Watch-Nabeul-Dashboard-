import { memo } from "react";

/* ─── Icon mapping for land use classes ─────────────────────────── */
const ICONS = {
  Water: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  Built_up: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
    </svg>
  ),
  Forest: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L8 8h3v4l4 2-3 6h6l-3-6 4-2V8h3L12 2z"/>
    </svg>
  ),
  Agricultural_area: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22h20"/>
      <path d="M5 22V10c0-1.5 1-3 3-3h8c2 0 3 1.5 3 3v12"/>
      <path d="M9 22V14h6v8"/>
      <path d="M12 7V3"/>
      <path d="M8 5h8"/>
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

/* ─── Enhanced KPI Card with left-accent stripe ────────────────── */
const KPICard = memo(function KPICard({ 
  value, 
  label, 
  subLabel, 
  delta, 
  deltaValue, 
  color, 
  icon,
  size = "medium" 
}) {
  const iconElement = icon || DEFAULT_ICON;
  
  const sizeStyles = {
    small: { valueSize: "1.1rem", labelSize: "0.7rem", subSize: "0.62rem" },
    medium: { valueSize: "1.5rem", labelSize: "0.78rem", subSize: "0.67rem" },
    large: { valueSize: "2rem", labelSize: "0.85rem", subSize: "0.72rem" },
  };
  
  const sizes = sizeStyles[size];
  
  const deltaColor = deltaValue !== undefined 
    ? (parseFloat(deltaValue) >= 0 ? "#16a34a" : "#dc2626")
    : "var(--color-text-muted)";
  
  const deltaSign = deltaValue !== undefined && parseFloat(deltaValue) >= 0 ? "+" : "";

  return (
    <div 
      style={{
        padding: "1rem 1.1rem",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border-light)",
        borderLeft: `4px solid ${color}`,
        boxShadow: "var(--shadow-sm)",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
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
      {/* Top row: icon + value */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ 
          color, 
          fontSize: sizes.valueSize, 
          fontWeight: 800, 
          lineHeight: 1.2,
          fontFamily: "var(--font-body)",
          fontVariantNumeric: "tabular-nums"
        }}>
          {value}
        </div>
        <div style={{ color, opacity: 0.8, flexShrink: 0 }}>
          {iconElement}
        </div>
      </div>
      
      {/* Label */}
      <div style={{ 
        fontSize: sizes.labelSize, 
        fontWeight: 700, 
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
        lineHeight: 1.3
      }}>
        {label}
      </div>
      
      {/* Sub-label and delta row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        {subLabel && (
          <div style={{ 
            fontSize: sizes.subSize, 
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.3
          }}>
            {subLabel}
          </div>
        )}
        {delta && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.25rem",
            fontSize: "0.7rem",
            fontWeight: 700,
            color: deltaColor,
            fontFamily: "var(--font-body)",
            background: `${deltaColor}12`,
            padding: "0.15rem 0.45rem",
            borderRadius: "var(--radius-sm)",
            whiteSpace: "nowrap"
          }}>
            {deltaSign}{delta}
          </div>
        )}
      </div>
    </div>
  );
});

export default KPICard;