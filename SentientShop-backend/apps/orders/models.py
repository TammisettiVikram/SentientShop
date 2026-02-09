from django.conf import settings
from django.db import models

class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default="PENDING")
    stripe_payment_intent = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
