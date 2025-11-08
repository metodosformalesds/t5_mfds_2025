# payments/serializers.py

from rest_framework import serializers
from decimal import Decimal
from django.db import transaction
from products.models import Product, Order, Cart
from .models import Transaction
from core.serializers import UserProfileSerializer


class CheckoutSerializer(serializers.Serializer):
    """
    Serializer para iniciar el proceso de checkout
    Valida el carrito y crea un PaymentIntent en Stripe
    """
    
    buyer_name = serializers.CharField(max_length=200)
    buyer_phone = serializers.CharField(max_length=15)
    buyer_address = serializers.CharField()
    
    def validate(self, attrs):
        """Validar que el carrito tenga items y stock suficiente"""
        user = self.context['request'].user
        
        # Obtener carrito
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            raise serializers.ValidationError('No tienes items en el carrito')
        
        if not cart.items:
            raise serializers.ValidationError('Tu carrito está vacío')
        
        # Validar stock de cada producto
        errors = []
        total = Decimal('0.00')
        
        for item in cart.items:
            try:
                product = Product.objects.get(id=item['product_id'])
                
                # Verificar que esté activo
                if product.status != 'active':
                    errors.append(f'{product.common_name}: Producto no disponible')
                    continue
                
                # Verificar stock
                if product.quantity < item['quantity']:
                    errors.append(
                        f'{product.common_name}: Stock insuficiente. '
                        f'Disponible: {product.quantity}, Solicitado: {item["quantity"]}'
                    )
                    continue
                
                # Calcular total
                total += product.price_mxn * item['quantity']
                
            except Product.DoesNotExist:
                errors.append(f'Producto ID {item["product_id"]}: No encontrado')
        
        if errors:
            raise serializers.ValidationError({'stock_errors': errors})
        
        if total <= 0:
            raise serializers.ValidationError('El total debe ser mayor a 0')
        
        # Agregar datos validados al contexto
        attrs['cart'] = cart
        attrs['total'] = total
        
        return attrs


class OrderItemSerializer(serializers.Serializer):
    """Serializer para items dentro de una orden"""
    
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    quantity = serializers.IntegerField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    seller_id = serializers.IntegerField()
    seller_username = serializers.CharField()


class OrderSerializer(serializers.ModelSerializer):
    """Serializer para órdenes (lectura)"""
    
    buyer = UserProfileSerializer(read_only=True)
    items = serializers.SerializerMethodField()
    seller_earnings = serializers.ReadOnlyField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'buyer_name', 'buyer_phone', 'buyer_address',
            'items', 'subtotal_mxn', 'commission_mxn', 'total_mxn',
            'seller_earnings', 'stripe_payment_id', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_items(self, obj):
        """Deserializar items JSON"""
        return obj.items


class OrderCreateSerializer(serializers.Serializer):
    """
    Serializer para crear orden después de pago exitoso
    NO se usa directamente por el usuario, se usa internamente
    """
    
    cart = serializers.PrimaryKeyRelatedField(queryset=Cart.objects.all())
    buyer_name = serializers.CharField(max_length=200)
    buyer_phone = serializers.CharField(max_length=15)
    buyer_address = serializers.CharField()
    stripe_payment_id = serializers.CharField()
    
    def create(self, validated_data):
        """Crear orden y decrementar stock"""
        cart = validated_data['cart']
        user = cart.user
        
        # Calcular totales
        subtotal = Decimal('0.00')
        items_data = []
        
        with transaction.atomic():
            # Procesar cada item
            for item in cart.items:
                product = Product.objects.select_for_update().get(
                    id=item['product_id']
                )
                
                # Validar stock nuevamente (por si cambió entre checkout y pago)
                if product.quantity < item['quantity']:
                    raise serializers.ValidationError({
                        'stock_error': f'{product.common_name}: Stock insuficiente'
                    })
                
                # Calcular subtotal
                item_subtotal = product.price_mxn * item['quantity']
                subtotal += item_subtotal
                
                # Guardar info del item
                items_data.append({
                    'product_id': product.id,
                    'product_name': product.common_name,
                    'quantity': item['quantity'],
                    'unit_price': float(product.price_mxn),
                    'subtotal': float(item_subtotal),
                    'seller_id': product.seller.id,
                    'seller_username': product.seller.username
                })
                
                # Decrementar stock
                product.quantity -= item['quantity']
                
                # Si se agota, cambiar status
                if product.quantity == 0:
                    product.status = 'out_of_stock'
                
                product.save()
            
            # Calcular comisión (10%)
            commission = subtotal * Decimal('0.10')
            total = subtotal
            
            # Crear orden
            order = Order.objects.create(
                buyer=user,
                buyer_name=validated_data['buyer_name'],
                buyer_phone=validated_data['buyer_phone'],
                buyer_address=validated_data['buyer_address'],
                items=items_data,
                subtotal_mxn=subtotal,
                commission_mxn=commission,
                total_mxn=total,
                stripe_payment_id=validated_data['stripe_payment_id'],
                status='completed'
            )
            
            # Registrar transacciones
            # 1. Transacción de compra (buyer)
            Transaction.record_purchase(
                user=user,
                order=order,
                amount=total,
                stripe_id=validated_data['stripe_payment_id']
            )
            
            # 2. Transacción de comisión (plataforma)
            Transaction.record_commission(
                order=order,
                amount=commission
            )
            
            # 3. Transacciones de venta por cada seller
            sellers_earnings = {}
            for item in items_data:
                seller_id = item['seller_id']
                seller_earning = Decimal(str(item['subtotal']))
                
                if seller_id in sellers_earnings:
                    sellers_earnings[seller_id]['amount'] += seller_earning
                else:
                    sellers_earnings[seller_id] = {
                        'amount': seller_earning,
                        'username': item['seller_username']
                    }
            
            # Crear transacciones de venta y actualizar balance
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            for seller_id, data in sellers_earnings.items():
                seller = User.objects.get(id=seller_id)
                
                # Calcular lo que recibe el seller (90%)
                seller_net = data['amount'] * Decimal('0.90')
                
                # Actualizar balance
                seller.available_balance_mxn += seller_net
                seller.save()
                
                # Registrar transacción
                Transaction.record_sale(
                    seller=seller,
                    order=order,
                    amount=seller_net
                )
            
            # Vaciar carrito
            cart.clear()
            
            return order


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer para transacciones"""
    
    user = UserProfileSerializer(read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'type', 'type_display', 'amount_mxn',
            'stripe_id', 'reference_id', 'reference_type',
            'description', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PaymentIntentSerializer(serializers.Serializer):
    """Serializer para crear PaymentIntent de Stripe"""
    
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(default='mxn')
    description = serializers.CharField(required=False)
    metadata = serializers.DictField(required=False)