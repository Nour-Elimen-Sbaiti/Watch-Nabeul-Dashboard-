import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Controls from "../components/Controls";
import MapView from "../components/MapView";
import Legend from "../components/Legend";
import StatisticsTabs from "../components/StatisticsTabs";
import ExportPanel from "../components/ExportPanel";
import {
  fetchStats,
  fetchAccuracyByClassifier,
  fetchChangeStats,
  fetchRasters,
  fetchTransitionMatrix,
} from "../services/api";
import { LAND_USE_CLASSES } from "../services/rasterConfig";
import "../Styles/PageLayout.css";

/* ─── Class name normalisation ───────────────────────────────── */
const CLASS_ALIASES = {
  water:             "Water",
  built_up:          "Built_up",
  builtup:           "Built_up",
  "built-up":        "Built_up",
  forest:            "Forest",
  agricultural_area: "Agricultural_area",
  agriculture:       "Agricultural_area",
  agricultural:      "Agricultural_area",
};

const normalizeClassName = (name = "Unknown") => {
  const key = String(name).trim().toLowerCase().replace(/\s+/g, "_");
  return CLASS_ALIASES[key] || name;
};

const classAreaKm2 = (record) => {
  if (record.area_km2    != null) return Number(record.area_km2);
  if (record.area        != null) return Number(record.area);
  if (record.area_ha     != null) return Number(record.area_ha) / 100;
  if (record.area_hectares != null) return Number(record.area_hectares) / 100;
  return 0;
};

/* ─── Stats transform ────────────────────────────────────────── */
const transformStats = (raw) => {
  if (!raw) return {};
  const out = {};

  const addRow = (year, name, area, percentage) => {
    const normalized = normalizeClassName(name);
    if (!year || !normalized) return;
    if (!out[year]) out[year] = {};
    out[year][normalized] = { area: Number(area || 0), percentage: Number(percentage ?? 0) };
  };

  if (raw.years && typeof raw.years === "object") {
    Object.entries(raw.years).forEach(([year, yobj]) => {
      (yobj?.classes || []).forEach((r) =>
        addRow(year, r.class_name || r.class || r.land_use_class, classAreaKm2(r), r.percentage)
      );
    });
    return out;
  }

  if (Array.isArray(raw)) {
    raw.forEach((r) =>
      addRow(
        String(r.year || ""),
        r.land_use_class || r.class_name || r.class,
        classAreaKm2(r),
        r.percentage
      )
    );
    return out;
  }

  Object.entries(raw).forEach(([year, yearData]) => {
    if (!/^\d{4}$/.test(year) || !yearData || typeof yearData !== "object") return;
    Object.entries(yearData).forEach(([name, value]) => {
      addRow(
        year, name,
        typeof value === "object" ? classAreaKm2(value) : 0,
        typeof value === "object" ? value.percentage : value
      );
    });
  });

  return out;
};

/* ─── Accuracy transform ─────────────────────────────────────── */
const transformAccuracy = (raw) => {
  if (!raw) return {};

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const classifierMap = {
      "CNN": "cnn",
      "SVM": "svm",
      "Random Forest": "rf",
    };

    const out = {};
    Object.entries(raw).forEach(([classifier, yearData]) => {
      const modelKey = classifierMap[classifier] || classifier.toLowerCase();
      out[modelKey] = {};
      Object.entries(yearData || {}).forEach(([year, metrics]) => {
        if (typeof metrics === "object") {
          out[modelKey][year] = {
            oa: Number(metrics.overall_accuracy_percent ?? metrics.oa ?? 0),
            kappa: Number(metrics.kappa ?? 0),
          };
        }
      });
    });
    return out;
  }

  if (raw.features && Array.isArray(raw.features)) {
    const out = {};
    raw.features.forEach((f) => {
      const p    = f.properties || {};
      const year = p.year?.toString();
      if (!year) return;
      const model = (p.model || p.model_type || p.classifier || "").toLowerCase() || null;
      if (model) {
        if (!out[model]) out[model] = {};
        out[model][year] = {
          oa: Number(p.overall_accuracy_percent ?? (p.overall_accuracy != null ? p.overall_accuracy * 100 : 0)),
          kappa: Number(p.kappa ?? 0),
        };
      }
    });
    return out;
  }

  if (Array.isArray(raw)) {
    const out = {};
    raw.forEach((r) => {
      const year  = String(r.year || "");
      const model = (r.classifier || r.model || r.model_type || "").toLowerCase() || null;
      if (!year) return;
      if (model) {
        if (!out[model]) out[model] = {};
        out[model][year] = {
          oa: Number(r.overall_accuracy_percent ?? (r.overall_accuracy != null ? r.overall_accuracy * 100 : 0)),
          kappa: Number(r.kappa ?? 0),
        };
      }
    });
    return out;
  }

  return raw;
};

