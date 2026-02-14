from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.store.views import AdminProductDetailView, AdminProductListCreateView, ProductViewSet

router = DefaultRouter()
router.register("products", ProductViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/", include("apps.reviews.urls")),
    path("api/admin/products/", AdminProductListCreateView.as_view()),
    path("api/admin/products/<int:product_id>/", AdminProductDetailView.as_view()),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/cart/", include("apps.carts.urls")),
    path("api/orders/", include("apps.orders.urls")),
]
