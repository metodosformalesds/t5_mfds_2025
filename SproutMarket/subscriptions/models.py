# subscriptions/models.py

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Subscription(models.Model):
    """
    Historial de suscripciones premium de usuarios.
    Registra todas las suscripciones creadas, canceladas y renovadas.
    """
    
    STATUS_CHOICES = [
        ('active', 'Activa'),
        ('canceled', 'Cancelada'),
        ('past_due', 'Pago vencido'),
        ('unpaid', 'Sin pagar'),
        ('trialing', 'En periodo de prueba'),
        ('incomplete', 'Incompleta'),
    ]
    
    # Usuario
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        verbose_name=_('usuario'),
        help_text='Usuario dueño de la suscripción'
    )
    
    # Stripe IDs
    stripe_subscription_id = models.CharField(
        _('ID de suscripción Stripe'),
        max_length=100,
        unique=True,
        help_text='ID de la suscripción en Stripe'
    )
    stripe_customer_id = models.CharField(
        _('ID de cliente Stripe'),
        max_length=100,
        help_text='ID del customer en Stripe'
    )
    stripe_price_id = models.CharField(
        _('ID de precio Stripe'),
        max_length=100,
        help_text='ID del price usado (ej: price_xxxxx)'
    )
    
    # Estado
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text='Estado actual de la suscripción'
    )
    
    # Fechas
    current_period_start = models.DateTimeField(
        _('inicio del periodo actual'),
        help_text='Fecha de inicio del periodo de facturación actual'
    )
    current_period_end = models.DateTimeField(
        _('fin del periodo actual'),
        help_text='Fecha de fin del periodo de facturación actual'
    )
    canceled_at = models.DateTimeField(
        _('cancelada en'),
        null=True,
        blank=True,
        help_text='Fecha en que se canceló la suscripción'
    )
    ended_at = models.DateTimeField(
        _('terminada en'),
        null=True,
        blank=True,
        help_text='Fecha en que terminó la suscripción'
    )
    
    # Metadata
    metadata = models.JSONField(
        _('metadata'),
        default=dict,
        blank=True,
        help_text='Información adicional de Stripe'
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('creado en'), auto_now_add=True)
    updated_at = models.DateTimeField(_('actualizado en'), auto_now=True)
    
    class Meta:
        db_table = 'subscriptions'
        verbose_name = _('suscripción')
        verbose_name_plural = _('suscripciones')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['stripe_subscription_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Subscription {self.stripe_subscription_id} - {self.user.email} ({self.status})"
    
    @property
    def is_active(self):
        """Verifica si la suscripción está activa"""
        return self.status == 'active'
    
    def cancel(self):
        """Marca la suscripción como cancelada"""
        from django.utils import timezone
        self.status = 'canceled'
        self.canceled_at = timezone.now()
        self.save()