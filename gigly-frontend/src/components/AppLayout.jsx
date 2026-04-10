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
    <div className="app-layout" style={{ position: "relative", minHeight: "100vh", background: "var(--bg-base)", overflowX: "hidden" }}>
      {/* Background Watermark */}
      <div style={{ 
        position: "fixed", top: "50%", left: "55%", transform: "translate(-50%, -50%)", 
        fontSize: "10vw", 
        fontWeight: 900, color: "rgba(0,0,0,0.012)", 
        pointerEvents: "none", zIndex: 0, whiteSpace: "nowrap", 
        fontFamily: "var(--font-display)",
        textAlign: "center",
        width: "90vw",
        display: "flex",
        justifyContent: "center",
        letterSpacing: "-0.05em",
        opacity: 0.8
      }}>
        ROZGAAAR
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
