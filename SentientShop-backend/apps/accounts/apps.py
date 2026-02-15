from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"

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
                    email="vikramtammisetti@gmail.com",
                    password="2D@Anime"
                )
                print("✅ Admin created")
            else:
                print("ℹ️ Admin exists")

        except Exception as e:
            print("⚠️ Admin bootstrap error:", e)
