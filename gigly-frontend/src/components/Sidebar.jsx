import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { RozgaaarMiniLogo, RozgaaarNameLogo } from "./RozgaaarLogo";

const SidebarIcon = ({ type }) => {
  const size = 18;
  const stroke = "currentColor";
  const strokeWidth = 2;

  switch (type) {
    case "dashboard":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
      );
    case "findWork":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      );
    case "postGig":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      );
    case "myGigs":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      );
    case "messages":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      );
    case "earnings":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      );
    case "profile":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      );
    case "admin":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      );
    case "logout":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      );
    default:
      return null;
  }
};

const icons = {
  dashboard: "dashboard",
  findWork:  "findWork",
  postGig:   "postGig",
  myGigs:    "myGigs",
  messages:  "messages",
  earnings:  "earnings",
  profile:   "profile",
  admin:     "admin",
  logout:    "logout",
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const workerLinks = [
    { to: "/dashboard", icon: icons.dashboard, label: "Dashboard" },
    { to: "/my-jobs",    icon: icons.myGigs,    label: "My Jobs"   },
    { to: "/messages",   icon: icons.messages,  label: "Messages"  },
    { to: "/earnings",   icon: icons.earnings,  label: "Wallet"    },
    { to: "/profile",    icon: icons.profile,   label: "Profile"   },
  ];
  const businessLinks = [
    { to: "/dashboard",  icon: icons.dashboard, label: "Dashboard" },
    { to: "/post-gig",   icon: icons.postGig,   label: "Post a Gig"},
    { to: "/my-gigs",    icon: icons.myGigs,    label: "My Gigs"   },
    { to: "/messages",   icon: icons.messages,  label: "Messages"  },
    { to: "/earnings",   icon: icons.earnings,  label: "Wallet"    },
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
        <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10 }}>
              <RozgaaarMiniLogo size={52} textColor="var(--text-primary)" />
              <RozgaaarNameLogo height={38} textColor="var(--text-primary)" />
            </div>
            <div style={{ width:6, height:6, borderRadius:"50%",
              background: isConnected ? "var(--success)" : "var(--text-muted)",
              boxShadow: isConnected ? "0 0 10px rgba(0,110,55,0.4)" : "none"
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
                  <span style={{ display: "flex", alignItems: "center", opacity: isActive ? 1 : 0.7 }}>
                    <SidebarIcon type={icon} />
                  </span>
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
          <button className="btn btn-ghost btn-sm btn-full" style={{ justifyContent:"flex-start", gap: 10 }}
            onClick={async () => { await logout(); navigate("/login"); }}>
            <span style={{ display: "flex", alignItems: "center" }}><SidebarIcon type="logout" /></span> Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}