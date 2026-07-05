from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
import rasterio
import os
from django.conf import settings
from .models import RasterLayer
from .serializers import RasterLayerSerializer

class RasterLayerViewSet(viewsets.ModelViewSet):
    queryset = RasterLayer.objects.all().order_by('-uploaded_at')
    serializer_class = RasterLayerSerializer

    @staticmethod
    def detect_raster_type(raster_name):
        """Detect if raster is LULC/classification or NDVI based on name"""
        name_lower = (raster_name or "").lower()
        if "ndvi" in name_lower:
            return "ndvi"
        elif "lulc" in name_lower or "classification" in name_lower or "change" in name_lower:
            return "classification"
        else:
            return "unknown"

    @action(detail=True, methods=['get'])
    def pixel_info(self, request, pk=None):
        """Get pixel information at specific coordinates"""
        try:
            raster_layer = self.get_object()
            
            # Validate and parse coordinates
            lat_str = request.query_params.get('lat')
            lon_str = request.query_params.get('lon')
            
            if not lat_str or not lon_str:
                return Response({'error': 'Missing lat or lon parameters'}, status=400)
            
            try:
                lat = float(lat_str)
                lon = float(lon_str)
            except ValueError:
                return Response({'error': 'Invalid lat/lon values. Must be numbers.'}, status=400)
            
            # Validate coordinate ranges
            if not (-90 <= lat <= 90):
                return Response({'error': 'Latitude must be between -90 and 90'}, status=400)
            if not (-180 <= lon <= 180):
                return Response({'error': 'Longitude must be between -180 and 180'}, status=400)
            
            # Get the raster file path
            raster_path = os.path.join(settings.MEDIA_ROOT, str(raster_layer.file))
            
            if not os.path.exists(raster_path):
                return Response({'error': 'Raster file not found'}, status=404)
            
            # Detect raster type
            raster_type = self.detect_raster_type(raster_layer.name)
            
            # Open raster and read pixel value
            with rasterio.open(raster_path) as src:
                # Convert lat/lon to pixel coordinates
                row, col = src.index(lon, lat)
                
                # Read pixel value
                window = rasterio.windows.Window(col, row, 1, 1)
                data = src.read(window=window)
                
                # Get band information
                band_count = src.count
                pixel_values = []
                
                for band_idx in range(band_count):
                    band_value = data[band_idx][0][0]
                    pixel_values.append({
                        'band': band_idx + 1,
                        'value': float(band_value) if band_value is not None else None,
                        'nodata': src.nodata is not None and band_value == src.nodata
                    })
                
                # Get raster metadata
                metadata = {
                    'crs': str(src.crs),
                    'transform': src.transform.to_gdal(),
                    'bounds': src.bounds,
                    'width': src.width,
                    'height': src.height,
                    'nodata': src.nodata,
                    'band_count': band_count,
                    'dtype': str(src.dtypes[0]) if src.dtypes else None
                }
                
                # 4-Class LULC Classification System
                # Maps all pixel values to 4 main categories:
                # 1. Built-up (Urban/Developed) - includes 255
                # 2. Agriculture (Cropland/Farmland) - includes 129
                # 3. Vegetation (Forest/Grassland/Shrubland/Wetlands) - includes 65
                # 4. Water (Water bodies) - includes 35
                
                # Class 1: Built-up / Urban (including 255)
                built_up_values = {1, 10, 21, 22, 23, 24, 255}
                # Class 2: Agriculture (including 129)
                agriculture_values = {2, 11, 12, 13, 20, 25, 40, 81, 82, 129}
                # Class 3: Vegetation (Forest, Grassland, Shrubland, Wetlands) - including 65
                vegetation_values = {3, 6, 7, 8, 14, 15, 16, 18, 30, 31, 32, 33, 34, 41, 42, 51, 52, 65, 70, 71, 90, 95, 100}
                # Class 4: Water (Water bodies, including 35)
                water_values = {4, 5, 9, 17, 19, 35, 43, 50, 60, 80}
                
                # Helper function to classify pixel value into 4 classes
                def classify_pixel_value(pixel_value):
                    if pixel_value in built_up_values:
                        return {'name': 'Built-up', 'key': 'Built_up'}
                    
                    if pixel_value in agriculture_values:
                        return {'name': 'Agriculture', 'key': 'Agricultural_area'}
                    
                    if pixel_value in vegetation_values:
                        return {'name': 'Forest', 'key': 'Vegetation'}
                    
                    if pixel_value in water_values:
                        return {'name': 'Water', 'key': 'Water'}
                    
                    # Default classification based on value ranges
                    if 1 <= pixel_value <= 10 or pixel_value == 255:
                        return {'name': 'Built-up', 'key': 'Built_up'}
                    elif 11 <= pixel_value <= 25 or pixel_value == 129:
                        return {'name': 'Agriculture', 'key': 'Agricultural_area'}
                    elif 26 <= pixel_value <= 34 or pixel_value == 65:
                        return {'name': 'Vegetation', 'key': 'Vegetation'}
                    elif pixel_value == 35 or pixel_value >= 40:
                        return {'name': 'Water', 'key': 'Water'}
                    else:
                        return {'name': 'Other', 'key': 'Other'}
                
                classification = None
                classification_key = None
                if raster_type == "classification" and pixel_values and pixel_values[0]['value'] is not None:
                    try:
                        pixel_value = int(round(float(pixel_values[0]['value'])))
                        class_info = classify_pixel_value(pixel_value)
                        if class_info:
                            classification = class_info['name']
                            classification_key = class_info['key']
                        else:
                            # Try to infer from common patterns
                            # Values in 100s might be scaled differently
                            if pixel_value >= 100 and pixel_value < 200:
                                # Might be percentage or scaled value
                                scaled_value = pixel_value // 10
                                if scaled_value in land_use_classes:
                                    classification = land_use_classes[scaled_value]['name']
                                    classification_key = land_use_classes[scaled_value]['key']
                                else:
                                    classification = f'Class {pixel_value}'
                                    classification_key = f'class_{pixel_value}'
                            else:
                                classification = f'Class {pixel_value}'
                                classification_key = f'class_{pixel_value}'
                    except (ValueError, TypeError):
                        classification = 'Unknown'
                        classification_key = 'unknown'
                
                # For NDVI rasters, calculate vegetation metrics
                ndvi_interpretation = None
                vegetation_coverage = None
                if raster_type == "ndvi" and pixel_values and pixel_values[0]['value'] is not None:
                    ndvi_val = float(pixel_values[0]['value'])
                    
                    # Handle different NDVI value scales:
                    # Standard scale: -1.0 to 1.0
                    # Scaled integer: -10000 to 10000 (common in MODIS/VIIRS)
                    # 0-255 scale: needs conversion
                    
                    # Detect and normalize scale
                    actual_ndvi = ndvi_val
                    ndvi_scale = "original"
                    
                    if abs(ndvi_val) > 1000:
                        # Likely scaled by 10000 (MODIS/VIIRS standard)
                        actual_ndvi = ndvi_val / 10000.0
                        ndvi_scale = "scaled_10000"
                    elif abs(ndvi_val) > 100:
                        # Likely scaled by 100
                        actual_ndvi = ndvi_val / 100.0
                        ndvi_scale = "scaled_100"
                    elif ndvi_val > 1.0 and ndvi_val <= 255:
                        # Likely 0-255 scale, convert to -1 to 1
                        actual_ndvi = (ndvi_val / 255.0) * 2.0 - 1.0
                        ndvi_scale = "0_255"
                    
                    # Clamp to valid NDVI range
                    actual_ndvi = max(-1.0, min(1.0, actual_ndvi))
                    
                    # NDVI interpretation based on normalized value
                    if actual_ndvi < 0:
                        ndvi_interpretation = {'level': 'Water/Bare Soil', 'category': 'water_bare'}
                    elif actual_ndvi < 0.2:
                        ndvi_interpretation = {'level': 'Very Sparse', 'category': 'very_sparse'}
                        vegetation_coverage = '< 10%'
                    elif actual_ndvi < 0.4:
                        ndvi_interpretation = {'level': 'Sparse', 'category': 'sparse'}
                        vegetation_coverage = '10 - 25%'
                    elif actual_ndvi < 0.6:
                        ndvi_interpretation = {'level': 'Moderate', 'category': 'moderate'}
                        vegetation_coverage = '25 - 50%'
                    elif actual_ndvi < 0.8:
                        ndvi_interpretation = {'level': 'Dense', 'category': 'dense'}
                        vegetation_coverage = '50 - 75%'
                    else:
                        ndvi_interpretation = {'level': 'Very Dense', 'category': 'very_dense'}
                        vegetation_coverage = '> 75%'
                
                response_data = {
                    'raster': raster_layer.name,
                    'raster_type': raster_type,
                    'coordinates': {'lat': lat, 'lon': lon},
                    'pixel_coordinates': {'row': int(row), 'col': int(col)},
                    'pixel_values': pixel_values,
                    'metadata': metadata
                }
                
                # Add type-specific data
                if raster_type == "classification":
                    response_data['classification'] = classification
                    response_data['classification_key'] = classification_key
                elif raster_type == "ndvi":
                    response_data['ndvi_interpretation'] = ndvi_interpretation
                    response_data['vegetation_coverage'] = vegetation_coverage
                    # Include the normalized NDVI value for display
                    if 'actual_ndvi' in dir():
                        response_data['normalized_ndvi'] = round(actual_ndvi, 4)
                    response_data['ndvi_scale'] = ndvi_scale if 'ndvi_scale' in dir() else 'original'
                
                return Response(response_data)
                
        except ValueError as e:
            return Response({'error': f'Invalid coordinates: {str(e)}'}, status=400)
        except Exception as e:
            return Response({'error': f'Error reading raster: {str(e)}'}, status=500)