import { useState, useEffect } from "react";

const DEFAULT = {
  "2020": { oa: 91.5, kappa: 0.884 },
  "2025": { oa: 88.0, kappa: 0.851 }
};

export default function AccuracyPanel({ accuracy: prop, year: selYear, setYear }) {
  const [animated, setAnimated] = useState(0);
  const data = prop || DEFAULT;

  useEffect(() => {
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setAnimated(1 - Math.pow(1 - step / 60, 3));
      if (step >= 60) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [prop]);

  const badge = (oa) =>
    oa >= 90 ? { text: "Excellent", color: "#16a34a", bg: "rgba(22,163,74,0.1)" }
    : oa >= 80 ? { text: "Good",      color: "#d97706", bg: "rgba(217,119,6,0.1)" }
    :            { text: "Fair",      color: "#dc2626", bg: "rgba(220,38,38,0.1)" };

  return (
    <div style={{ padding: "0.25rem 0" }}>
      <style>{`
        .acc-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(217,119,6,0.12); }
        @keyframes accIn { from { opacity:0; transform: translateY(12px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {Object.entries(data).map(([year, d], i) => {
          const b = badge(d.oa);
          const isActive = selYear === year;
          return (
            <div
              key={year}
              className="acc-card"
              onClick={() => setYear?.(year)}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(217,119,6,0.12), rgba(217,119,6,0.04))"
                  : "var(--color-bg-secondary)",
                border: `${isActive ? "2px" : "1px"} solid ${isActive ? "var(--color-primary)" : "var(--color-border-light)"}`,
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                textAlign: "center",
                cursor: setYear ? "pointer" : "default",
                transition: "all 0.25s ease",
                animation: `accIn 0.4s ease-out ${i * 0.1}s backwards`
              }}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
                {year}
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "800", background: "linear-gradient(135deg, #16a34a, var(--color-primary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>
                {(animated * d.oa).toFixed(1)}%
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>Overall Accuracy</div>
              <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-primary)", marginBottom: "0.25rem" }}>
                {(animated * d.kappa).toFixed(3)}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>Kappa Coefficient</div>
              <span style={{ padding: "0.2rem 0.6rem", borderRadius: "99px", background: b.bg, color: b.color, fontSize: "0.72rem", fontWeight: "700" }}>
                {b.text}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "1rem", padding: "0.65rem 0.875rem", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--color-border-light)", fontSize: "0.78rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        CNN model · Validated with 100 points/year via Google Earth Engine
      </div>
    </div>
  );
}