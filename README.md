# 🌍 TripPlanner Marketplace

A full-stack marketplace connecting travelers with verified local trip planners. Built with **React (TypeScript + Vite)**, **Node.js (Express + TypeScript)**, and **MySQL Server 8.0** (with an intelligent synchronized seed fallback engine).

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Run the following in the repository root (or install in `backend` and `frontend` separately):

```bash
# In the root directory:
npm run install:all
```

Alternatively:
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

### 2. Configure Environment Variables

A template is provided in `backend/.env.example`. Copy or inspect `backend/.env`:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret for Traveler, Planner, and Admin Authentication
JWT_SECRET=super_secure_trip_planner_jwt_secret_key_2026

# MySQL Database Configuration
# Connect to your local MySQL 8.0 server:
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_root_password
MYSQL_DATABASE=tourist

# Payment Provider Configuration (Test / Development Mode)
PAYMENT_GATEWAY_MODE=test
```

> **Automatic DB Driver Notice:**  
> If MySQL credentials are provided and MySQL is reachable, the backend connects and automatically runs `backend/db/init.sql` to initialize tables and seed data. If MySQL is not configured or password is blank, the backend automatically operates with the built-in synchronized in-memory database engine containing the exact same seed data, ensuring the app works instantly out-of-the-box!

---

### 3. Run the Application

You can start both frontend and backend concurrently from the root:

```bash
# Starts Backend (port 4000) and Frontend (port 5173) together
npm run dev
```

Or run each service in separate terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
*Health Check: http://localhost:4000/api/health*

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
*Web App: http://localhost:5173*

---

## 🔐 Demo Test Accounts

The platform includes pre-seeded accounts across all 3 roles:

| Role | Email | Password | Details & Specialties |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tripplanner.com` | `Admin@123` | Full administrative moderation access |
| **Trip Planner** | `ramesh.planner@tripplanner.com` | `Planner@123` | Based in **Visakhapatnam**; specializes in **Kasi (Varanasi)** & North Indian pilgrimages |
| **Trip Planner** | `priya.kerala@tripplanner.com` | `Planner@123` | Based in **Kochi**; specializes in **Munnar & Alleppey** backwaters |
| **Trip Planner** | `arjun.himalayas@tripplanner.com` | `Planner@123` | Based in **Delhi / Manali**; specializes in **Rohtang & Himachal** alpine treks |
| **Traveler** | `traveler@example.com` | `Traveler@123` | Verified traveler user |

> **Interactive Demo Switcher:**  
> The top navigation bar in the web app contains a **"Demo: [Traveler] [Planner] [Admin]"** 1-click switcher so you can test all 3 portals instantly without manual re-login.

---

## 🌟 Key Product Features

### 1. Traveler Frontend
* **Smart Route Search:** Search by origin and destination (e.g., `Visakhapatnam to Kasi`).
* **City Alias Recognition:** Intelligently recognizes **Kasi** as **Varanasi / Banaras / Kashi** and **Vizag** as **Visakhapatnam**.
* **Filter Controls:** Filter by maximum budget, departure dates, and local guide languages (Telugu, Hindi, English, Malayalam).
* **Itinerary & Amenity Highlights:** Complete day-by-day itinerary views, included services, and customer reviews.
* **Privacy-Conscious Contact:** Planners' direct phone numbers and WhatsApp links remain protected until a traveler submits an inquiry request, at which point direct phone call and WhatsApp options are unlocked.

### 2. Planner Portal
* **Planner Profile Editor:** Edit business name, operating base city, spoken languages, years of experience, specialties, and avatar image.
* **Trip-Plan Card Manager:** Create, view, edit, toggle published status, and delete trip cards with confirmation safeguards.
* **Subscription Management:** View active subscription tier (`Starter`, `Pro Planner`, `Elite`), renewal countdown, and test simulated payment checkout.
* **Inquiry Lead Inbox:** Real-time inbox of traveler contact requests with direct WhatsApp links.

### 3. Admin Portal
* **Live Platform Metrics:** Total Planners, Active Trip Cards, Pending Approvals, Active Subscriptions.
* **Planners & Cards View:** Review planners and their associated cards together in one unified accordion table.
* **Account Moderation:** Approve, verify, or suspend planner accounts.
* **Card Moderation:** Approve, flag, or remove inappropriate trip cards.
* **User & Subscription Registry:** Audit log of all registered users and payment transactions.

---

## 🛠️ REST API Reference

### Auth
* `POST /api/auth/register` - Create new traveler or planner account
* `POST /api/auth/login` - Authenticate and receive JWT
* `GET /api/auth/me` - Get profile of authenticated user

### Traveler Search & Contact
* `GET /api/trips/search?origin=...&destination=...&max_price=...&languages=...` - Search trip cards
* `GET /api/trips/:id` - Get full trip details with day-by-day itinerary & reviews
* `POST /api/trips/:id/contact` - Submit inquiry and unlock direct planner contact details

### Planner Portal (Requires Planner JWT)
* `GET /api/planner/profile` - Fetch current planner profile
* `PUT /api/planner/profile` - Update planner profile
* `GET /api/planner/cards` - List all cards belonging to authenticated planner
* `POST /api/planner/cards` - Create new trip plan card
* `PUT /api/planner/cards/:id` - Update trip plan card
* `PATCH /api/planner/cards/:id/publish` - Toggle published/unpublished state
* `DELETE /api/planner/cards/:id` - Delete card
* `GET /api/planner/inquiries` - View traveler inquiries received

### Subscriptions
* `GET /api/subscriptions/plans` - List available subscription plans
* `GET /api/subscriptions/current` - Get planner's current plan and expiry
* `POST /api/subscriptions/checkout` - Simulated test checkout for instant upgrade

### Admin Portal (Requires Admin JWT)
* `GET /api/admin/metrics` - High-level statistics
* `GET /api/admin/planners?search=...&status=...` - Planners with their trip cards
* `PATCH /api/admin/planners/:id/status` - Approve / suspend planner
* `GET /api/admin/cards?search=...&status=...` - All cards for moderation
* `PATCH /api/admin/cards/:id/moderate` - Approve / flag trip card
* `DELETE /api/admin/cards/:id` - Remove inappropriate card
* `GET /api/admin/users` - All system users
* `GET /api/admin/subscriptions` - Subscription audit records

---

## 🧪 Automated Testing

Run the automated backend verification suite:

```bash
npm test
```

Verifies:
* Origin & Destination alias search (`Visakhapatnam to Kasi` & `Visakhapatnam to Varanasi`)
* Role-based access control (Admin, Planner, Traveler)
* Contact inquiry submission and contact unlocking
* Subscription tiers and plan persistence
* Planner card management and admin listing
