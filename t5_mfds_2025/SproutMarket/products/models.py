# products/models.py

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from core.models import Category


class Product(models.Model):
    """
    Producto en venta en el marketplace.
    Un vendedor puede publicar hasta 10 productos gratis, 40 si es premium.
    """
    
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('out_of_stock', 'Agotado'),
        ('deleted', 'Eliminado')
    ]
    
    # Relaciones
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('vendedor'),
        help_text='Usuario que vende este producto'
    )
    categories = models.ManyToManyField(
        Category,
        related_name='products',
        verbose_name=_('categorías'),
        help_text='Categorías a las que pertenece (máximo 3)'
    )
    
    # Información básica
    common_name = models.CharField(
        _('nombre común'),
        max_length=200,
        help_text='Nombre común del producto'
    )
    scientific_name = models.CharField(
        _('nombre científico'),
        max_length=200,
        blank=True,
        help_text='Nombre científico (solo para plantas y semillas)'
    )
    description = models.TextField(
        _('descripción'),
        help_text='Descripción detallada del producto'
    )
    
    # Inventario y precio
    quantity = models.IntegerField(
        _('cantidad disponible'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Cantidad en stock'
    )
    price_mxn = models.DecimalField(
        _('precio MXN'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        help_text='Precio en pesos mexicanos'
    )
    
    # Dimensiones (opcionales)
    width_cm = models.DecimalField(
        _('ancho (cm)'),
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text='Ancho en centímetros'
    )
    height_cm = models.DecimalField(
        _('alto (cm)'),
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text='Alto en centímetros'
    )
    weight_kg = models.DecimalField(
        _('peso (kg)'),
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text='Peso en kilogramos'
    )
    
    # Imágenes (máximo 3)
    image1 = models.ImageField(
        _('imagen 1'),
        upload_to='products/',
        blank=True,
        null=True,
        help_text='Primera imagen del producto (principal)'
    )
    image2 = models.ImageField(
        _('imagen 2'),
        upload_to='products/',
        blank=True,
        null=True,
        help_text='Segunda imagen del producto'
    )
    image3 = models.ImageField(
        _('imagen 3'),
        upload_to='products/',
        blank=True,
        null=True,
        help_text='Tercera imagen del producto'
    )
    
    # Estado y métricas
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text='Estado actual del producto'
    )
    view_count = models.IntegerField(
        _('vistas'),
        default=0,
        help_text='Número de veces que se ha visto el producto'
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('creado en'), auto_now_add=True)
    updated_at = models.DateTimeField(_('actualizado en'), auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = _('producto')
        verbose_name_plural = _('productos')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller', 'status']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['-view_count']),
            models.Index(fields=['price_mxn']),
        ]
    
    def __str__(self):
        return f"{self.common_name} - ${self.price_mxn}"
    
    def save(self, *args, **kwargs):
        """Auto-marcar como agotado si quantity = 0"""
        if self.quantity == 0 and self.status == 'active':
            self.status = 'out_of_stock'
        elif self.quantity > 0 and self.status == 'out_of_stock':
            self.status = 'active'
        super().save(*args, **kwargs)
    
    @property
    def is_available(self):
        """Verifica si el producto está disponible para compra"""
        return self.status == 'active' and self.quantity > 0
    
    @property
    def main_image(self):
        """Retorna la primera imagen disponible"""
        return self.image1 or self.image2 or self.image3
    
    def increment_views(self):
        """Incrementa el contador de vistas"""
        self.view_count += 1
        self.save(update_fields=['view_count'])


class Cart(models.Model):
    """
    Carrito de compras persistente.
    Cada usuario tiene un único carrito que se guarda en la DB.
    """
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart',
        verbose_name=_('usuario')
    )
    items = models.JSONField(
        _('items'),
        default=list,
        help_text='Lista de items: [{"product_id": 1, "quantity": 2}, ...]'
    )
    created_at = models.DateTimeField(_('creado en'), auto_now_add=True)
    updated_at = models.DateTimeField(_('actualizado en'), auto_now=True)
    
    class Meta:
        db_table = 'carts'
        verbose_name = _('carrito')
        verbose_name_plural = _('carritos')
    
    def __str__(self):
        return f"Carrito de {self.user.email}"
    
    def get_total_items(self):
        """Retorna el número total de items en el carrito"""
        return sum(item['quantity'] for item in self.items)
    
    def clear(self):
        """Vacía el carrito"""
        self.items = []
        self.save()


class Order(models.Model):
    """
    Orden de compra confirmada.
    Se crea después de procesar el pago con Stripe.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('completed', 'Completada'),
        ('canceled', 'Cancelada'),
    ]
    
    # Relación con comprador
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='orders',
        verbose_name=_('comprador')
    )
    
    # Información del comprador (capturada en checkout)
    buyer_name = models.CharField(_('nombre del comprador'), max_length=200)
    buyer_phone = models.CharField(_('teléfono del comprador'), max_length=15)
    buyer_address = models.TextField(_('dirección de entrega'))
    
    # Items de la orden (denormalizado para histórico)
    items = models.JSONField(
        _('items'),
        help_text='Lista de productos comprados con detalles'
    )
    
    # Totales
    subtotal_mxn = models.DecimalField(
        _('subtotal'),
        max_digits=10,
        decimal_places=2,
        help_text='Subtotal sin comisión'
    )
    commission_mxn = models.DecimalField(
        _('comisión (10%)'),
        max_digits=10,
        decimal_places=2,
        help_text='Comisión de la plataforma (10%)'
    )
    total_mxn = models.DecimalField(
        _('total'),
        max_digits=10,
        decimal_places=2,
        help_text='Total pagado por el comprador'
    )
    
    # Stripe
    stripe_payment_id = models.CharField(
        _('ID de pago Stripe'),
        max_length=100,
        help_text='PaymentIntent ID de Stripe'
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
        db_table = 'orders'
        verbose_name = _('orden')
        verbose_name_plural = _('órdenes')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['buyer', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['stripe_payment_id']),
        ]
    
    def __str__(self):
        return f"Orden #{self.id} - {self.buyer_name} - ${self.total_mxn}"
    
    @property
    def seller_earnings(self):
        """Calcula lo que recibe el vendedor (90% del subtotal)"""
        return self.subtotal_mxn - self.commission_mxn