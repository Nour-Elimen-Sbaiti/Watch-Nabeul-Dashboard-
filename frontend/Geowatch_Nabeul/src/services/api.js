import axios from "axios";

const BASE = "http://localhost:8000/api";

const api = axios.create({ baseURL: BASE });

// ── Stats endpoints ────────────────────────────────────────────
// Each returns an array of analysis results filtered by type.
// Django name examples from admin:
//   "Accuracy Assessment RF (accuracy_assessment)"
//   "Accuracy Assessment SVM (accuracy_assessment)"
//   "Accuracy Assessment CNN (accuracy_assessment)"
//   "Overview Statistics (overview_statistics)"
//   "Change Detection 2020-2025 (change_detection)"
//   "Transition Matrix (transition_matrix)"

export const fetchStats = () =>
  api.get("/stats/by_type/?type=overview_statistics");

// Fetch accuracy assessment data grouped by classifier
// Returns all classifiers (CNN, SVM, Random Forest) organized by classifier and year
export const fetchAccuracyByClassifier = () =>
  api.get("/accuracy/summary/");

// Pass model so MapPage can fetch accuracy for whichever model is active.
// Falls back to all accuracy records if no model is given.
export const fetchAccuracy = (model = null) => {
  const params = model ? `?type=accuracy_assessment&model=${model}` : "?type=accuracy_assessment";
  return api.get(`/stats/by_type/${params}`);
};

export const fetchChangeStats = () =>
  api.get("/stats/by_type/?type=change_detection");

export const fetchTransitionMatrix = () =>
  api.get("/stats/by_type/?type=transition_matrix");

// ── Vector endpoints ───────────────────────────────────────────
// Two separate calls with a type filter so MapView doesn't have
// to guess which record is the boundary vs hydrology.
// Adjust the param name/value to match your Django VectorLayer model field.
export const fetchBoundaries = () =>
  api.get("/vectors/").then(res => ({
    ...res,
    data: res.data.filter(v => v.name.toLowerCase().includes("boundar"))
  }));

export const fetchHydrology = () =>
  api.get("/vectors/").then(res => ({
    ...res,
    data: res.data.filter(v => v.name.toLowerCase().includes("hydro"))
  }));
// ── Raster endpoint ────────────────────────────────────────────
// Returns all 8 raster records. Filtering by type/year/model is
// done client-side in RasterManager using the `name` field since
// Django names follow "LULC Nabeul 2025 CNN" / "NDVI 2025".
export const fetchRasters = () => api.get("/rasters/");

// ── Pixel info ─────────────────────────────────────────────────
// Uses plain fetch to avoid axios CORS preflight issues.
export const fetchPixelInfo = (rasterId, lat, lon) =>
  fetch(
    `http://localhost:8000/api/rasters/${rasterId}/pixel_info/?lat=${lat}&lon=${lon}`
  ).then((r) => r.json());

export default api;