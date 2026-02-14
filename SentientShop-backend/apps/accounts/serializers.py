from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password"]

    def create(self, validated_data):
        email = validated_data["email"]

        # generate unique username
        username = email.split("@")[0]

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data["password"]
        )

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(
            email=data["email"],
            password=data["password"],
        )
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = getattr(user, "role", "CUSTOMER")
        token["is_staff"] = user.is_staff
        token["is_superuser"] = user.is_superuser
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["email"] = self.user.email
        data["role"] = getattr(self.user, "role", "CUSTOMER")
        data["is_staff"] = self.user.is_staff
        data["is_superuser"] = self.user.is_superuser
        return data


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "role", "is_active", "is_staff", "is_superuser", "last_login"]
        read_only_fields = ["id", "is_superuser", "last_login"]


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "role", "is_active", "date_joined", "last_login"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
