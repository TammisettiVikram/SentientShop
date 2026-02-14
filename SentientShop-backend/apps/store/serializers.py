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


class AdminVariantSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = ProductVariant
        fields = ["id", "size", "color", "price", "stock"]


class AdminProductSerializer(serializers.ModelSerializer):
    variants = AdminVariantSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = ["id", "name", "description", "category", "variants"]

    def create(self, validated_data):
        variants_data = validated_data.pop("variants", [])
        product = Product.objects.create(**validated_data)
        for variant_data in variants_data:
            ProductVariant.objects.create(product=product, **variant_data)
        return product

    def update(self, instance, validated_data):
        variants_data = validated_data.pop("variants", None)
        instance.name = validated_data.get("name", instance.name)
        instance.description = validated_data.get("description", instance.description)
        instance.category = validated_data.get("category", instance.category)
        instance.save()

        if variants_data is not None:
            existing_by_id = {variant.id: variant for variant in instance.variants.all()}
            seen_ids = set()

            for variant_data in variants_data:
                variant_id = variant_data.pop("id", None)
                if variant_id and variant_id in existing_by_id:
                    variant = existing_by_id[variant_id]
                    for field, value in variant_data.items():
                        setattr(variant, field, value)
                    variant.save()
                    seen_ids.add(variant_id)
                else:
                    created = ProductVariant.objects.create(product=instance, **variant_data)
                    seen_ids.add(created.id)

            for variant in instance.variants.all():
                if variant.id not in seen_ids:
                    variant.delete()

        return instance
