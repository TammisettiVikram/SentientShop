import os
from django.apps import AppConfig

def ready(self):
    import os

    if os.environ.get("AUTO_CREATE_ADMIN", "False") != "True":
        return

    try:
        from django.contrib.auth import get_user_model

        User = get_user_model()

        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(
                username="admin",
                email = os.getenv("ADMIN_EMAIL"),
                password = os.getenv("ADMIN_PASSWORD")
            )
            print("✅ Admin created")
        else:
            print("ℹ️ Admin exists")

    except Exception as e:
        print("⚠️ Admin bootstrap error:", e)
