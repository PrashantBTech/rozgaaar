# FlashGig-2 Project Overview

## 🏗 System Architecture

The project is structured as a modern MERN stack application, split cleanly into two distinct parts: `gigly-frontend` and `gigly-backend`.

### 1. `gigly-backend` (Node.js/Express)
A robust RESTful and real-time backend primarily serving gig workers and businesses.

**Core Technologies:**
*   **Runtime:** Node.js (18+)
*   **Framework:** Express.js
*   **Database:** MongoDB via Mongoose
*   **Real-time:** Socket.io for chat, presence, and location tracking
*   **Authentication:** JWT (Access and Refresh Tokens)
*   **Payment Integration:** Stripe
*   **File Storage:** Cloudinary (via Multer)

**Key Features:**
*   Role-based functionality (Worker, Business, Admin) with route guards.
*   Geospatial queries for hyperlocal job searches (e.g., jobs within a 10km radius).
*   Real-time notifications, chat, typing indicators, and worker location updates via WebSockets.
*   Background cron jobs (e.g., auto-expiring job listings).
*   Built-in Swagger documentation (`/api/docs`).
*   Robust security practices (helmet, mongo-sanitize, rate limiting, bcryptjs).

### 2. `gigly-frontend` (React Component Structure)
A pixel-perfect, responsive React application styled with pure CSS variables and modern typography, designed to match professional UI tokens.

**Core Technologies:**
*   **Framework:** React 18, React Router v6
*   **Networking:** Axios (with JWT interceptors) and Socket.io Client
*   **Styling:** Custom CSS with globally managed variables for themes (zero third-party UI libs used)
*   **State:** React Context API (`AuthContext`, `SocketContext`)
*   **Tooling:** Create React App

**Key Features:**
*   Protected routes wrapped by `AppLayout`.
*   Role-aware dashboards, sidebars, and features (e.g., `MyGigs` for businesses, `FindWork` for workers).
*   Real-time messaging via the `Messages` component.
*   Integrated payments view (`Earnings`) displaying Stripe transactions.
*   AI integration features (`AIConcierge` route presence).
*   Toast notifications integration (`react-hot-toast`).

## 🔄 Data & Endpoints Flow

*   **Job Discovery:** Businesses post gigs (`POST /api/v1/jobs`), and workers use geospatial search parameters to retrieve nearest jobs matching their criteria (`GET /api/v1/jobs`).
*   **Gig Lifecycle:** Application → Acceptance/Rejection → Check-in/Check-out → Review & Payment.
*   **Payments Flow:** Completes gig → System tracks completion via `checkout` endpoint → Business triggers a Stripe Payment Intent → Frontend processes the payment → Backend receives webhook verifying the payment and updates standard balances (90% to worker, 10% platform fee).

## 🚀 Current Execution State
The system is currently running on your local machine:
*   `npm run dev` in `gigly-backend` (Starts at port 5000)
*   `npm start` in `gigly-frontend` (Starts at port 3000)
