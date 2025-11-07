# core/authentication.py

import boto3
from django.conf import settings
from django.contrib.auth import get_user_model
from botocore.exceptions import ClientError

User = get_user_model()


class CognitoClient:
    """Cliente para interactuar con AWS Cognito"""
    
    def __init__(self):
        self.client = boto3.client(
            'cognito-idp',
            region_name=settings.COGNITO_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        self.user_pool_id = settings.COGNITO_USER_POOL_ID
        self.client_id = settings.COGNITO_APP_CLIENT_ID
    
    def sign_up(self, username, email, password, **kwargs):
        """
        Registra un nuevo usuario en Cognito
        
        Args:
            username: Nombre de usuario
            email: Email del usuario
            password: Contraseña
            **kwargs: Atributos adicionales (name, phone_number, etc.)
        
        Returns:
            dict: Respuesta de Cognito o None si falla
        """
        try:
            user_attributes = [
                {'Name': 'email', 'Value': email}
            ]
            
            # Agregar atributos adicionales
            if 'name' in kwargs:
                user_attributes.append({'Name': 'name', 'Value': kwargs['name']})
            if 'phone_number' in kwargs:
                user_attributes.append({'Name': 'phone_number', 'Value': kwargs['phone_number']})
            
            response = self.client.sign_up(
                ClientId=self.client_id,
                Username=username,
                Password=password,
                UserAttributes=user_attributes
            )
            
            return response
            
        except ClientError as e:
            print(f"Error en sign_up: {e}")
            return None
    
    def confirm_sign_up(self, username, confirmation_code):
        """
        Confirma el registro con el código enviado por email
        
        Args:
            username: Nombre de usuario
            confirmation_code: Código de verificación
        
        Returns:
            bool: True si se confirmó correctamente
        """
        try:
            self.client.confirm_sign_up(
                ClientId=self.client_id,
                Username=username,
                ConfirmationCode=confirmation_code
            )
            return True
            
        except ClientError as e:
            print(f"Error en confirm_sign_up: {e}")
            return False
    
    def sign_in(self, username, password):
        """
        Autentica usuario en Cognito
        
        Args:
            username: Nombre de usuario o email
            password: Contraseña
        
        Returns:
            dict: Tokens de autenticación o None si falla
        """
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': username,
                    'PASSWORD': password
                }
            )
            
            # Retornar tokens
            return {
                'access_token': response['AuthenticationResult']['AccessToken'],
                'id_token': response['AuthenticationResult']['IdToken'],
                'refresh_token': response['AuthenticationResult']['RefreshToken'],
                'expires_in': response['AuthenticationResult']['ExpiresIn']
            }
            
        except ClientError as e:
            print(f"Error en sign_in: {e}")
            return None
    
    def get_user(self, access_token):
        """
        Obtiene información del usuario desde Cognito
        
        Args:
            access_token: Token de acceso
        
        Returns:
            dict: Atributos del usuario
        """
        try:
            response = self.client.get_user(
                AccessToken=access_token
            )
            
            # Convertir atributos a dict
            user_attributes = {}
            for attr in response['UserAttributes']:
                user_attributes[attr['Name']] = attr['Value']
            
            return {
                'username': response['Username'],
                'attributes': user_attributes
            }
            
        except ClientError as e:
            print(f"Error en get_user: {e}")
            return None
    
    def forgot_password(self, username):
        """Inicia proceso de recuperación de contraseña"""
        try:
            self.client.forgot_password(
                ClientId=self.client_id,
                Username=username
            )
            return True
            
        except ClientError as e:
            print(f"Error en forgot_password: {e}")
            return False
    
    def confirm_forgot_password(self, username, confirmation_code, new_password):
        """Confirma nueva contraseña"""
        try:
            self.client.confirm_forgot_password(
                ClientId=self.client_id,
                Username=username,
                ConfirmationCode=confirmation_code,
                Password=new_password
            )
            return True
            
        except ClientError as e:
            print(f"Error en confirm_forgot_password: {e}")
            return False


# Helper function
def sync_cognito_user_to_db(cognito_user_data):
    """
    Sincroniza usuario de Cognito con base de datos local
    
    Args:
        cognito_user_data: Dict con información del usuario de Cognito
    
    Returns:
        User: Instancia del usuario en Django
    """
    username = cognito_user_data['username']
    attributes = cognito_user_data['attributes']
    
    # Buscar o crear usuario en DB
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': attributes.get('email', ''),
            'first_name': attributes.get('name', '').split()[0] if attributes.get('name') else '',
            'is_email_verified': attributes.get('email_verified', 'false') == 'true'
        }
    )
    
    return user