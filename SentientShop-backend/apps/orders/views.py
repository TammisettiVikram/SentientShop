from decimal import Decimal

import stripe
from django.conf import settings
from django.db import transaction
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.carts.models import CartItem
from apps.store.models import Product
from core.permissions import IsAdminRole

from .models import Order, OrderItem

stripe.api_key = settings.STRIPE_SECRET_KEY


def _load_cart_items(user):
    return list(CartItem.objects.select_related("variant", "variant__product").filter(user=user))


def _calculate_total(cart_items):
    return sum(item.variant.price * item.quantity for item in cart_items)


def _validate_stock(cart_items):
    for item in cart_items:
        if item.quantity > item.variant.stock:
            return item
    return None


def _find_order_from_intent(intent):
    intent_id = intent.get("id")
    order_id = intent.get("metadata", {}).get("order_id")

    order = None
    if order_id:
        order = Order.objects.select_for_update().filter(id=order_id).first()
    if not order and intent_id:
        order = Order.objects.select_for_update().filter(stripe_payment_intent=intent_id).first()
    return order


def _mark_order_paid_and_sync_inventory(order):
    if order.status == "PAID":
        return

    order_items = list(order.items.select_related("variant").all())
    for order_item in order_items:
        variant = order_item.variant
        if variant.stock < order_item.quantity:
            order.status = "CANCELLED"
            order.save(update_fields=["status"])
            return

    for order_item in order_items:
        variant = order_item.variant
        variant.stock -= order_item.quantity
        variant.save(update_fields=["stock"])

    order.status = "PAID"
    order.save(update_fields=["status"])
    CartItem.objects.filter(user=order.user).delete()


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        cart_items = _load_cart_items(request.user)
        if not cart_items:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        out_of_stock_item = _validate_stock(cart_items)
        if out_of_stock_item:
            return Response(
                {
                    "error": f"Insufficient stock for {out_of_stock_item.variant.product.name}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        total = _calculate_total(cart_items)
        order = Order.objects.create(user=request.user, total_amount=total, status="PENDING")
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                variant=item.variant,
                quantity=item.quantity,
                price=item.variant.price,
            )

        return Response(
            {"message": "Order created successfully", "order_id": order.id, "total": total},
            status=status.HTTP_201_CREATED,
        )


class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items__variant__product").order_by("-id")
        data = []
        for order in orders:
            invoice_number = f"INV-{order.created_at:%Y%m%d}-{order.id:05d}"
            data.append(
                {
                    "id": order.id,
                    "total_amount": order.total_amount,
                    "status": order.status,
                    "created_at": order.created_at,
                    "invoice_number": invoice_number,
                    "invoice_available": order.status in ["PAID", "SHIPPED", "DELIVERED"],
                    "items": [
                        {
                            "product": item.variant.product.name,
                            "size": item.variant.size,
                            "color": item.variant.color,
                            "price": item.price,
                            "quantity": item.quantity,
                        }
                        for item in order.items.all()
                    ],
                }
            )

        return Response(data)


class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        cart_items = _load_cart_items(request.user)
        if not cart_items:
            return Response({"error": "Cart empty"}, status=status.HTTP_400_BAD_REQUEST)

        out_of_stock_item = _validate_stock(cart_items)
        if out_of_stock_item:
            return Response(
                {
                    "error": f"Insufficient stock for {out_of_stock_item.variant.product.name}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        total = _calculate_total(cart_items)
        order = Order.objects.create(user=request.user, total_amount=total, status="PENDING")
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                variant=item.variant,
                quantity=item.quantity,
                price=item.variant.price,
            )

        intent = stripe.PaymentIntent.create(
            amount=int(Decimal(total) * 100),
            currency="inr",
            metadata={"order_id": str(order.id), "user_id": str(request.user.id)},
        )

        order.stripe_payment_intent = intent.id
        order.save(update_fields=["stripe_payment_intent"])

        return Response({"client_secret": intent.client_secret, "order_id": order.id})


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except Exception:
        return HttpResponse(status=400)

    event_type = event.get("type")
    intent = event.get("data", {}).get("object", {})

    if event_type in ["payment_intent.succeeded", "payment_intent.payment_failed"]:
        with transaction.atomic():
            order = _find_order_from_intent(intent)
            if not order:
                return HttpResponse(status=200)

            if event_type == "payment_intent.succeeded":
                _mark_order_paid_and_sync_inventory(order)
            elif order.status == "PENDING":
                order.status = "CANCELLED"
                order.save(update_fields=["status"])

    return HttpResponse(status=200)


class AdminDashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        orders = Order.objects.select_related("user").all().order_by("-id")
        paid_orders = Order.objects.filter(status="PAID")

        revenue_by_day = (
            paid_orders.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(revenue=Sum("total_amount"))
            .order_by("day")
        )
        orders_by_day = (
            Order.objects.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(orders=Count("id"))
            .order_by("day")
        )
        status_summary = (
            Order.objects.values("status").annotate(count=Count("id")).order_by("status")
        )

        data = {
            "metrics": {
                "total_orders": orders.count(),
                "paid_orders": paid_orders.count(),
                "pending_orders": Order.objects.filter(status="PENDING").count(),
                "total_revenue": paid_orders.aggregate(total=Sum("total_amount"))["total"] or 0,
                "total_products": Product.objects.count(),
                "total_users": User.objects.count(),
            },
            "orders": [
                {
                    "id": order.id,
                    "user": order.user.email,
                    "total": order.total_amount,
                    "status": order.status,
                    "created_at": order.created_at,
                }
                for order in orders
            ],
            "revenue_summary": [{"status": row["status"], "count": row["count"]} for row in status_summary],
            "charts": {
                "revenue_by_day": [
                    {"date": row["day"], "revenue": float(row["revenue"] or 0)} for row in revenue_by_day
                ],
                "orders_by_day": [{"date": row["day"], "orders": row["orders"]} for row in orders_by_day],
            },
        }

        return Response(data)


class AdminOrderStatusUpdateView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, order_id):
        status_value = request.data.get("status")
        allowed_status = {choice[0] for choice in Order.STATUS_CHOICES}
        if status_value not in allowed_status:
            return Response(
                {"error": "Invalid status", "allowed": sorted(list(allowed_status))},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        order.status = status_value
        order.save(update_fields=["status"])
        return Response({"status": "updated", "order_id": order.id, "new_status": order.status})
