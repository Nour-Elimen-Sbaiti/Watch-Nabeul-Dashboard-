import { useState, useEffect } from "react";
import { LAND_USE_CLASSES } from "../services/rasterConfig";

const DEFAULT = {
  "2020": {
    Water:             { area: 820.0,  percentage: 7.9  },
    Built_up:          { area: 1560.0, percentage: 15.0 },
    Forest:            { area: 2100.0, percentage: 20.2 },
    Agricultural_area: { area: 5910.0, percentage: 56.9 }
  },
  "2025": {
    Water:             { area: 760.0,  percentage: 7.3  },
    Built_up:          { area: 2200.0, percentage: 21.2 },
    Forest:            { area: 1900.0, percentage: 18.3 },
    Agricultural_area: { area: 5530.0, percentage: 53.2 }
  }
};

const COLORS = Object.fromEntries(LAND_USE_CLASSES.map((c) => [c.key, c.color]));

export default function StatsTable({ stats: propStats, year: propYear }) {
  const [selectedYear, setSelectedYear] = useState(propYear || "2025");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (propYear) setSelectedYear(propYear);
  }, [propYear]);

  const data = propStats || DEFAULT;
  const yearData = (data && (data[selectedYear] || data["2025"])) || DEFAULT[selectedYear];

  if (!yearData || typeof yearData !== "object") {
    return (
      <div style={{ padding: "1rem", color: "var(--color-text-secondary)" }}>Statistics not available.</div>
    );
  }

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

  return (
    <div style={{ padding: "0.25rem 0" }}>
      <style>{`
        .strow:hover td { background: rgba(217,119,6,0.04) !important; }
        .sth:hover { color: var(--color-primary) !important; background: rgba(217,119,6,0.06) !important; }
      `}</style>

      {/* Year pills */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {Object.keys(data).map((y) => (
          <button key={y} onClick={() => setSelectedYear(y)} style={{
            padding: "0.4rem 1rem", borderRadius: "var(--radius-sm)",
            border: `1.5px solid ${y === selectedYear ? "var(--color-primary)" : "var(--color-border-light)"}`,
            background: y === selectedYear ? "rgba(217,119,6,0.1)" : "transparent",
            color: y === selectedYear ? "var(--color-primary)" : "var(--color-text-secondary)",
            fontWeight: "700", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s"
          }}>
            {y}
          </button>
        ))}
      </div>

      <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--color-border-light)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr>
              {[["name", "Land Use Class"], ["area", "Area (km²)"], ["percentage", "Coverage"]].map(([k, label]) => (
                <th key={k} className="sth" style={thS(sort.key === k)} onClick={() => toggle(k)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>{label}<SortIcon k={k} /></div>
                </th>
              ))}
              <th style={{ ...thS(false), cursor: "default" }}>Distribution</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(([cls, vals], i) => (
              <tr key={cls} className="strow" onMouseEnter={() => setHovered(cls)} onMouseLeave={() => setHovered(null)}>
                <td style={tdS(hovered === cls)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: `${COLORS[cls]}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: COLORS[cls] }} />
                    </div>
                    <span style={{ fontWeight: "600", color: "var(--color-text)" }}>{cls.replace("_", " ")}</span>
                  </div>
                </td>
                <td style={tdS(hovered === cls)}>
                  <span style={{ fontFamily: "monospace", fontWeight: "600" }}>{vals.area.toLocaleString("en-US", { minimumFractionDigits: 1 })}</span>
                </td>
                <td style={tdS(hovered === cls)}>
                  <span style={{ padding: "0.2rem 0.55rem", borderRadius: "99px", background: `${COLORS[cls]}18`, color: COLORS[cls], fontWeight: "700", fontSize: "0.82rem" }}>
                    {vals.percentage}%
                  </span>
                </td>
                <td style={tdS(hovered === cls)}>
                  <div style={{ height: "7px", background: "var(--color-border-light)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${vals.percentage}%`, height: "100%", background: COLORS[cls], borderRadius: "4px", transition: "width 0.8s ease" }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "var(--color-bg-secondary)" }}>
              <td style={{ ...tdS(false), fontWeight: "700", borderBottom: "none" }}>Total</td>
              <td style={{ ...tdS(false), fontFamily: "monospace", fontWeight: "700", borderBottom: "none" }}>{total.toLocaleString("en-US", { minimumFractionDigits: 1 })}</td>
              <td style={{ ...tdS(false), fontWeight: "700", borderBottom: "none" }}>
                <span style={{ padding: "0.2rem 0.55rem", borderRadius: "99px", background: "rgba(217,119,6,0.15)", color: "var(--color-primary)", fontWeight: "700", fontSize: "0.82rem" }}>100%</span>
              </td>
              <td style={{ ...tdS(false), borderBottom: "none" }}>
                <div style={{ display: "flex", height: "7px", borderRadius: "4px", overflow: "hidden" }}>
                  {sorted.map(([cls, vals]) => (
                    <div key={cls} style={{ width: `${vals.percentage}%`, background: COLORS[cls] }} />
                  ))}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p style={{ marginTop: "0.75rem", fontSize: "0.73rem", color: "var(--color-text-muted)", textAlign: "right" }}>
        Nabeul Region · CNN Classification · {selectedYear}
      </p>
    </div>
  );
}