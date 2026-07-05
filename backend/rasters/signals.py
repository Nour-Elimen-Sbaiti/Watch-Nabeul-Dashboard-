# rasters/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
import rasterio
from rasterio.warp import transform_bounds
from .models import RasterLayer

@receiver(post_save, sender=RasterLayer)
def extract_bbox(sender, instance, created, **kwargs):
    if created and instance.file:
        with rasterio.open(instance.file.path) as src:
            bounds = transform_bounds(src.crs, 'EPSG:4326', *src.bounds)
            RasterLayer.objects.filter(pk=instance.pk).update(
                min_lon=bounds[0], min_lat=bounds[1],
                max_lon=bounds[2], max_lat=bounds[3],
            )