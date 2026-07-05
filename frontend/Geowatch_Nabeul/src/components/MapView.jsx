import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchBoundaries, fetchHydrology, fetchRasters, fetchPixelInfo } from "../services/api";
import { LAND_USE_CLASSES } from "../services/rasterConfig";
import CompareView from "./CompareView";

/* ─── Classification pixel-value map ────────────────────────── */
const CLASSIFICATION_MAP = {
  "1": { name: "Urban/Built-up",    color: "#dc2626", description: "Urban areas, buildings, roads"       },
  "2": { name: "Agricultural Land", color: "#65a30d", description: "Cropland, farmland, plantations"     },
  "3": { name: "Forest",            color: "#15803d", description: "Forest cover, trees, woodland"       },
  "4": { name: "Water Bodies",      color: "#0891b2", description: "Lakes, rivers, reservoirs, sea"      },
  "5": { name: "Barren Land",       color: "#a8a29e", description: "Bare soil, rock, desert"             },
  "6": { name: "Wetlands",          color: "#0d9488", description: "Marshes, swamps, bogs"               },
  "7": { name: "Grassland",         color: "#84cc16", description: "Grass, meadows, pasture"             },
  "8": { name: "Shrubland",         color: "#ca8a04", description: "Shrubs, bushes, scrubland"           },
};

