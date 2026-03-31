import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { notifsAPI } from "../services/api";

export default function Header({ onMenuToggle }) {
  const { user } = useAuth();
  const { notifications: liveNotifs } = useSocket();
  const [dbNotifs, setDbNotifs]   = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread]       = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const dropRef  = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    notifsAPI.getAll().then(r => {
      setDbNotifs(r.data.data || []);
      setUnread(r.data.unreadCount || 0);
    }).catch(() => {});
  }, [user, liveNotifs.length]);

  useEffect(() => {
    const handler = (e) => {
      if (!dropRef.current?.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAll = async () => {
    await notifsAPI.markAllRead();
    setUnread(0);
    setDbNotifs(d => d.map(n => ({ ...n, isRead: true })));
  };

  const allNotifs = [
    ...liveNotifs.slice(0,3).map(n => ({ ...n, _id:"live_"+Math.random(), isRead:false })),
    ...dbNotifs,
  ].slice(0, 8);

  return (
    <header style={{
      height: "var(--header-h)",
      background: "var(--dark-glass)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderBottom: "1px solid var(--dark-glass-border)",
      display: "flex", alignItems: "center",
      padding: "0 16px", gap: 10,
      position: "sticky", top: 0, zIndex: 50,
      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)"
    }}>

      {/* ── Hamburger — always visible on mobile ── */}
      <button className="btn btn-ghost btn-sm header-menu-btn"
        style={{ padding: 8, flexShrink: 0 }}
        onClick={onMenuToggle}
        aria-label="Open menu">
        ☰
      </button>

      {/* ── Search bar — hidden on mobile unless toggled ── */}
      <div className={`input-icon-wrap header-search`}
        style={{ flex: 1, maxWidth: 460, display: "flex" }}>
        <span className="input-icon" style={{ fontSize: 14 }}>🔍</span>
        <input className="input"
          placeholder="Search gigs, skills, locations..."
          style={{ background: "var(--bg-base)", borderColor: "var(--border)", padding: "8px 14px 8px 38px" }}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/find-work?q=${e.target.value}`)}
        />
      </div>

      {/* ── Mobile search toggle ── */}
      <button className="btn btn-ghost btn-sm show-mobile"
        style={{ padding: 8, fontSize: 16, flexShrink: 0 }}
        onClick={() => setShowSearch(s => !s)}
        aria-label="Search">
        🔍
      </button>

      {/* ── Mobile search overlay ── */}
      {showSearch && (
        <div style={{
          position: "fixed", top: "var(--header-h)", left: 0, right: 0,
          background: "var(--bg-surface)", borderBottom: "1px solid var(--border)",
          padding: "12px 16px", zIndex: 100, display: "flex", gap: 8,
        }}>
          <div className="input-icon-wrap" style={{ flex: 1 }}>
            <span className="input-icon" style={{ fontSize: 14 }}>🔍</span>
            <input className="input" placeholder="Search gigs..."
              style={{ background: "var(--bg-base)", padding: "8px 14px 8px 38px" }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/find-work?q=${e.target.value}`);
                  setShowSearch(false);
                }
              }}
            />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSearch(false)}>✕</button>
        </div>
      )}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>

        {/* ── Notification bell ── */}
        <div style={{ position: "relative" }} ref={dropRef}>
          <button className="btn btn-ghost btn-sm"
            style={{ position: "relative", padding: 8 }}
            onClick={() => setShowNotifs(s => !s)}>
            🔔
            {unread > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                width: 16, height: 16, borderRadius: "50%",
                background: "var(--urgent)", fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", border: "2px solid var(--bg-surface)",
              }}>{unread > 9 ? "9+" : unread}</span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              width: 320, background: "var(--bg-card)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-card)", zIndex: 200, overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 16px", borderBottom: "1px solid var(--border)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                {unread > 0 && (
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={markAll}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {allNotifs.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                    No notifications yet
                  </div>
                ) : allNotifs.map((n, i) => (
                  <div key={n._id || i} style={{
                    padding: "12px 16px", borderBottom: "1px solid var(--border)",
                    background: n.isRead ? "transparent" : "rgba(59,232,176,0.04)",
                    cursor: "pointer",
                  }}>
                    <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 13, color: "var(--text-primary)", marginBottom: 2 }}>
                      {n.title || n.type}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {n.body || n.jobTitle || ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── User avatar ── */}
        <button className="btn btn-ghost btn-sm" style={{ gap: 8, padding: "6px 8px" }}
          onClick={() => navigate("/profile")}>
          <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize: 11 }}>
            {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <span className="hide-mobile" style={{ fontSize: 13, fontWeight: 600 }}>
            {user?.name?.split(" ")[0]}
          </span>
        </button>
      </div>

      <style>{`
        /* Desktop: hide hamburger, show search */
        .header-menu-btn { display: none; }
        .header-search   { display: flex !important; }
        .show-mobile     { display: none !important; }

        /* Tablet/mobile: show hamburger, hide search */
        @media (max-width: 768px) {
          .header-menu-btn { display: flex !important; }
          .header-search   { display: none !important; }
          .show-mobile     { display: flex !important; }
        }
      `}</style>
    </header>
  );
}