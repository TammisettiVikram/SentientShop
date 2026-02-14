from django.urls import path

from .views import (
    AdminDashboardView,
    AdminOrderStatusUpdateView,
    CheckoutView,
    CreatePaymentIntentView,
    OrderListView,
    stripe_webhook,
)

urlpatterns = [
    path("", OrderListView.as_view(), name="order-list"),
    path("checkout/", CheckoutView.as_view()),
    path("create-payment-intent/", CreatePaymentIntentView.as_view()),
    path("webhook/", stripe_webhook),
    path("admin/dashboard/", AdminDashboardView.as_view()),
    path("admin/orders/<int:order_id>/status/", AdminOrderStatusUpdateView.as_view()),
]
