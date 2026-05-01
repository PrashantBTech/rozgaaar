import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const icons = {
  dashboard: "⚡",
  findWork:  "🔍",
  postGig:   "➕",
  myGigs:    "📋",
  messages:  "💬",
  earnings:  "💰",
  profile:   "👤",
  admin:     "🛡️",
  logout:    "→",
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const workerLinks = [
    { to: "/dashboard", icon: icons.dashboard, label: "Dashboard" },
    { to: "/find-work",  icon: icons.findWork,  label: "Find Work"  },
    { to: "/my-jobs",    icon: icons.myGigs,    label: "My Jobs"   },
    { to: "/messages",   icon: icons.messages,  label: "Messages"  },
    { to: "/earnings",   icon: icons.earnings,  label: "Earnings"  },
    { to: "/profile",    icon: icons.profile,   label: "Profile"   },
  ];
  const businessLinks = [
    { to: "/dashboard",  icon: icons.dashboard, label: "Dashboard" },
    { to: "/post-gig",   icon: icons.postGig,   label: "Post a Gig"},
    { to: "/my-gigs",    icon: icons.myGigs,    label: "My Gigs"   },
    { to: "/messages",   icon: icons.messages,  label: "Messages"  },
    { to: "/earnings",   icon: icons.earnings,  label: "Earnings"  },
    { to: "/profile",    icon: icons.profile,   label: "Profile"   },
  ];
  const adminLinks = [
    { to: "/dashboard",  icon: icons.dashboard, label: "Dashboard" },
    { to: "/admin",      icon: icons.admin,     label: "Admin Panel"},
    { to: "/profile",    icon: icons.profile,   label: "Profile"   },
  ];

  const links = user?.role === "admin" ? adminLinks
              : user?.role === "business" ? businessLinks
              : workerLinks;

  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?";

  return (
    <>
      {open && <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:99 }} onClick={onClose} />}
      <nav className={`sidebar${open ? " open" : ""}`}>
        {/* Logo */}
        <div style={{ padding:"24px 16px 16px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:"8px",
              background:"var(--dark-accent)", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:16, fontWeight:900, color:"var(--accent)",
              fontFamily:"var(--font-display)"
            }}>R</div>
            <span style={{ 
              fontFamily:"var(--font-display)", 
              fontWeight:800, 
              fontSize:18, 
              color:"var(--text-primary)", 
              letterSpacing:"-0.04em", 
              textTransform: "uppercase" 
            }}>
              Rozgaaar
            </span>
            <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%",
              background: isConnected ? "#10B981" : "var(--text-muted)",
              boxShadow: isConnected ? "0 0 10px rgba(16,185,129,0.3)" : "none"
            }} />
          </div>
        </div>

        {/* Links */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 14px" }}>
          {links.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              style={({ isActive }) => ({
                display:"flex", alignItems:"center", gap:14,
                padding:"12px 16px", borderRadius:"var(--radius-md)",
                marginBottom:4, textDecoration:"none", fontWeight:isActive ? 700 : 500,
                fontSize:14, transition:"all 0.25s cubic-bezier(0.23, 1, 0.32, 1)",
                background: isActive ? "var(--dark-accent)" : "transparent",
                color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                letterSpacing: isActive ? "0.02em" : "0",
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ fontSize:18, opacity: isActive ? 1 : 0.7 }}>{icon}</span>
                  {label}
                  {isActive && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Footer */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div className={`avatar avatar-md avatar-placeholder`} style={{ fontSize:14 }}>{initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:13, color:"var(--text-primary)", truncate:true, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                {user?.name || "Guest"}
              </div>
              <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"capitalize" }}>
                {user?.role}
                {user?.isIdVerified && <span style={{ marginLeft:4, color:"var(--accent)" }}>✓</span>}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-full" style={{ justifyContent:"flex-start" }}
            onClick={async () => { await logout(); navigate("/login"); }}>
            <span>{icons.logout}</span> Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}