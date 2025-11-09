# test_ses_sns_notifications.py
"""
Script para probar el envío REAL de notificaciones con SES y SNS
Ejecutar: python test_ses_sns_notifications.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from notifications.services import (
    EmailService,
    PushNotificationService,
    NotificationService,
    send_purchase_confirmation,
    send_sale_notification,
    send_exchange_offer_notification
)
from notifications.models import Notification
from products.models import Order
from exchanges.models import Exchange, ExchangeOffer
from decimal import Decimal

User = get_user_model()


def print_separator(title):
    """Imprime un separador visual"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def test_email_service():
    """Prueba el servicio de email (AWS SES)"""
    print_separator("📧 TEST 1: AWS SES - Envío de Email")
    
    # Obtener usuario de prueba
    try:
        user = User.objects.filter(is_email_verified=True).first()
        if not user:
            print("❌ No hay usuarios con email verificado")
            print("💡 Crea un usuario con email verificado primero")
            return False
    except Exception as e:
        print(f"❌ Error al obtener usuario: {e}")
        return False
    
    print(f"👤 Usuario: {user.email}")
    print(f"📧 Email destino: {user.email}")
    
    # Enviar email de prueba
    email_service = EmailService()
    
    subject = "🧪 Test de SproutMarket - AWS SES"
    message = """
Hola desde SproutMarket!

Este es un email de prueba para verificar que AWS SES está funcionando correctamente.

Si recibes este email, significa que:
✅ Las credenciales de AWS están configuradas
✅ El email fue verificado en SES
✅ El servicio de notificaciones funciona

Saludos,
Equipo SproutMarket
    """
    
    print("\n📤 Enviando email...")
    response = email_service.send_email(
        to_email=user.email,
        subject=subject,
        message=message.strip()
    )
    
    if response:
        print("✅ EMAIL ENVIADO EXITOSAMENTE!")
        print(f"📊 Message ID: {response.get('MessageId', 'N/A')}")
        print(f"💡 Revisa tu bandeja de entrada: {user.email}")
        return True
    else:
        print("❌ ERROR al enviar email")
        print("\n🔍 POSIBLES CAUSAS:")
        print("1. AWS_ACCESS_KEY_ID o AWS_SECRET_ACCESS_KEY incorrectos")
        print("2. Email no verificado en AWS SES")
        print("3. Cuenta de SES en modo Sandbox (solo emails verificados)")
        print("4. Region incorrecta en AWS_SES_REGION")
        return False


def test_sns_service():
    """Prueba el servicio de push (AWS SNS)"""
    print_separator("📱 TEST 2: AWS SNS - Push Notification")
    
    push_service = PushNotificationService()
    
    if not push_service.topic_arn:
        print("⚠️  SNS_TOPIC_ARN no configurado en .env")
        print("💡 Para probar SNS, necesitas:")
        print("   1. Crear un SNS Topic en AWS Console")
        print("   2. Agregar SNS_TOPIC_ARN en tu .env")
        print("   3. Suscribirte al topic (email, SMS, etc.)")
        return False
    
    print(f"📡 Topic ARN: {push_service.topic_arn[:50]}...")
    
    subject = "🧪 Test SproutMarket"
    message = "Push notification de prueba desde SproutMarket"
    
    print("\n📤 Enviando push notification...")
    response = push_service.send_push(
        subject=subject,
        message=message
    )
    
    if response:
        print("✅ PUSH ENVIADO EXITOSAMENTE!")
        print(f"📊 Message ID: {response.get('MessageId', 'N/A')}")
        print(f"💡 Revisa tus suscripciones al topic SNS")
        return True
    else:
        print("❌ ERROR al enviar push")
        return False


def test_notification_service():
    """Prueba el servicio unificado de notificaciones"""
    print_separator("🔔 TEST 3: NotificationService - Email + Push + DB")
    
    # Obtener usuario de prueba
    try:
        user = User.objects.filter(is_email_verified=True).first()
        if not user:
            print("❌ No hay usuarios con email verificado")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    print(f"👤 Usuario: {user.email}")
    
    # Enviar notificación completa
    notification_service = NotificationService()
    
    result = notification_service.notify_user(
        user=user,
        notification_type='purchase_confirmation',
        subject='🧪 Test de Notificación Completa',
        message='Este es un test del sistema unificado de notificaciones.',
        metadata={'test': True, 'timestamp': 'now'},
        send_email=True,
        send_push=False  # Cambiar a True si tienes SNS configurado
    )
    
    print("\n📊 RESULTADO:")
    print(f"   Email enviado: {'✅ Sí' if result['email_sent'] else '❌ No'}")
    print(f"   Push enviado: {'✅ Sí' if result['push_sent'] else '❌ No'}")
    print(f"   Guardado en DB: {'✅ Sí' if result['notification_id'] else '❌ No'}")
    
    if result['notification_id']:
        notification = Notification.objects.get(id=result['notification_id'])
        print(f"   ID notificación: {notification.id}")
        print(f"   Tipo: {notification.get_type_display()}")
    
    return result['email_sent'] or result['push_sent']


