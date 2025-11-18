# core/urls.py
"""
Autor: Carlo Lara 215661
Fecha: 04/11/2025
Descripción: Rutas del módulo de autenticación, perfil y recuperación de contraseña.
"""

from django.urls import path
from .views import (
    UserRegistrationView,
    EmailVerificationView,
    UserLoginView,
    UserProfileView,
    UserProfileUpdateView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    UserLogoutView
)

app_name = 'core'

urlpatterns = [
    # Autenticación
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/verify-email/', EmailVerificationView.as_view(), name='verify-email'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/logout/', UserLogoutView.as_view(), name='logout'),
    
    # Perfil
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/profile/update/', UserProfileUpdateView.as_view(), name='profile-update'),
    
    # Password reset
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]