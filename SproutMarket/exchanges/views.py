# exchanges/views.py

import stripe
from decimal import Decimal
from django.conf import settings
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Exchange, ExchangeOffer
from .serializers import (
    ExchangeListSerializer,
    ExchangeDetailSerializer,
    ExchangeCreateSerializer,
    ExchangeUpdateSerializer,
    ExchangeOfferCreateSerializer,
    ExchangeOfferListSerializer,
    ExchangeOfferResponseSerializer
)

# Configurar Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class ExchangeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para publicaciones de intercambio
    
    list: GET /api/exchanges/ - Listar intercambios activos (público)
    retrieve: GET /api/exchanges/{id}/ - Detalle (público)
    create: POST /api/exchanges/ - Crear publicación (autenticado, requiere pago)
    update: PUT/PATCH /api/exchanges/{id}/ - Actualizar (owner)
    destroy: DELETE /api/exchanges/{id}/ - Cancelar (owner)
    
    Filtros disponibles:
    - ?location=juarez - Filtrar por ubicación
    - ?min_height=10&max_height=50 - Rango de altura
    - ?min_width=10&max_width=50 - Rango de ancho
    - ?search=monstera - Búsqueda por nombre
    """
    
    queryset = Exchange.objects.select_related('user').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['plant_common_name', 'plant_scientific_name', 'description', 'location']
    ordering_fields = ['created_at']
    ordering = ['-created_at']  # Más recientes primero
    
    def get_queryset(self):
        """
        Filtrar exchanges según el contexto
        - Para listado público: solo activos
        - Para mis intercambios: todos los del usuario
        """
        queryset = super().get_queryset()
        
        # Si el usuario quiere ver solo sus intercambios
        if self.action == 'my_exchanges':
            return queryset.filter(user=self.request.user)
        
        # Para el público, solo exchanges activos
        if self.action in ['list', 'retrieve']:
            queryset = queryset.filter(status='active')
        
        # Filtros custom
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        min_height = self.request.query_params.get('min_height')
        if min_height:
            queryset = queryset.filter(height_cm__gte=min_height)
        
        max_height = self.request.query_params.get('max_height')
        if max_height:
            queryset = queryset.filter(height_cm__lte=max_height)
        
        min_width = self.request.query_params.get('min_width')
        if min_width:
            queryset = queryset.filter(width_cm__gte=min_width)
        
        max_width = self.request.query_params.get('max_width')
        if max_width:
            queryset = queryset.filter(width_cm__lte=max_width)
        
        return queryset
    
    def get_serializer_class(self):
        """Seleccionar serializer según la acción"""
        if self.action == 'list':
            return ExchangeListSerializer
        elif self.action == 'retrieve':
            return ExchangeDetailSerializer
        elif self.action == 'create':
            return ExchangeCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ExchangeUpdateSerializer
        return ExchangeListSerializer
    
    def get_permissions(self):
        """Permisos personalizados por acción"""
        if self.action in ['create', 'my_exchanges', 'my_offers']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsExchangeOwner()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        """Crear exchange (ya validado el pago en serializer)"""
        serializer.save()
    
    def perform_destroy(self, instance):
        """Cancelar exchange (soft delete)"""
        if instance.status == 'exchanged':
            return Response(
                {'detail': 'No puedes cancelar un intercambio ya completado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Rechazar todas las ofertas pendientes
        instance.offers.filter(status='pending').update(status='rejected')
        
        # Marcar como cancelado
        instance.status = 'canceled'
        instance.save()
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def create_payment_intent(self, request):
        """
        POST /api/exchanges/create_payment_intent/
        
        Crear PaymentIntent de $90 MXN para publicar un exchange
        
        Response:
        {
            "client_secret": "pi_xxx_secret_yyy",
            "payment_intent_id": "pi_xxx",
            "amount": 90.00,
            "amount_cents": 9000,
            "currency": "mxn"
        }
        """
        user = request.user
        amount_cents = 9000  # $90 MXN
        
        try:
            # Crear PaymentIntent en Stripe
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='mxn',
                metadata={
                    'user_id': user.id,
                    'user_email': user.email,
                    'type': 'exchange_publication'
                },
                description=f'Publicación de intercambio - SproutMarket - {user.email}'
            )
            
            return Response({
                'client_secret': payment_intent.client_secret,
                'payment_intent_id': payment_intent.id,
                'amount': 90.00,
                'amount_cents': amount_cents,
                'currency': 'mxn'
            }, status=status.HTTP_200_OK)
        
        except stripe.error.StripeError as e:
            return Response({
                'error': 'Error al crear el pago',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_exchanges(self, request):
        """
        GET /api/exchanges/my_exchanges/
        Obtener intercambios del usuario autenticado
        """
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = ExchangeListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = ExchangeListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reactivate(self, request, pk=None):
        """
        POST /api/exchanges/{id}/reactivate/
        Reactivar exchange cancelado (solo owner)
        """
        exchange = self.get_object()
        
        if exchange.user != request.user:
            return Response(
                {'detail': 'No tienes permiso para reactivar este intercambio'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if exchange.status == 'canceled':
            exchange.status = 'active'
            exchange.save()
            
            return Response({
                'message': 'Intercambio reactivado exitosamente',
                'exchange': ExchangeDetailSerializer(exchange, context={'request': request}).data
            })
        
        return Response(
            {'detail': 'Solo puedes reactivar intercambios cancelados'},
            status=status.HTTP_400_BAD_REQUEST
        )


class ExchangeOfferViewSet(viewsets.ViewSet):
    """
    ViewSet para ofertas de intercambio
    
    create: POST /api/exchange-offers/ - Crear oferta (autenticado, gratis)
    my_offers: GET /api/exchange-offers/my_offers/ - Mis ofertas
    respond: POST /api/exchange-offers/respond/ - Aceptar/rechazar (owner del exchange)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request):
        """
        POST /api/exchange-offers/
        
        Body:
        {
            "exchange_id": 1,
            "plant_common_name": "Monstera",
            "plant_scientific_name": "Monstera deliciosa",
            "description": "Planta grande y saludable",
            "width_cm": 30,
            "height_cm": 50,
            "image1": <file>,
            "image2": <file> (opcional),
            "image3": <file> (opcional)
        }
        """
        serializer = ExchangeOfferCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        offer = serializer.save()
        
        return Response({
            'message': 'Oferta creada exitosamente',
            'offer': ExchangeOfferListSerializer(offer).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def my_offers(self, request):
        """
        GET /api/exchange-offers/my_offers/
        
        Obtener todas las ofertas que he hecho
        """
        offers = ExchangeOffer.objects.filter(
            offeror=request.user
        ).select_related('exchange', 'offeror').order_by('-created_at')
        
        serializer = ExchangeOfferListSerializer(offers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def respond(self, request):
        """
        POST /api/exchange-offers/respond/
        
        Aceptar o rechazar una oferta (solo owner del exchange)
        
        Body:
        {
            "offer_id": 1,
            "action": "accept" | "reject"
        }
        """
        serializer = ExchangeOfferResponseSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = serializer.save()
        return Response(result, status=status.HTTP_200_OK)


class IsExchangeOwner(permissions.BasePermission):
    """
    Permiso personalizado:
    - Solo el owner del exchange puede editar o cancelar
    """
    
    def has_object_permission(self, request, view, obj):
        """Verificar que el usuario sea el owner"""
        return obj.user == request.user