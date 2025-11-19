# verify_cognito.py
"""
Autor: Carlo Lara 215661
Fecha: 09/11/2025
Descripción: Script para verificar la cuenta de AWS Cognito ingresando el código enviado por correo.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.authentication import CognitoClient

cognito = CognitoClient()

# Ingresa el código que te llegó por email
username = 'testuser2'
codigo = input("Ingresa el código de verificación: ")

success = cognito.confirm_sign_up(username, codigo)

if success:
    print("✅ Email verificado correctamente!")
    print("Ahora puedes hacer login")
else:
    print("❌ Código inválido o expirado")