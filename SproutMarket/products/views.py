# products/views.py

from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from core.models import Category
from .models import Product, Cart
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
    ProductUpdateSerializer,
    CartSerializer
)
from .filters import ProductFilter
from .permissions import IsSellerOrReadOnly


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para categorías (solo lectura)
    
    list: GET /api/products/categories/
    retrieve: GET /api/products/categories/{id}/
    """
    queryset = Category.objects.filter(is_active=True).order_by('order')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet para productos con CRUD completo
    
    list: GET /api/products/ - Listar productos (público)
    retrieve: GET /api/products/{id}/ - Detalle (público)
    create: POST /api/products/ - Crear (autenticado)
    update: PUT/PATCH /api/products/{id}/ - Actualizar (owner)
    destroy: DELETE /api/products/{id}/ - Eliminar (owner)
    
    Filtros disponibles:
    - ?categories=1,2 - Filtrar por categorías
    - ?min_price=10&max_price=100 - Rango de precio
    - ?seller=username - Productos de un vendedor
    - ?search=planta - Búsqueda por nombre/descripción
    - ?status=active - Filtrar por estado
    """
    
    queryset = Product.objects.select_related('seller').prefetch_related('categories')
    permission_classes = [IsSellerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['common_name', 'scientific_name', 'description']
    ordering_fields = ['created_at', 'price_mxn', 'view_count']
    ordering = ['-created_at']  # Default: más recientes primero
    
    def get_queryset(self):
        """
        Filtrar productos según el contexto
        - Para listado público: solo activos
        - Para propios productos: todos los del usuario
        """
        queryset = super().get_queryset()
        
        # Si el usuario quiere ver solo sus productos
        if self.action == 'my_products':
            return queryset.filter(seller=self.request.user)
        
        # Para el público, solo productos activos
        if self.action in ['list', 'retrieve']:
            queryset = queryset.filter(status='active')
            
            # Premium sellers primero
            queryset = queryset.order_by('-seller__is_premium', '-created_at')
        
        return queryset
    
    def get_serializer_class(self):
        """Seleccionar serializer según la acción"""
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action == 'create':
            return ProductCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProductUpdateSerializer
        return ProductListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Obtener detalle e incrementar contador de vistas"""
        instance = self.get_object()
        
        # Incrementar vistas (solo si no es el dueño)
        if not request.user.is_authenticated or request.user != instance.seller:
            instance.increment_views()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Crear producto asignando el seller automáticamente"""
        serializer.save()
    
    def perform_destroy(self, instance):
        """Soft delete: cambiar status a 'deleted' en lugar de eliminar"""
        instance.status = 'deleted'
        instance.save()
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_products(self, request):
        """
        GET /api/products/my_products/
        Obtener productos del usuario autenticado
        """
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProductListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reactivate(self, request, pk=None):
        """
        POST /api/products/{id}/reactivate/
        Reactivar producto eliminado (solo owner)
        """
        product = self.get_object()
        
        if product.seller != request.user:
            return Response(
                {'detail': 'No tienes permiso para reactivar este producto'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if product.status == 'deleted':
            # Verificar que tenga stock
            if product.quantity > 0:
                product.status = 'active'
            else:
                product.status = 'out_of_stock'
            
            product.save()
            
            return Response({
                'message': 'Producto reactivado exitosamente',
                'product': ProductDetailSerializer(product).data
            })
        
        return Response(
            {'detail': 'El producto ya está activo'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        GET /api/products/featured/
        Obtener productos destacados (premium sellers o más vistos)
        """
        queryset = self.get_queryset().filter(
            status='active'
        ).order_by('-seller__is_premium', '-view_count')[:10]
        
        serializer = ProductListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        GET /api/products/by_category/?category_slug=plantas
        Obtener productos por slug de categoría
        """
        category_slug = request.query_params.get('category_slug')
        
        if not category_slug:
            return Response(
                {'detail': 'Se requiere el parámetro category_slug'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            category = Category.objects.get(slug=category_slug, is_active=True)
        except Category.DoesNotExist:
            return Response(
                {'detail': 'Categoría no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        queryset = self.get_queryset().filter(categories=category)
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProductListSerializer(queryset, many=True)
        return Response(serializer.data)


class CartViewSet(viewsets.ViewSet):
    """
    ViewSet para manejo del carrito
    
    retrieve: GET /api/cart/ - Ver carrito
    add_item: POST /api/cart/add/ - Agregar item
    update_item: PUT /api/cart/update/{product_id}/ - Actualizar cantidad
    remove_item: DELETE /api/cart/remove/{product_id}/ - Quitar item
    clear: DELETE /api/cart/clear/ - Vaciar carrito
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_cart(self):
        """Obtener o crear carrito del usuario"""
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
    def list(self, request):
        """
        GET /api/cart/
        Ver carrito actual
        """
        cart = self.get_cart()
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add(self, request):
        """
        POST /api/cart/add/
        Body: {"product_id": 1, "quantity": 2}
        """
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        if not product_id:
            return Response(
                {'detail': 'Se requiere product_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que el producto existe y está activo
        try:
            product = Product.objects.get(id=product_id, status='active')
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Producto no encontrado o no disponible'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # No permitir agregar productos propios
        if product.seller == request.user:
            return Response(
                {'detail': 'No puedes agregar tus propios productos al carrito'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart = self.get_cart()
        
        # Buscar si ya existe en el carrito
        found = False
        for item in cart.items:
            if item['product_id'] == product_id:
                item['quantity'] += quantity
                found = True
                break
        
        # Si no existe, agregarlo
        if not found:
            cart.items.append({
                'product_id': product_id,
                'quantity': quantity
            })
        
        cart.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'], url_path='update/(?P<product_id>[^/.]+)')
    def update_item(self, request, product_id=None):
        """
        PUT /api/cart/update/{product_id}/
        Body: {"quantity": 5}
        """
        quantity = request.data.get('quantity', 1)
        
        if quantity < 1:
            return Response(
                {'detail': 'La cantidad debe ser al menos 1'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart = self.get_cart()
        
        # Buscar y actualizar
        found = False
        for item in cart.items:
            if item['product_id'] == int(product_id):
                item['quantity'] = quantity
                found = True
                break
        
        if not found:
            return Response(
                {'detail': 'Producto no encontrado en el carrito'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'], url_path='remove/(?P<product_id>[^/.]+)')
    def remove_item(self, request, product_id=None):
        """
        DELETE /api/cart/remove/{product_id}/
        """
        cart = self.get_cart()
        
        # Filtrar para quitar el item
        original_length = len(cart.items)
        cart.items = [
            item for item in cart.items 
            if item['product_id'] != int(product_id)
        ]
        
        if len(cart.items) == original_length:
            return Response(
                {'detail': 'Producto no encontrado en el carrito'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """
        DELETE /api/cart/clear/
        Vaciar carrito
        """
        cart = self.get_cart()
        cart.clear()
        
        return Response({
            'message': 'Carrito vaciado exitosamente'
        })