from django.apps import AppConfig



class RastersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rasters'

    def ready(self):
        import rasters.signals  # ← registers the signal
