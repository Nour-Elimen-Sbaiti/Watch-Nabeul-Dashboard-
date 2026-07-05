# Geowatch Nabeul

A web-based LULC (Land Use / Land Cover) change detection and statistics
dashboard for Nabeul Governorate, Tunisia (2020–2025), built with Django and
React. Land cover was classified from Sentinel-2 imagery using three models:
SVM and Random Forest (Google Earth Engine) and a CNN (PyTorch).

**End-of-year project — 1st year Engineering, Geospatial Informatics**
**MSE — École Nationale des Ingénieurs de la Manouba**

- **Prepared by:** Nour Elimen Sbaiti & Zayneb Ben Rajab
- **Supervised by:** Mr. Louay Rabah

## Features

- Interactive map (React + Leaflet) with LULC classification, NDVI, and
  change-detection layers
- Boundary and hydrology overlays
- Per-pixel classification / NDVI inspection on click
- Statistics dashboard: accuracy assessment, transition matrix, change stats
- Split-view comparison (2020 vs 2025)

## Tech Stack

- **Frontend:** React, Leaflet / react-leaflet, Axios, Vite
- **Backend:** Django, Django REST Framework
- **Classification methodology:**
  - **SVM (Support Vector Machine)** — trained and run on Google Earth Engine
  - **Random Forest** — trained and run on Google Earth Engine
  - **CNN (Convolutional Neural Network)** — built and trained with PyTorch
  - Source imagery: **Sentinel-2** (2020 and 2025)
- **Data:** Sentinel-2 imagery, HydroRIVERS (hydrology), FAO GAUL (boundary)

## Project Structure

```
CAP2/
├── backend/     → Django REST API (rasters, vectors, stats, pixel info, tiles)
├── frontend/
│   └── Geowatch_Nabeul/   → React + Leaflet dashboard
├── scripts/     → Data prep / model training scripts (GEE, PyTorch CNN)
├── data/        → Raw input data (not included in this repo — see Data section)
├── docs/        → Setup notes and troubleshooting guides
├── run_dashboard.bat   → Convenience script to launch backend + frontend
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- Git

## Quick Start

1. Clone the repo
2. Follow the **Manual Setup** steps below (first time only)
3. After first-time setup, double-click `run_dashboard.bat` to start both
   backend and frontend together

## Manual Setup (first time)

### 1. Backend (Django)

```bash
cd backend
python -m venv env

