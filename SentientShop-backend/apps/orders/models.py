from django.db import models
from django.conf import settings
from apps.store.models import ProductVariant


class Order(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("SHIPPED", "Shipped"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
    ]

    user = models.ForeignKey( 
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE 
        ) 
    total_amount = models.DecimalField(max_digits=10, decimal_places=2) 
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default="PENDING" 
        ) 
    created_at = models.DateTimeField(auto_now_add=True) 
    stripe_payment_intent = models.CharField( 
        max_length=255, null=True, blank=True 
    )
    def __str__(self):
        return f"Order {self.id} - {self.user.email}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.variant.product.name} x {self.quantity}"
