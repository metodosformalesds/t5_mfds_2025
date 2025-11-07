# exchanges/models.py

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class Exchange(models.Model):
    """
    Publicación de intercambio de plantas.
    Requiere pago único de $90 MXN para publicar.
    """
    
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('exchanged', 'Intercambiado'),
        ('canceled', 'Cancelado'),
    ]
    
    # Usuario que publica
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exchanges',
        verbose_name=_('publicador'),
        help_text='Usuario que ofrece la planta para intercambio'
    )
    
    # Información de la planta
    plant_common_name = models.CharField(
        _('nombre común de la planta'),
        max_length=200,
        help_text='Nombre común de la planta ofrecida'
    )
    plant_scientific_name = models.CharField(
        _('nombre científico'),
        max_length=200,
        help_text='Nombre científico de la planta'
    )
    description = models.TextField(
        _('descripción'),
        help_text='Descripción detallada de la planta y condiciones'
    )
    
    # Dimensiones
    width_cm = models.DecimalField(
        _('ancho (cm)'),
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text='Ancho de la planta en centímetros'
    )
    height_cm = models.DecimalField(
        _('alto (cm)'),
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text='Alto de la planta en centímetros'
    )
    
    # Ubicación para coordinar intercambio
    location = models.TextField(
        _('ubicación'),
        help_text='Zona o dirección para coordinar el intercambio'
    )
    
    # Imágenes (máximo 3)
    image1 = models.ImageField(
        _('imagen 1'),
        upload_to='exchanges/',
        blank=True,
        null=True,
        help_text='Primera imagen de la planta'
    )
    image2 = models.ImageField(
        _('imagen 2'),
        upload_to='exchanges/',
        blank=True,
        null=True,
        help_text='Segunda imagen de la planta'
    )
    image3 = models.ImageField(
        _('imagen 3'),
        upload_to='exchanges/',
        blank=True,
        null=True,
        help_text='Tercera imagen de la planta'
    )
    
    # Pago y estado
    stripe_payment_id = models.CharField(
        _('ID de pago Stripe'),
        max_length=100,
        help_text='PaymentIntent ID del pago de $90 MXN (no reembolsable)'
    )
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text='Estado actual de la publicación'
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('creado en'), auto_now_add=True)
    updated_at = models.DateTimeField(_('actualizado en'), auto_now=True)
    
    class Meta:
        db_table = 'exchanges'
        verbose_name = _('intercambio')
        verbose_name_plural = _('intercambios')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.plant_common_name} - {self.user.email}"
    
    @property
    def is_active(self):
        """Verifica si la publicación está activa"""
        return self.status == 'active'
    
    @property
    def pending_offers_count(self):
        """Cuenta ofertas pendientes (máximo 4)"""
        return self.offers.filter(status='pending').count()
    
    def can_receive_offers(self):
        """Verifica si puede recibir más ofertas (máximo 4 pendientes)"""
        return self.is_active and self.pending_offers_count < 4
    
    @property
    def main_image(self):
        """Retorna la primera imagen disponible"""
        return self.image1 or self.image2 or self.image3


class ExchangeOffer(models.Model):
    """
    Oferta de intercambio hecha por otro usuario.
    Máximo 4 ofertas pendientes por publicación.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptada'),
        ('rejected', 'Rechazada'),
    ]
    
    # Relaciones
    exchange = models.ForeignKey(
        Exchange,
        on_delete=models.CASCADE,
        related_name='offers',
        verbose_name=_('intercambio'),
        help_text='Publicación a la que se hace la oferta'
    )
    offeror = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exchange_offers',
        verbose_name=_('oferente'),
        help_text='Usuario que hace la oferta'
    )
    
    # Información de la planta ofrecida
    plant_common_name = models.CharField(
        _('nombre común de la planta'),
        max_length=200,
        help_text='Nombre común de la planta ofrecida'
    )
    plant_scientific_name = models.CharField(
        _('nombre científico'),
        max_length=200,
        help_text='Nombre científico de la planta ofrecida'
    )
    description = models.TextField(
        _('descripción'),
        help_text='Descripción de la planta que se ofrece'
    )
    
    # Dimensiones
    width_cm = models.DecimalField(
        _('ancho (cm)'),
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    height_cm = models.DecimalField(
        _('alto (cm)'),
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    
    # Imágenes de la planta ofrecida (máximo 3)
    image1 = models.ImageField(
        _('imagen 1'),
        upload_to='exchange_offers/',
        blank=True,
        null=True
    )
    image2 = models.ImageField(
        _('imagen 2'),
        upload_to='exchange_offers/',
        blank=True,
        null=True
    )
    image3 = models.ImageField(
        _('imagen 3'),
        upload_to='exchange_offers/',
        blank=True,
        null=True
    )
    
    # Estado
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('creado en'), auto_now_add=True)
    updated_at = models.DateTimeField(_('actualizado en'), auto_now=True)
    
    class Meta:
        db_table = 'exchange_offers'
        verbose_name = _('oferta de intercambio')
        verbose_name_plural = _('ofertas de intercambio')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['exchange', 'status']),
            models.Index(fields=['offeror', 'status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['exchange', 'offeror'],
                condition=models.Q(status='pending'),
                name='unique_pending_offer_per_user'
            )
        ]
    
    def __str__(self):
        return f"Oferta de {self.offeror.email} para {self.exchange.plant_common_name}"
    
    @property
    def main_image(self):
        """Retorna la primera imagen disponible"""
        return self.image1 or self.image2 or self.image3