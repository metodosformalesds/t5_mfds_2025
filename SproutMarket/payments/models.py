# payments/models.py

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class Transaction(models.Model):
    """
    Registro de todas las transacciones financieras del sistema.
    Centraliza pagos, ventas, comisiones, suscripciones y retiros.
    """
    
    TYPE_CHOICES = [
        ('purchase', 'Compra de producto'),
        ('sale', 'Venta de producto'),
        ('commission', 'Comisión de plataforma'),
        ('subscription', 'Suscripción premium'),
        ('exchange_publication', 'Publicación de intercambio'),
        ('withdrawal', 'Retiro de fondos'),
    ]
    
    # Usuario relacionado
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transactions',
        verbose_name=_('usuario'),
        help_text='Usuario que realizó o recibió la transacción'
    )
    
    # Tipo y monto
    type = models.CharField(
        _('tipo'),
        max_length=30,
        choices=TYPE_CHOICES,
        help_text='Tipo de transacción'
    )
    amount_mxn = models.DecimalField(
        _('monto (MXN)'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        help_text='Monto de la transacción en pesos mexicanos'
    )
    
    # Stripe
    stripe_id = models.CharField(
        _('ID de Stripe'),
        max_length=100,
        blank=True,
        help_text='ID de la transacción en Stripe (PaymentIntent, Transfer, etc.)'
    )
    
    # Referencia a la entidad relacionada
    reference_id = models.IntegerField(
        _('ID de referencia'),
        null=True,
        blank=True,
        help_text='ID de la orden, exchange, subscription, etc.'
    )
    reference_type = models.CharField(
        _('tipo de referencia'),
        max_length=50,
        blank=True,
        help_text='Modelo relacionado: Order, Exchange, etc.'
    )
    
    # Descripción
    description = models.TextField(
        _('descripción'),
        help_text='Descripción legible de la transacción'
    )
    
    # Metadata adicional (opcional)
    metadata = models.JSONField(
        _('metadata'),
        default=dict,
        blank=True,
        help_text='Información adicional en formato JSON'
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('creado en'), auto_now_add=True)
    
    class Meta:
        db_table = 'transactions'
        verbose_name = _('transacción')
        verbose_name_plural = _('transacciones')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['type', '-created_at']),
            models.Index(fields=['stripe_id']),
            models.Index(fields=['reference_id', 'reference_type']),
        ]
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.user.email if self.user else 'N/A'} - ${self.amount_mxn}"
    
    @classmethod
    def record_purchase(cls, user, order, amount, stripe_id):
        """Registra una compra de producto"""
        return cls.objects.create(
            user=user,
            type='purchase',
            amount_mxn=amount,
            stripe_id=stripe_id,
            reference_id=order.id,
            reference_type='Order',
            description=f'Compra de orden #{order.id}'
        )
    
    @classmethod
    def record_sale(cls, seller, order, amount):
        """Registra una venta (90% para el vendedor)"""
        return cls.objects.create(
            user=seller,
            type='sale',
            amount_mxn=amount,
            reference_id=order.id,
            reference_type='Order',
            description=f'Venta de orden #{order.id}'
        )
    
    @classmethod
    def record_commission(cls, order, amount):
        """Registra la comisión de la plataforma (10%)"""
        return cls.objects.create(
            user=None,  # La comisión es para la plataforma
            type='commission',
            amount_mxn=amount,
            reference_id=order.id,
            reference_type='Order',
            description=f'Comisión de orden #{order.id}'
        )
    
    @classmethod
    def record_subscription(cls, user, amount, stripe_id):
        """Registra una suscripción premium"""
        return cls.objects.create(
            user=user,
            type='subscription',
            amount_mxn=amount,
            stripe_id=stripe_id,
            description='Suscripción premium mensual'
        )
    
    @classmethod
    def record_exchange_publication(cls, user, exchange, amount, stripe_id):
        """Registra el pago de publicación de intercambio ($90 MXN)"""
        return cls.objects.create(
            user=user,
            type='exchange_publication',
            amount_mxn=amount,
            stripe_id=stripe_id,
            reference_id=exchange.id,
            reference_type='Exchange',
            description=f'Publicación de intercambio: {exchange.plant_common_name}'
        )
    
    @classmethod
    def record_withdrawal(cls, user, amount, stripe_id):
        """Registra un retiro de fondos"""
        return cls.objects.create(
            user=user,
            type='withdrawal',
            amount_mxn=amount,
            stripe_id=stripe_id,
            description=f'Retiro de fondos'
        )