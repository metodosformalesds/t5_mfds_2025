# notifications/models.py

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    """
    Notificaciones enviadas a usuarios por email (SES) y push (SNS).
    Se guardan en DB para historial.
    """
    
    TYPE_CHOICES = [
        ('email_verification', 'Verificación de email'),
        ('purchase_confirmation', 'Confirmación de compra'),
        ('sale_notification', 'Notificación de venta'),
        ('exchange_offer', 'Nueva oferta de intercambio'),
        ('offer_accepted', 'Oferta aceptada'),
        ('offer_rejected', 'Oferta rechazada'),
        ('subscription_renewal', 'Renovación de suscripción'),
        ('subscription_canceled', 'Suscripción cancelada'),
        ('low_stock', 'Alerta de stock bajo'),
        ('withdrawal_completed', 'Retiro completado'),
    ]
    
    # Usuario destinatario
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('usuario'),
        help_text='Usuario que recibe la notificación'
    )
    
    # Tipo y contenido
    type = models.CharField(
        _('tipo'),
        max_length=30,
        choices=TYPE_CHOICES,
        help_text='Tipo de notificación'
    )
    title = models.CharField(
        _('título'),
        max_length=200,
        help_text='Asunto o título de la notificación'
    )
    message = models.TextField(
        _('mensaje'),
        help_text='Contenido de la notificación'
    )
    
    # Estado
    is_read = models.BooleanField(
        _('leída'),
        default=False,
        help_text='Si el usuario ha leído la notificación'
    )
    
    # Metadata adicional
    metadata = models.JSONField(
        _('metadata'),
        default=dict,
        blank=True,
        help_text='Información adicional (IDs, enlaces, etc.)'
    )
    
    # Información de envío
    email_sent = models.BooleanField(
        _('email enviado'),
        default=False,
        help_text='Si se envió por email (SES)'
    )
    push_sent = models.BooleanField(
        _('push enviado'),
        default=False,
        help_text='Si se envió notificación push (SNS)'
    )
    email_sent_at = models.DateTimeField(
        _('email enviado en'),
        null=True,
        blank=True
    )
    push_sent_at = models.DateTimeField(
        _('push enviado en'),
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('creado en'), auto_now_add=True)
    read_at = models.DateTimeField(
        _('leído en'),
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'notifications'
        verbose_name = _('notificación')
        verbose_name_plural = _('notificaciones')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.user.email}"
    
    def mark_as_read(self):
        """Marca la notificación como leída"""
        if not self.is_read:
            self.is_read = True
            from django.utils import timezone
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    @classmethod
    def create_and_send(cls, user, type, title, message, metadata=None):
        """
        Crea una notificación y la envía por email y/o push.
        Este método será implementado en notifications/services.py
        """
        notification = cls.objects.create(
            user=user,
            type=type,
            title=title,
            message=message,
            metadata=metadata or {}
        )
        
        # TODO: Implementar envío real en Día 7
        # from notifications.services import send_email, send_push
        # send_email(notification)
        # send_push(notification)
        
        return notification