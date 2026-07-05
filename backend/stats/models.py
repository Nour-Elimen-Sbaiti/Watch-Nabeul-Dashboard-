from django.db import models

class AnalysisResult(models.Model):
    RESULT_TYPES = [
        ('change_detection', 'Change Detection'),
        ('overview_statistics', 'Overview Statistics'),
        ('transition_matrix', 'Transition Matrix'),
        ('accuracy_assessment', 'Accuracy Assessment'),
    ]
    name = models.CharField(max_length=255)
    result_type = models.CharField(max_length=50, choices=RESULT_TYPES)
    data = models.JSONField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.result_type})"


class AccuracyAssessment(models.Model):
    CLASSIFIER_CHOICES = [
        ('CNN', 'Convolutional Neural Network'),
        ('SVM', 'Support Vector Machine'),
        ('Random Forest', 'Random Forest'),
    ]
    classifier = models.CharField(max_length=50, choices=CLASSIFIER_CHOICES)
    year = models.IntegerField()
    overall_accuracy_percent = models.FloatField()
    kappa = models.FloatField()
    quality = models.CharField(max_length=50)
    data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('classifier', 'year')
        ordering = ['-year', 'classifier']

    def __str__(self):
        return f"{self.classifier} - {self.year} ({self.overall_accuracy_percent}%)"