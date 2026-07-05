from django.db import models

# Create your models here.
from django.db import models

class RasterLayer(models.Model):
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file        = models.FileField(upload_to='rasters/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # Bounding box (auto-filled)
    min_lon = models.FloatField(null=True, blank=True)
    min_lat = models.FloatField(null=True, blank=True)
    max_lon = models.FloatField(null=True, blank=True)
    max_lat = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name