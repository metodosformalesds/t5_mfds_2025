# products/filters.py

import django_filters
from .models import Product
from core.models import Category


class ProductFilter(django_filters.FilterSet):
    """
    Filtros personalizados para productos
    
    Uso:
    - ?categories=1,2,3 - Filtrar por IDs de categorías
    - ?min_price=10 - Precio mínimo
    - ?max_price=100 - Precio máximo
    - ?seller__username=john - Productos de un vendedor
    - ?status=active - Filtrar por estado
    """
    
    # Filtro por múltiples categorías
    categories = django_filters.ModelMultipleChoiceFilter(
        field_name='categories',
        queryset=Category.objects.filter(is_active=True),
        help_text='Filtrar por IDs de categorías (ej: ?categories=1,2)'
    )
    
    # Rango de precio
    min_price = django_filters.NumberFilter(
        field_name='price_mxn',
        lookup_expr='gte',
        help_text='Precio mínimo'
    )
    max_price = django_filters.NumberFilter(
        field_name='price_mxn',
        lookup_expr='lte',
        help_text='Precio máximo'
    )
    
    # Filtro por vendedor (username)
    seller__username = django_filters.CharFilter(
        field_name='seller__username',
        lookup_expr='iexact',
        help_text='Username del vendedor'
    )
    
    # Filtro por ciudad del vendedor
    seller__city = django_filters.CharFilter(
        field_name='seller__city',
        lookup_expr='icontains',
        help_text='Ciudad del vendedor'
    )
    
    # Solo productos premium
    seller__is_premium = django_filters.BooleanFilter(
        field_name='seller__is_premium',
        help_text='Solo productos de vendedores premium'
    )
    
    # Filtro por disponibilidad
    in_stock = django_filters.BooleanFilter(
        method='filter_in_stock',
        help_text='Solo productos en stock'
    )
    
    class Meta:
        model = Product
        fields = {
            'status': ['exact'],
            'seller__username': ['exact', 'icontains'],
            'common_name': ['icontains'],
            'scientific_name': ['icontains'],
        }
    
    def filter_in_stock(self, queryset, name, value):
        """Filtrar productos con stock disponible"""
        if value:
            return queryset.filter(quantity__gt=0, status='active')
        return queryset