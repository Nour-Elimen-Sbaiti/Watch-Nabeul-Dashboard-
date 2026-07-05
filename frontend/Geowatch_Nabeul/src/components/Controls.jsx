import { useState } from "react";

const labelStyle = {
  display: "flex", alignItems: "center", gap: "0.4rem",
  fontSize: "0.72rem", fontWeight: 700,
  color: "var(--color-text-secondary)",
  textTransform: "uppercase", letterSpacing: "0.07em",
  marginBottom: "0.5rem",
  fontFamily: "var(--font-body)",
};

export default function Controls({
  layerType,       setLayerType,
  modelVariant,    setModelVariant,
  rasters = [],
  compareMode = false, onToggleCompare,
  selectedYear = "2025", setSelectedYear,
  showBoundary = false,  onToggleBoundary,
  showHydrology = false, onToggleHydrology,
  rasterVisible = true,  onToggleRasterVisible,
  rasterOpacity = 90,    setRasterOpacity,
}) {
  const [focused, setFocused] = useState(false);

  const selectStyle = (isFocused) => ({
    width: "100%", padding: "0.65rem 1rem", paddingRight: "2.5rem",
    borderRadius: "var(--radius-md)",
    border: `2px solid ${isFocused ? "var(--color-primary)" : "var(--color-border-light)"}`,
    background: "var(--color-surface)", color: "var(--color-text)",
    fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 500,
    cursor: "pointer", outline: "none", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d97706' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center",
    transition: "all 0.2s ease",
    boxShadow: isFocused ? "0 0 0 4px rgba(217,119,6,0.1)" : "none",
  });

  const isChange = layerType === "change";

  /* ── Download handler ─────────────────────────────────────── */
  const handleDownload = () => {
    const list      = Array.isArray(rasters) ? rasters : [];
    const typeToken = layerType === "ndvi"   ? "ndvi"
                    : layerType === "change" ? "change"
                    : "lulc";

    const match = list.find((r) => {
      const n = (r.name || "").toLowerCase();
      const hasType  = n.includes(typeToken);
      const hasYear  = layerType === "change" ? true : n.includes(selectedYear);

      if (typeToken !== "lulc") return hasType && hasYear;

      const modelLower = modelVariant?.toLowerCase() || "cnn";
      if (modelLower === "cnn") {
        return hasType && hasYear && (n.includes("cnn") || (!n.includes("rf") && !n.includes("svm")));
      } else {
        return hasType && hasYear && (n.includes(`_${modelLower}`) || n.includes(` ${modelLower}`) || n.endsWith(modelLower));
      }
    })
    || list.find((r) => {
      const n = (r.name || "").toLowerCase();
      return n.includes(typeToken) && (layerType === "change" || n.includes(selectedYear));
    });

    const url = match?.file || match?.tile_url;
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("Download not available for this layer. Check that the raster has a file URL in Django admin.");
    }
  };

  return (
    <div style={{ padding: "0.25rem 0", fontFamily: "var(--font-body)" }}>

      {/* 1 ── Layer type */}
      <div style={{ marginBottom: "1.1rem" }}>
        <label style={labelStyle}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </svg>
          Layer Type
        </label>
        <select
          value={layerType}
          onChange={(e) => setLayerType(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={selectStyle(focused)}
        >
          <option value="classification">LULC Classification</option>
          <option value="ndvi">NDVI Vegetation</option>
        </select>
      </div>

      {/* 2 ── Year (hidden for change layer) */}
      {!isChange && (
        <div style={{ marginBottom: "1.1rem" }}>
          <label style={labelStyle}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Year
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem" }}>
            {["2020", "2025"].map((year) => {
              const active = selectedYear === year;
              return (
                <button
                  key={year} type="button"
                  onClick={() => setSelectedYear?.(year)}
                  style={{
                    padding: "0.5rem 0.6rem", borderRadius: "var(--radius-sm)",
                    border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border-light)"}`,
                    background: active ? "rgba(217,119,6,0.1)" : "var(--color-bg-secondary)",
                    color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Change period label */}
      {isChange && (
        <div style={{
          marginBottom: "1.1rem", padding: "0.65rem 0.85rem",
          borderRadius: "var(--radius-md)",
          background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.2)",
        }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--font-body)" }}>
            Period
          </div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-text)", marginTop: "0.2rem", fontFamily: "var(--font-body)" }}>
            2020 — 2025
          </div>
        </div>
      )}

      {/* 3 ── Model (classification only) */}
      {layerType === "classification" && (
        <div style={{ marginBottom: "1.1rem" }}>
          <label style={labelStyle}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
                       A1.65 1.65 0 0 0 15 19.4"/>
            </svg>
            Model Classifier
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.35rem" }}>
            {["cnn", "rf", "svm"].map((m) => {
              const active = modelVariant === m;
              const label = m.toUpperCase();
              return (
                <button
                  key={m} type="button"
                  onClick={() => setModelVariant(m)}
                  style={{
                    padding: "0.45rem 0.3rem", borderRadius: "var(--radius-sm)",
                    border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border-light)"}`,
                    background: active ? "rgba(217,119,6,0.1)" : "var(--color-bg-secondary)",
                    color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem",
                    cursor: "pointer",
                    opacity: 1,
                    textTransform: "uppercase",
                  }}
                  title={m === "cnn" ? "Convolutional Neural Network" : m === "rf" ? "Random Forest" : "Support Vector Machine"}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {(() => {
            const list = Array.isArray(rasters) ? rasters : [];
            const modelLabel = modelVariant === "cnn" ? "CNN" :
                              modelVariant === "rf" ? "RF" : "SVM";
            const match = list.find((r) => {
              const n = (r.name || "").toLowerCase();
              const hasLulc = n.includes("lulc");
              const hasYear = n.includes(selectedYear);

              if (modelVariant === "cnn") {
                return hasLulc && hasYear && (n.includes("cnn") || (!n.includes("rf") && !n.includes("svm")));
              } else {
                return hasLulc && hasYear && (n.includes(`_${modelVariant}`) || n.includes(` ${modelVariant}`) || n.endsWith(modelVariant));
              }
            });
            return match ? (
              <div style={{ marginTop: "0.5rem", padding: "0.5rem",
                           background: "rgba(217,119,6,0.08)", borderRadius: "var(--radius-sm)",
                           border: "1px solid rgba(217,119,6,0.2)", fontSize: "0.7rem",
                           color: "var(--color-primary)", fontFamily: "var(--font-body)", fontWeight: 600,
                           wordBreak: "break-all", overflowWrap: "break-word" }}>
                ✓ Active: {match.name}
              </div>
            ) : (
              <div style={{ marginTop: "0.5rem", padding: "0.5rem",
                           background: "rgba(220,38,38,0.08)", borderRadius: "var(--radius-sm)",
                           border: "1px solid rgba(220,38,38,0.2)", fontSize: "0.7rem",
                           color: "#dc2626", fontFamily: "var(--font-body)", fontWeight: 600,
                           wordBreak: "break-all", overflowWrap: "break-word" }}>
                ⚠ No raster found for {modelLabel} {selectedYear}
              </div>
            );
          })()}
        </div>
      )}

      {/* 4 ── Raster layer visibility + opacity (moved above Overlays) */}
      <div style={{ marginBottom: "1.1rem" }}>
        <label style={labelStyle}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Raster Layer
        </label>

        <label
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.4rem 0.6rem", marginBottom: "0.6rem",
            borderRadius: "var(--radius-sm)",
            border: `1.5px solid ${rasterVisible ? "var(--color-primary)" : "var(--color-border-light)"}`,
            background: rasterVisible ? "rgba(217,119,6,0.06)" : "var(--color-bg-secondary)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={rasterVisible}
            onChange={onToggleRasterVisible}
            style={{ width: 15, height: 15, cursor: "pointer" }}
          />
          <span style={{ flex: 1, fontSize: "0.875rem", color: "var(--color-text)" }}>
            Show raster on map
          </span>
        </label>

        <div style={{ opacity: rasterVisible ? 1 : 0.45, pointerEvents: rasterVisible ? "auto" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Opacity</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary)" }}>
              {rasterOpacity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={rasterOpacity}
            onChange={(e) => setRasterOpacity(Number(e.target.value))}
            style={{
              width: "100%",
              accentColor: "var(--color-primary)",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      {/* 5 ── Overlays */}
      <div style={{ marginBottom: "1.1rem" }}>
        <label style={labelStyle}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
          </svg>
          Overlays
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {[
            { key: "boundary",  label: "Boundary",  color: "#ff4757", on: showBoundary,  toggle: onToggleBoundary  },
            { key: "hydrology", label: "Hydrology", color: "#3b82f6", on: showHydrology, toggle: onToggleHydrology },
          ].map(({ key, label, color, on, toggle }) => (
            <label
              key={key}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.4rem 0.6rem",
                borderRadius: "var(--radius-sm)",
                border: `1.5px solid ${on ? color : "var(--color-border-light)"}`,
                background: on ? color + "0d" : "var(--color-bg-secondary)",
                cursor: "pointer",
              }}
            >
              <div style={{ position: "relative" }}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={toggle}
                  style={{
                    width: 14, height: 14,
                    border: `2px solid ${on ? color : "var(--color-border-light)"}`,
                    borderRadius: 3,
                    appearance: "none",
                    background: "var(--color-surface)",
                    cursor: "pointer",
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                />
                {on && (
                  <div style={{
                    position: "absolute",
                    top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    width: 8, height: 8,
                    background: color,
                    borderRadius: 2,
                    pointerEvents: "none",
                  }}
                  />
                )}
              </div>
              <span style={{ flex: 1, fontSize: "0.875rem", color: "var(--color-text)" }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 6 ── Compare (not for change layer) */}
      {!isChange && (
        <>
          <button
            type="button" onClick={onToggleCompare}
            style={{
              width: "100%", padding: "0.65rem 1rem", borderRadius: "var(--radius-md)",
              border: `1.5px solid ${compareMode ? "var(--color-primary)" : "var(--color-border-light)"}`,
              background: compareMode ? "rgba(217,119,6,0.12)" : "var(--color-bg-secondary)",
              color: compareMode ? "var(--color-primary)" : "var(--color-text)",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "0.5rem", marginBottom: "1rem",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/>
              <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/>
              <path d="M12 3v18"/>
            </svg>
            {compareMode ? "Exit Compare" : "Compare Layers"}
          </button>

          {compareMode && (
            <div style={{
              padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)",
              background: "rgba(217,119,6,0.06)", border: "1px dashed rgba(217,119,6,0.3)",
              marginBottom: "1rem", fontSize: "0.75rem",
              color: "var(--color-text-muted)", fontFamily: "var(--font-body)",
              wordBreak: "break-word", overflowWrap: "break-word",
            }}>
              Drag the divider on the map to compare {selectedYear} vs{" "}
              {selectedYear === "2020" ? "2025" : "2020"}
            </div>
          )}
        </>
      )}

      {/* 7 ── Download */}
      <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border-light)" }}>
        <label style={labelStyle}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Current Layer
        </label>
        <button
          onClick={handleDownload}
          style={{
            width: "100%", padding: "0.7rem 1rem", borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--color-primary)",
            background: "rgba(217,119,6,0.1)", color: "var(--color-primary)",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.85rem",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "0.5rem", transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(217,119,6,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(217,119,6,0.1)";  e.currentTarget.style.transform = "translateY(0)";    }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download
        </button>
        <div style={{ marginTop: "0.5rem", fontSize: "0.72rem", color: "var(--color-text-muted)", textAlign: "center" }}>
          Downloads the currently selected layer
        </div>
      </div>
    </div>
  );
}