# Generated migration for AccuracyAssessment model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stats', '0002_alter_analysisresult_result_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='AccuracyAssessment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('classifier', models.CharField(choices=[('CNN', 'Convolutional Neural Network'), ('SVM', 'Support Vector Machine'), ('Random Forest', 'Random Forest')], max_length=50)),
                ('year', models.IntegerField()),
                ('overall_accuracy_percent', models.FloatField()),
                ('kappa', models.FloatField()),
                ('quality', models.CharField(max_length=50)),
                ('data', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-year', 'classifier'],
            },
        ),
        migrations.AddConstraint(
            model_name='accuracyassessment',
            constraint=models.UniqueConstraint(fields=('classifier', 'year'), name='unique_classifier_year'),
        ),
    ]
