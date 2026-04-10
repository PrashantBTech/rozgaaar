import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { jobsAPI, appsAPI, paymentsAPI } from "../services/api";
import GigCard from "../components/GigCard";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const GREET = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export default function Dashboard() {
  const { user } = useAuth();
  const { nearbyJobs } = useSocket();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ earned: 0, newGigs: 0, activeJobs: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [nearbyGigs, setNearbyGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes, walletRes] = await Promise.allSettled([
        jobsAPI.getAll({ limit: 6, status: "open" }),
        appsAPI.getMine(),
        paymentsAPI.getWallet(),
      ]);

      if (jobsRes.status === "fulfilled") setNearbyGigs(jobsRes.value.data.data || []);

      if (appsRes.status === "fulfilled") {
        const apps = appsRes.value.data.data || [];
        const activeJobs = apps.filter(a => ["accepted","in_progress"].includes(a.status)).length;
        setStats(s => ({ ...s, activeJobs }));
        const recent = apps.slice(0, 5).map(a => ({
          id: a._id,
          type: a.status === "completed" ? "payment" : a.status === "accepted" ? "accepted" : "application",
          title: a.status === "completed" ? "Payment Received" : a.status === "accepted" ? "Application Accepted 🎉" : "Application Submitted",
          desc: a.job?.title || "Gig",
          amount: a.status === "completed" ? `₹${a.totalPaid}` : null,
          status: a.status,
          time: a.updatedAt,
        }));
        setRecentActivity(recent);
      }

      if (walletRes.status === "fulfilled") {
        const w = walletRes.value.data.data;
        setStats(s => ({ ...s, earned: w.walletBalance || 0 }));
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleApply = async (job) => {
    try {
      await appsAPI.apply(job._id);
      toast.success("Applied successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not apply");
    }
  };

  const quickActions = user?.role === "worker"
    ? [
        { icon:"🔍", label:"Find Work", sub:"Browse local gigs and get paid today.", action:()=>navigate("/find-work"), color:"var(--accent)" },
        { icon:"📋", label:"My Jobs", sub:"View all your applications and active gigs.", action:()=>navigate("/my-jobs"), color:"var(--cyan)" },
      ]
    : [
        { icon:"➕", label:"Post Work", sub:"Need help fast? Hire instantly for short-term gigs.", action:()=>navigate("/post-gig"), color:"var(--accent)" },
        { icon:"📋", label:"My Gigs", sub:"Manage your postings and hired workers.", action:()=>navigate("/my-gigs"), color:"var(--cyan)" },
      ];

  return (
    <div className="page-content">

      {/* ── Welcome Banner ── */}
      <div className="fade-in" style={{ marginBottom:48 }}>
        <div style={{ fontSize:14, color:"var(--text-muted)", marginBottom:10, fontWeight:700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {GREET()}, {user?.name?.split(" ")[0]}
        </div>
        <h1 style={{ 
          fontSize: "clamp(32px, 5vw, 48px)", 
          marginBottom:16, 
          fontFamily: "var(--font-display)", 
          fontWeight: 800, 
          textTransform: "uppercase", 
          lineHeight: 1,
          letterSpacing: "-0.04em"
        }}>
          Overview<span style={{ color:"var(--accent)", fontStyle: "italic", fontFamily: "var(--font-editorial)", textTransform: "lowercase", marginLeft: 10, fontWeight: 400 }}>of your gig activity.</span>
        </h1>
        <p style={{ color:"var(--text-secondary)", fontSize:18, fontFamily: "var(--font-editorial)", fontStyle: "italic" }}>
          Explore and manage your local network opportunities.
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div
        className="stats-grid fade-in fade-in-1"
        style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:16, marginBottom:32 }}
      >
        {/*<div className="stat-card">
          <div className="stat-label">Earned Today</div>
          <div className="stat-value" style={{ color:"var(--accent)" }}>
            ₹{stats.earned.toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 })}
          </div>
          <div className="stat-delta">+₹120 vs yesterday</div>
        </div> */}
        
        {user?.role === "worker" && (
          <div className="stat-card">
            <div className="stat-label">New Gigs Nearby</div>
            <div className="stat-value" style={{ color:"var(--cyan)" }}>{nearbyGigs.length}</div>
            <div className="stat-delta">Available now</div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{stats.activeJobs}</div>
          <div className="stat-delta">In progress</div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="fade-in fade-in-2" style={{ marginBottom:32 }}>
        <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>
          Quick Actions
        </div>
        <div className="grid-2" style={{ gap:16 }}>
          {quickActions.map(a => (
            <button key={a.label} className="card"
              style={{ border:"1px solid var(--border)", cursor:"pointer", textAlign:"left", background:"var(--bg-card)", transition:"all 0.2s" }}
              onClick={a.action}
              onMouseEnter={e => { e.currentTarget.style.borderColor="var(--border-active)"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="none"; }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{a.icon}</div>
              <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:16, color:a.color, marginBottom:6 }}>{a.label}</div>
              <div style={{ fontSize:13, color:"var(--text-secondary)" }}>{a.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main 2-col grid ── */}
      <div
        className="dashboard-grid"
        style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24 }}
      >

        {/* ── Nearby Gigs / Posted Jobs ── */}
        <div className="fade-in fade-in-3">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              {user?.role === "worker" ? "Nearby Opportunities" : "Your Recent Postings"}
            </div>
            <button className="btn btn-ghost btn-sm"
              onClick={() => navigate(user?.role === "worker" ? "/find-work" : "/my-gigs")}>
              View all →
            </button>
          </div>

          {loading ? (
            <div style={{ display:"grid", gap:12 }}>
              {[1,2,3].map(i => (
                <div key={i} className="skeleton" style={{ height:140, borderRadius:"var(--radius-lg)" }} />
              ))}
            </div>
          ) : nearbyGigs.length === 0 ? (
            <div className="card" style={{ textAlign:"center", padding:40, color:"var(--text-muted)" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
              <div>No gigs available right now</div>
            </div>
          ) : (
            <div style={{ display:"grid", gap:12 }}>
              {nearbyGigs.slice(0,4).map(job => (
                <GigCard key={job._id} job={job} onApply={handleApply} />
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Activity ── */}
        <div className="fade-in fade-in-4">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Recent Activity
            </div>
            <button className="btn btn-ghost btn-sm">View all</button>
          </div>

          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            {recentActivity.length === 0 ? (
              <div style={{ padding:32, textAlign:"center", color:"var(--text-muted)" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
                <div style={{ fontSize:13 }}>No activity yet</div>
              </div>
            ) : recentActivity.map((a, i) => (
              <div key={a.id} style={{
                padding:"14px 16px",
                borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border)" : "none",
                display:"flex", gap:12, alignItems:"flex-start",
              }}>
                <div style={{
                  width:36, height:36, borderRadius:"var(--radius-sm)", flexShrink:0,
                  background: a.type === "payment" ? "var(--accent-dim)" : a.type === "accepted" ? "var(--gold-dim)" : "var(--cyan-dim)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
                }}>
                  {a.type === "payment" ? "💰" : a.type === "accepted" ? "🎉" : "📋"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>{a.title}</div>
                  <div style={{ fontSize:12, color:"var(--text-muted)", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                    {a.desc}
                  </div>
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>
                    {a.time ? formatDistanceToNow(new Date(a.time), { addSuffix:true }) : ""}
                  </div>
                </div>
                <div style={{ flexShrink:0, textAlign:"right" }}>
                  {a.amount && (
                    <div style={{ fontWeight:700, color:"var(--accent)", fontSize:13 }}>{a.amount}</div>
                  )}
                  <span className={`badge ${
                    a.status === "completed" ? "badge-success" :
                    a.status === "accepted"  ? "badge-info"    : "badge-pending"
                  }`} style={{ fontSize:9, padding:"2px 6px" }}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Trending categories */}
          <div style={{ marginTop:24 }}>
            <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>
              Trending Near You
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {["Delivery","Cleaning","Moving","Pet Care","☕ Cafe"].map(c => (
                <button key={c} className="tag" style={{ cursor:"pointer" }}
                  onClick={() => navigate(`/find-work?category=${c.toLowerCase().replace(/[^a-z]/g,"_")}`)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}