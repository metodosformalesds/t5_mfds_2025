# payments/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CheckoutView,
    ConfirmPaymentView,
    OrderViewSet,
    SalesViewSet,
    TransactionViewSet,
    BalanceView
)

app_name = 'payments'

# Router para ViewSets
router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'sales', SalesViewSet, basename='sale')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    # Checkout y confirmación
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('confirm/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    
    # Balance
    path('balance/', BalanceView.as_view(), name='balance'),
    
    # ViewSets
    path('', include(router.urls)),
]