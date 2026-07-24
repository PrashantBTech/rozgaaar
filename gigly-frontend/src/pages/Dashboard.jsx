import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { jobsAPI, appsAPI, paymentsAPI } from "../services/api";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import FindWork from "./FindWork";

// ── SVG Icon Components ──────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const FolderIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="2"></circle>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <line x1="9" y1="12" x2="15" y2="12"></line>
    <line x1="9" y1="16" x2="13" y2="16"></line>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="17" y1="11" x2="23" y2="11"></line>
  </svg>
);

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const DotsVerticalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const GREET = () => {
  const h = new Date().getHours();
  return h < 12 ? "GOOD MORNING" : h < 17 ? "GOOD AFTERNOON" : "GOOD EVENING";
};

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "worker") {
    return <FindWork />;
  }

  const { nearbyJobs } = useSocket();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ earned: 0, newGigs: 0, activeJobs: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [myGigsList, setMyGigsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [user, nearbyJobs]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.role === "business") {
        const [myJobsRes, walletRes] = await Promise.allSettled([
          jobsAPI.getMine(),
          paymentsAPI.getWallet(),
        ]);

        if (myJobsRes.status === "fulfilled") {
          const gigs = myJobsRes.value.data.data || [];
          setMyGigsList(gigs);
          const activeJobs = gigs.filter(g => ["open", "in_progress"].includes(g.status)).length;
          const openGigs = gigs.filter(g => g.status === "open").length;
          setStats(s => ({ ...s, activeJobs, newGigs: openGigs }));

          const recent = gigs.slice(0, 5).map(g => ({
            id: g._id,
            type: g.status === "completed" ? "payment" : "job_posted",
            title: g.status === "completed" ? "Gig Completed" : "Gig Posted",
            badge: g.status === "open" ? "OPEN" : g.status === "in_progress" ? "IN PROGRESS" : g.status.toUpperCase(),
            desc: g.title,
            time: g.updatedAt || g.createdAt,
          }));
          setRecentActivity(recent);
        }

        if (walletRes.status === "fulfilled") {
          const w = walletRes.value.data.data;
          setStats(s => ({ ...s, earned: w.walletBalance || 0 }));
        }
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ position: "relative", paddingBottom: 80 }}>

      {/* ── Welcome Banner ── */}
      <div className="fade-in" style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {GREET()}, {user?.businessName?.toUpperCase() || user?.name?.toUpperCase() || "RAPID DELIVERY SOLUTIONS"}
        </div>
        <h1 style={{ 
          fontSize: "clamp(24px, 4vw, 30px)", 
          fontWeight: 800, 
          color: "#0F172A", 
          letterSpacing: "-0.025em", 
          marginBottom: 6,
          fontFamily: "'DM Sans', sans-serif"
        }}>
          Overview of Your Gig Activity
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0, fontStyle: "normal" }}>
          Explore and manage your local network opportunities.
        </p>
      </div>

      {/* ── Top Grid (Active Jobs & Recent Activity) ── */}
      <div className="fade-in fade-in-1" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
        gap: 24, 
        marginBottom: 28 
      }}>
        
        {/* Active Jobs Card */}
        <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
              ACTIVE JOBS
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
              <span style={{ fontSize: 56, fontWeight: 900, color: "#0F172A", lineHeight: 1 }}>
                {stats.activeJobs}
              </span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>
                In progress
              </span>
            </div>
            <div style={{ width: 70, height: 2.5, background: "var(--border-active)", borderRadius: 2, marginBottom: 24 }} />
          </div>

          <div 
            onClick={() => navigate("/my-gigs")}
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: 8, 
              color: "#103461", 
              fontWeight: 700, 
              fontSize: 14, 
              cursor: "pointer",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            View all active tasks <ArrowRightIcon />
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              RECENT ACTIVITY
            </div>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}
              onClick={() => navigate("/my-gigs")}
            >
              VIEW ALL
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {recentActivity.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No recent activity recorded
              </div>
            ) : recentActivity.slice(0, 2).map(act => (
              <div key={act.id} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ 
                  width: 42, 
                  height: 42, 
                  borderRadius: 10, 
                  background: "#EFF6FF", 
                  color: "#2563EB", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {act.type === "payment" ? <UserPlusIcon /> : <ClipboardIcon />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{act.title}</span>
                    {act.badge && (
                      <span style={{ 
                        fontSize: 10, 
                        fontWeight: 800, 
                        background: "#DCFCE7", 
                        color: "#166534", 
                        padding: "2px 6px", 
                        borderRadius: 4 
                      }}>
                        {act.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {act.desc}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {act.time ? formatDistanceToNow(new Date(act.time), { addSuffix: true }) : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Quick Actions Grid (Post Work & My Gigs) ── */}
      <div className="fade-in fade-in-2" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: 20, 
        marginBottom: 36 
      }}>
        {/* Post Work Action Card */}
        <div 
          onClick={() => navigate("/post-gig")}
          style={{ 
            border: "1.5px dashed rgba(37, 99, 235, 0.35)", 
            background: "rgba(239, 246, 255, 0.45)", 
            borderRadius: 14, 
            padding: 24, 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: 18,
            transition: "all 0.25s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(37, 99, 235, 0.35)"; e.currentTarget.style.transform = "none"; }}
        >
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 12, 
            background: "#3B82F6", 
            color: "#FFFFFF", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            flexShrink: 0
          }}>
            <PlusIcon />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", marginBottom: 4 }}>Post Work</div>
            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.4 }}>Need help fast? Hire instantly for short-term gigs.</div>
          </div>
        </div>

        {/* My Gigs Action Card */}
        <div 
          onClick={() => navigate("/my-gigs")}
          style={{ 
            border: "1px solid var(--border)", 
            background: "#FFFFFF", 
            borderRadius: 14, 
            padding: 24, 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: 18,
            transition: "all 0.25s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-active)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
        >
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 12, 
            background: "#EFF6FF", 
            color: "#2563EB", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            flexShrink: 0
          }}>
            <FolderIcon />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", marginBottom: 4 }}>My Gigs</div>
            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.4 }}>Manage your postings and hired workers in one place.</div>
          </div>
        </div>
      </div>

      {/* ── Your Recent Postings Section ── */}
      <div className="fade-in fade-in-3">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              YOUR RECENT POSTINGS
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Active Opportunities
            </h2>
          </div>
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => navigate("/my-gigs")}
          >
            VIEW ALL POSTINGS <ArrowRightIcon />
          </button>
        </div>

        {loading ? (
          <div style={{ display: "grid", gap: 14 }}>
            {[1, 2].map(i => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
            ))}
          </div>
        ) : myGigsList.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 12, color: "#2563EB" }}><BriefcaseIcon /></div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>You haven't posted any gigs yet</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Create your first posting to start hiring nearby workers instantly.</div>
            <button className="btn btn-primary btn-sm" style={{ padding: "8px 20px" }} onClick={() => navigate("/post-gig")}>
              <PlusIcon /> Post Your First Gig
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {myGigsList.slice(0, 4).map(job => (
              <div 
                key={job._id}
                className="job-row-card"
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                {/* Left accent bar */}
                <div 
                  className="job-row-accent"
                  style={{
                    background: job.status === "open" ? "#16A34A" : job.status === "in_progress" ? "#2563EB" : "#94A3B8"
                  }} 
                />

                <div className="job-row-content">
                  {/* Left info & icon */}
                  <div className="job-row-main">
                    <div className="job-row-icon">
                      <BriefcaseIcon />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="job-row-title">
                        {job.title}
                      </div>
                      <div className="job-row-meta">
                        <span className="job-row-meta-item">
                          <PinIcon /> {job.location?.address || job.location?.city || "Mumbai, Suburban"}
                        </span>
                        <span className="job-row-meta-item">
                          <ClockIcon /> {job.durationHours ? `${job.durationHours}h Flexible Hours` : "Flexible Hours"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right controls */}
                  <div className="job-row-actions">
                    <div className="job-row-pay">
                      <div className="job-row-price">
                        ₹{job.payPerHour}<span className="job-row-price-unit">/hr</span>
                      </div>
                      <div className="job-row-badge">
                        {job.status === "open" ? "HIRING NOW" : job.status.toUpperCase()}
                      </div>
                    </div>

                    <button 
                      className="job-row-manage-btn" 
                      onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job._id}`); }}
                    >
                      Manage
                    </button>

                    <button 
                      style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job._id}/edit`); }}
                      title="Options"
                    >
                      <DotsVerticalIcon />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating Action Button (FAB) ── */}
      <div 
        onClick={() => navigate("/post-gig")}
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "#0F172A",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.3)",
          zIndex: 999,
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease"
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 14px 30px rgba(15, 23, 42, 0.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(15, 23, 42, 0.3)"; }}
        title="Post a New Gig"
      >
        <PlusIcon />
      </div>

    </div>
  );
}