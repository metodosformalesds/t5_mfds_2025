# products/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Product, Cart, Order


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin para productos"""
    
    list_display = [
        'id', 'common_name', 'seller', 'price_mxn', 
        'quantity', 'status', 'view_count', 'image_thumbnail', 'created_at'
    ]
    list_filter = ['status', 'categories', 'created_at']
    search_fields = ['common_name', 'scientific_name', 'description', 'seller__email']
    ordering = ['-created_at']
    filter_horizontal = ['categories']
    
    fieldsets = (
        (_('Información Básica'), {
            'fields': ('seller', 'common_name', 'scientific_name', 'description')
        }),
        (_('Categorías'), {
            'fields': ('categories',)
        }),
        (_('Inventario y Precio'), {
            'fields': ('quantity', 'price_mxn')
        }),
        (_('Dimensiones'), {
            'fields': ('width_cm', 'height_cm', 'weight_kg')
        }),
        (_('Imágenes'), {
            'fields': ('image1', 'image2', 'image3')
        }),
        (_('Estado'), {
            'fields': ('status', 'view_count')
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'view_count']
    
    def image_thumbnail(self, obj):
        """Muestra miniatura de la imagen principal"""
        if obj.image1:
            return format_html('<img src="{}" width="50" height="50" />', obj.image1.url)
        return '-'
    image_thumbnail.short_description = 'Imagen'


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Admin para carritos"""
    
    list_display = ['id', 'user', 'items_count', 'updated_at']
    search_fields = ['user__email', 'user__username']
    ordering = ['-updated_at']
    
    fieldsets = (
        (_('Usuario'), {
            'fields': ('user',)
        }),
        (_('Items'), {
            'fields': ('items',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def items_count(self, obj):
        """Muestra el número de items en el carrito"""
        return obj.get_total_items()
    items_count.short_description = 'Items'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin para órdenes"""
    
    list_display = [
        'id', 'buyer', 'buyer_name', 'total_mxn', 
        'status', 'stripe_payment_id', 'created_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = [
        'buyer__email', 'buyer_name', 'buyer_phone', 
        'stripe_payment_id'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        (_('Comprador'), {
            'fields': ('buyer', 'buyer_name', 'buyer_phone', 'buyer_address')
        }),
        (_('Items'), {
            'fields': ('items',)
        }),
        (_('Totales'), {
            'fields': ('subtotal_mxn', 'commission_mxn', 'total_mxn')
        }),
        (_('Pago'), {
            'fields': ('stripe_payment_id',)
        }),
        (_('Estado'), {
            'fields': ('status',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']