# Activate the virtual environment:
# Windows PowerShell:
.\env\Scripts\Activate.ps1
# Windows CMD:
env\Scripts\activate
# macOS/Linux:
source env/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py load_accuracy_data
python manage.py createsuperuser   # see "Setting Up the Admin Account" below
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`.

### 2. Frontend (React)

Open a **second** terminal:

```bash
cd frontend/Geowatch_Nabeul
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` (or whatever port Vite reports).

## Setting Up the Admin Account

The Django admin panel (`/admin/`) lets you manage rasters, vectors, and
statistics data directly. You need to create an account the first time you
set up the project — there's no default login.

### Create a superuser

From the `backend` folder, with the virtual environment activated:

```bash
python manage.py createsuperuser
```

You'll be prompted for:

1. **Username** — anything you like, e.g. `admin`
2. **Email address** — optional, press Enter to skip
3. **Password** — type it and press Enter
   ⚠️ Nothing will appear on screen while typing — no dots, no characters.
   This is normal terminal behavior, not a bug.
4. **Password (again)** — retype the same password to confirm

If your password is short or simple, Django may ask:

```
This password is too common. Bypass password validation and create user anyway? [y/N]:
```

Type `y` and press Enter if this is just for local development.

You should then see:

```
Superuser created successfully.
```

### Log in to the admin panel

1. Make sure the backend is running: `python manage.py runserver`
2. Open: http://127.0.0.1:8000/admin/
3. Log in with the username and password you just created

From here you can:

- Add/remove/edit raster layers (`Rasters` → `Raster layers`)
- Add/remove/edit vector layers like boundary and hydrology (`Vectors` → `Vector layers`)
- View and manage statistics records (`Stats` → `Analysis results`, `Accuracy assessments`)

### Forgot your password / need a new account later

Create additional superusers anytime with `python manage.py createsuperuser`,
or reset an existing password with:

```bash
python manage.py changepassword <username>
```

## Access URLs

- **Backend API:** http://127.0.0.1:8000
- **Frontend Dashboard:** http://localhost:5173
- **Admin Panel:** http://127.0.0.1:8000/admin

## API Endpoints

- `GET /api/accuracy/` — All accuracy data (SVM, Random Forest, CNN)
- `GET /api/accuracy/by_classifier/?classifier=SVM` — Filter by classifier
- `GET /api/accuracy/by_year/?year=2020` — Filter by year
- `GET /api/accuracy/summary/` — Summary grouped by classifier and year
- `GET /api/rasters/` — All raster layers
- `GET /api/vectors/` — All vector layers (boundary, hydrology)
- `GET /geojson/<id>/` — GeoJSON for a specific vector layer
- `GET /tiles/<id>/<z>/<x>/<y>.png` — Map tile for a specific raster layer

## Database

The backend uses **SQLite** by default (Django's built-in database), stored
locally at `backend/db.sqlite3`. This file is excluded from the repo via
`.gitignore` — each person who clones the project gets their own empty
database, built from migrations, and fills it with their own data via
Django admin.

### Main models

| Model | App | Purpose |
|---|---|---|
| `RasterLayer` | `rasters` | Stores metadata for each raster (LULC classification, NDVI) — name, description, bounding box (`min_lon`, `min_lat`, `max_lon`, `max_lat`), and a reference to the actual `.tif` file. Tiles are generated on the fly from these files (see `rasters/tiles.py`). |
| `VectorLayer` | `vectors` | Stores metadata for vector overlays — the Nabeul administrative boundary and the hydrology (river) network — and a reference to the source `.geojson` file. Served via `/geojson/<id>/`. |
| `AnalysisResult` | `stats` | Stores computed statistics results (overview statistics, change detection, transition matrix), tagged by `result_type` so the frontend can request the right kind via `/api/stats/by_type/`. |
| `AccuracyAssessment` | `stats` | Stores per-classifier, per-year accuracy metrics (overall accuracy, kappa) for CNN, SVM, and Random Forest, exposed via `/api/accuracy/`. |

### How data gets in

- **Rasters and vectors** are uploaded through the Django admin
  (`/admin/` → Rasters / Vectors → Add), where you attach the actual
  `.tif` / `.geojson` file to a new record.
- **Accuracy and statistics data** are loaded from JSON files in
  `data/stats/` using the management command:
  ```bash
  python manage.py load_accuracy_data
  ```

### Setting up the database on a fresh clone

```bash
cd backend
python manage.py migrate              # creates db.sqlite3 and all tables
python manage.py createsuperuser      # so you can log into /admin/
python manage.py load_accuracy_data   # seeds accuracy/statistics data
```

Then upload your raster and vector files manually via `/admin/` (see
**Data** section above for what's needed).

### Switching to PostgreSQL (optional)

For production or larger datasets, you can swap SQLite for PostgreSQL by
updating `DATABASES` in `backend/envproject/settings.py` and installing
`psycopg2`. This isn't required for local development or grading — SQLite
is sufficient for the scope of this project.

## Data Sources

Accuracy data is loaded from:

- `data/stats/accuracy_SVM.json`
- `data/stats/accuracy_RF.json`
- `data/stats/accuracy_CNN.json`

Vector layers (boundary, hydrology) and raster outputs (LULC/NDVI tiles) are
not included in this repo due to file size limits on GitHub. To run the
dashboard with real data, you'll need:

- **Nabeul Boundary** — FAO GAUL administrative boundary for Nabeul Governorate
- **Nabeul Hydrology** — HydroRIVERS river network data, clipped to Nabeul
- **LULC/NDVI rasters** — generated via the scripts in `/scripts` from Sentinel-2 imagery

Upload these via Django admin (`/admin/`) after creating your superuser account.

## Dashboard Features

The statistics dashboard is organized into tabs, each focused on a
different way of exploring the LULC data:

- **Overview** — headline metrics at a glance: total area, built-up cover,
  forest cover, and classifier accuracy (with kappa) for the selected model/year
- **Time Series** — track how each land use class changes across 2020–2025
- **Scenario Planner** — an interactive "what-if" tool to simulate land-use
  changes and estimate their environmental impact. Choose from ready-made
  templates or define a custom scenario:
  - **Reforestation Program** — convert agricultural land to forest
  - **Urban Growth** — project urban expansion from agricultural land
  - **Green City Initiative** — add urban green space, reduce built-up density
  - **Agricultural Intensification** — convert forest to high-yield agriculture
  - **Wetland Restoration** — restore wetlands from agricultural land
  - **Custom Scenario** — define your own land-use change parameters
- **Accuracy** — per-classifier accuracy metrics (SVM, Random Forest, CNN),
  including overall accuracy and kappa coefficient
- **Confusion Matrix** — per-class classification performance breakdown for
  the selected model
- **Landscape Metrics** — spatial pattern statistics describing the LULC
  classification (e.g. patch structure, fragmentation)
- **Transition Matrix** — class-to-class change between 2020 and 2025
  (e.g. how much agricultural land became built-up)
- **Environmental** — environmental indicators derived from the LULC data
- **Carbon Storage** — estimated carbon storage implications of land cover
  change
- **Biodiversity** — biodiversity-related indicators tied to land cover change
- **Urban Heat** — urban heat implications of built-up area expansion
- **Soil Erosion** — soil erosion risk indicators tied to land cover change

Beyond the statistics tabs, the dashboard also includes:

1. **Compare Mode** — Compare different land use layers side by side, with a
   draggable split-view slider (2020 vs 2025)
2. **Interactive Map** — LULC, NDVI, boundary, and hydrology layers
3. **Real Pixel Info** — Click anywhere on the map for classification/NDVI values
4. **Comparison Popups** — In compare mode, see side-by-side pixel data
5. **Auto-Generated Insights** — plain-language summaries flagging notable
   trends (e.g. urban expansion, agricultural loss, reforestation) computed
   directly from the underlying change statistics
6. **Export & Share** — Statistics and map outputs can be exported as:
   - **CSV** — for spreadsheet analysis
   - **JSON** — for programmatic / downstream use
   - **Map image** — a snapshot of the current map view
   - **Printable report** — a formatted summary suitable for presentations

## Why This Matters: Decision Support

Land Use / Land Cover change is a key indicator for planning and
environmental management — tracking urban expansion, agricultural loss,
and vegetation trends helps identify pressures on natural resources before
they become irreversible. By turning raw classification outputs into
readable statistics, auto-generated insights, and exportable reports, this
dashboard is designed to make LULC change legible to non-technical
stakeholders — municipal planners, environmental agencies, or researchers —
who need a quick, evidence-based picture of how Nabeul Governorate's land
cover has evolved between 2020 and 2025, without having to interpret raw
GIS layers themselves.

## Limitations & Future Work

This dashboard currently reflects **only the data that has been generated
and uploaded for this project** — Sentinel-2 imagery for 2020 and 2025,
classified with three models (SVM, Random Forest, CNN) for Nabeul
Governorate specifically. It is a proof of concept, not a live monitoring
system, and should be read with that scope in mind.

It can be extended and made more robust by:

- Adding more time steps (e.g. yearly imagery instead of just 2020/2025)
  to track trends more precisely
- Expanding coverage beyond Nabeul Governorate to neighboring regions
- Incorporating higher-resolution imagery or additional spectral indices
  beyond NDVI (e.g. NDBI for built-up areas, NDWI for water)
- Validating classifications against more extensive ground-truth data
- Automating periodic re-classification as new Sentinel-2 imagery becomes
  available, rather than relying on manually generated snapshots

## Troubleshooting

- **Data doesn't load:** Run `python manage.py load_accuracy_data`
- **API not responding:** Check the Django server is running on port 8000
- **Frontend not loading:** Check the React dev server is running on port 5173
- **Tiles/rasters not rendering (`CRSError` / "Cannot find proj.db"):** Make
  sure `rasterio` is installed inside the venv (`pip install rasterio`) — the
  project computes `PROJ_LIB` / `GDAL_DATA` automatically from the installed
  package, so this should work out of the box after
  `pip install -r requirements.txt`. If it still fails, confirm no leftover
  `PROJ_LIB` / `GDAL_DATA` environment variables are set on your system
  (Windows: Environment Variables settings) pointing to a stale/incorrect path.
- **Duplicate raster/vector layers in the dropdown:** Some records may have
  been uploaded twice under slightly different names. Remove duplicates via
  `/admin/` → Raster layers / Vector layers.
- **Boundary/Hydrology overlay shows the wrong layer, or the map looks
  outdated after a code change:** Clear the Vite cache and rebuild:
  ```bash
  cd frontend/Geowatch_Nabeul
  rm -rf node_modules/.vite dist
  npm run dev
  ```
  Then hard-refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`).
- **`ModuleNotFoundError` for any Python package:** Make sure the virtual
  environment is activated (your terminal prompt should show `(env)`), then
  run `pip install -r requirements.txt` again.

## Authors & Acknowledgments

This project was developed as an end-of-year project for 1st year Engineering
in Geospatial Informatics at **MSE (École Nationale des Ingénieurs de la
Manouba)**.

- **Nour Elimen Sbaiti**
- **Zayneb Ben Rajab**

**Supervised by:** Mr. Louay Rabah

## License

[Choose a license, e.g. MIT]