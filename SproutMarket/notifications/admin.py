# notifications/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin para notificaciones"""
    
    list_display = [
        'id', 'user', 'type', 'title', 'status_badge',
        'email_sent', 'push_sent', 'created_at'
    ]
    list_filter = [
        'type', 'is_read', 'email_sent', 'push_sent', 'created_at'
    ]
    search_fields = [
        'user__email', 'title', 'message', 'type'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        (_('Usuario'), {
            'fields': ('user',)
        }),
        (_('Notificación'), {
            'fields': ('type', 'title', 'message')
        }),
        (_('Estado'), {
            'fields': ('is_read', 'read_at')
        }),
        (_('Envío Email'), {
            'fields': ('email_sent', 'email_sent_at')
        }),
        (_('Envío Push'), {
            'fields': ('push_sent', 'push_sent_at')
        }),
        (_('Metadata'), {
            'fields': ('metadata',)
        }),
        (_('Fecha'), {
            'fields': ('created_at',)
        }),
    )
    
    readonly_fields = ['created_at', 'read_at', 'email_sent_at', 'push_sent_at']
    
    def status_badge(self, obj):
        """Muestra badge de estado leído/no leído"""
        if obj.is_read:
            return format_html(
                '<span style="color: green;">✓ Leída</span>'
            )
        return format_html(
            '<span style="color: orange;">● No leída</span>'
        )
    status_badge.short_description = 'Estado'
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        """Acción: marcar como leídas"""
        count = 0
        for notification in queryset:
            if not notification.is_read:
                notification.mark_as_read()
                count += 1
        self.message_user(request, f'{count} notificaciones marcadas como leídas.')
    mark_as_read.short_description = 'Marcar como leídas'
    
    def mark_as_unread(self, request, queryset):
        """Acción: marcar como no leídas"""
        count = queryset.update(is_read=False, read_at=None)
        self.message_user(request, f'{count} notificaciones marcadas como no leídas.')
    mark_as_unread.short_description = 'Marcar como no leídas'