# ⚡ Rozgaaar Backend — Hyperlocal Instant Hiring Platform

> Connect businesses with gig workers in real-time. No interviews. No delays. Just work.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT (Access + Refresh tokens) |
| File Uploads | Multer + Cloudinary |
| Payments | Stripe |
| Email | Nodemailer |
| Logging | Winston |
| API Docs | Swagger (OpenAPI 3.0) |
| Scheduling | node-cron |
| Security | Helmet, mongo-sanitize, rate-limit |

---

## 📁 Project Structure

```
gigly-backend/
├── server.js                  # Entry point (Express + Socket.io + Cron)
├── config/
│   ├── db.js                  # MongoDB connection
│   └── cloudinary.js          # Cloudinary / Multer setup
├── models/
│   ├── User.model.js          # Worker & Business users
│   ├── Job.model.js           # Gig job listings (GeoJSON)
│   ├── Application.model.js   # Apply / Accept / Check-in/out
│   └── Review.model.js        # Reviews + Notifications + Messages
├── controllers/
│   ├── auth.controller.js     # Register, login, refresh, forgot pw
│   ├── job.controller.js      # CRUD + geospatial search + real-time alerts
│   └── application.controller.js # Apply, accept, check-in/out, withdraw
├── routes/
│   ├── auth.routes.js
│   ├── job.routes.js
│   ├── application.routes.js
│   ├── user.routes.js
│   ├── review.routes.js
│   ├── upload.routes.js
│   ├── notification.routes.js
│   ├── payment.routes.js
│   └── admin.routes.js
├── middleware/
│   ├── auth.js                # protect / authorize / optionalAuth
│   ├── asyncHandler.js
│   └── errorHandler.js
├── sockets/
│   └── socketHandler.js       # Real-time: chat, presence, job alerts
├── swagger/
│   └── swaggerConfig.js       # OpenAPI 3.0 spec
└── utils/
    ├── logger.js              # Winston logger
    ├── errorResponse.js       # Custom error class
    ├── sendEmail.js           # Nodemailer helper
    └── seeder.js              # Demo data seed
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in MongoDB URI, Cloudinary, Stripe, SMTP credentials
```

### 3. Seed demo data
```bash
npm run seed
```

### 4. Start development server
```bash
npm run dev
```

---

## 🔑 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | ❌ | Register worker or business |
| POST | `/api/v1/auth/login` | ❌ | Login, get JWT tokens |
| POST | `/api/v1/auth/refresh-token` | ❌ | Refresh access token |
| GET | `/api/v1/auth/me` | ✅ | Get current user |
| GET | `/api/v1/jobs` | ❌ | List jobs (geospatial filter) |
| POST | `/api/v1/jobs` | Business | Post a new gig |
| GET | `/api/v1/jobs/my` | Business | My posted jobs |
| POST | `/api/v1/applications` | Worker | Apply to a job |
| GET | `/api/v1/applications/my` | Worker | My applications |
| GET | `/api/v1/applications/job/:id` | Business | View applicants |
| PATCH | `/api/v1/applications/:id/status` | Business | Accept / reject |
| PATCH | `/api/v1/applications/:id/checkin` | Worker | Check in |
| PATCH | `/api/v1/applications/:id/checkout` | Worker | Check out |
| POST | `/api/v1/reviews` | ✅ | Submit post-gig review |
| POST | `/api/v1/uploads/id-document` | ✅ | Upload ID for verification |
| POST | `/api/v1/payments/create-payment-intent` | Business | Pay a worker |
| GET | `/api/v1/notifications` | ✅ | Get notifications |
| GET | `/api/v1/admin/dashboard` | Admin | Platform stats |

📚 **Full interactive docs: `http://localhost:5000/api/docs`**

---

## ⚡ Socket.io Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `join_chat` | `applicationId` | Join a gig chat room |
| `send_message` | `{ applicationId, receiverId, text }` | Send chat message |
| `messages_read` | `{ applicationId }` | Mark messages as read |
| `update_location` | `{ lat, lng }` | Worker updates live location |
| `typing` | `{ applicationId }` | Typing indicator start |
| `stop_typing` | `{ applicationId }` | Typing indicator stop |

### Server → Client
| Event | Description |
|---|---|
| `new_job_nearby` | New job within 10km radius |
| `new_application` | Business receives new applicant |
| `application_accepted` | Worker gets hired |
| `application_rejected` | Worker application declined |
| `new_message` | Incoming chat message |
| `message_notification` | Chat notification |
| `user_online / user_offline` | Presence updates |
| `worker_location_update` | Live worker location |

---

## 👤 User Roles

| Role | Can Do |
|---|---|
| **Worker** | Apply to jobs, check in/out, earn, get reviewed |
| **Business** | Post jobs, manage applicants, pay workers, review workers |
| **Admin** | Full platform control, ID verification, banning, analytics |

---

## 🔒 Security

- JWT access tokens (7d) + refresh tokens (30d)
- bcrypt password hashing (12 rounds)
- Helmet HTTP headers
- MongoDB injection sanitization
- Rate limiting (100 req / 15 min)
- Role-based route guards
- Cloudinary secure file storage

---

## 🔁 Cron Jobs

| Schedule | Task |
|---|---|
| Every 5 minutes | Auto-expire job listings past their start time |

---

## 💰 Payment Flow

1. Worker completes gig → `checkout` endpoint
2. Business calls `create-payment-intent` → gets `clientSecret`
3. Business completes payment via Stripe.js on frontend
4. Stripe webhook fires `payment_intent.succeeded`
5. Worker wallet credited (90% — platform takes 10%)

---

## 🌱 Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@rozgaaar.app | Admin@1234 |
| Business | rohan@brewcafe.in | Business@123 |
| Business | priya@eventpro.in | Business@123 |
| Worker | arjun@worker.com | Worker@123 |
| Worker | sneha@worker.com | Worker@123 |
