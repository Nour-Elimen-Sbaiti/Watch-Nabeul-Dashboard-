# Watch-Nabeul-Dashboard

Watch Nabeul is a dashboard we built to track how land use and land cover in Nabeul Governorate, Tunisia changed between 2020 and 2025. The backend is Django, the frontend is React + Leaflet, and the whole point of it is to take satellite classification outputs , which normally just sit around as raw GIS files and turn them into something you can actually click through and explore.

The classification is based on Sentinel-2 imagery, and we ran it through three different models so we could compare how they stack up against each other:

- **SVM** (Support Vector Machine), on Google Earth Engine
- **RF**, also on Google Earth Engine
- **A CNN**, which we built and trained from scratch in PyTorch

## Academic context

This started as an end-of-year project for 1st year Engineering in Geospatial Informatics at MSE (Manouba School of Engineering) affliated to the UMA (Unoversity of Manouba)

## What's actually in it

The centerpiece is an interactive Leaflet map with LULC classification, NDVI, boundary, and hydrology layers. You can toggle between Streets and Satellite basemaps, turn layers on/off manually, and adjust opacity per layer. Click anywhere on the map and it pulls back the actual pixel-level classification or NDVI value from the backend. There's also a Compare Mode — a draggable split slider so you can literally drag across the map between 2020 and 2025.

Past the map, there's a statistics dashboard split into tabs:

- **Overview** — the headline numbers for whichever model/year is selected: total area, built-up cover, forest cover, classifier accuracy, kappa
- **Time Series** — how each land use class shifted across 2020–2025
- **Scenario Planner** — a what-if tool for simulating changes (reforestation, urban growth, a green city initiative, agricultural intensification, wetland restoration, or something fully custom) and seeing the estimated impact
- **Accuracy** and **Confusion Matrix** — how each classifier actually performed
- **Landscape Metrics** — patch structure, fragmentation, that kind of spatial pattern stuff
- **Transition Matrix** — how much of each class turned into another between the two years
- **Environmental, Carbon Storage, Biodiversity, Urban Heat, Soil Erosion** — a handful of derived indicators tied back to the land cover change

It also writes its own plain-language insights (flagging things like "this area is urbanizing" or "this looks like reforestation" straight from the numbers), and everything can be exported — CSV, JSON, a map snapshot, or a printable report.

## Tech stack

- **Frontend:** React (Vite), Leaflet / react-leaflet, Axios
- **Backend:** Django, Django REST Framework, SQLite (default)
- **GIS / ML pipeline:** Sentinel-2 imagery, Google Earth Engine (SVM, Random Forest), PyTorch (CNN), Rasterio
- **Data:** Sentinel-2 imagery, HydroRIVERS (hydrology), FAO GAUL (boundary)

## Why LULC matters

LULC change is one of the better indicators for planning and environmental management — it's how you catch urban expansion, agricultural loss, or vegetation trends before they turn into bigger problems. The idea behind this dashboard is to make that kind of change legible to people who aren't going to open a GIS tool themselves — municipal planners, environmental agencies, researchers — by turning it into readable stats, plain-language insights, and reports they can export and hand off.

## Project structure

```
Capstone project/
├── backend/                # Django REST API
│   ├── envproject/          # Django project settings
│   ├── rasters/              # Raster layers, tile generation
│   ├── vectors/               # Vector layers (boundary, hydrology)
│   ├── stats/                  # Statistics & accuracy models
│   ├── media/                  # Uploaded raster/vector files, served to the frontend
│   ├── templates/
│   ├── env/
│   ├── db.sqlite3
│   ├── manage.py
│   ├── requirements.txt
│   └── setup_accuracy.sh       # Mac/Linux shortcut: runs migrate + load_accuracy_data in one go
│
├── frontend/
│   └── Geowatch_Nabeul/     # React + Leaflet dashboard
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── vite.config.js
│       ├── eslint.config.js
│       └── README.md           # Frontend-specific setup notes
│
├── data/                    # Source layers behind everything in backend/media
│   ├── cap_layers.qgz        # QGIS project tying the layers together
│   ├── vectors/                # .shp / .geojson source vectors
│   ├── rasters/                # .tif source rasters
│   └── stats/                   # Accuracy JSON files (tracked)
│
├── scripts/                 # GEE / PyTorch data prep & training scripts
├── .vscode/                  # Editor settings
├── run_dashboard.bat         # One-click launcher (backend + frontend)
├── LICENSE
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- Git

## Getting it running

**If you've already done the first-time setup**, just run:

```bash
run_dashboard.bat
```

That starts the Django backend (port 8000) and React frontend (port 5173) together.

**First time setup**, you'll need to do it manually.

### Backend (Django)

```bash
cd backend
python -m venv env

