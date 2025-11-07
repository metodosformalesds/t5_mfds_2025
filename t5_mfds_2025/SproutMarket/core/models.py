# core/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom User model - Usuario unificado que puede comprar, vender e intercambiar.
    Extiende AbstractUser de Django para agregar campos adicionales.
    """
    
    # Información de contacto
    phone_number = models.CharField(
        _('teléfono'),
        max_length=15,
        blank=True,
        help_text='Número de teléfono de contacto'
    )
    profile_image = models.ImageField(
        _('imagen de perfil'),
        upload_to='profiles/',
        blank=True,
        null=True,
        help_text='Foto de perfil del usuario'
    )
    
    # Ubicación
    city = models.CharField(
        _('ciudad'),
        max_length=100,
        default='Ciudad Juárez'
    )
    state = models.CharField(
        _('estado'),
        max_length=100,
        default='Chihuahua'
    )
    location = models.TextField(
        _('ubicación'),
        blank=True,
        help_text='Dirección completa o zona para coordinar entregas'
    )
    
    # Información de negocio (opcional para vendedores)
    business_name = models.CharField(
        _('nombre del negocio'),
        max_length=200,
        blank=True,
        help_text='Nombre del vivero o negocio (opcional)'
    )
    
    # Plan Premium
    is_premium = models.BooleanField(
        _('es premium'),
        default=False,
        help_text='Usuario con suscripción premium activa'
    )
    premium_expires_at = models.DateTimeField(
        _('premium expira en'),
        null=True,
        blank=True,
        help_text='Fecha de expiración del plan premium'
    )
    
    # Verificación de email
    is_email_verified = models.BooleanField(
        _('email verificado'),
        default=False,
        help_text='Si el usuario ha verificado su email'
    )
    email_verification_token = models.CharField(
        _('token de verificación'),
        max_length=100,
        blank=True,
        help_text='Token para verificar email'
    )
    
    # Integración con Stripe
    stripe_customer_id = models.CharField(
        _('ID de cliente Stripe'),
        max_length=100,
        blank=True,
        help_text='ID del customer en Stripe'
    )
    stripe_account_id = models.CharField(
        _('ID de cuenta Stripe Connect'),
        max_length=100,
        blank=True,
        help_text='ID de la cuenta Connect para recibir pagos'
    )
    stripe_subscription_id = models.CharField(
        _('ID de suscripción Stripe'),
        max_length=100,
        blank=True,
        help_text='ID de la suscripción premium en Stripe'
    )
    
    # Balance disponible
    available_balance_mxn = models.DecimalField(
        _('balance disponible'),
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text='Balance disponible para retirar (después de comisiones)'
    )
    
    # Timestamps adicionales
    created_at = models.DateTimeField(_('creado en'), auto_now_add=True)
    updated_at = models.DateTimeField(_('actualizado en'), auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = _('usuario')
        verbose_name_plural = _('usuarios')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_premium']),
            models.Index(fields=['is_email_verified']),
        ]
    
    def __str__(self):
        return self.email
    
    @property
    def product_limit(self):
        """Límite de productos según plan (10 gratis, 40 premium)"""
        return 40 if self.is_premium else 10
    
    def can_publish_product(self):
        """Verifica si el usuario puede publicar más productos"""
        from products.models import Product  # Import aquí para evitar circular
        current_count = Product.objects.filter(
            seller=self,
            status='active'
        ).count()
        return current_count < self.product_limit
    
    def get_full_name(self):
        """Retorna nombre completo o username si no tiene nombre"""
        full_name = super().get_full_name()
        return full_name if full_name else self.username


class Category(models.Model):
    """
    Categorías fijas del sistema: Plantas, Semillas, Insumos, Herramientas y Accesorios.
    Estas categorías se crean via comando de management y son de solo lectura.
    """
    
    name = models.CharField(
        _('nombre'),
        max_length=100,
        unique=True,
        help_text='Nombre de la categoría'
    )
    slug = models.SlugField(
        _('slug'),
        unique=True,
        help_text='Identificador único para URLs'
    )
    description = models.TextField(
        _('descripción'),
        blank=True,
        help_text='Descripción de la categoría'
    )
    icon = models.CharField(
        _('icono'),
        max_length=50,
        blank=True,
        help_text='Nombre del icono (opcional)'
    )
    order = models.IntegerField(
        _('orden'),
        default=0,
        help_text='Orden de visualización'
    )
    is_active = models.BooleanField(
        _('activo'),
        default=True,
        help_text='Si la categoría está activa'
    )
    created_at = models.DateTimeField(_('creado en'), auto_now_add=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = _('categoría')
        verbose_name_plural = _('categorías')
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name