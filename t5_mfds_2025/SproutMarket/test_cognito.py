# test_cognito.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.authentication import CognitoClient

# Inicializar cliente
cognito = CognitoClient()

# Probar registro (usa TU email real para recibir código)
print("📧 Registrando usuario en Cognito...")
response = cognito.sign_up(
    username='testuser2',
    email='carlo.lm70@gmail.com',  # ← CAMBIA ESTO
    password='TestPass123!',
    name='Usuario de Prueba'
)

if response:
    print("✅ Usuario registrado en Cognito!")
    print("📬 Revisa tu email para el código de verificación")
    print(f"UserSub: {response.get('UserSub')}")
else:
    print("❌ Error al registrar en Cognito")