from rest_framework import serializers
from .models import AnalysisResult, AccuracyAssessment

class AnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisResult
        fields = ['id', 'name', 'result_type', 'data', 'uploaded_at']


class AccuracyAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccuracyAssessment
        fields = ['id', 'classifier', 'year', 'overall_accuracy_percent', 'kappa', 'quality', 'created_at']