# Activate the venv:
# Windows PowerShell:
.\env\Scripts\Activate.ps1
# Windows CMD:
env\Scripts\activate
# macOS/Linux:
source env/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py load_accuracy_data   # optional — db.sqlite3 already ships with this data, but safe to re-run
python manage.py createsuperuser      # see "Admin account" below
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`.

> On Mac/Linux, `backend/setup_accuracy.sh` does the migrate + `load_accuracy_data` steps for you in one go, if you'd rather run that instead of typing both commands separately.

### Frontend (React)

Open a second terminal:

```bash
cd frontend/Geowatch_Nabeul
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` (or wherever Vite decides to put it).

## Admin account

The Django admin panel (`/admin/`) is where you manage rasters, vectors, and stats data. There's no login baked in — you create one yourself the first time:

```bash
python manage.py createsuperuser
```

It'll ask for:

1. **Username** — anything, `admin` works fine
2. **Email** — optional, just hit Enter to skip it
3. **Password** — type it and hit Enter. Nothing will show up on screen while you type, not even dots — that's just how terminals work, not a bug.
4. **Password again** — retype to confirm

If Django complains the password's too common, type `y` to override it (fine for local dev).

Then log in at `http://127.0.0.1:8000/admin/`. From there you can manage:

- **Raster layers** (`Rasters → Raster layers`)
- **Vector layers** (`Vectors → Vector layers`)
- **Statistics records** (`Stats → Analysis results`, `Accuracy assessments`)

Forgot your password, or want another account later:

```bash
python manage.py createsuperuser        # new account
python manage.py changepassword <username>  # reset an existing one
```

## URLs

- Backend API: http://127.0.0.1:8000
- Frontend dashboard: http://localhost:5173
- Admin panel: http://127.0.0.1:8000/admin

## API endpoints

- `GET /api/accuracy/` — all accuracy data (SVM, Random Forest, CNN)
- `GET /api/accuracy/by_classifier/?classifier=SVM` — filter by classifier
- `GET /api/accuracy/by_year/?year=2020` — filter by year
- `GET /api/accuracy/summary/` — summary grouped by classifier and year
- `GET /api/rasters/` — all raster layers
- `GET /api/vectors/` — all vector layers (boundary, hydrology)
- `GET /geojson/<id>/` — GeoJSON for a specific vector layer
- `GET /tiles/<id>/<z>/<x>/<y>.png` — map tile for a specific raster layer

## Database

This project uses **SQLite** (`backend/db.sqlite3`) by default. The file is committed to the repo already populated with the project's data, so cloning it gives you a working dashboard right away, with no separate seeding step. Normally you'd gitignore `db.sqlite3` in a production setup, but for this academic project we kept it in the repo for convenience.

| Model | App | Purpose |
|---|---|---|
| `RasterLayer` | `rasters` | LULC/NDVI raster metadata — name, bounding box, file reference. Tiles are generated on the fly (`rasters/tiles.py`). |
| `VectorLayer` | `vectors` | Boundary & hydrology metadata plus `.geojson` file reference, served via `/geojson/<id>/`. |
| `AnalysisResult` | `stats` | Overview stats, change detection, transition matrix — tagged by `result_type`. |
| `AccuracyAssessment` | `stats` | Per-classifier, per-year accuracy metrics (overall accuracy, kappa). |

How data actually gets in:
- Rasters & vectors → uploaded manually via `/admin/` (see Data Sources below)
- Accuracy/statistics → loaded automatically via `python manage.py load_accuracy_data`

If you ever want to swap SQLite for PostgreSQL, update `DATABASES` in `backend/envproject/settings.py` and install `psycopg2`. Not something you need for local dev or grading, just an option.

## Data sources

The pre-populated database and the raw raster/vector files (`backend/media/rasters/`, `backend/media/vectors/`) are included directly in the repo. Clone it and you should see layers on the map right away — no manual admin upload needed to get started.

