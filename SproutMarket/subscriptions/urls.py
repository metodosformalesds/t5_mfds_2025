# subscriptions/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionViewSet, SubscriptionWebhookView

app_name = 'subscriptions'

# Router para el ViewSet
router = DefaultRouter()
router.register(r'', SubscriptionViewSet, basename='subscription')

urlpatterns = [
    # Webhook de Stripe (sin autenticación)
    path('webhook/', SubscriptionWebhookView.as_view(), name='webhook'),
    
    # ViewSet endpoints
    path('', include(router.urls)),
]

# Las rutas generadas automáticamente serán:
# POST   /api/subscriptions/create/      - Crear suscripción
# POST   /api/subscriptions/cancel/      - Cancelar suscripción
# POST   /api/subscriptions/reactivate/  - Reactivar suscripción
# GET    /api/subscriptions/status/      - Estado de suscripción
# GET    /api/subscriptions/history/     - Historial
# GET    /api/subscriptions/benefits/    - Información de beneficios
# POST   /api/subscriptions/webhook/     - Webhook de Stripe