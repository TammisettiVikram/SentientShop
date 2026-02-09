from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.carts.views import CartViewSet
from apps.store.views import ProductViewSet

router = DefaultRouter()
router.register("products", ProductViewSet)
router.register("cart", CartViewSet, basename="cart")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]
urlpatterns += [
    path("api/auth/", include("apps.accounts.urls")),
]
urlpatterns += [
    path("api/orders/", include("apps.orders.urls")),
]
