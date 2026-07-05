from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rasters.views import RasterLayerViewSet
from rasters.tiles import get_tile
from django.views.generic import TemplateView
from vectors.views import VectorLayerViewSet, serve_geojson
from stats.views import AnalysisResultViewSet, AccuracyAssessmentViewSet

router = DefaultRouter()
router.register(r'rasters', RasterLayerViewSet)
router.register(r'vectors', VectorLayerViewSet)
router.register(r'stats', AnalysisResultViewSet)
router.register(r'accuracy', AccuracyAssessmentViewSet, basename='accuracy')
router.register(r'accuracy', AccuracyAssessmentViewSet)

urlpatterns = [
    path('', lambda request: redirect('map/')),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('tiles/<int:layer_id>/<int:z>/<int:x>/<int:y>.png', get_tile),
    path('geojson/<int:layer_id>/', serve_geojson),
    path('map/', TemplateView.as_view(template_name='map.html')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)