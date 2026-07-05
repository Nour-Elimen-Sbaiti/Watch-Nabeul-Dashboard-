// Nabeul governorate approximate bounds
const NABEUL_BOUNDS = [[35.80, 9.80], [37.20, 11.80]];

// Label config only — tile URLs come from the Django /api/rasters/ response.
// Keys must match what findRaster() produces when reading raster names.
export const LAYER_CONFIG = {
  lulc_2020_cnn: { bounds: NABEUL_BOUNDS, label: "LULC 2020 CNN" },
  lulc_2025_cnn: { bounds: NABEUL_BOUNDS, label: "LULC 2025 CNN" },
  lulc_2020_rf:  { bounds: NABEUL_BOUNDS, label: "LULC 2020 RF"  },
  lulc_2025_rf:  { bounds: NABEUL_BOUNDS, label: "LULC 2025 RF"  },
  lulc_2020_svm: { bounds: NABEUL_BOUNDS, label: "LULC 2020 SVM" },
  lulc_2025_svm: { bounds: NABEUL_BOUNDS, label: "LULC 2025 SVM" },
  ndvi_2020:     { bounds: NABEUL_BOUNDS, label: "NDVI 2020"     },
  ndvi_2025:     { bounds: NABEUL_BOUNDS, label: "NDVI 2025"     },
};

// Land-use classes — keys must match what Django returns in stats records.
export const LAND_USE_CLASSES = [
  { key: "Water",             color: "#0891b2", description: "Water bodies"      },
  { key: "Built_up",          color: "#dc2626", description: "Urban areas"        },
  { key: "Forest",            color: "#15803d", description: "Forest cover"       },
  { key: "Agricultural_area", color: "#65a30d", description: "Agricultural land"  },
];

export const YEARS = ["2020", "2025"];

// Model variants available in Django raster names
export const MODEL_VARIANTS = ["cnn", "rf", "svm"];