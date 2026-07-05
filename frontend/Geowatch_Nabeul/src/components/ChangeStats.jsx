import { useState, useEffect } from "react";

const DEFAULT = {
  "2020–2025": {
    Water:             -0.6,
    Built_up:          +6.2,
    Forest:            -1.9,
    Agricultural_area: -3.7
  }
};

const COLORS = { Water: "#0891b2", Built_up: "#dc2626", Forest: "#15803d", Agricultural_area: "#65a30d" };

export default function ChangeStats({ changeData: prop }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const data = prop || DEFAULT;

  return (
    <div style={{ padding: "0.25rem 0" }}>
      <style>{`
        .ci:hover { transform: translateX(4px); border-color: var(--color-primary) !important; }
        @keyframes valPop { from { opacity:0; transform: scale(0.6); } to { opacity:1; transform: scale(1); } }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
        {Object.entries(data).map(([period, classes], pi) => (
          <div key={period} style={{
            background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)",
            padding: "1.25rem", border: "1px solid var(--color-border-light)",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: `all 0.45s ease ${pi * 0.12}s`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px dashed var(--color-border-light)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontWeight: "700", color: "var(--color-text)" }}>{period}</span>
            </div>

            {Object.entries(classes).map(([cls, val], i) => {
              const up = val > 0;
              const color = up ? "#16a34a" : "#dc2626";
              return (
                <div key={cls} className="ci" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.55rem 0.75rem", marginBottom: "0.45rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-light)",
                  transition: "all 0.2s"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: COLORS[cls] || "#999" }} />
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", fontWeight: "500" }}>
                      {cls.replace("_", " ")}
                    </span>
                  </div>
                  <span style={{ fontWeight: "800", fontSize: "1rem", color, animation: `valPop 0.4s ease-out ${(pi * 4 + i) * 0.08}s backwards` }}>
                    {up ? "+" : ""}{val.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div style={{ marginTop: "1.25rem", padding: "1rem", background: "linear-gradient(135deg, rgba(220,38,38,0.05), rgba(217,119,6,0.07), rgba(21,128,61,0.05))", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-light)" }}>
        <div style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "0.75rem", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>5-Year Summary (2020–2025)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Built-up",    change: "+6.2%", color: "#dc2626" },
            { label: "Agriculture", change: "-3.7%", color: "#65a30d" },
            { label: "Forest",      change: "-1.9%", color: "#15803d" },
            { label: "Water",       change: "-0.6%", color: "#0891b2" }
          ].map((it) => (
            <div key={it.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "800", color: it.color, fontFamily: "var(--font-body)" }}>{it.change}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "2px", fontFamily: "var(--font-body)" }}>{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}