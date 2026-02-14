from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from core.permissions import IsAdminRole

from .models import Product
from rest_framework.permissions import AllowAny
from .serializers import AdminProductSerializer, ProductSerializer

class ProductViewSet(ReadOnlyModelViewSet):
    queryset = Product.objects.prefetch_related("variants")
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class AdminProductListCreateView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        products = Product.objects.prefetch_related("variants").all().order_by("-id")
        return Response(AdminProductSerializer(products, many=True).data)

    def post(self, request):
        serializer = AdminProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminProductDetailView(APIView):
    permission_classes = [IsAdminRole]

    def get_object(self, product_id):
        try:
            return Product.objects.prefetch_related("variants").get(id=product_id)
        except Product.DoesNotExist:
            return None

    def patch(self, request, product_id):
        product = self.get_object(product_id)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminProductSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, product_id):
        product = self.get_object(product_id)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
