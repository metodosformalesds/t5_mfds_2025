# test_exchanges.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from exchanges.models import Exchange, ExchangeOffer
from decimal import Decimal
import stripe
from django.conf import settings

User = get_user_model()

def test_exchanges():
    print("🧪 INICIANDO TEST DE EXCHANGES\n")
    
    # 1. Obtener usuario y token
    print("1️⃣ Obteniendo usuario...")
    try:
        user = User.objects.get(username='testuser1')
    except User.DoesNotExist:
        print("⚠️ Usuario 'testuser1' no existe. Creando uno...")
        user = User.objects.create_user(
            username='testuser1',
            email='test@example.com',
            password='TestPass123!',
            is_email_verified=True
        )
    
    token, _ = Token.objects.get_or_create(user=user)
    print(f"✅ Usuario: {user.username}")
    print(f"🔑 Token: {token.key[:20]}...\n")
    
    # 2. Crear PaymentIntent de $90 MXN
    print("2️⃣ Creando PaymentIntent en Stripe...")
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=9000,  # $90 MXN en centavos
            currency='mxn',
            payment_method_types=['card'],
            metadata={
                'user_id': user.id,
                'user_email': user.email,
                'type': 'exchange_publication'
            },
            description=f'Publicación de intercambio - SproutMarket - {user.email}'
        )
        
        print(f"✅ PaymentIntent creado!")
        print(f"   ID: {payment_intent.id}")
        print(f"   Status: {payment_intent.status}")
        print(f"   Amount: $90 MXN (9000 centavos)")
        print(f"   Client Secret: {payment_intent.client_secret[:40]}...\n")
        
        # 3. Confirmar pago con token de prueba oficial (tok_visa)
        print("3️⃣ Confirmando pago con tarjeta de prueba...")
        payment_intent = stripe.PaymentIntent.confirm(
            payment_intent.id,
            payment_method='pm_card_visa'
        )
        print(f"✅ Pago confirmado!")
        print(f"   Status final: {payment_intent.status}\n")
        
    except stripe.error.StripeError as e:
        print(f"❌ Error de Stripe: {str(e)}")
        return False
    
    # 4. Crear publicación de intercambio
    print("4️⃣ Creando publicación de intercambio...")
    
    exchange_data = {
        'user': user,
        'plant_common_name': 'Monstera Deliciosa',
        'plant_scientific_name': 'Monstera deliciosa',
        'description': 'Planta hermosa de tamaño mediano, perfecta para interiores. '
                      'Tiene hojas grandes y fenestradas. Muy saludable.',
        'width_cm': Decimal('30.00'),
        'height_cm': Decimal('50.00'),
        'location': 'Ciudad Juárez, Chihuahua - Col. Campestre',
        'stripe_payment_id': payment_intent.id,
        'status': 'active'
    }
    
    exchange = Exchange.objects.create(**exchange_data)
    
    print(f"✅ Exchange creado!")
    print(f"   ID: {exchange.id}")
    print(f"   Planta: {exchange.plant_common_name}")
    print(f"   Ubicación: {exchange.location}")
    print(f"   Status: {exchange.status}")
    print(f"   Payment ID: {exchange.stripe_payment_id[:20]}...\n")
    
    # 5. Registrar transacción
    print("5️⃣ Registrando transacción...")
    from payments.models import Transaction
    
    transaction = Transaction.record_exchange_publication(
        user=user,
        exchange=exchange,
        amount=Decimal('90.00'),
        stripe_id=payment_intent.id
    )
    
    print(f"✅ Transacción registrada!")
    print(f"   ID: {transaction.id}")
    print(f"   Tipo: {transaction.get_type_display()}")
    print(f"   Monto: ${transaction.amount_mxn} MXN\n")
    
    # 6. Crear usuario ofertante
    print("6️⃣ Creando usuario ofertante...")
    try:
        offeror = User.objects.get(username='offeror1')
    except User.DoesNotExist:
        offeror = User.objects.create_user(
            username='offeror1',
            email='offeror@example.com',
            password='TestPass123!',
            is_email_verified=True
        )
    
    print(f"✅ Ofertante: {offeror.username}\n")
    
    # 7. Crear oferta de intercambio
    print("7️⃣ Creando oferta de intercambio...")
    
    if not exchange.can_receive_offers():
        print("❌ El exchange ya tiene 4 ofertas pendientes")
        return False
    
    offer_data = {
        'exchange': exchange,
        'offeror': offeror,
        'plant_common_name': 'Pothos',
        'plant_scientific_name': 'Epipremnum aureum',
        'description': 'Pothos grande y muy sano, con muchas hojas verdes.',
        'width_cm': Decimal('25.00'),
        'height_cm': Decimal('40.00'),
        'status': 'pending'
    }
    
    offer = ExchangeOffer.objects.create(**offer_data)
    
    print(f"✅ Oferta creada!")
    print(f"   ID: {offer.id}")
    print(f"   Planta ofrecida: {offer.plant_common_name}")
    print(f"   Ofertante: {offer.offeror.username}")
    print(f"   Status: {offer.status}\n")
    
    # 8. Verificar contador de ofertas
    print("8️⃣ Verificando contador de ofertas...")
    print(f"   Ofertas pendientes: {exchange.pending_offers_count}/4")
    print(f"   ¿Puede recibir más ofertas?: {exchange.can_receive_offers()}\n")
    
    # 9. Simular aceptar oferta
    print("9️⃣ Simulando aceptación de oferta...")
    
    offer.status = 'accepted'
    offer.save()
    
    exchange.status = 'exchanged'
    exchange.save()
    
    other_offers = exchange.offers.filter(status='pending').exclude(id=offer.id)
    count_rejected = other_offers.update(status='rejected')
    
    print(f"✅ Oferta aceptada!")
    print(f"   Exchange status: {exchange.status}")
    print(f"   Offer status: {offer.status}")
    print(f"   Otras ofertas rechazadas: {count_rejected}\n")
    
    # 10. Mostrar información de contacto (simulado)
    print("🔟 Información de contacto para coordinar intercambio:")
    print("\n📋 Publicador (owner):")
    print(f"   Nombre: {exchange.user.get_full_name() or exchange.user.username}")
    print(f"   Email: {exchange.user.email}")
    print(f"   Teléfono: {exchange.user.phone_number or 'No proporcionado'}")
    print(f"   Ubicación: {exchange.location}")
    
    print("\n📋 Ofertante (offeror):")
    print(f"   Nombre: {offer.offeror.get_full_name() or offer.offeror.username}")
    print(f"   Email: {offer.offeror.email}")
    print(f"   Teléfono: {offer.offeror.phone_number or 'No proporcionado'}")
    
    print("\n✨ ¡EXCHANGE COMPLETADO EXITOSAMENTE!")
    print("\n📊 Resumen:")
    print(f"   - Exchange ID: {exchange.id}")
    print(f"   - Pago procesado: $90 MXN")
    print(f"   - Transacción registrada: #{transaction.id}")
    print(f"   - Oferta aceptada: #{offer.id}")
    print(f"   - Status final: {exchange.status}")
    
    return True


if __name__ == '__main__':
    success = test_exchanges()
    if success:
        print("\n✅ TODAS LAS PRUEBAS PASARON")
    else:
        print("\n❌ ALGUNAS PRUEBAS FALLARON")
