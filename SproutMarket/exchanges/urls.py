# exchanges/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExchangeViewSet, ExchangeOfferViewSet

app_name = 'exchanges'

# Router para ViewSets
router = DefaultRouter()
router.register(r'exchanges', ExchangeViewSet, basename='exchange')

# URLs de ofertas (sin router para mayor control)
offer_urls = [
    path('', ExchangeOfferViewSet.as_view({'post': 'create'}), name='offer-create'),
    path('my_offers/', ExchangeOfferViewSet.as_view({'get': 'my_offers'}), name='my-offers'),
    path('respond/', ExchangeOfferViewSet.as_view({'post': 'respond'}), name='offer-respond'),
]

urlpatterns = [
    path('', include(router.urls)),
    path('exchange-offers/', include(offer_urls)),
]