# subscriptions/serializers.py

from rest_framework import serializers
from .models import Subscription
from core.serializers import UserProfileSerializer


class SubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar información de suscripción
    """
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_active = serializers.ReadOnlyField()
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'status', 'status_display', 'is_active',
            'current_period_start', 'current_period_end',
            'canceled_at', 'days_remaining',
            'created_at'
        ]
        read_only_fields = '__all__'
    
    def get_days_remaining(self, obj):
        """Calcula días restantes del periodo actual"""
        from django.utils import timezone
        
        if obj.current_period_end:
            delta = obj.current_period_end - timezone.now()
            return max(0, delta.days)
        return 0


class SubscriptionCreateSerializer(serializers.Serializer):
    """
    Serializer para crear una suscripción
    No requiere datos de entrada, solo token de autenticación
    """
    
    def validate(self, attrs):
        """Validar que el usuario no tenga ya una suscripción activa"""
        user = self.context['request'].user
        
        if user.is_premium:
            raise serializers.ValidationError(
                'Ya tienes una suscripción premium activa'
            )
        
        # Verificar si tiene suscripción activa en DB
        active_subscription = Subscription.objects.filter(
            user=user,
            status='active'
        ).first()
        
        if active_subscription:
            raise serializers.ValidationError(
                'Ya tienes una suscripción activa'
            )
        
        return attrs
    
    def create(self, validated_data):
        """Crear suscripción usando el servicio"""
        from .services import SubscriptionService
        
        user = self.context['request'].user
        result = SubscriptionService.create_subscription(user)
        
        return result


class SubscriptionCancelSerializer(serializers.Serializer):
    """
    Serializer para cancelar una suscripción
    """
    
    def validate(self, attrs):
        """Validar que el usuario tenga una suscripción activa"""
        user = self.context['request'].user
        
        if not user.stripe_subscription_id:
            raise serializers.ValidationError(
                'No tienes una suscripción activa para cancelar'
            )
        
        return attrs
    
    def save(self):
        """Cancelar suscripción usando el servicio"""
        from .services import SubscriptionService
        
        user = self.context['request'].user
        result = SubscriptionService.cancel_subscription(user)
        
        return result


class SubscriptionStatusSerializer(serializers.Serializer):
    """
    Serializer para el estado de suscripción
    """
    
    has_subscription = serializers.BooleanField()
    is_premium = serializers.BooleanField()
    status = serializers.CharField(allow_null=True)
    current_period_start = serializers.DateTimeField(required=False, allow_null=True)
    current_period_end = serializers.DateTimeField(required=False, allow_null=True)
    cancel_at_period_end = serializers.BooleanField(required=False)


class SubscriptionHistorySerializer(serializers.ModelSerializer):
    """
    Serializer para historial de suscripciones
    """
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    duration_days = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'stripe_subscription_id', 'status', 'status_display',
            'current_period_start', 'current_period_end',
            'canceled_at', 'ended_at', 'duration_days',
            'created_at', 'updated_at'
        ]
        read_only_fields = '__all__'
    
    def get_duration_days(self, obj):
        """Calcula duración de la suscripción en días"""
        if obj.current_period_start and obj.current_period_end:
            delta = obj.current_period_end - obj.current_period_start
            return delta.days
        return 0