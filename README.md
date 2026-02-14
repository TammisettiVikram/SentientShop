# SentientShop

Full-stack ecommerce app:
- Backend: Django + DRF + JWT + Stripe
- Frontend: React + Vite + Tailwind

## Project Structure

- `SentientShop-backend` - Django API
- `SentientShop_frontend` - React app

## Local Setup

### 1. Backend

```bash
cd SentientShop-backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Create `SentientShop-backend/.env` with:

```env
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Frontend

```bash
cd SentientShop_frontend
npm install
npm run dev
```

Create `SentientShop_frontend/.env` with:

```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Railway Deploy (Backend)

The backend uses `SentientShop-backend/Procfile`:

```procfile
release: python manage.py migrate && python manage.py createsuperuser --noinput || true
web: gunicorn core.wsgi:application
```

### Required Railway Variables

- `SECRET_KEY`
- `DEBUG=False`
- `DATABASE_URL` (Railway Postgres connection string)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DJANGO_SUPERUSER_USERNAME`
- `DJANGO_SUPERUSER_EMAIL`
- `DJANGO_SUPERUSER_PASSWORD`

`release` step runs migrations on each deploy and attempts superuser creation.  
If the superuser already exists, deploy continues because of `|| true`.

## Common Commands

Backend checks:

```bash
cd SentientShop-backend
python manage.py check
```

Frontend build:

```bash
cd SentientShop_frontend
npm run build
```
