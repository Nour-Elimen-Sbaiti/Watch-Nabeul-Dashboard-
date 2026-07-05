#!/usr/bin/env python3
"""
Check database and setup rasters if needed
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'envproject.settings')

try:
    django.setup()
except Exception as e:
    print(f"Error setting up Django: {e}")
    print("\nTry activating virtual environment first:")
    print("  env\\Scripts\\activate")
    print("Then install requirements:")
    print("  pip install -r requirements.txt")
    sys.exit(1)

from rasters.models import RasterLayer
from django.core.files import File
import glob

def check_database():
    """Check what's in the database"""
    print("=" * 60)
    print("Checking Database")
    print("=" * 60)
    
    # Count rasters
    raster_count = RasterLayer.objects.count()
    print(f"Raster layers in database: {raster_count}")
    
    if raster_count > 0:
        print("\nExisting rasters:")
        for raster in RasterLayer.objects.all():
            print(f"  - ID: {raster.id}, Name: {raster.name}")
            print(f"    File: {raster.file}")
            print(f"    Bounds: [{raster.min_lat}, {raster.min_lon}] to [{raster.max_lat}, {raster.max_lon}]")
            print()
    else:
        print("\nNo rasters found in database!")
        print("\nTo add rasters manually:")
        print("1. Go to http://127.0.0.1:8000/admin")
        print("2. Login with admin credentials")
        print("3. Add RasterLayer objects")
        print("4. Or run: python manage.py shell and create them programmatically")
    
    return raster_count

def check_media_files():
    """Check what raster files exist in media folder"""
    print("\n" + "=" * 60)
    print("Checking Media Files")
    print("=" * 60)
    
    media_dir = os.path.join(os.path.dirname(__file__), 'media', 'rasters')
    tif_files = glob.glob(os.path.join(media_dir, '*.tif'))
    
    print(f"Found {len(tif_files)} .tif files in media/rasters/")
    
    if tif_files:
        print("\nAvailable raster files:")
        for tif in sorted(tif_files):
            filename = os.path.basename(tif)
            size_mb = os.path.getsize(tif) / (1024 * 1024)
            print(f"  - {filename} ({size_mb:.1f} MB)")
    
    return tif_files

def create_sample_raster():
    """Create a sample raster if database is empty"""
    from rasters.models import RasterLayer
    
    if RasterLayer.objects.count() == 0:
        print("\n" + "=" * 60)
        print("Creating Sample Raster")
        print("=" * 60)
        
        # Find a .tif file
        media_dir = os.path.join(os.path.dirname(__file__), 'media', 'rasters')
        tif_files = glob.glob(os.path.join(media_dir, '*.tif'))
        
        if tif_files:
            sample_file = tif_files[0]
            filename = os.path.basename(sample_file)
            
            print(f"Creating raster from: {filename}")
            
            # Create raster object
            raster = RasterLayer(
                name=f"Sample - {filename}",
                description="Automatically created sample raster"
            )
            
            # Save with file
            with open(sample_file, 'rb') as f:
                raster.file.save(filename, File(f))
            
            # Set approximate bounds for Nabeul, Tunisia
            raster.min_lat = 36.0
            raster.min_lon = 10.0
            raster.max_lat = 37.0
            raster.max_lon = 11.0
            raster.save()
            
            print(f"Created raster: {raster.name} (ID: {raster.id})")
            print("Note: You may need to set proper bounds in admin panel")
        else:
            print("No .tif files found to create sample raster")

def main():
    print("Database and Media Check")
    print("=" * 60)
    
    try:
        # Check database
        raster_count = check_database()
        
        # Check media files
        tif_files = check_media_files()
        
        # Create sample if needed
        if raster_count == 0 and tif_files:
            create_sample_raster()
        
        print("\n" + "=" * 60)
        print("Next Steps")
        print("=" * 60)
        
        if raster_count == 0:
            print("1. Run Django server: python manage.py runserver")
            print("2. Go to http://127.0.0.1:8000/admin")
            print("3. Add RasterLayer objects with proper bounds")
            print("4. Or run this script again after adding rasters")
        else:
            print("1. Start Django server: python manage.py runserver")
            print("2. Test API: http://127.0.0.1:8000/api/rasters/")
            print("3. Test pixel info: http://127.0.0.1:8000/api/rasters/1/pixel_info/?lat=36.75&lon=10.73")
            print("4. Start frontend: cd ../front_test && npm run dev")
        
    except Exception as e:
        print(f"\nError: {e}")
        print("\nMake sure:")
        print("1. Virtual environment is activated")
        print("2. Requirements are installed: pip install -r requirements.txt")
        print("3. Database is migrated: python manage.py migrate")

if __name__ == "__main__":
    main()