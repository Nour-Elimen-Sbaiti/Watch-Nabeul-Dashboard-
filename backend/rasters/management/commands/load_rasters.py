import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings
from rasters.models import RasterLayer


class Command(BaseCommand):
    help = 'Load raster files from data/rasters/ into the database'

    def handle(self, *args, **options):
        """Load raster files from the data directory"""
        data_dir = os.path.join(settings.BASE_DIR.parent, 'data', 'rasters')
        media_rasters_dir = os.path.join(settings.MEDIA_ROOT, 'rasters')
        
        if not os.path.exists(data_dir):
            self.stdout.write(self.style.ERROR(f'Data directory not found: {data_dir}'))
            return
        
        # Create media/rasters directory if it doesn't exist
        os.makedirs(media_rasters_dir, exist_ok=True)
        
        # Define rasters to load with proper naming
        rasters_to_load = [
            # LULC files (CNN is default, no suffix)
            ('lulc_2020.tif', 'LULC 2020 CNN'),
            ('lulc_2025.tif', 'LULC 2025 CNN'),
            ('lulc_2020_rf.tif', 'LULC 2020 RF'),
            ('lulc_2025_rf.tif', 'LULC 2025 RF'),
            ('lulc_2020_svm.tif', 'LULC 2020 SVM'),
            ('lulc_2025_svm.tif', 'LULC 2025 SVM'),
            # NDVI files
            ('ndvi_2020.tif', 'NDVI 2020'),
            ('ndvi_2025.tif', 'NDVI 2025'),
        ]
        
        created_count = 0
        skipped_count = 0
        
        for filename, display_name in rasters_to_load:
            source_path = os.path.join(data_dir, filename)
            
            if not os.path.exists(source_path):
                self.stdout.write(self.style.WARNING(f'Source file not found: {filename}'))
                continue
            
            # Check if already in database
            if RasterLayer.objects.filter(name=display_name).exists():
                self.stdout.write(f'Skipping (already exists): {display_name}')
                skipped_count += 1
                continue
            
            # Copy file to media directory
            dest_filename = f'rasters/{filename}'
            dest_path = os.path.join(settings.MEDIA_ROOT, dest_filename)
            
            # Create directory if needed
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            
            try:
                shutil.copy2(source_path, dest_path)
                
                # Create database record
                raster = RasterLayer.objects.create(
                    name=display_name,
                    description=f'Raster layer: {display_name}',
                    file=dest_filename
                )
                
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created: {display_name}'))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error loading {filename}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'\nCompleted! Created: {created_count}, Skipped: {skipped_count}'
        ))
