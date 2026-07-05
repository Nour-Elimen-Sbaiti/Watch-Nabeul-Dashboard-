from rest_framework import serializers
from .models import VectorLayer

class VectorLayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = VectorLayer
        fields = ['id', 'name', 'description', 'file', 'uploaded_at', 'layer_type']
