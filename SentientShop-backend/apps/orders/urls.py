from django.urls import path
from .views import CheckoutView
from .webhooks import stripe_webhook

urlpatterns = [
    path("checkout/", CheckoutView.as_view()),
    path("webhook/", stripe_webhook),
]
