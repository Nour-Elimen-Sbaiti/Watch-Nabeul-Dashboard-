import { useState } from "react";
import { LAND_USE_CLASSES } from "../services/rasterConfig";

export default function Legend({ type, year = "2025" }) {
  const [expanded, setExpanded] = useState(null);

  const defaultStats = {
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

  if (type === "change") {
    const changeClasses = [
      { label: "Urban Expansion",  color: "#dc2626", desc: "New built-up area" },
      { label: "Deforestation",    color: "#f97316", desc: "Forest to other" },
      { label: "Vegetation Loss",  color: "#fbbf24", desc: "Agriculture decline" },
      { label: "No Change",        color: "#d1d5db", desc: "Stable land cover" },
      { label: "Vegetation Gain",  color: "#86efac", desc: "New vegetation" },
      { label: "Water Change",     color: "#0891b2", desc: "Water body shift" },
    ];
    return (
      <div style={{ padding: "0.25rem 0" }}>
        {changeClasses.map(c => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.45rem 0.7rem", marginBottom: "0.35rem", borderRadius: "var(--radius-sm)", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-light)" }}>
            <div style={{ width: 16, height: 16, borderRadius: 3, background: c.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text)", fontFamily: "var(--font-body)" }}>{c.label}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{c.desc}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed var(--color-border-light)", fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Change Detection · 2020–2025
        </div>
      </div>
    );
  }

  if (type === "ndvi") {
    return (
      <div style={{ padding: "0.25rem 0" }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
          padding: "1rem", background: "var(--color-bg-secondary)",
          borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-light)"
        }}>
          <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>NDVI Scale (Viridis)</span>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ position: "relative", width: "24px", height: "130px" }}>
              <div style={{
                width: "24px", height: "130px",
                background: "linear-gradient(to top, #440154 0%, #31688e 15%, #35b779 35%, #6ece58 55%, #b5de2b 75%, #fde724 100%)",
                borderRadius: "4px", border: "1px solid var(--color-border-light)"
              }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "130px", fontSize: "0.68rem", color: "var(--color-text-secondary)", fontWeight: "600" }}>
              <div>High (+1)</div>
              <div>Dense</div>
              <div>Moderate (0)</div>
              <div>Sparse</div>
              <div>Low (-1)</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.25rem 0" }}>
      <style>{`
        .legend-item { transition: all 0.2s ease; }
        .legend-item:hover { transform: translateX(4px); box-shadow: var(--shadow-sm); }
        .legend-item:hover .lbox { transform: scale(1.15); }
        @keyframes legendIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        @keyframes expandIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
      `}</style>

       {LAND_USE_CLASSES.map((item, i) => {
         const stats = defaultStats[year]?.[item.key];
         const isOpen = expanded === item.key;
         return (
           <div key={item.key}>
             <div className="legend-item" style={{
               display: "flex", alignItems: "center", gap: "0.65rem",
               padding: "0.55rem 0.7rem", marginBottom: "0.45rem",
               borderRadius: "var(--radius-sm)",
               background: "var(--color-bg-secondary)",
               border: "1px solid var(--color-border-light)",
               animation: `legendIn 0.3s ease-out ${i * 0.06}s backwards`,
               cursor: "default"
             }}>
               <div className="lbox" style={{
                 width: "18px", height: "18px", borderRadius: "4px",
                 background: item.color, boxShadow: `0 2px 8px ${item.color}44`,
                 flexShrink: 0, transition: "transform 0.2s"
               }} />
               <div style={{ flex: 1, minWidth: 0 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                   <span style={{ fontWeight: "600", fontSize: "0.875rem", color: "var(--color-text)" }}>
                     {item.key.replace("_", " ")}
                   </span>
                   {stats && (
                     <button onClick={() => setExpanded(isOpen ? null : item.key)} style={{
                       padding: "0.15rem 0.45rem", borderRadius: "6px",
                       border: `1.5px solid ${isOpen ? item.color : "var(--color-border-light)"}`,
                       background: isOpen ? `${item.color}18` : "transparent",
                       color: isOpen ? item.color : "var(--color-text-muted)",
                       fontSize: "0.7rem", fontWeight: "600", cursor: "pointer",
                       transition: "all 0.2s"
                     }}>
                       {isOpen ? "-" : "+"}
                     </button>
                   )}
                 </div>
                 <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "1px" }}>{item.description}</div>
               </div>

             </div>

             {isOpen && stats && (
               <div style={{
                 marginBottom: "0.45rem", marginLeft: "0.75rem", marginRight: "0.5rem",
                 padding: "0.7rem", background: "var(--color-bg-secondary)",
                 borderRadius: "var(--radius-sm)", border: `1px solid ${item.color}44`,
                 animation: "expandIn 0.25s ease-out"
               }}>
                 <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-text)", marginBottom: "0.4rem" }}>
                   {item.key.replace("_", " ")} — {year}
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.25rem" }}>
                   <span style={{ color: "var(--color-text-secondary)" }}>Area</span>
                   <strong style={{ fontFamily: "monospace" }}>{stats.area.toFixed(1)} km²</strong>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                   <span style={{ color: "var(--color-text-secondary)" }}>Coverage</span>
                   <strong style={{ color: item.color }}>{stats.percentage}%</strong>
                 </div>

               </div>
             )}
           </div>
         );
       })}

      <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed var(--color-border-light)", fontSize: "0.72rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        CNN Classification · {year}
      </div>
    </div>
  );
}