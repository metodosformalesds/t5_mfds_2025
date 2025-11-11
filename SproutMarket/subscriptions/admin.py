# subscriptions/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """Admin para suscripciones premium"""
    
    list_display = [
        'id', 'user_email', 'status_badge', 'is_active',
        'current_period_end', 'created_at'
    ]
    list_filter = [
        'status', 'created_at', 'current_period_end'
    ]
    search_fields = [
        'user__email', 'user__username',
        'stripe_subscription_id', 'stripe_customer_id'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        (_('Usuario'), {
            'fields': ('user',)
        }),
        (_('Stripe'), {
            'fields': ('stripe_subscription_id', 'stripe_customer_id', 'stripe_price_id')
        }),
        (_('Estado'), {
            'fields': ('status',)
        }),
        (_('Periodo'), {
            'fields': ('current_period_start', 'current_period_end')
        }),
        (_('Cancelación'), {
            'fields': ('canceled_at', 'ended_at')
        }),
        (_('Metadata'), {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def user_email(self, obj):
        """Muestra el email del usuario"""
        return obj.user.email
    user_email.short_description = 'Usuario'
    
    def status_badge(self, obj):
        """Muestra badge de estado con color"""
        colors = {
            'active': 'green',
            'canceled': 'orange',
            'past_due': 'red',
            'unpaid': 'red',
            'trialing': 'blue',
            'incomplete': 'gray',
        }
        
        color = colors.get(obj.status, 'gray')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">● {}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Estado'
    
    def is_active(self, obj):
        """Muestra si la suscripción está activa"""
        if obj.is_active:
            return format_html('<span style="color: green;">✓ Activa</span>')
        return format_html('<span style="color: red;">✗ Inactiva</span>')
    is_active.short_description = 'Activa'
    is_active.boolean = True