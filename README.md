# 🛒 SentientShop — Full Stack E-Commerce Platform

SentientShop is a production-ready full stack e-commerce application built with Django REST Framework and React.  
It supports product management, cart and checkout, Stripe payments, role-based access control, reviews, and admin dashboards.

Designed to demonstrate real-world backend architecture, API design, secure authentication, and cloud deployment.

---

## 🚀 Live Demo

Frontend: https://sentientshop-frontend.vercel.app 
Backend API: https://sentientshop-production.up.railway.app  

Admin Panel:  
https://sentientshop-production.up.railway.app/admin/

---

## 🧠 Features

### 🛍 Store
- Product catalog with categories
- Product variants (size, color, price, stock)
- Product detail pages
- Review system (only after purchase)

### 🛒 Cart
- Guest cart support
- Authenticated user cart
- Quantity management
- Persistent cart storage

### 💳 Payments
- Stripe integration
- Secure checkout flow
- Webhook handling
- Order status updates

### 📦 Orders
- Order history
- Payment status tracking
- Invoice-style order view

### 🔐 Authentication
- JWT authentication
- Login / Register
- Password update
- Secure API access

### 👥 Role-Based Access Control (RBAC)
- User role
- Admin role
- Staff permissions
- Protected endpoints

### 📊 Admin Dashboard
- Order metrics
- Revenue summary
- Product CRUD
- User management

---

## 🏗 Tech Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL
- Stripe API
- SimpleJWT
- Gunicorn
- WhiteNoise

### Frontend
- React
- Vite
- Axios
- Tailwind CSS
- Stripe Elements

### Infrastructure
- Railway (Backend + Postgres)
- Vercel (Frontend)
- Environment variables for secrets

---

## 📂 Project Structure

SentientShop/
│
├── SentientShop-backend/
│ ├── apps/
│ │ ├── accounts
│ │ ├── store
│ │ ├── carts
│ │ ├── orders
│ │ └── reviews
│ ├── core/
│ └── manage.py
│
├── SentientShop_frontend/
│ ├── src/
│ └── vite.config.js
│
└── README.md

---

## ⚙️ Environment Variables

### Backend (.env)

SECRET_KEY=your-secret
DEBUG=False

DATABASE_URL=postgres-url

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strongpassword

---

### Frontend (.env)

VITE_API_BASE_URL=https://sentientshop-production.up.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

---

## 🛠 Local Setup

### 1️⃣ Clone repo

git clone https://github.com/TammisettiVikram/sentientshop.git
cd sentientshop

---

### 2️⃣ Backend

cd backend

python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

---

### 3️⃣ Frontend

cd frontend

npm install
npm run dev

---

## 🔄 Stripe Webhook (Local)

stripe listen --forward-to localhost:8000/api/orders/webhook/

---

## 🚢 Deployment

### Backend — Railway
- Connect GitHub repo
- Add environment variables
- Run migrations automatically
- Start with Gunicorn

### Frontend — Vercel
- Connect repo
- Add environment variables
- Deploy

---

## 🧩 Key Architecture Decisions

- Decoupled frontend + backend for scalability
- JWT instead of session auth for API security
- Webhook-driven payment confirmation
- PostgreSQL for production reliability
- RBAC implemented at API layer

---

## 📈 Future Improvements

- Email notifications
- Inventory alerts
- Refund workflow
- Order tracking
- Search + filtering
- Redis caching
- Background jobs (Celery)
- Docker support

---

## 👨‍💻 Author

Vikram Tammisetti

Backend-focused full stack developer passionate about building production systems.

Skills:
Python • Django • FastAPI • React • PostgreSQL • Stripe • Cloud Deployment

---

## 📜 License

MIT License — feel free to use and modify.
