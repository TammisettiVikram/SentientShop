from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    size = models.CharField(max_length=10)
    color = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()