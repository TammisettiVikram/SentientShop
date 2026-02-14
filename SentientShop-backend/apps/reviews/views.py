from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import OrderItem
from apps.store.models import Product

from .models import Review
from .serializers import ReviewSerializer


class ProductReviewListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id).select_related("user")
        return Response(ReviewSerializer(reviews, many=True).data)

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        has_purchased = OrderItem.objects.filter(
            order__user=request.user,
            order__status__in=["PAID", "SHIPPED", "DELIVERED"],
            variant__product=product,
        ).exists()

        if not has_purchased:
            return Response(
                {"detail": "Only users who bought this product can review it."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review, created = Review.objects.update_or_create(
            user=request.user,
            product=product,
            defaults={
                "rating": serializer.validated_data["rating"],
                "comment": serializer.validated_data.get("comment", ""),
            },
        )

        output = ReviewSerializer(review).data
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(output, status=status_code)
