# payments/admin.py

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin para transacciones"""
    
    list_display = [
        'id', 'user', 'type', 'amount_mxn', 
        'stripe_id', 'reference_info', 'created_at'
    ]
    list_filter = ['type', 'created_at']
    search_fields = [
        'user__email', 'stripe_id', 'description',
        'reference_id', 'reference_type'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        (_('Usuario'), {
            'fields': ('user',)
        }),
        (_('Transacción'), {
            'fields': ('type', 'amount_mxn', 'description')
        }),
        (_('Stripe'), {
            'fields': ('stripe_id',)
        }),
        (_('Referencia'), {
            'fields': ('reference_id', 'reference_type')
        }),
        (_('Metadata'), {
            'fields': ('metadata',)
        }),
        (_('Fecha'), {
            'fields': ('created_at',)
        }),
    )
    
    readonly_fields = ['created_at']
    
    def reference_info(self, obj):
        """Muestra información de referencia"""
        if obj.reference_type and obj.reference_id:
            return f"{obj.reference_type} #{obj.reference_id}"
        return '-'
    reference_info.short_description = 'Referencia'
    
    def has_add_permission(self, request):
        """No permitir crear transacciones manualmente"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """No permitir eliminar transacciones"""
        return False