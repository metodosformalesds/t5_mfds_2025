# exchanges/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Exchange, ExchangeOffer


@admin.register(Exchange)
class ExchangeAdmin(admin.ModelAdmin):
    """Admin para intercambios"""
    
    list_display = [
        'id', 'plant_common_name', 'user', 'status', 
        'pending_offers', 'image_thumbnail', 'created_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = [
        'plant_common_name', 'plant_scientific_name', 
        'user__email', 'location'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        (_('Usuario'), {
            'fields': ('user',)
        }),
        (_('Información de la Planta'), {
            'fields': ('plant_common_name', 'plant_scientific_name', 'description')
        }),
        (_('Dimensiones'), {
            'fields': ('width_cm', 'height_cm')
        }),
        (_('Ubicación'), {
            'fields': ('location',)
        }),
        (_('Imágenes'), {
            'fields': ('image1', 'image2', 'image3')
        }),
        (_('Pago y Estado'), {
            'fields': ('stripe_payment_id', 'status')
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def image_thumbnail(self, obj):
        """Muestra miniatura de la imagen principal"""
        if obj.image1:
            return format_html('<img src="{}" width="50" height="50" />', obj.image1.url)
        return '-'
    image_thumbnail.short_description = 'Imagen'
    
    def pending_offers(self, obj):
        """Muestra el número de ofertas pendientes"""
        return f"{obj.pending_offers_count}/4"
    pending_offers.short_description = 'Ofertas pendientes'


@admin.register(ExchangeOffer)
class ExchangeOfferAdmin(admin.ModelAdmin):
    """Admin para ofertas de intercambio"""
    
    list_display = [
        'id', 'exchange', 'offeror', 'plant_common_name', 
        'status', 'image_thumbnail', 'created_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = [
        'plant_common_name', 'plant_scientific_name',
        'offeror__email', 'exchange__plant_common_name'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        (_('Intercambio y Oferente'), {
            'fields': ('exchange', 'offeror')
        }),
        (_('Planta Ofrecida'), {
            'fields': ('plant_common_name', 'plant_scientific_name', 'description')
        }),
        (_('Dimensiones'), {
            'fields': ('width_cm', 'height_cm')
        }),
        (_('Imágenes'), {
            'fields': ('image1', 'image2', 'image3')
        }),
        (_('Estado'), {
            'fields': ('status',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def image_thumbnail(self, obj):
        """Muestra miniatura de la imagen principal"""
        if obj.image1:
            return format_html('<img src="{}" width="50" height="50" />', obj.image1.url)
        return '-'
    image_thumbnail.short_description = 'Imagen'