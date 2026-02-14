import stripe
from django.conf import settings
from django.http import HttpResponse
from apps.carts.models import CartItem
from django.views.decorators.csrf import csrf_exempt
from .models import Order

stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        print("Webhook signature error:", e)
        return HttpResponse(status=400)

    print("Stripe event:", event["type"])

    if event["type"] == "payment_intent.succeeded":

        intent = event["data"]["object"]
        metadata = intent.get("metadata", {})

        order_id = metadata.get("order_id")

        if not order_id:
            print("No order_id — ignoring event")
            return HttpResponse(status=200)

        try:
            order = Order.objects.get(id=order_id)

            if order.status != "PAID":
                print("Marking order PAID:", order.id)

                order.status = "PAID"
                order.save()

                # Deduct stock
                for item in order.items.all():
                    variant = item.variant
                    variant.stock -= item.quantity
                    variant.save()

                # Clear cart
                CartItem.objects.filter(user=order.user).delete()

        except Order.DoesNotExist:
            print("Order not found:", order_id)

    return HttpResponse(status=200)

