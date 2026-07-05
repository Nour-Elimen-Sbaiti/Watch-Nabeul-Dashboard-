import json
import os
from django.core.management.base import BaseCommand
from stats.models import AccuracyAssessment
from django.conf import settings

class Command(BaseCommand):
    help = 'Load accuracy assessment data from JSON files'

    def handle(self, *args, **options):
        # Define the data directory path
        data_dir = os.path.join(settings.BASE_DIR.parent, 'data', 'stats')
        
        # Map JSON files to classifier names
        accuracy_files = {
            'accuracy_SVM.json': 'SVM',
            'accuracy_RF.json': 'Random Forest',
            'accuracy_CNN.json': 'CNN'
        }
        
        created_count = 0
        updated_count = 0
        
        for filename, classifier in accuracy_files.items():
            filepath = os.path.join(data_dir, filename)
            
            if not os.path.exists(filepath):
                self.stdout.write(self.style.WARNING(f'File not found: {filepath}'))
                continue
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Process each feature in the FeatureCollection
                for feature in data.get('features', []):
                    properties = feature.get('properties', {})
                    
                    # Create or update AccuracyAssessment record
                    obj, created = AccuracyAssessment.objects.update_or_create(
                        classifier=classifier,
                        year=properties.get('year'),
                        defaults={
                            'overall_accuracy_percent': properties.get('overall_accuracy_percent'),
                            'kappa': properties.get('kappa'),
                            'quality': properties.get('quality'),
                            'data': properties  # Store the full properties as JSON
                        }
                    )
                    
                    if created:
                        created_count += 1
                        self.stdout.write(f'Created: {classifier} - {properties.get("year")}')
                    else:
                        updated_count += 1
                        self.stdout.write(f'Updated: {classifier} - {properties.get("year")}')
                
                self.stdout.write(self.style.SUCCESS(f'Successfully loaded {filename}'))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error loading {filename}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'Completed! Created: {created_count}, Updated: {updated_count}'
        ))