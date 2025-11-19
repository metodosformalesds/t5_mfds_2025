# test_cognito.py
"""
Autor: Carlo Lara 215661
Fecha: 09/11/2025
Descripción: Script de prueba para registrar un usuario en AWS Cognito y verificar su sign-up.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.authentication import CognitoClient

# Inicializar cliente
cognito = CognitoClient()


print("📧 Registrando usuario en Cognito...")
response = cognito.sign_up(
    username='testuser2',
    email='carlo.lm70@gmail.com',
    password='TestPass123!',
    name='Usuario de Prueba'
)

if response:
    print("✅ Usuario registrado en Cognito!")
    print("📬 Revisa tu email para el código de verificación")
    print(f"UserSub: {response.get('UserSub')}")
else:
    print("❌ Error al registrar en Cognito")