/* ─── Change transform ───────────────────────────────────────── */
const transformChange = (raw) => {
  if (!raw) return {};

  if (Array.isArray(raw.classes)) {
    const label = raw.period?.replace("_", "–") || "2020–2025";
    const out   = { [label]: {} };
    raw.classes.forEach((c) => {
      const name = c.class_name || c.class || "Unknown";
      const pct  = c.percentage_point_change ?? c.change_percent_of_2020 ?? c.percentage_change ?? 0;
      out[label][name] = Number(pct);
    });
    return out;
  }

  if (Array.isArray(raw)) {
    const out = {};
    raw.forEach(({ period, land_use_class, percentage_change }) => {
      const label = period?.replace("_", "–");
      if (!label || !land_use_class) return;
      if (!out[label]) out[label] = {};
      out[label][land_use_class] = percentage_change;
    });
    return out;
  }

  return raw;
};

/* ─── Transition matrix transform ───────────────────────────── */
const transformTransitionMatrix = (raw) => {
  if (!raw) return null;
  if (raw.matrix_km2 && raw.classes) return raw;
  if (raw.data?.matrix_km2 && raw.data?.classes) return raw.data;
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item.data?.matrix_km2 && item.data?.classes) return item.data;
      if (item.matrix_km2 && item.classes) return item;
    }
  }
  return null;
};

/* ─── Chart stats helper ─────────────────────────────────────── */
const toChartStats = (overviewStats) =>
  Object.fromEntries(
    LAND_USE_CLASSES.map((lc) => [
      lc.key,
      ["2020", "2025"].map((y) => overviewStats?.[y]?.[lc.key]?.percentage ?? 0),
    ])
  );

/* ─── Unwrap DRF response payload ───────────────────────────── */
const unwrap = (res) => {
  if (!res?.data) return null;
  const payload = res.data;

  if (payload.results != null) {
    const r = payload.results;
    return r.length === 1 ? r[0].data ?? r[0] : r;
  }

  if (Array.isArray(payload)) {
    return payload.length === 1 ? payload[0].data ?? payload[0] : payload;
  }

  return payload.data ?? payload;
};

/* ─── Helper: pick accuracy for the active model ─────────────── */
const pickAccuracy = (acc, modelVariant) => {
  if (!acc) return null;
  if (acc[modelVariant]) return acc[modelVariant];
  const keys = Object.keys(acc);
  if (keys.some((k) => /^\d{4}$/.test(k))) return acc;
  return null;
};

