# payments/views.py
from core.models import User
import stripe
from decimal import Decimal
from django.conf import settings
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Order, Cart
from .models import Transaction
from .serializers import (
    CheckoutSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    TransactionSerializer
)

# Configurar Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class CheckoutView(APIView):
    """
    POST /api/payments/checkout/
    
    Paso 1: Validar carrito y crear PaymentIntent en Stripe
    
    Body:
    {
        "buyer_name": "Juan Pérez",
        "buyer_phone": "6141234567",
        "buyer_address": "Calle Principal #123, Ciudad Juárez"
    }
    
    Response:
    {
        "client_secret": "pi_xxx_secret_yyy",
        "payment_intent_id": "pi_xxx",
        "amount": 500.00,
        "buyer_info": {...}
    }
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CheckoutSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Datos validados
        cart = serializer.validated_data['cart']
        total = serializer.validated_data['total']
        buyer_name = serializer.validated_data['buyer_name']
        buyer_phone = serializer.validated_data['buyer_phone']
        buyer_address = serializer.validated_data['buyer_address']
        
        # Convertir a centavos (Stripe usa centavos)
        amount_cents = int(total * 100)
        
        try:
            # Crear PaymentIntent en Stripe
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='mxn',
                metadata={
                    'user_id': request.user.id,
                    'user_email': request.user.email,
                    'buyer_name': buyer_name,
                    'buyer_phone': buyer_phone,
                    'cart_id': cart.id
                },
                description=f'Compra de {len(cart.items)} productos - SproutMarket'
            )
            
            return Response({
                'client_secret': payment_intent.client_secret,
                'payment_intent_id': payment_intent.id,
                'amount': float(total),
                'amount_cents': amount_cents,
                'currency': 'mxn',
                'buyer_info': {
                    'name': buyer_name,
                    'phone': buyer_phone,
                    'address': buyer_address
                },
                'cart_items': len(cart.items)
            }, status=status.HTTP_200_OK)
        
        except stripe.error.StripeError as e:
            return Response({
                'error': 'Error al procesar el pago',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConfirmPaymentView(APIView):
    """
    POST /api/payments/confirm/
    
    Paso 2: Confirmar pago y crear orden
    Se llama después de que el frontend confirma el pago con Stripe
    
    Body:
    {
        "payment_intent_id": "pi_xxx",
        "buyer_name": "Juan Pérez",
        "buyer_phone": "6141234567",
        "buyer_address": "Calle Principal #123"
    }
    
    Response:
    {
        "message": "Orden creada exitosamente",
        "order": {...}
    }
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        payment_intent_id = request.data.get('payment_intent_id')
        
        if not payment_intent_id:
            return Response({
                'error': 'payment_intent_id es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verificar el pago en Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            # Validar que el pago fue exitoso
            if payment_intent.status != 'succeeded':
                return Response({
                    'error': 'El pago no ha sido completado',
                    'status': payment_intent.status
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validar que el pago pertenece al usuario
            if payment_intent.metadata.get('user_id') != str(request.user.id):
                return Response({
                    'error': 'Este pago no te pertenece'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Obtener carrito
            try:
                cart = Cart.objects.get(user=request.user)
            except Cart.DoesNotExist:
                return Response({
                    'error': 'Carrito no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Crear orden
            order_serializer = OrderCreateSerializer(data={
                'cart': cart.id,
                'buyer_name': request.data.get('buyer_name'),
                'buyer_phone': request.data.get('buyer_phone'),
                'buyer_address': request.data.get('buyer_address'),
                'stripe_payment_id': payment_intent_id
            })
            
            if not order_serializer.is_valid():
                return Response(
                    order_serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            order = order_serializer.save()
            
            # TODO: Enviar notificaciones (Día 7)
            # - Email al comprador
            # - Email a cada vendedor
            
            return Response({
                'message': 'Orden creada exitosamente',
                'order': OrderSerializer(order).data
            }, status=status.HTTP_201_CREATED)
        
        except stripe.error.StripeError as e:
            return Response({
                'error': 'Error al verificar el pago',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'error': 'Error al crear la orden',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MembershipCheckoutSessionView(APIView):
    """
    Crea una sesión de Stripe Checkout para cobro único de membresías.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan = request.data.get("plan")

        # Validar plan
        if plan not in ["basic", "pro", "premium"]:
            return Response({"error": "Plan inválido"}, status=400)

        # Precios
        prices = {
            "basic": 400,
            "pro": 750,
            "premium": 1350,
        }

        price_mxn = prices[plan]

        # Crear Stripe Checkout Session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "mxn",
                    "product_data": {
                        "name": f"Membresía {plan.upper()} - SproutMarket"
                    },
                    "unit_amount": price_mxn * 100,
                },
                "quantity": 1,
            }],
            mode="payment",
            metadata={
                "user_id": request.user.id,
                "plan": plan
            },
            success_url="http://localhost:5173/membresia/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:5173/membresia/cancel",
        )

        return Response({"checkout_url": session.url})


class MembershipCheckoutConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        session_id = request.query_params.get("session_id")

        if not session_id:
            return Response({"error": "No session_id provided"}, status=400)

        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status != "paid":
            return Response({"error": "El pago no está completado"}, status=400)

        # Metadata
        user_id = session.metadata.get("user_id")
        plan = session.metadata.get("plan")

        if not user_id or not plan:
            return Response({"error": "Metadata incompleta"}, status=400)

        # Usuario
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

        # Duración
        from django.utils import timezone
        from datetime import timedelta
        
        durations = {"basic": 3, "pro": 6, "premium": 12}
        months = durations[plan]

        expires_at = timezone.now() + timedelta(days=30 * months)

        # Activar la membresía
        user.membership_type = plan
        user.membership_is_active = True
        user.membership_expires_at = expires_at
        user.save()

        # Registrar transacción CORRECTAMENTE
        Transaction.objects.create(
            user=user,
            type="subscription",
            amount_mxn=session.amount_total / 100,
            stripe_id=session.payment_intent,
            description=f"Membresía {plan.upper()}",
            metadata={
                "plan": plan,
                "months": months,
                "stripe_session_id": session_id
            }
        )

        return Response({
            "message": "Membresía activada correctamente",
            "plan": plan,
            "expires_at": expires_at.isoformat(),
        })



class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para órdenes (solo lectura para usuarios)
    
    list: GET /api/orders/ - Mis órdenes
    retrieve: GET /api/orders/{id}/ - Detalle de orden
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Solo órdenes del usuario autenticado"""
        return Order.objects.filter(buyer=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        GET /api/orders/recent/
        Últimas 5 órdenes
        """
        queryset = self.get_queryset()[:5]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        GET /api/orders/stats/
        Estadísticas de compras del usuario
        """
        queryset = self.get_queryset()
        
        total_orders = queryset.count()
        total_spent = sum(order.total_mxn for order in queryset)
        
        return Response({
            'total_orders': total_orders,
            'total_spent': float(total_spent),
            'average_order': float(total_spent / total_orders) if total_orders > 0 else 0
        })


class SalesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ventas (productos vendidos por el usuario)
    
    list: GET /api/sales/ - Mis ventas
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Órdenes que contienen productos del usuario"""
        user = self.request.user
        
        # Filtrar órdenes donde algún item tenga al usuario como seller
        orders = Order.objects.filter(
            status='completed'
        ).order_by('-created_at')
        
        # Filtrar solo las que tienen productos del usuario
        user_orders = []
        for order in orders:
            for item in order.items:
                if item.get('seller_id') == user.id:
                    user_orders.append(order)
                    break
        
        return user_orders
    
    def list(self, request):
        """Listar ventas con items filtrados por seller"""
        orders = self.get_queryset()
        
        # Filtrar items de cada orden para mostrar solo los del usuario
        filtered_data = []
        for order in orders:
            order_data = OrderSerializer(order).data
            
            # Filtrar items
            order_data['items'] = [
                item for item in order_data['items']
                if item['seller_id'] == request.user.id
            ]
            
            # Recalcular subtotal solo de items del usuario
            user_subtotal = sum(
                Decimal(str(item['subtotal'])) 
                for item in order_data['items']
            )
            order_data['user_subtotal'] = float(user_subtotal)
            order_data['user_earnings'] = float(user_subtotal * Decimal('0.90'))
            
            filtered_data.append(order_data)
        
        return Response(filtered_data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        GET /api/sales/stats/
        Estadísticas de ventas
        """
        orders = self.get_queryset()
        
        total_sales = 0
        total_earnings = 0
        items_sold = 0
        
        for order in orders:
            for item in order.items:
                if item.get('seller_id') == request.user.id:
                    subtotal = Decimal(str(item['subtotal']))
                    total_sales += subtotal
                    total_earnings += subtotal * Decimal('0.90')
                    items_sold += item['quantity']
        
        return Response({
            'total_sales': float(total_sales),
            'total_earnings': float(total_earnings),
            'commission_paid': float(total_sales * Decimal('0.10')),
            'items_sold': items_sold,
            'orders_count': len(orders)
        })


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para transacciones
    
    list: GET /api/transactions/ - Mis transacciones
    retrieve: GET /api/transactions/{id}/ - Detalle
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Solo transacciones del usuario"""
        return Transaction.objects.filter(
            user=self.request.user
        ).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        GET /api/transactions/by_type/?type=purchase
        Filtrar por tipo de transacción
        """
        transaction_type = request.query_params.get('type')
        
        if not transaction_type:
            return Response({
                'error': 'Se requiere el parámetro type'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(type=transaction_type)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class BalanceView(APIView):
    """
    GET /api/payments/balance/
    Ver balance disponible para retiro
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        return Response({
            'available_balance': float(user.available_balance_mxn),
            'currency': 'MXN'
        })