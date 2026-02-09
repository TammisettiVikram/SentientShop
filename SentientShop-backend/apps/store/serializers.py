from rest_framework import serializers
from .models import Product, ProductVariant

class VariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = "__all__"

class ProductSerializer(serializers.ModelSerializer):
    variants = VariantSerializer(many=True)

    class Meta:
        model = Product
        fields = "__all__"