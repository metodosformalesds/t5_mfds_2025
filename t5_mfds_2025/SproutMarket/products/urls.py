# products/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, CartViewSet

app_name = 'products'

# Router para ViewSets
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')

# URLs del carrito (ViewSet sin router para mayor control)
cart_urls = [
    path('', CartViewSet.as_view({'get': 'list'}), name='cart-detail'),
    path('add/', CartViewSet.as_view({'post': 'add'}), name='cart-add'),
    path('update/<int:product_id>/', CartViewSet.as_view({'put': 'update_item'}), name='cart-update'),
    path('remove/<int:product_id>/', CartViewSet.as_view({'delete': 'remove_item'}), name='cart-remove'),
    path('clear/', CartViewSet.as_view({'delete': 'clear'}), name='cart-clear'),
]

urlpatterns = [
    path('', include(router.urls)),
    path('cart/', include(cart_urls)),
]