from django.db import models

# Create your models here.


class VectorLayer(models.Model):
    LAYER_TYPE_CHOICES = [
        ('boundary', 'Boundary'),
        ('hydrology', 'Hydrology'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='vectors/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    layer_type = models.CharField(max_length=20, choices=LAYER_TYPE_CHOICES, default='boundary')

    def __str__(self):
        return self.name
