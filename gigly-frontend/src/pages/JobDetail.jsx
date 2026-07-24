import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobsAPI, appsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow, format } from "date-fns";
import toast from "react-hot-toast";

const getTrustScore = (u) => {
  if (!u) return "—";
  let score = 50;
  if (u.isIdVerified) score += 20;
  if (u.totalJobsCompleted > 0) score += Math.min(20, u.totalJobsCompleted * 2);
  if (u.averageRating > 0) score += (u.averageRating / 5) * 10;
  return `${Math.min(100, Math.round(score))}%`;
};

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [checks, setChecks] = useState({ age:false, transport:false, smartphone:false });
  const [application, setApplication] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    jobsAPI.getOne(id).then(r => { setJob(r.data.data); setLoading(false); }).catch(() => setLoading(false));

    if (user?.role === "worker") {
      appsAPI.getMine().then(r => {
        const apps = r.data.data || [];
        const found = apps.find(app => app.job === id || app.job?._id === id);
        if (found) setApplication(found);
      }).catch(() => {});
    }
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (user.role !== "worker") {
      toast.error("Please log in as a Worker account to apply for gigs.");
      return;
    }
    if (!checks.age) { toast.error("Please confirm you meet the prerequisites"); return; }

    setApplying(true);
    try {
      await appsAPI.apply(job._id, coverNote);
      toast.success("Applied! 🎉 You'll be notified when accepted.");
      const appsRes = await appsAPI.getMine();
      const found = (appsRes.data.data || []).find(app => app.job === id || app.job?._id === id);
      if (found) setApplication(found);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not apply");
    } finally { setApplying(false); }
  };

  const handleWithdraw = async () => {
    if (!application) return;
    setWithdrawing(true);
    try {
      await appsAPI.withdraw(application._id);
      toast.success("Application withdrawn successfully.");
      setApplication(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not withdraw application");
    } finally { setWithdrawing(false); }
  };

  if (loading) return (
    <div className="page-content">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:200, borderRadius:"var(--radius-lg)" }} />)}
      </div>
    </div>
  );

  if (!job) return (
    <div className="page-content" style={{ textAlign:"center", paddingTop:80 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>😕</div>
      <h2>Job not found</h2>
      <button className="btn btn-primary" style={{ marginTop:20 }} onClick={() => navigate("/find-work")}>Browse Gigs</button>
    </div>
  );

  const business = job.postedBy;
  const isFullTime = false;
  const totalPay = job.payPerHour * job.durationHours;
  const isOwner = user && user._id === business?._id;
  const slotsLeft = job.slotsRequired - (job.slotsFilled || 0);
  const employmentLabel = "Part-time / Gig";

  return (
    <div className="page-content">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:20 }} onClick={() => navigate(-1)}>← Back</button>

      <div className="job-detail-grid" style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24, alignItems:"start" }}>
        {/* ── Left: Job Info ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Header card */}
          <div className={`card fade-in${job.isUrgent ? " urgent" : ""}`}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:12 }}>
              <div>
                {job.isUrgent && <span className="badge badge-urgent" style={{ marginBottom:8, display:"inline-flex" }}>🔴 URGENT HIRING</span>}
                <h1 style={{ fontSize:"clamp(20px,3vw,28px)", marginBottom:4 }}>{job.title}</h1>
                <div style={{ color:"var(--text-secondary)", fontSize:14 }}>
                  📍 {job.location?.address} • Posted {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix:true }) : ""}
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:32, color:"var(--accent)" }}>
                  ₹{job.payPerHour}<span style={{ fontSize:14, fontWeight:400, color:"var(--text-muted)" }}>{isFullTime ? "/mo" : "/hr"}</span>
                </div>
                <div style={{ fontSize:13, color:"var(--text-secondary)" }}>
                  {isFullTime ? "Estimated monthly salary" : `₹${totalPay} total est.`}
                </div>
              </div>
            </div>

            {/* Meta tags */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              <span className="badge badge-info">⏱ {job.durationHours} Hours{isFullTime ? "/day" : ""}</span>
              <span className="badge badge-info">📅 {job.date ? format(new Date(job.date), "EEE, MMM d") : ""}</span>
              <span className="badge badge-info">🕐 {job.startTime} – {job.endTime}</span>
              <span className="badge badge-info">💼 {employmentLabel}</span>
              {slotsLeft > 0 && <span className="badge badge-success">{slotsLeft} slot{slotsLeft>1?"s":""} left</span>}
              {job.requirements?.attire && <span className="badge" style={{ background:"var(--bg-elevated)", color:"var(--text-secondary)" }}>👕 {job.requirements.attire}</span>}
            </div>
          </div>

          {/* About the Gig */}
          <div className="card fade-in fade-in-1">
            <h3 style={{ fontSize:16, marginBottom:16 }}>About the Gig</h3>
            <p style={{ color:"var(--text-secondary)", lineHeight:1.8, fontSize:14 }}>{job.description}</p>
          </div>

          {/* Responsibilities & Requirements */}
          <div className="card fade-in fade-in-2">
            <h3 style={{ fontSize:16, marginBottom:16 }}>Requirements</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                `Must be ${job.requirements?.minAge || 18} years or older`,
                "Punctual and professional attitude",
                "Ability to stand for extended periods",
                "Friendly demeanor",
                ...(job.requirements?.ownVehicle ? ["Own vehicle required"] : []),
                ...(job.requirements?.requireResume ? ["CV/Resume upload required to apply"] : []),
              ].map((r, i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:14, color:"var(--text-secondary)" }}>
                  <span style={{ color:"var(--accent)", marginTop:1, flexShrink:0 }}>✓</span>
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="card fade-in fade-in-3">
              <h3 style={{ fontSize:16, marginBottom:16 }}>Skills Preferred</h3>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {job.skills.map(s => <span key={s} className="tag">{s}</span>)}
              </div>
            </div>
          )}

          {/* Prerequisites (workers & guests) */}
          {(!user || user?.role === "worker") && (
            <div className="card fade-in fade-in-4">
              <h3 style={{ fontSize:16, marginBottom:16 }}>Prerequisites</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  { k:"age", label:"I am 18 years or older", sub:"Required for insurance purposes." },
                  { k:"transport", label:"I have reliable transportation", sub:"Public transit or personal vehicle." },
                  { k:"smartphone", label:"I have a smartphone with data", sub:"Required for clock-in/clock-out via Rozgaaar app." },
                ].map(c => (
                  <label key={c.k} style={{ display:"flex", gap:12, cursor:"pointer", alignItems:"flex-start" }}>
                    <input type="checkbox" checked={checks[c.k]} onChange={e => setChecks({...checks,[c.k]:e.target.checked})}
                      style={{ marginTop:3, accentColor:"var(--accent)", width:16, height:16 }} />
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>{c.label}</div>
                      <div style={{ fontSize:12, color:"var(--text-muted)" }}>{c.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="card fade-in fade-in-4">
            <h3 style={{ fontSize:16, marginBottom:12 }}>Location</h3>
            <div style={{ background:"var(--bg-base)", borderRadius:"var(--radius-md)", height:180,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"var(--text-muted)",
              border:"1px solid var(--border)", flexDirection:"column", gap:8 }}>
              <div style={{ fontSize:32 }}>🗺️</div>
              <div>Exact meeting point revealed after acceptance</div>
              <div style={{ fontSize:13 }}>📍 {job.location?.address}</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop:12, width:"100%" }}>Get Directions</button>
          </div>
        </div>

        {/* ── Right: Sticky Apply Panel ── */}
        <div className="job-sticky-panel" style={{ position:"sticky", top:96 }}>
          {/* Pricing card */}
          <div className="card fade-in" style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:13, color:"var(--text-secondary)" }}>{isFullTime ? "Salary" : "Rate"}</span>
              <span style={{ fontWeight:700 }}>₹{job.payPerHour}{isFullTime ? "/mo" : "/hr"}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:13, color:"var(--text-secondary)" }}>{isFullTime ? "Daily Hours" : "Duration"}</span>
              <span style={{ fontWeight:700 }}>{job.durationHours} hours</span>
            </div>
            <div className="divider" />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <span style={{ fontWeight:700 }}>{isFullTime ? "Total Monthly" : "Estimated Total"}</span>
              <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:20, color:"var(--accent)" }}>₹{totalPay.toLocaleString("en-IN")}</span>
            </div>

            {/* ── Guest View Apply Prompt ── */}
            {!user && job.status === "open" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={() => setShowAuthModal(true)}
                >
                  Apply
                </button>
                <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                  Anyone can view jobs on Rozgaaar. Sign in to apply!
                </p>
              </div>
            )}

            {/* ── Logged-in Worker View ── */}
            {user?.role === "worker" && !isOwner && (
              <>
                {application ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className={`badge badge-${application.status === "accepted" || application.status === "shortlisted" ? "success" : "pending"}`} 
                         style={{ 
                           width: "100%", 
                           justifyContent: "center", 
                           padding: "10px 14px", 
                           fontSize: 13, 
                           fontWeight: 700,
                           textTransform: "uppercase" 
                         }}>
                      Status: {application.status}
                    </div>
                    
                    {["pending", "viewed", "shortlisted"].includes(application.status) && (
                      <button
                        className="btn btn-secondary btn-full"
                        style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
                        disabled={withdrawing}
                        onClick={handleWithdraw}
                      >
                        {withdrawing ? "Withdrawing..." : "Withdraw Application"}
                      </button>
                    )}
                    
                    <p style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", marginTop:4 }}>
                      {application.status === "shortlisted" && "You have been shortlisted! The business will contact you shortly."}
                      {application.status === "accepted" && "Your application was accepted! Check My Jobs for check-in options."}
                      {application.status === "pending" && "Your application is currently pending review by the employer."}
                      {application.status === "viewed" && "The employer has reviewed your application profile."}
                    </p>
                  </div>
                ) : (
                  job.status === "open" && (
                    <>
                      {showNote && (
                        <div className="input-group" style={{ marginBottom:12 }}>
                          <label className="input-label">Cover Note (optional)</label>
                          <textarea className="input" rows={3} placeholder="Tell the business why you're a great fit..."
                            value={coverNote} onChange={e=>setCoverNote(e.target.value)} style={{ resize:"vertical" }} />
                        </div>
                      )}
                      <button
                        className="btn btn-primary btn-full btn-lg"
                        disabled={
                          applying ||
                          !checks.age
                        }
                        onClick={handleApply}
                      >
                        {applying ? "Applying…" : "Apply"}
                      </button>
                      <button className="btn btn-ghost btn-sm btn-full" style={{ marginTop:8 }} onClick={() => setShowNote(s=>!s)}>
                        {showNote ? "Remove note" : "+ Add cover note"}
                      </button>
                      <p style={{ fontSize:11, color:"var(--text-muted)", textAlign:"center", marginTop:10 }}>
                        You won't be charged. Payment is direct deposit upon completion.
                      </p>
                    </>
                  )
                )}
              </>
            )}

            {/* ── Logged-in Business View (non-owner) ── */}
            {user?.role === "business" && !isOwner && (
              <div style={{ textAlign: "center", padding: 12, background: "var(--bg-hover)", borderRadius: "var(--radius-md)" }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                  Logged in as Business account.
                </p>
                <button className="btn btn-secondary btn-sm btn-full" onClick={() => navigate(`/login?redirect=/jobs/${job._id}`)}>
                  Switch to Worker Account
                </button>
              </div>
            )}

            {isOwner && (
              <button className="btn btn-secondary btn-full" onClick={() => navigate(`/my-gigs`)}>
                Manage This Gig →
              </button>
            )}
            {job.status !== "open" && !isOwner && (
              <div className="badge badge-pending" style={{ width:"100%", justifyContent:"center", padding:10 }}>
                {job.status === "completed" ? "✓ Completed" : job.status === "expired" ? "⏰ Expired" : job.status}
              </div>
            )}
          </div>

          {/* Poster trust card */}
          {business && (
            <div className="card fade-in fade-in-1">
              <h4 style={{ fontSize:14, marginBottom:14 }}>Poster Trust Score</h4>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
                <div className="avatar avatar-md avatar-placeholder" style={{ fontSize:14 }}>
                  {business.name?.[0] || "B"}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{business.businessName || business.name}</div>
                  <div style={{ fontSize:12, color:"var(--text-muted)" }}>Member since {new Date(business.createdAt).getFullYear()}</div>
                </div>
                <div style={{ marginLeft:"auto", fontFamily:"var(--font-display)", fontWeight:800, fontSize:18, color:"var(--accent)" }}>
                  {getTrustScore(business)}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  business.isIdVerified && "✅ Payment Verified",
                  "📋 50+ Gigs Posted",
                  "⚡ 100% Response Rate",
                ].filter(Boolean).map(t => (
                  <div key={t} style={{ fontSize:12, color:"var(--text-secondary)" }}>{t}</div>
                ))}
              </div>
              <button className="btn btn-secondary btn-sm btn-full" style={{ marginTop:14 }}>Contact Poster</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Guest Auth Modal ── */}
      {showAuthModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)", zIndex: 1000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowAuthModal(false)}>
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 20, padding: 32, maxWidth: 440, width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12, textAlign: "center" }}>🔒</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 8, color: "var(--text-primary)" }}>
              Log in to Apply
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.6, marginBottom: 24 }}>
              Anyone can view jobs on Rozgaaar! To submit your application and confirm your details, please log in or create a Worker account.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button className="btn btn-primary btn-full" onClick={() => navigate(`/login?redirect=/jobs/${job._id}`)}>
                Log in to Existing Account
              </button>
              <button className="btn btn-secondary btn-full" onClick={() => navigate(`/register?role=worker&redirect=/jobs/${job._id}`)}>
                Create New Worker Account
              </button>
              <button className="btn btn-ghost btn-full btn-sm" onClick={() => setShowAuthModal(false)}>
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}