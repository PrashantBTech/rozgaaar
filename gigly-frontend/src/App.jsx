import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

// Layout
import AppLayout from "./components/AppLayout";

// Public pages
import Landing from "./pages/Landing";
import { Login, Register } from "./pages/Auth";

// App pages
import Dashboard from "./pages/Dashboard";
import FindWork from "./pages/FindWork";
import PostGig from "./pages/PostGig";
import JobDetail from "./pages/JobDetail";
import MyGigs from "./pages/MyGigs";
import Messages from "./pages/Messages";
import { Profile, Earnings, MyJobs } from "./pages/ProfileEarnings";
import AIConcierge from "./pages/AIConcierge";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-card)",
              },
              success: { iconTheme: { primary: "var(--accent)", secondary: "#080d1a" } },
              error:   { iconTheme: { primary: "var(--urgent)", secondary: "#080d1a" } },
            }}
          />

          <Routes>
            {/* ── Public ── */}
            <Route path="/"         element={<Landing />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Protected (inside AppLayout) ── */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard"  element={<Dashboard />} />
              <Route path="/find-work"  element={<FindWork />} />
              <Route path="/jobs/:id"   element={<JobDetail />} />
              <Route path="/post-gig"   element={<PostGig />} />
              <Route path="/my-gigs"    element={<MyGigs />} />
              <Route path="/my-jobs"    element={<MyJobs />} />
              <Route path="/messages"   element={<Messages />} />
              <Route path="/earnings"   element={<Earnings />} />
              <Route path="/profile"    element={<Profile />} />
              <Route path="/ai-concierge" element={<AIConcierge />} />
            </Route>

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}