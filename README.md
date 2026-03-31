# 🚀 Fastify Auth Template

A high-performance backend built with **Fastify** and **Prisma**. This project implements advanced authentication patterns, session management, and a robust security layer.

---

## 🛠 Tech Stack

* **Runtime:** Node.js (v20+)
* **Framework:** [Fastify](https://www.fastify.io/) — Low overhead and highest throughput.
* **ORM:** [Prisma](https://www.prisma.io/) with PostgreSQL.
* **Security:** JWT (Access + Refresh Tokens), Bcrypt, Helmet.
* **Validation:** JSON Schema (AJV) for strict request/response typing.

---

## ✨ Key Features

### 🔐 Authentication & Session Management
* **Refresh Token Rotation:** Secure session renewal with automatic reuse detection.
* **Device Normalization:** Intelligent `User-Agent` parsing to group sessions by device/browser.
* **Session Control:** Dedicated `/sessions` endpoint to monitor active devices and perform remote logout.
* **Multi-factor Ready:** Verification service for Email/SMS flows.

### 🛡 Security & Reliability
* **Dynamic Rate Limiting:** Adjustable limits to prevent DoS.
* **Advanced Error Handling:** Standardized error response format `{ "error": "CODE" }` for seamless Frontend i18n support.
* **Brute-force Protection:** Verification codes are hashed (Bcrypt) with a strict "Max 3 Attempts" policy.
* **Security Headers:** Pre-configured [@fastify/helmet](https://github.com/fastify/fastify-helmet) integration.

---

## 🚦 Quick Start

### 1. Environment Setup
Create a `.env` file based on the provided example:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/db"
JWT_SECRET="your_ultra_secret_key"
```

### 2. Installation
```bash
# Install dependencies
npm install

# Run database types generation and migrations
npm run prisma:generate
npm run prisma:migrate

# Start in development mode
npm run dev
```