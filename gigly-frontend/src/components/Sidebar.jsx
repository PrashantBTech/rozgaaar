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
    { to: "/ai-concierge", icon: "🤖",              label: "Ask Gigi"  },
  ];
  const businessLinks = [
    { to: "/dashboard",  icon: icons.dashboard, label: "Dashboard" },
    { to: "/post-gig",   icon: icons.postGig,   label: "Post a Gig"},
    { to: "/my-gigs",    icon: icons.myGigs,    label: "My Gigs"   },
    { to: "/messages",   icon: icons.messages,  label: "Messages"  },
    { to: "/earnings",   icon: icons.earnings,  label: "Earnings"  },
    { to: "/profile",    icon: icons.profile,   label: "Profile"   },
    { to: "/ai-concierge", icon: "🤖",              label: "Ask Gigi"  },
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
        <div style={{ padding:"20px 20px 12px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:"var(--radius-sm)",
              background:"var(--accent)", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:18, fontWeight:800, color:"#080d1a",
              fontFamily:"var(--font-display)"
            }}>G</div>
            <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:20, color:"var(--text-primary)", letterSpacing:"-0.02em" }}>
              Rozgaaar
            </span>
            <div style={{ marginLeft:"auto", width:8, height:8, borderRadius:"50%",
              background: isConnected ? "var(--accent)" : "var(--text-muted)",
              boxShadow: isConnected ? "0 0 8px var(--accent-glow)" : "none"
            }} title={isConnected ? "Live" : "Offline"} />
          </div>
        </div>

        {/* Links */}
        <div style={{ flex:1, overflowY:"auto", padding:"12px 12px" }}>
          {links.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              style={({ isActive }) => ({
                display:"flex", alignItems:"center", gap:12,
                padding:"10px 12px", borderRadius:"var(--radius-md)",
                marginBottom:2, textDecoration:"none", fontWeight:500,
                fontSize:14, transition:"all 0.15s",
                background: isActive ? "linear-gradient(90deg, var(--accent-dim), transparent)" : "transparent",
                color: isActive ? "#fff" : "var(--text-secondary)",
                borderLeft: isActive ? "3px solid var(--neon-blue)" : "3px solid transparent",
                boxShadow: isActive ? "-15px 0 30px -10px var(--neon-pink)" : "none",
              })}
            >
              <span style={{ fontSize:16 }}>{icon}</span>
              {label}
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