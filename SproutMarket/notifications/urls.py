# notifications/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

app_name = 'notifications'

# Router para el ViewSet
router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]

# Las rutas generadas automáticamente serán:
# GET    /api/notifications/                    - Listar notificaciones
# GET    /api/notifications/{id}/                - Ver detalle
# DELETE /api/notifications/{id}/                - Eliminar notificación
# PUT    /api/notifications/{id}/mark_as_read/   - Marcar como leída
# POST   /api/notifications/mark_all_read/       - Marcar todas como leídas
# GET    /api/notifications/unread_count/        - Contador de no leídas
# GET    /api/notifications/recent/              - Últimas 10
# DELETE /api/notifications/clear_all/           - Eliminar todas
# DELETE /api/notifications/clear_read/          - Eliminar leídas
# GET    /api/notifications/stats/               - Estadísticas