/* ─── Basemap options ─────────────────────────────────────────── */
const BASEMAPS = {
  streets: {
    label: "Streets",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
};

/* ─── NDVI level classifier ──────────────────────────────────── */
const getNDVILevel = (value) => {
  if (value === null || value === undefined)
    return { level: "No Data",        color: "#666666", description: "No vegetation data"                  };
  const v = parseFloat(value);
  if (v < 0)   return { level: "Water/Bare Soil", color: "#0891b2", description: "Water bodies or bare soil"        };
  if (v < 0.2) return { level: "Very Low",        color: "#f87171", description: "Very sparse or stressed vegetation" };
  if (v < 0.4) return { level: "Low",             color: "#fbbf24", description: "Sparse vegetation, dry areas"      };
  if (v < 0.6) return { level: "Moderate",        color: "#a3e635", description: "Healthy vegetation, crops"         };
  if (v < 0.8) return { level: "High",            color: "#22c55e", description: "Dense vegetation, forests"         };
  return         { level: "Very High",      color: "#16a34a", description: "Very dense, lush vegetation"       };
};

/* ─── Debounce utility ─────────────────────────────────────────── */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* ─── findRaster ───────────────────────────────────────────────── */
function findRaster(rasters, layerType, year, modelVariant = "cnn") {
  const list = Array.isArray(rasters) ? rasters : [];

  if (list.length === 0) {
    console.warn("[findRaster] No rasters available");
    return null;
  }

  const n = (r) => (r.name || "").toLowerCase();

  const typeToken = layerType === "ndvi"   ? "ndvi"
                  : layerType === "change" ? "change"
                  : "lulc";

  if (typeToken === "lulc") {
    let r = null;

    if (modelVariant === "cnn") {
      r = list.find((x) => {
        const name = n(x);
        return name.includes("lulc") &&
               name.includes(year) &&
               (name.includes("cnn") || (!name.includes("rf") && !name.includes("svm")));
      });
      if (!r) {
        r = list.find((x) => {
          const name = n(x);
          return name.includes("lulc") && name.includes(year) && !name.includes("rf") && !name.includes("svm");
        });
      }
    } else {
      const modelLower = modelVariant.toLowerCase();
      r = list.find((x) => {
        const name = n(x);
        return name.includes("lulc") &&
               name.includes(year) &&
               (name.includes(`_${modelLower}`) || name.includes(` ${modelLower}`) || name.endsWith(modelLower));
      });
    }

    if (r) {
      const url = r.tile_url || `http://localhost:8000/tiles/${r.id}/{z}/{x}/{y}.png`;
      return { ...r, resolvedUrl: url };
    }
  }

  if (typeToken === "ndvi" || typeToken === "change") {
    const r = list.find((x) => {
      const name = n(x);
      return name.includes(typeToken) && name.includes(year);
    });

    if (r) {
      const url = r.tile_url || `http://localhost:8000/tiles/${r.id}/{z}/{x}/{y}.png`;
      return { ...r, resolvedUrl: url };
    }
  }

  const fallback = list.find((x) => n(x).includes(typeToken));
  if (fallback) {
    console.warn(`[findRaster] Using fallback for type:${typeToken} year:${year} model:${modelVariant}`);
    const url = fallback.tile_url || `http://localhost:8000/tiles/${fallback.id}/{z}/{x}/{y}.png`;
    return { ...fallback, resolvedUrl: url };
  }

  console.warn(
    `[findRaster] No match — type:${typeToken} year:${year} model:${modelVariant}`,
    list.map((x) => x.name)
  );
  return null;
}

/* ─── Popup HTML builder ─────────────────────────────────────── */
function buildPopupHTML(pixelData, layerType, selectedYear, modelVariant = "cnn", accuracy = null) {
  const { raster, raster_type, coordinates, pixel_values, classification, classification_key, ndvi_interpretation, vegetation_coverage, pixel_coordinates } = pixelData;
  const coord = `${coordinates.lat.toFixed(5)}° N, ${coordinates.lon.toFixed(5)}° E`;
  const pixelCoord = pixel_coordinates ? `Row: ${pixel_coordinates.row}, Col: ${pixel_coordinates.col}` : '';

  const row = (label, value, color = "") => `
    <div style="display:flex;justify-content:space-between;align-items:center;
                padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.05)">
      <span style="font-size:10px;color:#57534e;font-weight:600">${label}</span>
      <span style="font-size:11px;font-weight:700;color:${color || "#1c1917"}">${value}</span>
    </div>`;

  const dot = (color) =>
    `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;
      background:${color};margin-right:6px;flex-shrink:0;border:1px solid rgba(0,0,0,0.15);box-shadow:0 1px 3px rgba(0,0,0,0.2)"></span>`;

  const colorMap = {
    'Built_up': '#dc2626',
    'Agricultural_area': '#65a30d',
    'Vegetation': '#16a34a',
    'Water': '#0891b2'
  };

  const classDescription = {
    'Built_up': 'Urban areas, buildings, roads, infrastructure',
    'Agricultural_area': 'Cropland, farmland, plantations, orchards',
    'Vegetation': 'Forest, grassland, shrubland, wetlands',
    'Water': 'Water bodies, lakes, rivers'
  };

  let body = "";
  let headerColor = "#d97706";
  let headerTitle = "LULC";
  let headerIcon = "";

  if (raster_type === "classification" || layerType === "classification") {
    const classColor = colorMap[classification_key] || "#666666";
    const description = classDescription[classification_key] || '';

    const icons = {
      'Built_up': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9 14h.01"/><path d="M15 14h.01"/></svg>',
      'Agricultural_area': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-5"/><path d="M5 17h14"/><path d="M12 17V7"/><path d="M5 7h14"/><path d="M12 2L8 7h8z"/></svg>',
      'Forest': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L8 8h3v4h2V8h3z"/><path d="M12 12v10"/><path d="M8 22h8"/></svg>',
      'Water': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    };
    headerIcon = icons[classification_key] || '';

    body = `
      <div style="background: ${classColor}15; border-radius: 8px; padding: 10px; margin-bottom: 10px; border-left: 3px solid ${classColor}">
        <div style="font-size:9px;font-weight:700;color:${classColor};text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">
          Layer Type
        </div>
        <div style="font-size:13px;font-weight:800;color:${classColor};line-height:1.3">
          ${classification || "Unknown"}
        </div>
        ${description ? `<div style="font-size:9px;color:#78716c;margin-top:4px;line-height:1.4">${description}</div>` : ''}
      </div>
      <div style="margin-bottom:8px">
        ${row("Classification Class",
          `<span style="display:flex;align-items:center;font-size:12px">${dot(classColor)}<strong>${classification || "Unknown"}</strong></span>`,
          classColor)}
        ${row("Pixel Value", pixel_values?.[0]?.value ? Math.round(pixel_values[0].value).toString() : "N/A", "#666")}
        ${row("Map Coordinates", coord, "#78716c")}
        ${pixelCoord ? row("Pixel Position", pixelCoord, "#a8a29e") : ''}
      </div>
      <div style="background:#f5f5f4;border-radius:6px;padding:6px 8px;margin-top:6px">
        <div style="font-size:8px;font-weight:700;color:#a8a29e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px">
          Class Legend
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">
          ${Object.entries(colorMap).map(([key, color]) =>
            `<span style="display:inline-flex;align-items:center;gap:3px;font-size:8px;color:#57534e">
              <span style="width:8px;height:8px;border-radius:3px;background:${color};flex-shrink:0"></span>
              ${key === 'Built_up' ? 'Built-up' : key === 'Agricultural_area' ? 'Agricultural Area' : key === 'Vegetation' ? 'Forest' : 'Water'}
            </span>`
          ).join('')}
        </div>
      </div>`;

    headerColor = classColor;
    headerTitle = "LULC";

  } else if (raster_type === "ndvi" || layerType === "ndvi") {
    const ndviValue = pixelData.normalized_ndvi ?? (pixel_values?.[0]?.value != null ? parseFloat(pixel_values[0].value) : null);
    const ndviNum = ndviValue != null ? parseFloat(ndviValue) : 0;

    const lvlMap = {
      'water_bare':  { color: '#0891b2', label: 'Water/Bare Soil' },
      'very_sparse': { color: '#f87171', label: 'Very Sparse' },
      'sparse':      { color: '#fbbf24', label: 'Sparse' },
      'moderate':    { color: '#a3e635', label: 'Moderate' },
      'dense':       { color: '#22c55e', label: 'Dense' },
      'very_dense':  { color: '#16a34a', label: 'Very Dense' }
    };

    const lvl = ndvi_interpretation || { level: 'No Data', category: 'unknown' };
    const lvlInfo = lvlMap[lvl.category] || { color: '#666666', label: lvl.level };
    const lvlColor = lvlInfo.color;

    body = `
      <div style="background: ${lvlColor}15; border-radius: 8px; padding: 10px; margin-bottom: 10px; border-left: 3px solid ${lvlColor}">
        <div style="font-size:9px;font-weight:700;color:${lvlColor};text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">
          Layer Type
        </div>
        <div style="font-size:13px;font-weight:800;color:${lvlColor};line-height:1.3">
          NDVI - ${lvl.level}
        </div>
        <div style="font-size:9px;color:#78716c;margin-top:4px;line-height:1.4">
          Normalized Difference Vegetation Index
        </div>
      </div>
      <div style="margin-bottom:8px">
        ${row("NDVI Value", ndviValue != null ? ndviValue.toFixed(4) : "N/A", lvlColor)}
        ${row("Vegetation Level",
          `<span style="display:flex;align-items:center;font-size:12px"><strong>${lvl.level}</strong></span>`,
          lvlColor)}
        ${row("Vegetation Coverage", vegetation_coverage || "N/A", lvlColor)}
        ${row("Coordinates", coord, "#a8a29e")}
        ${pixelCoord ? row("Pixel Position", pixelCoord, "#a8a29e") : ''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px">
        <div style="background:#f5f5f4;border-radius:6px;padding:5px 7px">
          <div style="font-size:7px;color:#a8a29e;text-transform:uppercase">Low NDVI</div>
          <div style="font-size:9px;font-weight:600;color:#f87171">Water/Bare/Sparse</div>
        </div>
        <div style="background:#f5f5f4;border-radius:6px;padding:5px 7px">
          <div style="font-size:7px;color:#a8a29e;text-transform:uppercase">High NDVI</div>
          <div style="font-size:9px;font-weight:600;color:#16a34a">Dense Vegetation</div>
        </div>
      </div>`;

    headerColor = lvlColor;
    headerTitle = "NDVI";
    headerIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
  }

  return `
    <div style="font-family:'DM Sans',ui-sans-serif,sans-serif;min-width:280px;max-width:340px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;
                  padding-bottom:8px;border-bottom:2px solid ${headerColor}">
        <span style="color:${headerColor}">${headerIcon}</span>
        <span style="font-size:10px;font-weight:800;color:${headerColor};letter-spacing:.05em;text-transform:uppercase">
          ${headerTitle} Point Analysis
        </span>
      </div>
      <div style="font-size:9px;color:#78716c;margin-bottom:8px;padding:5px 8px;
                  background:#fafaf9;border-radius:6px;border:1px solid #e7e5e4">
        <span style="color:#a8a29e;font-size:8px;text-transform:uppercase;letter-spacing:.05em">Source</span><br>
        <strong style="font-size:10px">${raster}</strong>
      </div>
      ${body}
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid #e7e5e4;
              display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:8px;color:#a8a29e;font-weight:600">
          ${modelVariant.toUpperCase()} · ${selectedYear} · ${accuracy && accuracy[selectedYear] ? accuracy[selectedYear].oa.toFixed(1) + '%' : '—'}
        </span>
        <span style="font-size:7px;color:#d4d4d4">
          Click anywhere for new data
        </span>
      </div>
    </div>`;
}

/* ─── NDVI Value Display (real-time cursor tracking) ──────────── */
function NDVICursorDisplay({ layerType, selectedYear, rasters, modelVariant, accuracy }) {
  const map = useMap();
  const [ndviValue, setNdviValue] = useState(null);
  const [ndviLevel, setNdviLevel] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const markerRef = useRef(null);

  const debouncedFetch = useCallback(
    debounce(async (lat, lng) => {
      if (layerType !== "ndvi") return;
      setLoading(true);
      try {
        const active = findRaster(rasters, layerType, selectedYear, modelVariant);
        if (!active) return;
        const pixelData = await fetchPixelInfo(active.id, lat, lng);
        if (pixelData && !pixelData.error && pixelData.ndvi_interpretation) {
          const val = pixelData.normalized_ndvi ?? pixelData.pixel_values?.[0]?.value;
          if (val !== null && val !== undefined) {
            setNdviValue(parseFloat(val));
            setNdviLevel(pixelData.ndvi_interpretation);
            setPosition({ lat, lng });
          }
        }
      } catch (err) {
        console.error("[NDVICursorDisplay] fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 150),
    [layerType, selectedYear, rasters, modelVariant]
  );

  useEffect(() => {
    if (layerType !== "ndvi") {
      setNdviValue(null);
      setNdviLevel(null);
      setPosition(null);
      return;
    }
    const handleMouseMove = (e) => {
      const { lat, lng } = e.latlng;
      debouncedFetch(lat, lng);
    };
    map.on("mousemove", handleMouseMove);
    return () => { map.off("mousemove", handleMouseMove); };
  }, [layerType, map, debouncedFetch]);

  useEffect(() => {
    if (ndviValue === null || position === null) {
      if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }
      return;
    }
    const ndviNum = parseFloat(ndviValue);
    const lvl = getNDVILevel(ndviValue);
    const getColor = (v) => {
      if (v < 0)   return "#0891b2";
      if (v < 0.2) return "#f87171";
      if (v < 0.4) return "#fbbf24";
      if (v < 0.6) return "#a3e635";
      if (v < 0.8) return "#22c55e";
      return "#16a34a";
    };
    const color = getColor(ndviNum);
    const tooltipContent = `
      <div style="font-family:'DM Sans',ui-sans-serif,sans-serif;background:rgba(28,25,23,0.92);
                  backdrop-filter:blur(8px);color:#fff;padding:8px 14px;border-radius:8px;
                  font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,0.15);
                  box-shadow:0 4px 16px rgba(0,0,0,0.3);pointer-events:none;min-width:160px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};border:1px solid rgba(255,255,255,0.3)"></span>
          <span style="font-size:9px;color:#a8a29e;text-transform:uppercase;letter-spacing:.05em;">NDVI</span>
        </div>
        <div style="font-size:16px;font-weight:700;color:${color};line-height:1.2;">${ndviValue.toFixed(3)}</div>
        <div style="font-size:10px;color:#d4d4d8;margin-top:2px;">${lvl.level}</div>
        ${loading ? '<div style="font-size:8px;color:#78716c;margin-top:4px;">Updating...</div>' : ''}
      </div>`;
    if (markerRef.current) { map.removeLayer(markerRef.current); }
    const marker = L.marker(position, {
      icon: L.divIcon({ className: 'ndvi-cursor-marker', html: tooltipContent, iconSize: [160, 80], iconAnchor: [80, 40] }),
      keyboard: false, interactive: false,
    }).addTo(map);
    markerRef.current = marker;
    const styleId = "ndvi-cursor-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `.ndvi-cursor-marker { background:transparent!important;border:none!important;pointer-events:none!important; }`;
      document.head.appendChild(style);
    }
    return () => { if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; } };
  }, [ndviValue, ndviLevel, position, loading, map]);

  return null;
}

/* ─── ClickHandler ───────────────────────────────────────────── */
function ClickHandler({ layerType, selectedYear, rasters, modelVariant, accuracy }) {
  const map      = useMap();
  const popupRef = useRef(null);

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      const loadingPopup = L.popup({ maxWidth: 340, className: "lulc-popup", closeButton: true, autoClose: false })
        .setLatLng(e.latlng)
        .setContent(
          `<div style="padding:15px;text-align:center">
             <div style="width:20px;height:20px;border:2px solid #d97706;border-top-color:transparent;
                         border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 10px"></div>
             Loading pixel data…
           </div>`
        )
        .openOn(map);
      popupRef.current = loadingPopup;
      try {
        const active = findRaster(rasters, layerType, selectedYear, modelVariant);
        if (!active) {
          loadingPopup.setContent(
            `<div style='padding:15px'>
              <div style='color:#dc2626;font-weight:bold;margin-bottom:10px;'>No raster found!</div>
              <div style='font-size:12px;color:#666;'>
                Layer: ${layerType}<br>Year: ${selectedYear}<br>Model: ${modelVariant}<br>
                Available: ${rasters.map(r => r.name).join(', ')}
              </div>
            </div>`
          );
          return;
        }
        const pixelData = await fetchPixelInfo(active.id, lat, lng);
        if (pixelData.error) {
          loadingPopup.setContent(`<div style="padding:15px">Error: ${pixelData.error}</div>`);
          return;
        }
        loadingPopup.setContent(buildPopupHTML(pixelData, layerType, selectedYear, modelVariant, accuracy));
      } catch (err) {
        console.error("[ClickHandler] pixel info error:", err);
        loadingPopup.setContent(
          `<div style='padding:15px'>
            <div style='color:#dc2626;font-weight:bold;margin-bottom:10px;'>Error fetching pixel data</div>
            <div style='font-size:12px;color:#666;'>${err.message}</div>
          </div>`
        );
      }
    },
  });

  useEffect(() => {
    const id = "lulc-popup-style";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      .lulc-popup .leaflet-popup-content-wrapper {
        border-radius:12px!important;box-shadow:0 8px 32px rgba(0,0,0,.18)!important;
        padding:0!important;border:1px solid #e7e5e4;
      }
      .lulc-popup .leaflet-popup-content { margin:14px 16px!important; }
      .lulc-popup .leaflet-popup-tip-container { margin-top:-1px; }
      @keyframes spin { to { transform:rotate(360deg); } }
    `;
    document.head.appendChild(s);
  }, []);

  return null;
}

/* ─── RasterManager ──────────────────────────────────────────── */
function RasterManager({ layerType, selectedYear, rasters, modelVariant, rasterVisible = true, rasterOpacity = 90 }) {
  const map = useMap();
  const tileLayerRef = useRef(null);

  useEffect(() => {
    if (tileLayerRef.current) { map.removeLayer(tileLayerRef.current); tileLayerRef.current = null; }

    if (!rasterVisible) return;

    const raster = findRaster(rasters, layerType, selectedYear, modelVariant);
    if (!raster?.resolvedUrl) {
      console.warn('[RasterManager] No raster found for year:', selectedYear);
      return;
    }
    tileLayerRef.current = L.tileLayer(raster.resolvedUrl, {
      opacity: rasterOpacity / 100,
      pane: 'tilePane',
    }).addTo(map);

    return () => { if (tileLayerRef.current) { map.removeLayer(tileLayerRef.current); tileLayerRef.current = null; } };
  }, [layerType, selectedYear, rasters, modelVariant, rasterVisible, rasterOpacity, map]);

  return null;
}

/* ─── BoundaryManager ────────────────────────────────────────── */
function BoundaryManager({ boundaries, rivers, showBoundary, showHydrology }) {
  const map = useMap();
  const boundaryLayerRef = useRef(null);
  const hydrologyLayerRef = useRef(null);

  useEffect(() => {
    if (boundaryLayerRef.current) { map.removeLayer(boundaryLayerRef.current); boundaryLayerRef.current = null; }
    if (showBoundary && boundaries?.features) {
      boundaryLayerRef.current = L.geoJSON(boundaries, {
        style: { color: "#ff4757", weight: 2.5, opacity: 1, fillOpacity: 0, dashArray: '6,4', pane: 'overlayPane' },
      }).addTo(map);
    }
    return () => { if (boundaryLayerRef.current) { map.removeLayer(boundaryLayerRef.current); boundaryLayerRef.current = null; } };
  }, [map, boundaries, showBoundary]);

  useEffect(() => {
    if (hydrologyLayerRef.current) { map.removeLayer(hydrologyLayerRef.current); hydrologyLayerRef.current = null; }
    if (showHydrology && rivers?.features) {
      hydrologyLayerRef.current = L.geoJSON(rivers, {
        style: { color: "#0077be", weight: 1.5, opacity: 0.8, pane: 'overlayPane' },
      }).addTo(map);
    }
    return () => { if (hydrologyLayerRef.current) { map.removeLayer(hydrologyLayerRef.current); hydrologyLayerRef.current = null; } };
  }, [map, rivers, showHydrology]);

  return null;
}

/* ─── BasemapToggle ──────────────────────────────────────────── */
/* Small floating pill with two buttons to switch between the street
   basemap and satellite imagery. Positioned bottom-right — its own
   clear corner, away from the year badge (top-left), the Leaflet
   zoom control (bottom-left), and the Legend (top-right). */
function BasemapToggle({ basemap, onChange }) {
  return (
    <div style={{
      position: "absolute", bottom: "34px", right: "16px", zIndex: 1000,
      display: "flex", gap: "4px",
      background: "rgba(28,25,23,.78)",
      padding: "4px", borderRadius: "99px",
      backdropFilter: "blur(6px)",
      border: "1px solid rgba(255,255,255,.15)",
    }}>
      {Object.entries(BASEMAPS).map(([key, { label }]) => {
        const active = basemap === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{
              padding: "5px 12px",
              borderRadius: "99px",
              border: "none",
              background: active ? "#fff" : "transparent",
              color: active ? "#1c1917" : "#fff",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: ".03em",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── MapView ────────────────────────────────────────────────── */
export default function MapView({
  layerType,
  modelVariant  = "cnn",
  selectedYear  = "2025",
  compareMode   = false,
  showBoundary  = true,
  showHydrology = true,
  accuracy      = null,
  rasterVisible = true,
  rasterOpacity = 90,
}) {
  const [boundaries, setBoundaries] = useState(null);
  const [rivers,     setRivers]     = useState(null);
  const [rasters,    setRasters]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [dragging,   setDragging]   = useState(false);
  const [basemap,    setBasemap]    = useState("streets");
  const containerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetchRasters().catch(() => null),
    ]).then(([rasRes]) => {
      if (rasRes?.data?.length) {
        setRasters(rasRes.data);
      } else {
        console.warn("[MapView] fetchRasters returned empty:", rasRes);
      }
    }).finally(() => setLoading(false));

    fetch(`http://localhost:8000/api/vectors/`)
      .then(r => r.json())
      .then(vectors => {
        const boundary = vectors.find(v => v.name.toLowerCase().includes('boundar'));
        const hydrology = vectors.find(v => v.name.toLowerCase().includes('hydro'));
        console.log('boundary match:', boundary?.name, boundary?.id);
        console.log('hydrology match:', hydrology?.name, hydrology?.id);
        if (boundary) {
          fetch(`http://localhost:8000/geojson/${boundary.id}/`)
            .then(r => r.json())
            .then(data => { if (data) setBoundaries(data); })
            .catch(err => console.error('[MapView] Boundary error:', err));
        }
        if (hydrology) {
          fetch(`http://localhost:8000/geojson/${hydrology.id}/`)
            .then(r => r.json())
            .then(data => { if (data) setRivers(data); })
            .catch(err => console.error('[MapView] Hydrology error:', err));
        }
      })
      .catch(err => console.error('[MapView] Vectors fetch error:', err));
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging || !containerRef.current) return;
      const rect    = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("touchmove",  onMove, { passive: true });
    window.addEventListener("touchend",   onUp);
    return () => {
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseup",    onUp);
      window.removeEventListener("touchmove",  onMove);
      window.removeEventListener("touchend",   onUp);
    };
  }, [dragging]);

  useEffect(() => {
    const id = "zoom-control-offset-style";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      .leaflet-bottom.leaflet-left {
        margin-bottom: 26px !important;
        margin-left: 12px !important;
      }
    `;
    document.head.appendChild(s);
  }, []);

  const activeBasemap = BASEMAPS[basemap];

  return (
    <div
      id="map-container"
      ref={containerRef}
      style={{ position: "relative", userSelect: dragging ? "none" : "auto" }}
    >
      {!compareMode ? (
        <>
          <div style={{
            position: "absolute", top: "14px", left: "16px", zIndex: 1000,
            background: "rgba(28,25,23,.78)", color: "#fff",
            padding: "5px 14px", borderRadius: "99px",
            fontSize: ".8rem", fontWeight: 700, letterSpacing: ".05em",
            pointerEvents: "none", backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,.15)",
          }}>
            {selectedYear}
          </div>

          <BasemapToggle basemap={basemap} onChange={setBasemap} />

          <MapContainer
            center={[36.45, 10.73]}
            zoom={9}
            style={{ height: "560px", width: "100%", display: "block" }}
            scrollWheelZoom
            zoomControl={false}
          >
            <ZoomControl position="bottomleft" />
            <TileLayer
              key={basemap}
              url={activeBasemap.url}
              attribution={activeBasemap.attribution}
            />
            {rasters.length > 0 && (
              <RasterManager
                layerType={layerType}
                selectedYear={selectedYear}
                rasters={rasters}
                modelVariant={modelVariant}
                rasterVisible={rasterVisible}
                rasterOpacity={rasterOpacity}
              />
            )}
            <BoundaryManager
              boundaries={boundaries}
              rivers={rivers}
              showBoundary={showBoundary}
              showHydrology={showHydrology}
            />
            <ClickHandler
              layerType={layerType}
              selectedYear={selectedYear}
              rasters={rasters}
              modelVariant={modelVariant}
              accuracy={accuracy}
            />
            <NDVICursorDisplay
              layerType={layerType}
              selectedYear={selectedYear}
              rasters={rasters}
              modelVariant={modelVariant}
              accuracy={accuracy}
            />
          </MapContainer>
        </>
      ) : (
        <CompareView
          layerType={layerType}
          modelVariant={modelVariant}
          selectedYear={selectedYear}
          rasters={rasters}
          isDragging={dragging}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
        />
      )}

      {loading && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          zIndex: 2000, background: "var(--color-surface)",
          borderRadius: "var(--radius-md)", padding: "12px 24px",
          boxShadow: "var(--shadow-lg)",
          display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", fontWeight: 600,
        }}>
          <div style={{
            width: 20, height: 20,
            border: "2.5px solid var(--color-border-light)",
            borderTop: "2.5px solid var(--color-primary)",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }} />
          Loading layers…
        </div>
      )}
    </div>
  );
}