/* ─── MapPage ────────────────────────────────────────────────── */
export default function MapPage() {
  const [layerType,      setLayerType]      = useState("classification");
  const [modelVariant,   setModelVariant]   = useState("cnn");
  const [theme,          setTheme]          = useState(() => localStorage.getItem("theme") || "light");
  const [stats,          setStats]          = useState(null);
  const [accuracy,       setAccuracy]       = useState(null);
  const [changeData,     setChangeData]     = useState(null);
  const [transitionMatrix, setTransitionMatrix] = useState(null);
  const [selectedYear,   setSelectedYear]   = useState("2025");
  const [rasters,        setRasters]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [showSplitView,  setShowSplitView]  = useState(false);
  const [showBoundary,   setShowBoundary]   = useState(true);
  const [showHydrology,  setShowHydrology]  = useState(true);
  const [rasterVisible,  setRasterVisible]  = useState(true);
  const [rasterOpacity,  setRasterOpacity]  = useState(90);

  const handleToggleBoundary = () => {
    setShowBoundary((v) => !v);
  };

  const handleToggleHydrology = () => {
    setShowHydrology((v) => !v);
  };

  const handleToggleRasterVisible = () => {
    setRasterVisible((v) => !v);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    Promise.all([
      fetchStats().catch((err)             => { console.error("[MapPage] stats error:",    err); return null; }),
      fetchAccuracyByClassifier().catch((err)          => { console.error("[MapPage] accuracy error:", err); return null; }),
      fetchChangeStats().catch((err)       => { console.error("[MapPage] change error:",   err); return null; }),
      fetchTransitionMatrix().catch((err)  => { console.error("[MapPage] matrix error:",   err); return null; }),
    ]).then(([statsRes, accuracyRes, changeRes, matrixRes]) => {
      const statsPayload  = unwrap(statsRes);
      const accPayload    = unwrap(accuracyRes);
      const changePayload = unwrap(changeRes);
      const matrixPayload = unwrap(matrixRes);

      if (statsPayload)  setStats(transformStats(statsPayload));
      if (accPayload)    setAccuracy(transformAccuracy(accPayload));
      if (changePayload) setChangeData(transformChange(changePayload));
      if (matrixPayload) setTransitionMatrix(transformTransitionMatrix(matrixPayload));

      if (!statsRes?.data || !accuracyRes?.data || !changeRes?.data || !matrixRes?.data) {
        setError("Some analytics are unavailable. Check the API or try again later.");
      }
    }).finally(() => setLoading(false));

    fetchRasters()
      .then((r) => { if (r?.data) setRasters(r.data); })
      .catch(() => setRasters([]));
  }, []);

  const activeModelAccuracy = pickAccuracy(accuracy, modelVariant);
  const activeAccuracy      = activeModelAccuracy?.[selectedYear];

  const changeSummary = Object.values(changeData || {})[0] || {};
  const topChange     = Object.entries(changeSummary).sort(
    (a, b) => Math.abs(b[1]) - Math.abs(a[1])
  )[0];

  const chartStats = stats ? toChartStats(stats) : null;

  return (
    <div className="page">
      <Navbar
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      />

      <div className="page-content">
        {/* ── Side panel ── */}
        <div className="side-panel">

          {/* Map Controls card */}
          <div className="card" style={{ animationDelay: "0.05s" }}>
            <h3 style={{ fontFamily: "var(--font-display)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
                         A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
                         A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83
                         l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
                         A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83
                         l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
                         a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83
                         l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
                         a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Map Controls
            </h3>
            <Controls
              layerType={layerType}
              setLayerType={setLayerType}
              modelVariant={modelVariant}
              setModelVariant={setModelVariant}
              rasters={rasters}
              compareMode={showSplitView}
              onToggleCompare={() => setShowSplitView((v) => !v)}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              showBoundary={showBoundary}
              onToggleBoundary={handleToggleBoundary}
              showHydrology={showHydrology}
              onToggleHydrology={handleToggleHydrology}
              rasterVisible={rasterVisible}
              onToggleRasterVisible={handleToggleRasterVisible}
              rasterOpacity={rasterOpacity}
              setRasterOpacity={setRasterOpacity}
            />
          </div>

          {/* Quick metrics card */}
          <div className="card" style={{ animationDelay: "0.15s" }}>
            <h3 style={{ fontFamily: "var(--font-display)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 17v-5a2 2 0 1 1 4 0v5"/>
                <path d="M5 19h14"/>
                <path d="M10 10h4"/>
                <path d="M12 3v2"/>
              </svg>
              Quick metrics
            </h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                  Active view
                </span>
                <strong style={{ color: "var(--color-text)", fontSize: "1rem" }}>
                  {layerType === "ndvi" ? "NDVI vegetation" : layerType === "change" ? "Change detection" : `LULC classification (${modelVariant.toUpperCase()})`}
                </strong>
              </div>

              <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                  Selected year
                </span>
                <strong style={{ color: "var(--color-text)", fontSize: "1rem" }}>
                  {showSplitView ? "2020 vs 2025" : selectedYear}
                </strong>
              </div>

              {activeAccuracy && (
                <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                    Model accuracy
                  </span>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Overall accuracy:</span>
                    <strong style={{ color: "var(--color-primary)" }}>
                      {activeAccuracy.oa ? `${activeAccuracy.oa.toFixed(1)}%` : "—"}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Kappa coefficient:</span>
                    <strong style={{ color: "var(--color-primary)" }}>
                      {activeAccuracy.kappa ? activeAccuracy.kappa.toFixed(3) : "—"}
                    </strong>
                  </div>
                </div>
              )}

              {topChange && (
                <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                    Largest change
                  </span>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{topChange[0].replace("_", " ")}:</span>
                    <strong style={{
                      color: topChange[1] > 0 ? "#16a34a" : topChange[1] < 0 ? "#dc2626" : "#6b7280"
                    }}>
                      {topChange[1] >= 0 ? "+" : ""}{topChange[1].toFixed(1)}%
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map guidance card */}
          <div className="card" style={{
            animationDelay: "0.2s",
            background: "linear-gradient(135deg,rgba(217,119,6,.07),rgba(101,163,13,.05))",
            border: "1px solid rgba(217,119,6,.18)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.65rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text)" }}>
                Map guidance
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
              {showSplitView
                ? "Drag the divider left or right on the map to compare two years at once."
                : "The map is showing a single selected year."}{" "}
              Switch between LULC and NDVI for a clearer land-use / vegetation overview.
              Click any point on the map to see real pixel data from the backend.
            </p>
            <div style={{ display: "flex", gap: "0.45rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
              <span className="badge badge-primary">{showSplitView ? "Split view" : "Single layer"}</span>
              <span className="badge badge-success">Live legend</span>
              <span className="badge badge-warning">Statistics</span>
            </div>
          </div>

        </div>

        {/* ── Main column ── */}
        <div className="main-column">
          <div className="map-card card" style={{ position: "relative" }}>
            <div className="map-shell">
              <MapView
                layerType={layerType}
                modelVariant={modelVariant}
                selectedYear={selectedYear}
                compareMode={showSplitView}
                showBoundary={showBoundary}
                showHydrology={showHydrology}
                accuracy={activeModelAccuracy}
                rasterVisible={rasterVisible}
                rasterOpacity={rasterOpacity}
              />
            </div>

            {/* Floating legend, top-right of the map — kept as a sibling of
                .map-shell (not a child) so it isn't caught by any CSS that
                forces map-shell's children to stretch to full width. */}
            {!showSplitView && (
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  zIndex: 1000,
                  width: "230px",
                  maxWidth: "230px",
                  flexShrink: 0,
                  boxSizing: "border-box",
                  maxHeight: "calc(100% - 28px)",
                  overflowY: "auto",
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border-light)",
                  boxShadow: "var(--shadow-lg)",
                  padding: "0.85rem",
                  backdropFilter: "blur(6px)",
                }}
              >
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginBottom: "0.6rem",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" rx="1"/>
                    <rect x="14" y="3" width="7" height="5" rx="1"/>
                    <rect x="14" y="12" width="7" height="9" rx="1"/>
                    <rect x="3" y="16" width="7" height="5" rx="1"/>
                  </svg>
                  Legend
                </h3>
                <Legend
                  type={layerType === "ndvi" ? "ndvi" : layerType === "change" ? "change" : "classification"}
                  year={selectedYear}
                />
              </div>
            )}
          </div>

          {error && (
            <div style={{
              padding: "1rem", borderRadius: "var(--radius-lg)",
              background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.18)",
              color: "var(--color-text)", fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{
              padding: "1rem", borderRadius: "var(--radius-lg)",
              background: "rgba(15,23,42,.6)", border: "1px solid rgba(148,163,184,.15)",
              color: "var(--color-text-secondary)",
            }}>
              Loading analytics and statistics…
            </div>
          )}

          <StatisticsTabs
            chartStats={chartStats}
            tableStats={stats}
            accuracy={activeModelAccuracy}
            changeData={changeData}
            transitionMatrix={transitionMatrix}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            layerType={layerType}
            modelVariant={modelVariant}
          />

          {/* Export panel below statistics */}
          <div className="card" style={{ animationDelay: "0.3s" }}>
            <ExportPanel
              tableStats={stats}
              selectedYear={selectedYear}
              modelVariant={modelVariant}
              layerType={layerType}
              mapContainerId="map-container"
            />
          </div>
        </div>
      </div>
    </div>
  );
}