def test_purchase_notification():
    """Prueba notificación de compra (escenario real)"""
    print_separator("🛒 TEST 4: Notificación de Compra (Escenario Real)")
    
    # Buscar o crear una orden de prueba
    try:
        order = Order.objects.first()
        if not order:
            print("⚠️  No hay órdenes en la base de datos")
            print("💡 Crea una orden primero con el flujo de checkout")
            return False
        
        buyer = order.buyer
        if not buyer or not buyer.is_email_verified:
            print("❌ La orden no tiene un comprador con email verificado")
            return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    print(f"📦 Orden: #{order.id}")
    print(f"👤 Comprador: {buyer.email}")
    print(f"💰 Total: ${order.total_mxn} MXN")
    
    # Enviar notificación
    print("\n📤 Enviando notificación de compra...")
    result = send_purchase_confirmation(order, buyer)
    
    if result['email_sent']:
        print("✅ Notificación de compra enviada!")
        print(f"💡 Revisa el email: {buyer.email}")
        return True
    else:
        print("❌ No se pudo enviar la notificación")
        return False


def test_ses_configuration():
    """Verifica la configuración de SES"""
    print_separator("🔧 VERIFICACIÓN DE CONFIGURACIÓN SES")
    
    from django.conf import settings
    
    print("📋 Configuración actual:")
    print(f"   AWS_ACCESS_KEY_ID: {'✅ Configurado' if settings.AWS_ACCESS_KEY_ID else '❌ Falta'}")
    print(f"   AWS_SECRET_ACCESS_KEY: {'✅ Configurado' if settings.AWS_SECRET_ACCESS_KEY else '❌ Falta'}")
    print(f"   AWS_SES_REGION: {settings.AWS_SES_REGION}")
    print(f"   DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    
    print("\n📧 Estado de SES:")
    
    # Intentar conectarse a SES
    try:
        import boto3
        from botocore.exceptions import ClientError
        
        ses_client = boto3.client(
            'ses',
            region_name=settings.AWS_SES_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        # Verificar identidades verificadas
        response = ses_client.list_verified_email_addresses()
        verified_emails = response.get('VerifiedEmailAddresses', [])
        
        print(f"   ✅ Conexión exitosa con SES")
        print(f"   📧 Emails verificados: {len(verified_emails)}")
        
        if verified_emails:
            print("\n   Emails verificados en SES:")
            for email in verified_emails:
                print(f"      • {email}")
        else:
            print("\n   ⚠️  No hay emails verificados en SES")
            print("   💡 Debes verificar al menos un email en AWS SES Console")
        
        # Verificar si está en sandbox
        try:
            account_details = ses_client.get_account_sending_enabled()
            print(f"\n   Estado de la cuenta: {'✅ Activa' if account_details.get('Enabled') else '❌ Deshabilitada'}")
        except:
            print("\n   ℹ️  No se pudo verificar el estado de la cuenta")
        
        return True
        
    except ClientError as e:
        print(f"   ❌ Error de AWS: {e.response['Error']['Message']}")
        return False
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False


def main():
    """Ejecuta todos los tests"""
    print_separator("🧪 INICIANDO TESTS DE SES Y SNS")
    
    results = {
        'ses_config': False,
        'email': False,
        'sns': False,
        'unified': False,
        'purchase': False
    }
    
    # Test 1: Verificar configuración
    results['ses_config'] = test_ses_configuration()
    
    # Test 2: Enviar email
    if results['ses_config']:
        results['email'] = test_email_service()
    else:
        print("\n⏭️  Saltando test de email (configuración incompleta)")
    
    # Test 3: SNS
    results['sns'] = test_sns_service()
    
    # Test 4: Servicio unificado
    if results['ses_config']:
        results['unified'] = test_notification_service()
    
    # Test 5: Notificación de compra real
    if results['ses_config']:
        results['purchase'] = test_purchase_notification()
    
    # Resumen final
    print_separator("📊 RESUMEN DE TESTS")
    
    print("\nRESULTADOS:")
    print(f"   {'✅' if results['ses_config'] else '❌'} Configuración de SES")
    print(f"   {'✅' if results['email'] else '❌'} Envío de Email (SES)")
    print(f"   {'✅' if results['sns'] else '⚠️ '} Push Notification (SNS)")
    print(f"   {'✅' if results['unified'] else '❌'} Servicio Unificado")
    print(f"   {'✅' if results['purchase'] else '⚠️ '} Notificación de Compra")
    
    all_passed = all([
        results['ses_config'],
        results['email'],
        results['unified']
    ])
    
    if all_passed:
        print("\n🎉 ¡TODOS LOS TESTS CRÍTICOS PASARON!")
        print("\n✅ Tu sistema de notificaciones está funcionando correctamente")
    else:
        print("\n⚠️  ALGUNOS TESTS FALLARON")
        print("\n📋 PASOS PARA SOLUCIONAR:")
        
        if not results['ses_config']:
            print("\n1. CONFIGURAR AWS SES:")
            print("   • Ve a AWS Console → SES")
            print("   • Verifica tu email en 'Verified identities'")
            print("   • Copia las credenciales de IAM")
            print("   • Agrégalas al archivo .env")
        
        if not results['sns']:
            print("\n2. CONFIGURAR AWS SNS (Opcional):")
            print("   • Ve a AWS Console → SNS")
            print("   • Crea un Topic")
            print("   • Crea suscripciones (email, SMS)")
            print("   • Agrega el ARN del topic en .env")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏸️  Test interrumpido por el usuario")
    except Exception as e:
        print(f"\n❌ ERROR GENERAL: {str(e)}")
        import traceback
        traceback.print_exc()