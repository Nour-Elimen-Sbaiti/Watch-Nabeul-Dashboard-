

# Register your models here.
from django.contrib import admin
from .models import AnalysisResult, AccuracyAssessment

admin.site.register(AnalysisResult)
admin.site.register(AccuracyAssessment)
