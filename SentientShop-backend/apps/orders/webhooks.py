import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Order

stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    event = stripe.Event.construct_from(
        stripe.util.json.loads(payload),
        stripe.api_key
    )

    if event.type == "payment_intent.succeeded":
        intent = event.data.object
        Order.objects.filter(
            stripe_payment_intent=intent.id
        ).update(status="PAID")

    return HttpResponse(status=200)
