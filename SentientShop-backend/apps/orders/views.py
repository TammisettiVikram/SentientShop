import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.carts.models import CartItem
from .models import Order

stripe.api_key = settings.STRIPE_SECRET_KEY

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_items = CartItem.objects.filter(user=request.user)
        total = sum(item.variant.price * item.quantity for item in cart_items)

        intent = stripe.PaymentIntent.create(
            amount=int(total * 100),
            currency="inr",
        )

        order = Order.objects.create(
            user=request.user,
            total=total,
            stripe_payment_intent=intent.id
        )

        return Response({
            "client_secret": intent.client_secret,
            "order_id": order.id
        })
