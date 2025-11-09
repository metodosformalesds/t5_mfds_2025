# notifications/serializers.py

from rest_framework import serializers
from .models import Notification
from core.serializers import UserProfileSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer para listado de notificaciones
    Incluye información básica
    """
    
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'type_display', 'title', 'message',
            'is_read', 'metadata', 'created_at', 'read_at', 'time_ago'
        ]
        read_only_fields = ['id', 'type', 'title', 'message', 'created_at', 'read_at']
    
    def get_time_ago(self, obj):
        """Calcula tiempo transcurrido desde la creación"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return 'Hace un momento'
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f'Hace {minutes} minuto{"s" if minutes > 1 else ""}'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'Hace {hours} hora{"s" if hours > 1 else ""}'
        elif diff < timedelta(days=30):
            days = diff.days
            return f'Hace {days} día{"s" if days > 1 else ""}'
        else:
            return obj.created_at.strftime('%d/%m/%Y')


class NotificationDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para detalle completo de notificación
    """
    
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    email_sent_status = serializers.SerializerMethodField()
    push_sent_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'type_display', 'title', 'message',
            'is_read', 'read_at', 'metadata',
            'email_sent', 'email_sent_at', 'email_sent_status',
            'push_sent', 'push_sent_at', 'push_sent_status',
            'created_at'
        ]
        read_only_fields = '__all__'
    
    def get_email_sent_status(self, obj):
        """Status de envío de email"""
        if obj.email_sent and obj.email_sent_at:
            return f'Enviado el {obj.email_sent_at.strftime("%d/%m/%Y %H:%M")}'
        return 'No enviado'
    
    def get_push_sent_status(self, obj):
        """Status de envío de push"""
        if obj.push_sent and obj.push_sent_at:
            return f'Enviado el {obj.push_sent_at.strftime("%d/%m/%Y %H:%M")}'
        return 'No enviado'


class NotificationMarkReadSerializer(serializers.Serializer):
    """
    Serializer para marcar notificaciones como leídas
    """
    
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text='Lista de IDs de notificaciones a marcar como leídas. Si no se proporciona, marca todas.'
    )
    
    def validate_notification_ids(self, value):
        """Validar que las notificaciones existan y pertenezcan al usuario"""
        user = self.context['request'].user
        
        if value:
            # Verificar que todas las notificaciones existan y sean del usuario
            notifications = Notification.objects.filter(
                id__in=value,
                user=user
            )
            
            if notifications.count() != len(value):
                raise serializers.ValidationError(
                    'Algunas notificaciones no existen o no te pertenecen'
                )
        
        return value
    
    def save(self):
        """Marcar notificaciones como leídas"""
        user = self.context['request'].user
        notification_ids = self.validated_data.get('notification_ids')
        
        if notification_ids:
            # Marcar notificaciones específicas
            queryset = Notification.objects.filter(
                id__in=notification_ids,
                user=user,
                is_read=False
            )
        else:
            # Marcar todas las notificaciones del usuario
            queryset = Notification.objects.filter(
                user=user,
                is_read=False
            )
        
        # Actualizar en bulk
        count = 0
        for notification in queryset:
            notification.mark_as_read()
            count += 1
        
        return {
            'marked_count': count,
            'message': f'{count} notificación(es) marcada(s) como leída(s)'
        }