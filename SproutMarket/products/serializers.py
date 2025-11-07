# products/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import Category
from .models import Product, Cart, Order
from core.utils.s3_utils import upload_product_image, delete_image

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """Serializer para categorías"""
    
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'order', 'product_count']
    
    def get_product_count(self, obj):
        """Contar productos activos en esta categoría"""
        return obj.products.filter(status='active').count()


class ProductSellerSerializer(serializers.ModelSerializer):
    """Serializer simplificado del vendedor"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'business_name', 'city', 'is_premium', 'profile_image']


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer para listado de productos (vista de catálogo)"""
    
    seller = ProductSellerSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    main_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'common_name', 'scientific_name', 'price_mxn',
            'quantity', 'status', 'main_image', 'seller', 'categories',
            'view_count', 'created_at'
        ]
        read_only_fields = ['id', 'view_count', 'created_at']
    
    def get_main_image(self, obj):
        """Retorna la primera imagen disponible"""
        if obj.image1:
            return obj.image1.url if hasattr(obj.image1, 'url') else obj.image1
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer para detalle completo del producto"""
    
    seller = ProductSellerSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    images = serializers.SerializerMethodField()
    is_available = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'categories', 'common_name', 'scientific_name',
            'description', 'quantity', 'price_mxn', 'width_cm', 'height_cm',
            'weight_kg', 'images', 'status', 'is_available', 'view_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'seller', 'view_count', 'created_at', 'updated_at']
    
    def get_images(self, obj):
        """Retorna lista de URLs de imágenes"""
        images = []
        for img_field in ['image1', 'image2', 'image3']:
            img = getattr(obj, img_field)
            if img:
                images.append(img.url if hasattr(img, 'url') else img)
        return images


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear productos"""
    
    category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        min_length=1,
        max_length=3,
        help_text='IDs de categorías (mínimo 1, máximo 3)'
    )
    
    # Imágenes como archivos
    image1 = serializers.ImageField(required=True, help_text='Primera imagen (requerida)')
    image2 = serializers.ImageField(required=False, allow_null=True)
    image3 = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = [
            'common_name', 'scientific_name', 'description',
            'quantity', 'price_mxn', 'width_cm', 'height_cm', 'weight_kg',
            'category_ids', 'image1', 'image2', 'image3'
        ]
    
    def validate_category_ids(self, value):
        """Validar que las categorías existan"""
        categories = Category.objects.filter(id__in=value, is_active=True)
        if categories.count() != len(value):
            raise serializers.ValidationError('Una o más categorías no son válidas')
        return value
    
    def validate(self, attrs):
        """Validaciones generales"""
        user = self.context['request'].user
        
        # Verificar límite de productos
        if not user.can_publish_product():
            limit = user.product_limit
            raise serializers.ValidationError({
                'non_field_errors': f'Has alcanzado el límite de {limit} productos. '
                                   f'Suscríbete a premium para publicar hasta 40 productos.'
            })
        
        # Validar precio
        if attrs.get('price_mxn', 0) <= 0:
            raise serializers.ValidationError({
                'price_mxn': 'El precio debe ser mayor a 0'
            })
        
        # Validar cantidad
        if attrs.get('quantity', 0) < 0:
            raise serializers.ValidationError({
                'quantity': 'La cantidad no puede ser negativa'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Crear producto y subir imágenes a S3"""
        category_ids = validated_data.pop('category_ids')
        user = self.context['request'].user
        
        # Extraer imágenes
        image1 = validated_data.pop('image1')
        image2 = validated_data.pop('image2', None)
        image3 = validated_data.pop('image3', None)
        
        # Crear producto
        product = Product.objects.create(
            seller=user,
            **validated_data
        )
        
        # Asignar categorías
        categories = Category.objects.filter(id__in=category_ids)
        product.categories.set(categories)
        
        # Subir imágenes a S3
        try:
            product.image1 = upload_product_image(image1)
            
            if image2:
                product.image2 = upload_product_image(image2)
            
            if image3:
                product.image3 = upload_product_image(image3)
            
            product.save()
        except Exception as e:
            # Si falla el upload, eliminar producto
            product.delete()
            raise serializers.ValidationError({
                'images': f'Error al subir imágenes: {str(e)}'
            })
        
        return product


class ProductUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar productos"""
    
    category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        min_length=1,
        max_length=3
    )
    
    # Imágenes opcionales
    image1 = serializers.ImageField(required=False, allow_null=True)
    image2 = serializers.ImageField(required=False, allow_null=True)
    image3 = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = [
            'common_name', 'scientific_name', 'description',
            'quantity', 'price_mxn', 'width_cm', 'height_cm', 'weight_kg',
            'category_ids', 'image1', 'image2', 'image3', 'status'
        ]
    
    def validate_category_ids(self, value):
        """Validar categorías"""
        if value:
            categories = Category.objects.filter(id__in=value, is_active=True)
            if categories.count() != len(value):
                raise serializers.ValidationError('Una o más categorías no son válidas')
        return value
    
    def update(self, instance, validated_data):
        """Actualizar producto y manejar imágenes"""
        category_ids = validated_data.pop('category_ids', None)
        
        # Actualizar categorías si se proporcionaron
        if category_ids is not None:
            categories = Category.objects.filter(id__in=category_ids)
            instance.categories.set(categories)
        
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
                        setattr(instance, img_field, upload_product_image(new_image))
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


class CartItemSerializer(serializers.Serializer):
    """Serializer para items del carrito"""
    
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)


class CartSerializer(serializers.ModelSerializer):
    """Serializer para el carrito"""
    
    items = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_items', 'total_amount', 'updated_at']
        read_only_fields = ['id', 'user', 'updated_at']
    
    def get_items(self, obj):
        """Obtener items con información de productos"""
        items_data = []
        
        for item in obj.items:
            try:
                product = Product.objects.get(id=item['product_id'], status='active')
                items_data.append({
                    'product_id': item['product_id'],
                    'quantity': item['quantity'],
                    'product': ProductListSerializer(product).data,
                    'subtotal': float(product.price_mxn) * item['quantity']
                })
            except Product.DoesNotExist:
                continue
        
        return items_data
    
    def get_total_items(self, obj):
        """Contar total de items"""
        return sum(item['quantity'] for item in obj.items)
    
    def get_total_amount(self, obj):
        """Calcular total"""
        total = 0
        for item in obj.items:
            try:
                product = Product.objects.get(id=item['product_id'])
                total += float(product.price_mxn) * item['quantity']
            except Product.DoesNotExist:
                continue
        return total