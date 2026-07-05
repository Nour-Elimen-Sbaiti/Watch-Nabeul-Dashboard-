# Pixel Info Troubleshooting Guide

## Most Common Issues & Solutions

### Issue 1: "Nothing happens when I click on the map"
**Check these in browser console (F12):**

1. **Is the map loaded?**
   - Check if you see the map
   - Check console for Leaflet errors

2. **Is a raster layer selected?**
   - Select a layer from the sidebar
   - Check console: `"Setting up click handler for raster:"`

3. **Debug logging:**
   - Open browser console (F12)
   - Click on map
   - You should see:
     ```
     Map clicked at: {lat: ..., lng: ...}
     Active raster: {id: ..., name: ...}
     Fetching pixel info for raster X at lat, lng
     ```

### Issue 2: "Error fetching pixel data"
**Check backend:**

1. **Is Django running?**
   ```bash
   # Check if server is running
   curl http://127.0.0.1:8000/api/rasters/
   ```
   Should return JSON, not "connection refused"

2. **Are there rasters in database?**
   ```bash
   # Check database
   python manage.py shell
   >>> from rasters.models import RasterLayer
   >>> RasterLayer.objects.count()
   >>> for r in RasterLayer.objects.all(): print(r.id, r.name)
   ```

3. **Test API directly:**
   ```
   http://127.0.0.1:8000/api/rasters/1/pixel_info/?lat=36.75&lon=10.73
   ```

### Issue 3: "Raster file not found" error
**Check media files:**

1. **Do raster files exist?**
   ```bash
   # Check media folder
   dir backend\media\rasters
   ```

2. **Is the file path correct in database?**
   - Go to http://127.0.0.1:8000/admin
   - Check RasterLayer objects
   - File field should point to existing file

### Issue 4: Virtual Environment Problems
**Windows specific:**

1. **Activate virtual environment:**
   ```bash
   cd backend
   env\Scripts\activate
   ```

2. **Install requirements:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Check Django:**
   ```bash
   python -c "import django; print(django.get_version())"
   ```

### Quick Fix Script
Run `FIX_PIXEL_INFO.bat` - it will:
1. Check virtual environment
2. Check Django installation
3. Check database
4. Start backend and frontend

## Step-by-Step Debugging

### Step 1: Check Frontend
1. Open http://localhost:5173
2. Open browser console (F12)
3. Select a raster layer
4. Click on map
5. Check console messages

### Step 2: Check Backend API
1. Open http://127.0.0.1:8000/api/rasters/
2. Should show list of rasters
3. Note the ID of a raster

### Step 3: Test Pixel API Directly
```
http://127.0.0.1:8000/api/rasters/1/pixel_info/?lat=36.75&lon=10.73
```
Replace `1` with actual raster ID

### Step 4: Check Network Tab
1. In browser console, go to "Network" tab
2. Click on map
3. Look for request to `/api/rasters/{id}/pixel_info/`
4. Check response status and content

## Common Error Messages & Fixes

### "Cannot reach Django backend"
- Start Django: `python manage.py runserver`
- Check port 8000 is free

### "No rasters in database"
- Add rasters via admin panel
- Or run: `python manage.py createsuperuser` then add via web interface

### "ModuleNotFoundError: No module named 'django'"
- Virtual environment not activated
- Requirements not installed

### CORS errors
- Check `settings.py` has CORS configured
- Should have `CORS_ALLOW_ALL_ORIGINS = True`

## If All Else Fails

1. **Reset and start fresh:**
   ```bash
   # Backend
   cd backend
   env\Scripts\activate
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   
   # Frontend (new terminal)
   cd front_test
   npm run dev
   ```

2. **Add test raster via admin:**
   - Go to http://127.0.0.1:8000/admin
   - Login with superuser credentials
   - Add RasterLayer
   - Upload a .tif file from `data/rasters/`
   - Set bounds: min_lat=36.0, max_lat=37.0, min_lon=10.0, max_lon=11.0

3. **Test with coordinates in Nabeul area:**
   - lat: 36.75
   - lon: 10.73
   - These should be within your raster bounds