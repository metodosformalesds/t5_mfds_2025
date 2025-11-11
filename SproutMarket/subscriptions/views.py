# subscriptions/views.py

import stripe
from django.conf import settings
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Subscription
from .serializers import (
    SubscriptionSerializer,
    SubscriptionCreateSerializer,
    SubscriptionCancelSerializer,
    SubscriptionStatusSerializer,
    SubscriptionHistorySerializer
)
from .services import SubscriptionService

# Configurar Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionViewSet(viewsets.ViewSet):
    """
    ViewSet para manejar suscripciones premium
    
    create: POST /api/subscriptions/create/ - Crear suscripción
    cancel: POST /api/subscriptions/cancel/ - Cancelar suscripción
    status: GET /api/subscriptions/status/ - Ver estado
    reactivate: POST /api/subscriptions/reactivate/ - Reactivar
    history: GET /api/subscriptions/history/ - Historial
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def create_subscription(self, request):
        """
        POST /api/subscriptions/create_subscription/
        
        Crear una suscripción premium
        
        Response:
        {
            "subscription_id": "sub_xxxxx",
            "client_secret": "pi_xxxxx_secret_yyyy",
            "status": "incomplete",
            "current_period_end": "2025-02-15T10:00:00Z",
            "amount": 199.00
        }
        """
        serializer = SubscriptionCreateSerializer(
            data={},
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = serializer.save()
            
            return Response({
                'message': 'Suscripción creada. Completa el pago para activarla.',
                'subscription': result
            }, status=status.HTTP_201_CREATED)
            
        except stripe.error.StripeError as e:
            return Response({
                'error': 'Error al crear la suscripción',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'error': 'Error inesperado',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def cancel(self, request):
        """
        POST /api/subscriptions/cancel/
        
        Cancelar la suscripción premium
        La suscripción se mantendrá activa hasta el final del periodo pagado
        
        Response:
        {
            "message": "Suscripción cancelada...",
            "cancel_at": "2025-02-15T10:00:00Z",
            "status": "canceled"
        }
        """
        serializer = SubscriptionCancelSerializer(
            data={},
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = serializer.save()
            
            return Response(result, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.StripeError as e:
            return Response({
                'error': 'Error al cancelar la suscripción',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def reactivate(self, request):
        """
        POST /api/subscriptions/reactivate/
        
        Reactivar una suscripción cancelada
        Solo funciona si aún no ha terminado el periodo pagado
        
        Response:
        {
            "message": "Suscripción reactivada exitosamente",
            "status": "active",
            "current_period_end": "2025-02-15T10:00:00Z"
        }
        """
        try:
            result = SubscriptionService.reactivate_subscription(request.user)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.StripeError as e:
            return Response({
                'error': 'Error al reactivar la suscripción',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """
        GET /api/subscriptions/status/
        
        Obtener el estado actual de la suscripción del usuario
        
        Response:
        {
            "has_subscription": true,
            "is_premium": true,
            "status": "active",
            "current_period_start": "2025-01-15T10:00:00Z",
            "current_period_end": "2025-02-15T10:00:00Z",
            "cancel_at_period_end": false
        }
        """
        result = SubscriptionService.get_subscription_status(request.user)
        
        serializer = SubscriptionStatusSerializer(result)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """
        GET /api/subscriptions/history/
        
        Obtener historial de suscripciones del usuario
        
        Response:
        {
            "count": 2,
            "results": [...]
        }
        """
        subscriptions = Subscription.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        serializer = SubscriptionHistorySerializer(subscriptions, many=True)
        
        return Response({
            'count': subscriptions.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def benefits(self, request):
        """
        GET /api/subscriptions/benefits/
        
        Obtener información sobre los beneficios del plan premium
        
        Response:
        {
            "price": "199 MXN/mes",
            "benefits": [...]
        }
        """
        return Response({
            'price': '199 MXN/mes',
            'currency': 'MXN',
            'amount': 199.00,
            'benefits': [
                'Publicar hasta 40 productos (vs 10 en plan gratuito)',
                'Tus productos aparecen primero en el catálogo',
                'Badge de vendedor premium visible',
                'Soporte prioritario',
                'Estadísticas avanzadas de ventas'
            ],
            'free_plan_limits': {
                'max_products': 10,
                'priority': False
            },
            'premium_plan_limits': {
                'max_products': 40,
                'priority': True
            }
        })


class SubscriptionWebhookView(APIView):
    """
    POST /api/subscriptions/webhook/
    
    Endpoint para recibir webhooks de Stripe sobre suscripciones
    """
    
    permission_classes = []  # Los webhooks no requieren autenticación
    
    def post(self, request):
        """
        Procesar webhooks de Stripe
        
        Eventos manejados:
        - customer.subscription.created
        - customer.subscription.updated
        - customer.subscription.deleted
        - invoice.payment_succeeded
        - invoice.payment_failed
        """
        
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET
        
        try:
            # Verificar firma del webhook
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError:
            # Payload inválido
            return Response(
                {'error': 'Invalid payload'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except stripe.error.SignatureVerificationError:
            # Firma inválida
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Procesar el evento
        try:
            result = SubscriptionService.handle_subscription_webhook(event)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log del error pero retornar 200 para que Stripe no reintente
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error processing webhook: {str(e)}")
            
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_200_OK)