from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "user", "user_email", "product", "rating", "comment", "created_at"]
        read_only_fields = ["id", "user", "user_email", "product", "created_at"]
