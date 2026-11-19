"""
URL configuration for auction_system project.
Located in: oction_mart/auction_system/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'Auction Management API is running',
        'version': '1.0.0'
    })

def api_root(request):
    """API root endpoint"""
    return JsonResponse({
        'message': 'Welcome to Auction Management API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'health': '/health/',
        }
    })

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', api_root, name='api-root'),
    path('api/', include('myapp.urls')),
    
    # Health check
    path('health/', health_check, name='health-check'),
    
    # Root redirect
    path('', api_root, name='home'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)