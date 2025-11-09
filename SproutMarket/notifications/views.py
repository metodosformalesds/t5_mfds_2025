# notifications/views.py

from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone

from .models import Notification
from .serializers import (
    NotificationSerializer,
    NotificationDetailSerializer,
    NotificationMarkReadSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para notificaciones del usuario
    
    list: GET /api/notifications/ - Listar mis notificaciones
    retrieve: GET /api/notifications/{id}/ - Ver detalle
    destroy: DELETE /api/notifications/{id}/ - Eliminar notificación
    
    Acciones adicionales:
    - mark_as_read: PUT /api/notifications/{id}/mark_as_read/
    - mark_all_read: POST /api/notifications/mark_all_read/
    - unread_count: GET /api/notifications/unread_count/
    - clear_all: DELETE /api/notifications/clear_all/
    """
    
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']  # Más recientes primero
    
    def get_queryset(self):
        """Solo notificaciones del usuario autenticado"""
        queryset = Notification.objects.filter(user=self.request.user)
        
        # Filtro: solo no leídas
        unread_only = self.request.query_params.get('unread_only')
        if unread_only and unread_only.lower() == 'true':
            queryset = queryset.filter(is_read=False)
        
        # Filtro: por tipo
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(type=notification_type)
        
        return queryset
    
    def get_serializer_class(self):
        """Seleccionar serializer según la acción"""
        if self.action == 'retrieve':
            return NotificationDetailSerializer
        return NotificationSerializer
    
    def list(self, request):
        """
        GET /api/notifications/
        
        Query params:
        - ?unread_only=true - Solo notificaciones no leídas
        - ?type=purchase_confirmation - Filtrar por tipo
        - ?page=1 - Paginación
        """
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """
        GET /api/notifications/{id}/
        
        Ver detalle de notificación (automáticamente la marca como leída)
        """
        notification = self.get_object()
        
        # Marcar como leída automáticamente al ver el detalle
        if not notification.is_read:
            notification.mark_as_read()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    def destroy(self, request, pk=None):
        """
        DELETE /api/notifications/{id}/
        
        Eliminar una notificación
        """
        notification = self.get_object()
        notification.delete()
        
        return Response(
            {'message': 'Notificación eliminada exitosamente'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['put', 'patch'])
    def mark_as_read(self, request, pk=None):
        """
        PUT /api/notifications/{id}/mark_as_read/
        
        Marcar una notificación específica como leída
        """
        notification = self.get_object()
        
        if notification.is_read:
            return Response({
                'message': 'La notificación ya estaba marcada como leída'
            })
        
        notification.mark_as_read()
        
        return Response({
            'message': 'Notificación marcada como leída',
            'notification': NotificationSerializer(notification).data
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """
        POST /api/notifications/mark_all_read/
        
        Marcar todas las notificaciones como leídas
        O marcar solo algunas específicas
        
        Body (opcional):
        {
            "notification_ids": [1, 2, 3]
        }
        """
        serializer = NotificationMarkReadSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = serializer.save()
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        GET /api/notifications/unread_count/
        
        Obtener el número de notificaciones no leídas
        """
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        return Response({
            'unread_count': count
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        GET /api/notifications/recent/
        
        Obtener las últimas 10 notificaciones
        """
        queryset = self.get_queryset()[:10]
        serializer = self.get_serializer(queryset, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """
        DELETE /api/notifications/clear_all/
        
        Eliminar TODAS las notificaciones del usuario
        (Usar con precaución)
        """
        count = Notification.objects.filter(user=request.user).count()
        Notification.objects.filter(user=request.user).delete()
        
        return Response({
            'message': f'{count} notificación(es) eliminada(s) exitosamente',
            'deleted_count': count
        })
    
    @action(detail=False, methods=['delete'])
    def clear_read(self, request):
        """
        DELETE /api/notifications/clear_read/
        
        Eliminar solo las notificaciones ya leídas
        """
        queryset = Notification.objects.filter(
            user=request.user,
            is_read=True
        )
        count = queryset.count()
        queryset.delete()
        
        return Response({
            'message': f'{count} notificación(es) leída(s) eliminada(s)',
            'deleted_count': count
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        GET /api/notifications/stats/
        
        Estadísticas de notificaciones del usuario
        """
        user_notifications = Notification.objects.filter(user=request.user)
        
        total = user_notifications.count()
        unread = user_notifications.filter(is_read=False).count()
        read = user_notifications.filter(is_read=True).count()
        
        # Notificaciones por tipo
        by_type = {}
        for notification_type, _ in Notification.TYPE_CHOICES:
            count = user_notifications.filter(type=notification_type).count()
            if count > 0:
                by_type[notification_type] = count
        
        return Response({
            'total': total,
            'unread': unread,
            'read': read,
            'by_type': by_type
        })


class IsNotificationOwner(permissions.BasePermission):
    """
    Permiso personalizado: solo el owner de la notificación puede verla/editarla
    """
    
    def has_object_permission(self, request, view, obj):
        """Verificar que la notificación pertenece al usuario"""
        return obj.user == request.user