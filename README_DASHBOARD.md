# Dashboard Setup Instructions

## Quick Start
1. Double-click `run_dashboard.bat` to start both backend and frontend
2. Or follow manual steps below

## Manual Setup

### 1. Start Django Backend
```bash
cd backend
env\Scripts\activate
python manage.py migrate
python manage.py load_accuracy_data
python manage.py runserver
```

### 2. Start React Frontend
```bash
cd frontend
npm run dev
```

## Access URLs
- **Backend API**: http://127.0.0.1:8000
- **Frontend Dashboard**: http://localhost:5173
- **Admin Panel**: http://127.0.0.1:8000/admin

## API Endpoints
- `GET /api/accuracy/` - All accuracy data (SVM, Random Forest, CNN)
- `GET /api/accuracy/by_classifier/?classifier=SVM` - Filter by classifier
- `GET /api/accuracy/by_year/?year=2020` - Filter by year
- `GET /api/accuracy/summary/` - Summary grouped by classifier and year

## Data Sources
Accuracy data is loaded from:
- `data/stats/accuracy_SVM.json`
- `data/stats/accuracy_RF.json` 
- `data/stats/accuracy_CNN.json`

## Dashboard Features
1. **Accuracy Tab**: Shows SVM, Random Forest, and CNN accuracy metrics
2. **Compare Mode**: Compare different land use layers
3. **Statistics Panel**: View change detection, overview stats, and transition matrix
4. **Interactive Map**: Visualize raster and vector data
5. **Real Pixel Info**: Click anywhere on map to get land use classification and pixel values
6. **Comparison Popups**: In compare mode, see side-by-side pixel data from both layers

## Troubleshooting
- If data doesn't load: Run `python manage.py load_accuracy_data`
- If API not responding: Check Django server is running
- If frontend not loading: Check React dev server is running