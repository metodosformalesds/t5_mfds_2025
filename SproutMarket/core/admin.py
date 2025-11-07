# core/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Category


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin personalizado para el modelo User"""
    
    list_display = [
        'email', 'username', 'first_name', 'last_name', 
        'is_premium', 'is_email_verified', 'city', 'created_at'
    ]
    list_filter = [
        'is_premium', 'is_email_verified', 'is_staff', 
        'is_active', 'city'
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name', 'business_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        (_('Información Personal'), {
            'fields': ('first_name', 'last_name', 'email', 'phone_number', 'profile_image')
        }),
        (_('Ubicación'), {
            'fields': ('city', 'state', 'location')
        }),
        (_('Información de Negocio'), {
            'fields': ('business_name',)
        }),
        (_('Premium'), {
            'fields': ('is_premium', 'premium_expires_at')
        }),
        (_('Verificación'), {
            'fields': ('is_email_verified', 'email_verification_token')
        }),
        (_('Stripe'), {
            'fields': ('stripe_customer_id', 'stripe_account_id', 'stripe_subscription_id')
        }),
        (_('Balance'), {
            'fields': ('available_balance_mxn',)
        }),
        (_('Permisos'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('Fechas importantes'), {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'date_joined', 'last_login']
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin para categorías"""
    
    list_display = ['name', 'slug', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'slug', 'description']
    ordering = ['order', 'name']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'icon')
        }),
        (_('Configuración'), {
            'fields': ('order', 'is_active')
        }),
    )
    
    readonly_fields = ['created_at']