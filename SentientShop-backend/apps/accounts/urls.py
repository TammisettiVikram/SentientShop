from django.urls import path
from .views import (
    AdminUserListView,
    AdminUserUpdateView,
    ChangePasswordView,
    CustomTokenObtainPairView,
    ProfileView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", CustomTokenObtainPairView.as_view()),
    path("me/", ProfileView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    path("admin/users/", AdminUserListView.as_view()),
    path("admin/users/<int:user_id>/", AdminUserUpdateView.as_view()),
]