The `data/` folder holds the source layers behind all of this: `cap_layers.qgz` is the QGIS project tying everything together (useful if you want to inspect or re-style anything outside the dashboard), with the actual `.tif` rasters, `.shp` shapefiles, and `.geojson` vectors split across `data/rasters/`, `data/vectors/`, and `data/stats/`. `backend/media/` is the subset of these that's actually registered in the database and served to the frontend — `data/` is more the working/source copy.

Where the data actually comes from:

- **Nabeul Boundary** (`.geojson`) — FAO GAUL administrative boundary
- **Nabeul Hydrology** (`.geojson`) — HydroRIVERS river network, clipped down to Nabeul
- **LULC/NDVI rasters** (`.tif`) — one per year/model (8 total: LULC × 3 models × 2 years, plus NDVI × 2 years), generated via the scripts in `/scripts`
- **Accuracy statistics** — `data/stats/accuracy_SVM.json`, `accuracy_RF.json`, `accuracy_CNN.json`, loaded via `load_accuracy_data` if you ever rebuild from scratch

You'd only need to touch Django admin if you're adding *new* data — a different year, a new model's output, replacing an existing raster. Just dropping a file into `backend/media/` won't do anything on its own, since Django reads from the database, not the filesystem — any new file needs a matching record created through `/admin/`.

**Adding new data (via `/admin/`, once you've got a superuser):**

- *Vector layers:* `Vectors → Vector layers → Add vector layer` → set a **Name** (e.g. `Nabeul Boundary`, `Nabeul Hydrology` — keep these consistent, since the frontend matches on them) and upload the file.
- *Raster layers:* `Rasters → Raster layers → Add raster layer` → set a **Name** (e.g. `LULC Nabeul 2025 CNN`, `NDVI 2020` — the frontend actually parses the year/model/type out of this name, see `findRaster()` in `MapView.jsx`), upload the file, and fill in the bounding box (`min_lon`, `min_lat`, `max_lon`, `max_lat`).

One thing to watch out for: registering the same raster twice under different names will make it show up as two separate layers in the frontend. If that happens, just delete the extra one from `/admin/`.



## Troubleshooting

- **Data doesn't load** → run `python manage.py load_accuracy_data`
- **API not responding** → make sure the Django server is actually running on port 8000
- **Frontend not loading** → make sure the React dev server is running on port 5173
- **Tiles/rasters won't render (`CRSError` / "Cannot find proj.db")** → make sure `rasterio` is installed in the venv (`pip install rasterio`); `PROJ_LIB`/`GDAL_DATA` get computed automatically from the installed package. If it's still broken, check for a leftover system/user `PROJ_LIB` or `GDAL_DATA` variable pointing somewhere stale (Windows: Environment Variables settings)
- **Duplicate raster/vector layers in the dropdown** → remove the duplicates via `/admin/` → Raster layers / Vector layers
- **Boundary/Hydrology showing the wrong layer, or the map looking stale after a code change** → clear the Vite cache and rebuild:
  ```bash
  cd frontend/Geowatch_Nabeul
  rm -rf node_modules/.vite dist
  npm run dev
  ```
  then hard-refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`)
- **`ModuleNotFoundError` for any Python package** → check the venv is actually activated (you should see `(env)` in your prompt), then run `pip install -r requirements.txt` again

## Limitations & where this could go next

This dashboard reflects only the data generated and processed for the scope of this project. It analyzes Sentinel-2 imagery acquired for 2020 and 2025 and focuses exclusively on Nabeul Governorate, Tunisia. As such, it should be considered a proof of concept demonstrating an end-to-end workflow for LULC change detection, visualization, and decision support, rather than a real-time operational monitoring system.
Possible future improvements include:

Integrating annual or seasonal imagery instead of only two time points to enable more detailed trend analysis.
Expanding the study area beyond Nabeul Governorate to cover additional regions or the whole of Tunisia.
Improving classification accuracy through larger datasets and more extensive ground-truth validation.
Evaluating additional machine learning and deep learning approaches, such as U-Net and Vision Transformers (ViTs), alongside SVM, Random Forest, and CNN.
Developing predictive land-use models to forecast future LULC changes based on historical trends.

## Authors & acknowledgments

- **Nour Elimen Sbaiti**
- **Zayneb Ben Rajab**

Supervised by **Mr. Louay Rabah** — MSE, Manouba School of Engineering
