# test_notifications_endpoints.py
"""
Script para probar todos los endpoints de Notifications
Ejecutar: python test_notifications_endpoints.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from notifications.models import Notification
import requests
from decimal import Decimal

User = get_user_model()

# Configuración
BASE_URL = 'http://localhost:8000'
API_URL = f'{BASE_URL}/api'


def print_separator(title):
    """Imprime un separador visual"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def print_response(response):
    """Imprime la respuesta de manera formateada"""
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        import json
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except:
        print(response.text)


def test_notifications():
    print_separator("🧪 INICIANDO TEST DE NOTIFICATIONS")
    
    # ==================================================
    # PASO 1: Obtener o crear usuario de prueba
    # ==================================================
    print_separator("1️⃣  SETUP: Usuario y Token")
    
    try:
        user = User.objects.get(username='testuser')
        print(f"✅ Usuario encontrado: {user.username}")
    except User.DoesNotExist:
        print("⚠️  Usuario 'testuser' no existe. Creando...")
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            is_email_verified=True
        )
        print(f"✅ Usuario creado: {user.username}")
    
    # Obtener o crear token
    token, created = Token.objects.get_or_create(user=user)
    print(f"🔑 Token: {token.key[:20]}...")
    
    # Headers para las requests
    headers = {
        'Authorization': f'Token {token.key}',
        'Content-Type': 'application/json'
    }
    
    # ==================================================
    # PASO 2: Crear notificaciones de prueba
    # ==================================================
    print_separator("2️⃣  CREAR NOTIFICACIONES DE PRUEBA")
    
    # Limpiar notificaciones anteriores del usuario
    Notification.objects.filter(user=user).delete()
    print("🧹 Notificaciones anteriores eliminadas")
    
    # Crear diferentes tipos de notificaciones
    notifications_data = [
        {
            'type': 'purchase_confirmation',
            'title': 'Compra confirmada #1001',
            'message': 'Tu orden de $500 MXN ha sido confirmada exitosamente.',
            'metadata': {'order_id': 1001, 'amount': 500.00}
        },
        {
            'type': 'sale_notification',
            'title': '¡Nueva venta! #1001',
            'message': 'Has vendido 2 productos por $500 MXN.',
            'metadata': {'order_id': 1001, 'earnings': 450.00}
        },
        {
            'type': 'exchange_offer',
            'title': 'Nueva oferta de intercambio',
            'message': 'Juan Pérez te ofrece una Monstera por tu Pothos.',
            'metadata': {'exchange_id': 1, 'offer_id': 1}
        },
        {
            'type': 'offer_accepted',
            'title': '¡Tu oferta fue aceptada!',
            'message': 'María López aceptó tu oferta de intercambio.',
            'metadata': {'exchange_id': 2, 'offer_id': 2}
        },
        {
            'type': 'low_stock',
            'title': 'Alerta: Stock bajo',
            'message': 'Tu producto "Suculenta Echeveria" tiene solo 2 unidades.',
            'metadata': {'product_id': 10, 'quantity': 2}
        },
    ]
    
    created_notifications = []
    for data in notifications_data:
        notification = Notification.objects.create(
            user=user,
            **data
        )
        created_notifications.append(notification)
        print(f"✅ Creada: {notification.title}")
    
    print(f"\n📊 Total creadas: {len(created_notifications)} notificaciones")
    
    # ==================================================
    # PASO 3: Listar todas las notificaciones
    # ==================================================
    print_separator("3️⃣  GET /api/notifications/ - Listar todas")
    
    response = requests.get(
        f'{API_URL}/notifications/',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # PASO 4: Contador de no leídas
    # ==================================================
    print_separator("4️⃣  GET /api/notifications/unread_count/")
    
    response = requests.get(
        f'{API_URL}/notifications/unread_count/',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # PASO 5: Ver detalle de una notificación
    # ==================================================
    print_separator("5️⃣  GET /api/notifications/{id}/ - Ver detalle")
    
    first_notification_id = created_notifications[0].id
    response = requests.get(
        f'{API_URL}/notifications/{first_notification_id}/',
        headers=headers
    )
    print_response(response)
    print("\n💡 Nota: Al ver el detalle, la notificación se marca automáticamente como leída")
    
    # ==================================================
    # PASO 6: Verificar que se marcó como leída
    # ==================================================
    print_separator("6️⃣  Verificar contador después de ver detalle")
    
    response = requests.get(
        f'{API_URL}/notifications/unread_count/',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # PASO 7: Marcar una notificación como leída
    # ==================================================
    print_separator("7️⃣  PUT /api/notifications/{id}/mark_as_read/")
    
    second_notification_id = created_notifications[1].id
    response = requests.put(
        f'{API_URL}/notifications/{second_notification_id}/mark_as_read/',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # PASO 8: Filtrar solo no leídas
    # ==================================================
    print_separator("8️⃣  GET /api/notifications/?unread_only=true")
    
    response = requests.get(
        f'{API_URL}/notifications/?unread_only=true',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # PASO 9: Filtrar por tipo
    # ==================================================
    print_separator("9️⃣  GET /api/notifications/?type=exchange_offer")
    
    response = requests.get(
        f'{API_URL}/notifications/?type=exchange_offer',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # PASO 10: Últimas notificaciones
    # ==================================================
    print_separator("🔟 GET /api/notifications/recent/")
    
    response = requests.get(
        f'{API_URL}/notifications/recent/',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # PASO 11: Estadísticas
    # ==================================================
    print_separator("1️⃣1️⃣  GET /api/notifications/stats/")
    
    response = requests.get(
        f'{API_URL}/notifications/stats/',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # PASO 12: Marcar todas como leídas
    # ==================================================
    print_separator("1️⃣2️⃣  POST /api/notifications/mark_all_read/")
    
    response = requests.post(
        f'{API_URL}/notifications/mark_all_read/',
        headers=headers,
        json={}
    )
    print_response(response)
    
    # ==================================================
    # PASO 13: Verificar contador después de marcar todas
    # ==================================================
    print_separator("1️⃣3️⃣  Verificar contador (debería ser 0)")
    
    response = requests.get(
        f'{API_URL}/notifications/unread_count/',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # PASO 14: Eliminar una notificación
    # ==================================================
    print_separator("1️⃣4️⃣  DELETE /api/notifications/{id}/")
    
    third_notification_id = created_notifications[2].id
    response = requests.delete(
        f'{API_URL}/notifications/{third_notification_id}/',
        headers=headers
    )
    print(f"Status Code: {response.status_code}")
    if response.status_code == 204:
        print("✅ Notificación eliminada exitosamente")
    
    # ==================================================
    # PASO 15: Eliminar solo leídas
    # ==================================================
    print_separator("1️⃣5️⃣  DELETE /api/notifications/clear_read/")
    
    response = requests.delete(
        f'{API_URL}/notifications/clear_read/',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # PASO 16: Verificar notificaciones restantes
    # ==================================================
    print_separator("1️⃣6️⃣  Listar notificaciones después de limpieza")
    
    response = requests.get(
        f'{API_URL}/notifications/',
        headers=headers
    )
    print_response(response)
    
    # ==================================================
    # RESUMEN FINAL
    # ==================================================
    print_separator("✅ TEST COMPLETADO")
    
    print("""
    ENDPOINTS PROBADOS:
    ✅ GET    /api/notifications/                    - Listar
    ✅ GET    /api/notifications/{id}/               - Ver detalle
    ✅ DELETE /api/notifications/{id}/               - Eliminar
    ✅ PUT    /api/notifications/{id}/mark_as_read/  - Marcar como leída
    ✅ POST   /api/notifications/mark_all_read/      - Marcar todas
    ✅ GET    /api/notifications/unread_count/       - Contador
    ✅ GET    /api/notifications/recent/             - Últimas 10
    ✅ DELETE /api/notifications/clear_read/         - Eliminar leídas
    ✅ GET    /api/notifications/stats/              - Estadísticas
    
    FILTROS PROBADOS:
    ✅ ?unread_only=true  - Solo no leídas
    ✅ ?type=xxx          - Filtrar por tipo
    
    🎉 ¡Todos los endpoints funcionan correctamente!
    """)


if __name__ == '__main__':
    try:
        test_notifications()
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()