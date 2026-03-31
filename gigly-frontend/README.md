# ⚡ Gigly Frontend — React App

> Pixel-perfect React frontend for the Gigly hyperlocal gig platform. Matches the FlashGig PDF designs.

---

## 🖥️ Pages & Screens

| Screen | Route | Matches PDF |
|---|---|---|
| Landing / Hero | `/` | ✅ Hero, stats, how-it-works, trust, CTA |
| Register | `/register` | ✅ Role toggle, form, social auth |
| Login | `/login` | ✅ Credentials form, demo banner |
| Dashboard | `/dashboard` | ✅ Stats, quick actions, nearby gigs, activity |
| Find Work | `/find-work` | ✅ Search, filters, job grid, pagination |
| Post a Gig | `/post-gig` | ✅ 2-step form + live mobile preview |
| Job Detail | `/jobs/:id` | ✅ Full job info, trust score, apply panel |
| My Jobs (Worker) | `/my-jobs` | ✅ Application list, check-in/out |
| My Gigs (Business) | `/my-gigs` | ✅ Posted jobs + applicant management |
| Messages | `/messages` | ✅ Real-time chat via Socket.io |
| Profile | `/profile` | ✅ Stats, edit info, skills, reviews |
| Earnings | `/earnings` | ✅ Balance, transactions, tax, payout |

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Set REACT_APP_API_URL and REACT_APP_SOCKET_URL to your backend

# 3. Start
npm start
# Opens http://localhost:3000
```

> Make sure `gigly-backend` is running on port 5000 first.

---

## 🧱 Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 |
| Routing | React Router v6 |
| HTTP | Axios (with JWT interceptors + auto-refresh) |
| Real-time | Socket.io client |
| Toasts | React Hot Toast |
| Dates | date-fns |
| Fonts | Syne (display) + DM Sans (body) |
| Styling | Pure CSS variables (zero UI lib dependency) |

---

## 🎨 Design System

**Palette:** Deep navy (`#080d1a`) with electric cyan/green accents (`#3be8b0`, `#63d2ff`)

**Typography:**
- Display headings → **Syne** (bold, geometric)
- Body text → **DM Sans** (clean, readable)

**Key CSS variables:**
```css
--accent:       #3be8b0   /* primary CTA green */
--cyan:         #63d2ff   /* secondary accent */
--urgent:       #ff6b6b   /* urgent badges */
--bg-base:      #080d1a   /* page background */
--bg-card:      #111d35   /* card surfaces */
```

---

## 🔌 Backend Integration

Every API call is wired to the Gigly backend at `REACT_APP_API_URL`:

- **Auth**: JWT access + refresh token with auto-rotation on 401
- **Jobs**: Geospatial search params (lat/lng/radius)
- **Applications**: Apply, accept/reject, check-in/out
- **Socket.io**: Real-time job alerts, chat, presence, typing indicators
- **Payments**: Stripe wallet balance + transaction history
- **Notifications**: Live bell with unread count

---

## 📁 Project Structure

```
src/
├── context/
│   ├── AuthContext.jsx     ← Global user state, login/logout
│   └── SocketContext.jsx   ← Socket.io connection + event handlers
├── services/
│   └── api.js              ← All Axios API calls (auth, jobs, apps, etc.)
├── components/
│   ├── AppLayout.jsx       ← Protected route wrapper + layout shell
│   ├── Sidebar.jsx         ← Role-aware navigation
│   ├── Header.jsx          ← Search bar + notification bell
│   └── GigCard.jsx         ← Reusable job card component
├── pages/
│   ├── Landing.jsx         ← Public homepage
│   ├── Auth.jsx            ← Login + Register
│   ├── Dashboard.jsx       ← Welcome, stats, nearby gigs
│   ├── FindWork.jsx        ← Job search & filter
│   ├── PostGig.jsx         ← Create gig with live preview
│   ├── JobDetail.jsx       ← Full job page + apply
│   ├── MyGigs.jsx          ← Business: manage postings
│   ├── Messages.jsx        ← Real-time chat
│   └── ProfileEarnings.jsx ← Profile, Earnings, My Jobs
├── index.css               ← Design tokens + global styles
└── App.jsx                 ← Router config
```

---

## 🔐 Role-Based Views

| Role | Navigation |
|---|---|
| **Worker** | Dashboard, Find Work, My Jobs, Messages, Earnings, Profile |
| **Business** | Dashboard, Post a Gig, My Gigs, Messages, Earnings, Profile |
| **Admin** | Dashboard, Admin Panel, Profile |
