import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, marginBottom: 16 }}>
          <span style={{ color: "var(--accent)" }}>R</span>ozgaaar
        </div>
        <div style={{
          width: 40, height: 40, border: "3px solid var(--bg-elevated)", borderTop: "3px solid var(--accent)",
          borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto"
        }} />
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout" style={{ position: "relative", overflow: "hidden", background: "var(--bg-base)" }}>
      {/* ── Global Animated Neon Background ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div className="blob" style={{ top: "-10%", left: "-10%", width: "50vw", height: "50vw", background: "var(--neon-blue)", opacity: 0.25 }} />
        <div className="blob" style={{ top: "40%", right: "-20%", width: "40vw", height: "40vw", background: "var(--neon-pink)", animationDelay: "-4s", opacity: 0.2 }} />
        <div className="blob" style={{ bottom: "-20%", left: "20%", width: "60vw", height: "60vw", background: "var(--accent)", opacity: 0.15 }} />
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content" style={{ zIndex: 10, position: "relative", flex: 1, minHeight: "100vh" }}>
        <Header onMenuToggle={() => setSidebarOpen(s => !s)} />
        <main style={{ flex: 1, position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
