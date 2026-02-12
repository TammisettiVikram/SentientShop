from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Cart, CartItem
from apps.store.models import ProductVariant


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = CartItem.objects.filter(cart=cart)

        data = [
            {
                "id": item.id,
                "variant": item.product_variant.id,
                "product": item.product_variant.product.name,
                "size": item.product_variant.size,
                "color": item.product_variant.color,
                "price": float(item.product_variant.price),
                "quantity": item.quantity,
            }
            for item in items
        ]

        return Response(data)

    def post(self, request):
        variant_id = request.data.get("variant")
        qty = int(request.data.get("quantity", 1))

        if not variant_id:
            return Response(
                {"error": "variant is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, _ = Cart.objects.get_or_create(user=request.user)

        try:
            variant = ProductVariant.objects.get(id=variant_id)
        except ProductVariant.DoesNotExist:
            return Response(
                {"error": "Invalid variant"},
                status=status.HTTP_400_BAD_REQUEST
            )

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_variant=variant
        )

        if not created:
            item.quantity += qty
        else:
            item.quantity = qty

        item.save()

        return Response({"status": "added"}, status=201)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        item = CartItem.objects.get(id=item_id, cart__user=request.user)
        item.quantity = int(request.data.get("quantity", item.quantity))
        item.save()
        return Response({"status": "updated"})

    def delete(self, request, item_id):
        item = CartItem.objects.get(id=item_id, cart__user=request.user)
        item.delete()
        return Response({"status": "deleted"})
