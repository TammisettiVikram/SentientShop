from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(ReadOnlyModelViewSet):
    queryset = Product.objects.prefetch_related("variants")
    serializer_class = ProductSerializer