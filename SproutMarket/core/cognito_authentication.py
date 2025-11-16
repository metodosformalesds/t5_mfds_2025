# core/cognito_authentication.py

from rest_framework import authentication, exceptions
from django.conf import settings
from .authentication import CognitoClient, sync_cognito_user_to_db


class CognitoAuthentication(authentication.BaseAuthentication):
    """
    Autenticación usando tokens de AWS Cognito.
    
    Valida el access_token enviado en el header Authorization
    contra AWS Cognito y sincroniza el usuario con la DB local.
    """
    
    def authenticate(self, request):
        """
        Autentica la solicitud usando el token de Cognito.
        
        Returns:
            tuple: (user, token) si la autenticación es exitosa
            None: si no hay header de autorización
        
        Raises:
            AuthenticationFailed: si el token es inválido
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        # Si no hay header Authorization, continuar sin autenticar
        if not auth_header:
            return None
        
        # Verificar formato "Bearer <token>"
        if not auth_header.startswith('Bearer '):
            raise exceptions.AuthenticationFailed('Formato de autorización inválido. Use: Bearer <token>')
        
        try:
            # Extraer el token
            access_token = auth_header.split(' ')[1]
        except IndexError:
            raise exceptions.AuthenticationFailed('Token no proporcionado')
        
        # Validar token con Cognito
        cognito = CognitoClient()
        user_data = cognito.get_user(access_token)
        
        if not user_data:
            raise exceptions.AuthenticationFailed('Token inválido o expirado')
        
        # Sincronizar usuario con DB local
        try:
            user = sync_cognito_user_to_db(user_data)
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Error al sincronizar usuario: {str(e)}')
        
        # Retornar usuario autenticado y token
        return (user, access_token)
    
    def authenticate_header(self, request):
        """
        Retorna el tipo de autenticación para el header WWW-Authenticate
        """
        return 'Bearer realm="api"'