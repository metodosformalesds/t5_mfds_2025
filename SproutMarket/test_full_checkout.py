# test_full_checkout.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from products.models import Cart, Product
from decimal import Decimal
import stripe
from django.conf import settings

User = get_user_model()

def test_checkout():
    print("🧪 INICIANDO TEST DE CHECKOUT\n")
    
    # 1. Obtener usuario y token
    print("1️⃣ Obteniendo usuario...")
    user = User.objects.get(username='buyertest')
    token, _ = Token.objects.get_or_create(user=user)
    print(f"✅ Usuario: {user.username}")
    print(f"🔑 Token: {token.key[:20]}...\n")
    
    # 2. Verificar que hay productos
    print("2️⃣ Verificando productos...")
    products = Product.objects.filter(status='active')
    if not products.exists():
        print("❌ No hay productos activos")
        return
    
    product = products.first()
    print(f"✅ Producto encontrado: {product.common_name}")
    print(f"   Precio: ${product.price_mxn}")
    print(f"   Stock: {product.quantity}\n")
    
    # 3. Agregar al carrito
    print("3️⃣ Agregando al carrito...")
    cart, _ = Cart.objects.get_or_create(user=user)
    
    # Limpiar carrito primero
    cart.items = []
    
    # Agregar item
    cart.items.append({
        'product_id': product.id,
        'quantity': 2
    })
    cart.save()
    
    print(f"✅ Carrito actualizado")
    print(f"   Items: {len(cart.items)}")
    print(f"   Total items: {cart.get_total_items()}\n")
    
    # 4. Simular checkout
    print("4️⃣ Simulando checkout...")
    
    # Calcular total
    total = Decimal('0.00')
    for item in cart.items:
        prod = Product.objects.get(id=item['product_id'])
        total += prod.price_mxn * item['quantity']
    
    print(f"   Subtotal: ${total}")
    
    # Datos del comprador
    buyer_data = {
        'name': 'Carlo Lara',
        'phone': '6141234567',
        'address': 'Calle Principal #123, Ciudad Juárez'
    }
    print(f"   Comprador: {buyer_data['name']}\n")
    
    # 5. Crear PaymentIntent en Stripe
    print("5️⃣ Creando PaymentIntent en Stripe...")
    
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    try:
        amount_cents = int(total * 100)
        
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='mxn',
            metadata={
                'user_id': user.id,
                'user_email': user.email,
                'buyer_name': buyer_data['name'],
                'cart_id': cart.id
            },
            description=f'Compra de {len(cart.items)} productos - SproutMarket'
        )
        
        print(f"✅ PaymentIntent creado exitosamente!")
        print(f"   ID: {payment_intent.id}")
        print(f"   Status: {payment_intent.status}")
        print(f"   Amount: ${total} MXN ({amount_cents} centavos)")
        print(f"   Client Secret: {payment_intent.client_secret[:40]}...")
        
        print("\n✨ ¡CHECKOUT COMPLETADO EXITOSAMENTE!")
        print("\n📝 En producción:")
        print("   1. El frontend usaría el client_secret")
        print("   2. Stripe Elements procesaría el pago")
        print("   3. El webhook confirmaría y crearía la orden")
        
        return True
        
    except stripe.error.StripeError as e:
        print(f"❌ Error de Stripe: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == '__main__':
    test_checkout()