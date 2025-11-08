# exchanges/serializers.py

from rest_framework import serializers
from decimal import Decimal
from django.contrib.auth import get_user_model
from .models import Exchange, ExchangeOffer
from core.serializers import UserProfileSerializer
from core.utils.s3_utils import upload_exchange_image, delete_image

User = get_user_model()


class ExchangeListSerializer(serializers.ModelSerializer):
    """
    Serializer para listado de intercambios (catálogo público)
    Vista simplificada con info básica
    """
    
    user = UserProfileSerializer(read_only=True)
    main_image = serializers.SerializerMethodField()
    pending_offers_count = serializers.ReadOnlyField()
    can_receive_offers = serializers.SerializerMethodField()
    
    class Meta:
        model = Exchange
        fields = [
            'id', 'user', 'plant_common_name', 'plant_scientific_name',
            'width_cm', 'height_cm', 'location', 'main_image',
            'status', 'pending_offers_count', 'can_receive_offers',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_main_image(self, obj):
        """Retorna la primera imagen disponible"""
        if obj.image1:
            return obj.image1.url if hasattr(obj.image1, 'url') else obj.image1
        return None
    
    def get_can_receive_offers(self, obj):
        """Indica si puede recibir más ofertas"""
        return obj.can_receive_offers()


class ExchangeOfferListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar ofertas (para el publisher)
    """
    
    offeror = UserProfileSerializer(read_only=True)
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = ExchangeOffer
        fields = [
            'id', 'offeror', 'plant_common_name', 'plant_scientific_name',
            'description', 'width_cm', 'height_cm', 'images',
            'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']
    
    def get_images(self, obj):
        """Retorna lista de URLs de imágenes"""
        images = []
        for img_field in ['image1', 'image2', 'image3']:
            img = getattr(obj, img_field)
            if img:
                images.append(img.url if hasattr(img, 'url') else img)
        return images


class ExchangeDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para detalle completo del intercambio
    Incluye todas las ofertas recibidas
    """
    
    user = UserProfileSerializer(read_only=True)
    images = serializers.SerializerMethodField()
    offers = serializers.SerializerMethodField()
    pending_offers_count = serializers.ReadOnlyField()
    can_receive_offers = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Exchange
        fields = [
            'id', 'user', 'plant_common_name', 'plant_scientific_name',
            'description', 'width_cm', 'height_cm', 'location',
            'images', 'stripe_payment_id', 'status',
            'pending_offers_count', 'can_receive_offers', 'is_owner',
            'offers', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'stripe_payment_id', 'created_at', 'updated_at']
    
    def get_images(self, obj):
        """Retorna lista de URLs de imágenes"""
        images = []
        for img_field in ['image1', 'image2', 'image3']:
            img = getattr(obj, img_field)
            if img:
                images.append(img.url if hasattr(img, 'url') else img)
        return images
    
    def get_offers(self, obj):
        """Retorna las ofertas solo si el usuario es el owner"""
        request = self.context.get('request')
        if request and request.user == obj.user:
            # Si es el owner, mostrar todas las ofertas pendientes
            offers = obj.offers.filter(status='pending').order_by('-created_at')
            return ExchangeOfferListSerializer(offers, many=True).data
        return None
    
    def get_can_receive_offers(self, obj):
        """Indica si puede recibir más ofertas"""
        return obj.can_receive_offers()
    
    def get_is_owner(self, obj):
        """Indica si el usuario actual es el owner"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user == obj.user
        return False


class ExchangeCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear publicación de intercambio
    Requiere pago de $90 MXN
    """
    
    # Imágenes como archivos
    image1 = serializers.ImageField(required=True, help_text='Primera imagen (requerida)')
    image2 = serializers.ImageField(required=False, allow_null=True)
    image3 = serializers.ImageField(required=False, allow_null=True)
    
    # Payment Intent ID de Stripe
    stripe_payment_id = serializers.CharField(
        write_only=True,
        help_text='Payment Intent ID de Stripe (pago de $90 MXN)'
    )
    
    class Meta:
        model = Exchange
        fields = [
            'plant_common_name', 'plant_scientific_name', 'description',
            'width_cm', 'height_cm', 'location',
            'image1', 'image2', 'image3', 'stripe_payment_id'
        ]
    
    def validate_stripe_payment_id(self, value):
        """Verificar que el payment intent sea válido y de $90 MXN"""
        import stripe
        from django.conf import settings
        
        stripe.api_key = settings.STRIPE_SECRET_KEY
        
        try:
            payment_intent = stripe.PaymentIntent.retrieve(value)
            
            # Verificar que el pago fue exitoso
            if payment_intent.status != 'succeeded':
                raise serializers.ValidationError(
                    'El pago no ha sido completado exitosamente'
                )
            
            # Verificar que el monto sea $90 MXN (9000 centavos)
            if payment_intent.amount != 9000:
                raise serializers.ValidationError(
                    'El monto del pago debe ser $90 MXN'
                )
            
            # Verificar que la moneda sea MXN
            if payment_intent.currency != 'mxn':
                raise serializers.ValidationError(
                    'La moneda debe ser MXN'
                )
            
            # Verificar que el pago pertenezca al usuario
            user = self.context['request'].user
            if payment_intent.metadata.get('user_id') != str(user.id):
                raise serializers.ValidationError(
                    'Este pago no te pertenece'
                )
            
            # Verificar que no se haya usado antes
            if Exchange.objects.filter(stripe_payment_id=value).exists():
                raise serializers.ValidationError(
                    'Este pago ya ha sido utilizado para otra publicación'
                )
            
            return value
            
        except stripe.error.StripeError as e:
            raise serializers.ValidationError(f'Error al verificar el pago: {str(e)}')
    
    def validate(self, attrs):
        """Validaciones generales"""
        
        # Validar dimensiones
        if attrs.get('width_cm') and attrs.get('width_cm') <= 0:
            raise serializers.ValidationError({
                'width_cm': 'El ancho debe ser mayor a 0'
            })
        
        if attrs.get('height_cm') and attrs.get('height_cm') <= 0:
            raise serializers.ValidationError({
                'height_cm': 'El alto debe ser mayor a 0'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Crear publicación de intercambio y subir imágenes a S3"""
        user = self.context['request'].user
        
        # Extraer imágenes
        image1 = validated_data.pop('image1')
        image2 = validated_data.pop('image2', None)
        image3 = validated_data.pop('image3', None)
        
        # Crear exchange
        exchange = Exchange.objects.create(
            user=user,
            **validated_data
        )
        
        # Subir imágenes a S3
        try:
            exchange.image1 = upload_exchange_image(image1)
            
            if image2:
                exchange.image2 = upload_exchange_image(image2)
            
            if image3:
                exchange.image3 = upload_exchange_image(image3)
            
            exchange.save()
            
            # Registrar transacción
            from payments.models import Transaction
            Transaction.record_exchange_publication(
                user=user,
                exchange=exchange,
                amount=Decimal('90.00'),
                stripe_id=validated_data['stripe_payment_id']
            )
            
        except Exception as e:
            # Si falla el upload, eliminar exchange
            exchange.delete()
            raise serializers.ValidationError({
                'images': f'Error al subir imágenes: {str(e)}'
            })
        
        return exchange


class ExchangeUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar publicación de intercambio
    No requiere pago adicional
    """
    
    # Imágenes opcionales
    image1 = serializers.ImageField(required=False, allow_null=True)
    image2 = serializers.ImageField(required=False, allow_null=True)
    image3 = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Exchange
        fields = [
            'plant_common_name', 'plant_scientific_name', 'description',
            'width_cm', 'height_cm', 'location',
            'image1', 'image2', 'image3'
        ]
    
    def validate(self, attrs):
        """Validaciones"""
        # No permitir editar si ya fue intercambiado
        if self.instance.status == 'exchanged':
            raise serializers.ValidationError(
                'No puedes editar una publicación que ya fue intercambiada'
            )
        
        # Validar dimensiones
        if attrs.get('width_cm') and attrs.get('width_cm') <= 0:
            raise serializers.ValidationError({
                'width_cm': 'El ancho debe ser mayor a 0'
            })
        
        if attrs.get('height_cm') and attrs.get('height_cm') <= 0:
            raise serializers.ValidationError({
                'height_cm': 'El alto debe ser mayor a 0'
            })
        
        return attrs
    
    def update(self, instance, validated_data):
        """Actualizar exchange y manejar imágenes"""
        
        # Manejar actualización de imágenes
        for img_field in ['image1', 'image2', 'image3']:
            if img_field in validated_data:
                new_image = validated_data.pop(img_field)
                
                if new_image:
                    # Eliminar imagen anterior si existe
                    old_image = getattr(instance, img_field)
                    if old_image:
                        try:
                            delete_image(old_image)
                        except:
                            pass
                    
                    # Subir nueva imagen
                    try:
                        setattr(instance, img_field, upload_exchange_image(new_image))
                    except Exception as e:
                        raise serializers.ValidationError({
                            img_field: f'Error al subir imagen: {str(e)}'
                        })
                elif new_image is None:
                    # Eliminar imagen si se envió null
                    old_image = getattr(instance, img_field)
                    if old_image:
                        try:
                            delete_image(old_image)
                        except:
                            pass
                    setattr(instance, img_field, None)
        
        # Actualizar otros campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class ExchangeOfferCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear oferta de intercambio
    Gratis, pero validado
    """
    
    exchange_id = serializers.IntegerField(write_only=True)
    
    # Imágenes como archivos
    image1 = serializers.ImageField(required=True, help_text='Primera imagen (requerida)')
    image2 = serializers.ImageField(required=False, allow_null=True)
    image3 = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = ExchangeOffer
        fields = [
            'exchange_id', 'plant_common_name', 'plant_scientific_name',
            'description', 'width_cm', 'height_cm',
            'image1', 'image2', 'image3'
        ]
    
    def validate_exchange_id(self, value):
        """Validar que el exchange existe y está activo"""
        try:
            exchange = Exchange.objects.get(id=value)
        except Exchange.DoesNotExist:
            raise serializers.ValidationError('Publicación de intercambio no encontrada')
        
        # Verificar que esté activa
        if exchange.status != 'active':
            raise serializers.ValidationError(
                'Esta publicación de intercambio no está activa'
            )
        
        # Verificar que no sea del mismo usuario
        user = self.context['request'].user
        if exchange.user == user:
            raise serializers.ValidationError(
                'No puedes hacer ofertas en tus propias publicaciones'
            )
        
        # Verificar que pueda recibir más ofertas (máximo 4)
        if not exchange.can_receive_offers():
            raise serializers.ValidationError(
                'Esta publicación ya tiene el máximo de ofertas pendientes (4). '
                'Por favor espera a que el publicador acepte o rechace alguna oferta.'
            )
        
        # Verificar que no haya oferta pendiente del mismo usuario
        if exchange.offers.filter(offeror=user, status='pending').exists():
            raise serializers.ValidationError(
                'Ya tienes una oferta pendiente en esta publicación'
            )
        
        return value
    
    def validate(self, attrs):
        """Validaciones generales"""
        
        # Validar dimensiones
        if attrs.get('width_cm') and attrs.get('width_cm') <= 0:
            raise serializers.ValidationError({
                'width_cm': 'El ancho debe ser mayor a 0'
            })
        
        if attrs.get('height_cm') and attrs.get('height_cm') <= 0:
            raise serializers.ValidationError({
                'height_cm': 'El alto debe ser mayor a 0'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Crear oferta y subir imágenes"""
        user = self.context['request'].user
        exchange_id = validated_data.pop('exchange_id')
        exchange = Exchange.objects.get(id=exchange_id)
        
        # Extraer imágenes
        image1 = validated_data.pop('image1')
        image2 = validated_data.pop('image2', None)
        image3 = validated_data.pop('image3', None)
        
        # Crear oferta
        offer = ExchangeOffer.objects.create(
            exchange=exchange,
            offeror=user,
            **validated_data
        )
        
        # Subir imágenes a S3
        try:
            offer.image1 = upload_exchange_image(image1)
            
            if image2:
                offer.image2 = upload_exchange_image(image2)
            
            if image3:
                offer.image3 = upload_exchange_image(image3)
            
            offer.save()
            
            # TODO: Enviar notificación al publisher (Día 6-7)
            # from notifications.models import Notification
            # Notification.create_and_send(
            #     user=exchange.user,
            #     type='exchange_offer',
            #     title=f'Nueva oferta en tu publicación: {exchange.plant_common_name}',
            #     message=f'{user.get_full_name()} te ofrece {offer.plant_common_name}',
            #     metadata={'exchange_id': exchange.id, 'offer_id': offer.id}
            # )
            
        except Exception as e:
            # Si falla el upload, eliminar oferta
            offer.delete()
            raise serializers.ValidationError({
                'images': f'Error al subir imágenes: {str(e)}'
            })
        
        return offer


class ExchangeOfferResponseSerializer(serializers.Serializer):
    """
    Serializer para aceptar o rechazar una oferta
    """
    
    offer_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=['accept', 'reject'])
    
    def validate_offer_id(self, value):
        """Validar que la oferta existe"""
        try:
            offer = ExchangeOffer.objects.get(id=value)
        except ExchangeOffer.DoesNotExist:
            raise serializers.ValidationError('Oferta no encontrada')
        
        # Verificar que el usuario es el owner del exchange
        user = self.context['request'].user
        if offer.exchange.user != user:
            raise serializers.ValidationError(
                'No tienes permiso para responder esta oferta'
            )
        
        # Verificar que la oferta esté pendiente
        if offer.status != 'pending':
            raise serializers.ValidationError(
                'Esta oferta ya ha sido respondida'
            )
        
        # Verificar que el exchange esté activo
        if offer.exchange.status != 'active':
            raise serializers.ValidationError(
                'Esta publicación de intercambio ya no está activa'
            )
        
        return value
    
    def save(self):
        """Procesar la respuesta (aceptar o rechazar)"""
        offer_id = self.validated_data['offer_id']
        action = self.validated_data['action']
        
        offer = ExchangeOffer.objects.get(id=offer_id)
        exchange = offer.exchange
        
        if action == 'accept':
            # Aceptar oferta
            offer.status = 'accepted'
            offer.save()
            
            # Marcar exchange como intercambiado
            exchange.status = 'exchanged'
            exchange.save()
            
            # Rechazar automáticamente todas las demás ofertas pendientes
            other_offers = exchange.offers.filter(status='pending').exclude(id=offer.id)
            other_offers.update(status='rejected')
            
            # TODO: Enviar notificación a ambos usuarios (Día 6-7)
            # Notificar al offeror (aceptado)
            # Notificar a los otros offerors (rechazados)
            # Enviar información de contacto a ambas partes
            
            return {
                'message': 'Oferta aceptada exitosamente',
                'exchange': ExchangeDetailSerializer(exchange, context=self.context).data,
                'accepted_offer': ExchangeOfferListSerializer(offer).data,
                'contact_info': {
                    'your_contact': {
                        'name': exchange.user.get_full_name(),
                        'email': exchange.user.email,
                        'phone': exchange.user.phone_number,
                        'location': exchange.location
                    },
                    'offeror_contact': {
                        'name': offer.offeror.get_full_name(),
                        'email': offer.offeror.email,
                        'phone': offer.offeror.phone_number
                    }
                }
            }
        
        else:  # reject
            # Rechazar oferta
            offer.status = 'rejected'
            offer.save()
            
            # TODO: Notificar al offeror (rechazado)
            
            return {
                'message': 'Oferta rechazada',
                'exchange': ExchangeDetailSerializer(exchange, context=self.context).data
            }