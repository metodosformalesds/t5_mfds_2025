# core/views.py

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

from .serializers import (
    UserRegistrationSerializer,
    EmailVerificationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)

User = get_user_model()


class UserRegistrationView(APIView):
    """
    POST /api/auth/register
    Registra un nuevo usuario en Cognito y DB local
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            return Response({
                'message': 'Usuario registrado exitosamente',
                'detail': 'Se ha enviado un código de verificación a tu email',
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(APIView):
    """
    POST /api/auth/verify-email
    Verifica el email con el código enviado por Cognito
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            return Response({
                'message': 'Email verificado exitosamente',
                'detail': 'Ya puedes iniciar sesión'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """
    POST /api/auth/login
    Autentica usuario con Cognito y retorna tokens
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = serializer.validated_data['tokens']
            
            # Crear o obtener token de Django REST Framework (opcional)
            django_token, _ = Token.objects.get_or_create(user=user)
            
            return Response({
                'message': 'Login exitoso',
                'user': UserProfileSerializer(user).data,
                'cognito_tokens': {
                    'access_token': tokens['access_token'],
                    'id_token': tokens['id_token'],
                    'refresh_token': tokens['refresh_token'],
                    'expires_in': tokens['expires_in']
                },
                'django_token': django_token.key
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveAPIView):
    """
    GET /api/auth/profile
    Obtiene el perfil del usuario autenticado
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserProfileUpdateView(generics.UpdateAPIView):
    """
    PUT/PATCH /api/auth/profile/update
    Actualiza el perfil del usuario autenticado
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    """
    POST /api/auth/password-reset
    Solicita reset de contraseña (envía código al email)
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    POST /api/auth/password-reset/confirm
    Confirma reset de contraseña con código
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """
    POST /api/auth/logout
    Cierra sesión (invalida token de Django)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Eliminar token de Django
        request.user.auth_token.delete()
        
        return Response({
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)