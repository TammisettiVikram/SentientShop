from django.urls import path
from .views import CartView, CartItemDetailView

urlpatterns = [
    path("", CartView.as_view()),
    path("<int:item_id>/", CartItemDetailView.as_view()),
]
