# QWERTY E-Commerce 🛒

A modern, high-performance E-Commerce platform built with **Next.js 15** and **Bun**. Featuring a sleek monochrome aesthetic and a robust simulator ecosystem for development and testing.

## 🚀 Key Features

- **Monochrome Design System**: Ultra-premium minimalist aesthetic (Black/White/Gray).
- **Hybrid Data Persistence**: 
  - **Development**: Uses local JSON files.
  - **Production**: Uses GitHub API for real-time data persistence (Bypassing Vercel's read-only filesystem).
- **Advanced Security**: 
  - Centralized validation for Email & Strong Passwords.
  - SHA-256 password hashing.
  - JWT-based authentication with role-based access (Admin vs Customer).
- **Integrated Simulators**: Dedicated environments for testing emails, webhooks, and payments without real third-party services.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime**: [Bun](https://bun.sh/)
- **Styling**: Vanilla CSS / Tailwind CSS
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: Zustand / React Context
- **Database**: JSON-based with GitHub API Sync Layer

---

## 🔗 Special Endpoints (Simulators)

These endpoints are designed for developers to test critical flows without external dependencies. All simulator endpoints are **CORS-enabled** (Public).

### 1. Email Simulator (Mock SMTP)
Used to intercept and view outgoing emails (like OTPs).
- **API Endpoint**: `POST /api/simulators/emailer`
  - Body: `{ "to": "string", "subject": "string", "body": "string" }`
- **Dashboard**: `/emailer-simulator` (Real-time inbox view)

### 2. Webhook & Payment Simulator
Used to simulate payment gateways (e.g., QRIS, Bank Transfer).
- **Webhook Endpoint**: `POST /api/webhook/payment`
- **Simulation Page**: `/webhook-simulator` (Tools to trigger success/failure events)

### 3. Dummy Payment UI
A safe environment to simulate the customer checkout experience.
- **URL**: `/dummy-payment`

---

## 🔐 Auth & Security Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Create a new user with strong password validation. |
| `/api/auth/login` | `POST` | Authenticate and get JWT cookie. |
| `/api/auth/forgot-password` | `POST` | Trigger OTP generation (sent to terminal & email simulator). |
| `/api/auth/reset-password` | `POST` | Reset password using valid OTP. |

---

## 🏃 Getting Started

### 1. Installation
```bash
bun install
```

### 2. Environment Variables
Create a `.env.local` file:
```env
JWT_SECRET=your-secret-key
# GitHub Persistence (For Production)
GITHUB_TOKEN=your_token
GITHUB_USERNAME=your_username
GITHUB_REPO=your_repo
GITHUB_BRANCH=main
```

### 3. Run Development
```bash
bun dev
```

### 4. Port
The application runs on `http://localhost:3000`.

---

## 📂 Project Structure

- `/app`: Next.js App Router (Pages & API).
- `/src/modules`: Core business logic (Auth, Products, Orders).
- `/src/infrastructure`: Data access layers (JSON Handler, GitHub API Sync).
- `/src/utils`: Reusable utilities (Validation, Date formatting).
- `/data`: Local database storage (JSON files).

---

## 📜 License
MIT License - Developed by **QWERTY Team**.
