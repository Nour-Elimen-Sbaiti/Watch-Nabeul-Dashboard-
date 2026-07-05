from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AnalysisResult, AccuracyAssessment
from .serializers import AnalysisResultSerializer, AccuracyAssessmentSerializer

class AnalysisResultViewSet(viewsets.ModelViewSet):
    queryset = AnalysisResult.objects.all()
    serializer_class = AnalysisResultSerializer

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        result_type = request.query_params.get('type')
        results = AnalysisResult.objects.filter(result_type=result_type)
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)


class AccuracyAssessmentViewSet(viewsets.ModelViewSet):
    queryset = AccuracyAssessment.objects.all()
    serializer_class = AccuracyAssessmentSerializer

    @action(detail=False, methods=['get'])
    def by_classifier(self, request):
        """Get accuracy data grouped by classifier"""
        classifier = request.query_params.get('classifier')
        if classifier:
            results = AccuracyAssessment.objects.filter(classifier=classifier)
        else:
            results = AccuracyAssessment.objects.all()
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_year(self, request):
        """Get all classifiers' accuracy for a specific year"""
        year = request.query_params.get('year')
        if year:
            results = AccuracyAssessment.objects.filter(year=int(year))
        else:
            results = AccuracyAssessment.objects.all()
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get all accuracy data organized by classifier and year"""
        results = AccuracyAssessment.objects.all()
        data = {}
        for acc in results:
            if acc.classifier not in data:
                data[acc.classifier] = {}
            data[acc.classifier][acc.year] = {
                'overall_accuracy_percent': acc.overall_accuracy_percent,
                'kappa': acc.kappa,
                'quality': acc.quality
            }
        return Response(data)