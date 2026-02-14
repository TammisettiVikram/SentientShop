from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import CartItem
from apps.store.models import ProductVariant


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = CartItem.objects.filter(user=request.user)

        data = [
            {
                "id": item.id,
                "variant": item.variant.id,
                "product": item.variant.product.name,
                "size": item.variant.size,
                "color": item.variant.color,
                "price": float(item.variant.price),
                "quantity": item.quantity,
            }
            for item in items
        ]

        return Response(data)

    def post(self, request):
        variant_id = request.data.get("variant") or request.data.get("variant_id")
        try:
            qty = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            return Response(
                {"error": "quantity must be a number"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if qty < 1:
            return Response(
                {"error": "quantity must be at least 1"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not variant_id:
            return Response(
                {"error": "variant is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            variant = ProductVariant.objects.get(id=variant_id)
        except ProductVariant.DoesNotExist:
            return Response(
                {"error": "Invalid variant"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item, created = CartItem.objects.get_or_create(
            user=request.user,
            variant=variant,
            defaults={"quantity": qty},
        )

        if not created:
            item.quantity += qty
            item.save()

        return Response({"status": "added"}, status=201)



class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id, user=request.user)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            quantity = int(request.data.get("quantity", item.quantity))
        except (TypeError, ValueError):
            return Response(
                {"error": "quantity must be a number"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if quantity < 1:
            return Response(
                {"error": "quantity must be at least 1"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = quantity
        item.save()
        return Response({"status": "updated"})

    def delete(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id, user=request.user)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response({"status": "deleted"})
