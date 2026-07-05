from rest_framework import serializers
from .models import RasterLayer

class RasterLayerSerializer(serializers.ModelSerializer):
    tile_url = serializers.SerializerMethodField()

    class Meta:
        model  = RasterLayer
        fields = ['id', 'name', 'description', 'file',
                  'min_lon', 'min_lat', 'max_lon', 'max_lat',
                  'uploaded_at', 'tile_url']

    def get_tile_url(self, obj):
        request = self.context.get('request')
        base = request.build_absolute_uri('/') if request else 'http://localhost:8000/'
        return f"{base}tiles/{obj.id}/{{z}}/{{x}}/{{y}}.png"