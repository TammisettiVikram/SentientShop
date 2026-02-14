from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, "role", None) == "ADMIN" or user.is_staff or user.is_superuser)
        )


class IsSupportRole(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, "role", None) in ["ADMIN", "SUPPORT"] or user.is_staff or user.is_superuser)
        )
