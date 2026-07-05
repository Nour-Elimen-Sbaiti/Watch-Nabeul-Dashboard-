import { useState, useEffect, memo } from "react";
import { LAND_USE_CLASSES } from "../services/rasterConfig";

/* ─── Mini Sparkline Component ─────────────────────────────────── */
const Sparkline = memo(function Sparkline({ data, color, width = 80, height = 24 }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>N/A</span>
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;
  const chartHeight = height - padding * 2;
  const chartWidth = width - 8;
  const stepX = chartWidth / (data.length - 1);

  const points = data.map((val, i) => ({
    x: 4 + i * stepX,
    y: padding + chartHeight - ((val - min) / range) * chartHeight,
  }));

  const pathD = points.reduce((acc, p, i) => 
    acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), ""
  );

  const areaD = pathD + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sparkline-gradient-${color})`} />
      <path 
        d={pathD} 
        fill="none" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle 
          key={i} 
          cx={p.x} 
          cy={p.y} 
          r={i === points.length - 1 ? 2.5 : 1.5} 
          fill={color}
          opacity={i === points.length - 1 ? 1 : 0.6}
        />
      ))}
    </svg>
  );
});

/* ─── Change Badge Component ───────────────────────────────────── */
const ChangeBadge = memo(function ChangeBadge({ value, showPlus = true }) {
  const numValue = parseFloat(value);
  const isPositive = numValue >= 0;
  const color = isPositive ? "#16a34a" : "#dc2626";
  const sign = showPlus && isPositive ? "+" : "";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.2rem",
      padding: "0.2rem 0.5rem",
      background: `${color}15`,
      borderRadius: "99px",
      fontSize: "0.75rem",
      fontWeight: 700,
      color: color,
      fontVariantNumeric: "tabular-nums",
      whiteSpace: "nowrap"
    }}>
      {sign}{typeof value === "number" ? value.toFixed(1) : value}%
    </span>
  );
});

/* ─── Enhanced Stats Table ─────────────────────────────────────── */
export default function EnhancedStatsTable({ stats: propStats, year: propYear }) {
  const [selectedYear, setSelectedYear] = useState(propYear || "2025");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (propYear) setSelectedYear(propYear);
  }, [propYear]);

  const data = propStats || {};
  const yearData = (data && (data[selectedYear] || data["2025"])) || {};

  if (!yearData || typeof yearData !== "object" || Object.keys(yearData).length === 0) {
    return (
      <div style={{ padding: "1rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}>
        Statistics not available.
      </div>
    );
  }

  const years = Object.keys(data).sort();
  const otherYear = selectedYear === "2025" ? "2020" : "2025";
  const otherYearData = data[otherYear] || {};

  const sorted = Object.entries(yearData).sort((a, b) => {
    if (!sort.key) return 0;
    const av = sort.key === "name" ? a[0] : a[1][sort.key];
    const bv = sort.key === "name" ? b[0] : b[1][sort.key];
    return (av < bv ? -1 : 1) * (sort.dir === "asc" ? 1 : -1);
  });

  const toggle = (key) =>
    setSort((p) => ({ key, dir: p.key === key && p.dir === "asc" ? "desc" : "asc" }));

  const SortIcon = ({ k }) => sort.key !== k
    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3 }}><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg>
    : sort.dir === "asc"
      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M7 15l5 5 5-5"/></svg>
      : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M7 9l5-5 5 5"/></svg>;

  const total = Object.values(yearData).reduce((s, v) => s + v.area, 0);

  const thS = (active) => ({
    padding: "0.85rem 1rem", textAlign: "left",
    fontWeight: "700", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em",
    color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
    background: active ? "rgba(217,119,6,0.08)" : "var(--color-bg-secondary)",
    borderBottom: "2px solid var(--color-border-light)",
    cursor: "pointer", userSelect: "none", transition: "all 0.2s"
  });

  const tdS = (isH) => ({
    padding: "0.8rem 1rem",
    borderBottom: "1px solid var(--color-border-light)",
    background: isH ? "rgba(217,119,6,0.03)" : "transparent",
    transition: "background 0.15s"
  });

  // Build sparkline data for each class
  const getSparklineData = (className) => {
    return years.map(y => data[y]?.[className]?.percentage ?? 0);
  };

  return (
    <div style={{ padding: "0.25rem 0" }}>
      <style>{`
        .estrow:hover td { background: rgba(217,119,6,0.04) !important; }
        .esth:hover { color: var(--color-primary) !important; background: rgba(217,119,6,0.06) !important; }
      `}</style>

      {/* Year pills */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {years.map((y) => (
          <button 
            key={y} 
            onClick={() => setSelectedYear(y)} 
            style={{
              padding: "0.4rem 1rem", borderRadius: "var(--radius-sm)",
              border: `1.5px solid ${y === selectedYear ? "var(--color-primary)" : "var(--color-border-light)"}`,
              background: y === selectedYear ? "rgba(217,119,6,0.1)" : "transparent",
              color: y === selectedYear ? "var(--color-primary)" : "var(--color-text-secondary)",
              fontWeight: "700", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s"
            }}
          >
            {y}
          </button>
        ))}
      </div>

      <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--color-border-light)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr>
              <th style={thS(false)}>Class</th>
              <th style={thS(sort.key === "area")} onClick={() => toggle("area")}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>Area (km²)<SortIcon k="area" /></div>
              </th>
              <th style={thS(sort.key === "percentage")} onClick={() => toggle("percentage")}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>Coverage<SortIcon k="percentage" /></div>
              </th>
              <th style={thS(false)}>Change</th>
              <th style={thS(false)}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(([cls, vals]) => {
              const otherVals = otherYearData[cls] || { percentage: 0, area: 0 };
              const pctChange = vals.percentage - otherVals.percentage;
              const areaChange = vals.area - otherVals.area;

              return (
                <tr key={cls} className="estrow" onMouseEnter={() => setHovered(cls)} onMouseLeave={() => setHovered(null)}>
                  <td style={tdS(hovered === cls)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <div style={{ 
                        width: "12px", 
                        height: "12px", 
                        borderRadius: "3px", 
                        background: LAND_USE_CLASSES.find(l => l.key === cls)?.color || "#999",
                        flexShrink: 0 
                      }} />
                      <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
                        {cls.replace(/_/g, " ")}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...tdS(hovered === cls), fontVariantNumeric: "tabular-nums", fontFamily: "monospace", fontWeight: 600 }}>
                    {vals.area.toLocaleString("en-US", { minimumFractionDigits: 1 })}
                  </td>
                  <td style={tdS(hovered === cls)}>
                    <span style={{ 
                      padding: "0.2rem 0.55rem", 
                      borderRadius: "99px", 
                      background: `${LAND_USE_CLASSES.find(l => l.key === cls)?.color || "#999"}18`, 
                      color: LAND_USE_CLASSES.find(l => l.key === cls)?.color || "#999", 
                      fontWeight: 700, 
                      fontSize: "0.82rem" 
                    }}>
                      {vals.percentage}%
                    </span>
                  </td>
                  <td style={tdS(hovered === cls)}>
                    <ChangeBadge value={pctChange} />
                  </td>
                  <td style={{ ...tdS(hovered === cls), padding: "0.5rem 1rem" }}>
                    <Sparkline 
                      data={getSparklineData(cls)} 
                      color={LAND_USE_CLASSES.find(l => l.key === cls)?.color || "#999"}
                      width={70}
                      height={22}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "var(--color-bg-secondary)" }}>
              <td style={{ ...tdS(false), fontWeight: "700", borderBottom: "none" }}>Total</td>
              <td style={{ ...tdS(false), fontFamily: "monospace", fontWeight: "700", borderBottom: "none" }}>
                {total.toLocaleString("en-US", { minimumFractionDigits: 1 })}
              </td>
              <td style={{ ...tdS(false), fontWeight: "700", borderBottom: "none" }}>
                <span style={{ 
                  padding: "0.2rem 0.55rem", 
                  borderRadius: "99px", 
                  background: "rgba(217,119,6,0.15)", 
                  color: "var(--color-primary)", 
                  fontWeight: "700", 
                  fontSize: "0.82rem" 
                }}>
                  100%
                </span>
              </td>
              <td style={{ ...tdS(false), borderBottom: "none" }} />
              <td style={{ ...tdS(false), borderBottom: "none" }} />
            </tr>
          </tfoot>
        </table>
      </div>

      <p style={{ marginTop: "0.75rem", fontSize: "0.73rem", color: "var(--color-text-muted)", textAlign: "right", fontFamily: "var(--font-body)" }}>
        Nabeul Region · {selectedYear}
      </p>
    </div>
  );
}