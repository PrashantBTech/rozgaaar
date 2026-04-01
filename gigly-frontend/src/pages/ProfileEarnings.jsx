// ── Profile Page ──────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI, reviewsAPI } from "../services/api";
import toast from "react-hot-toast";
import WorkerScanModal from "../components/WorkerScanModal";

const getTrustScore = (u) => {
  if (!u) return "—";
  let score = 50;
  if (u.isIdVerified) score += 20;
  if (u.totalJobsCompleted > 0) score += Math.min(20, u.totalJobsCompleted * 2);
  if (u.averageRating > 0) score += (u.averageRating / 5) * 10;
  return `${Math.min(100, Math.round(score))}%`;
};

export function Profile() {
  const { user, updateUser, loadUser } = useAuth();
  const [form, setForm] = useState({ name:"", bio:"", phone:"", skills:[], education:[] });
  const [skillInput, setSkillInput] = useState("");
  const [educationInput, setEducationInput] = useState("");
  const [reviews, setReviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("info");

  useEffect(() => {
    if (user) {
      setForm({ name:user.name||"", bio:user.bio||"", phone:user.phone||"", skills:user.skills||[], education:user.education||[] });
      reviewsAPI.getForUser(user._id).then(r => setReviews(r.data.data||[])).catch(()=>{});
    }
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      const finalForm = { ...form };
      if (skillInput.trim()) {
        finalForm.skills = [...finalForm.skills, skillInput.trim()];
        setSkillInput("");
      }
      if (educationInput.trim()) {
        finalForm.education = [...finalForm.education, educationInput.trim()];
        setEducationInput("");
      }
      setForm(finalForm);

      const { data } = await usersAPI.updateProfile(finalForm);
      updateUser(data.data);
      toast.success("Profile updated!");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      setForm(f => ({ ...f, skills:[...f.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };
  const removeSkill = (i) => setForm(f => ({ ...f, skills:f.skills.filter((_,idx)=>idx!==i) }));

  const addEducation = (e) => {
    if (e.key === "Enter" && educationInput.trim()) {
      setForm(f => ({ ...f, education:[...f.education, educationInput.trim()] }));
      setEducationInput("");
    }
  };
  const removeEducation = (i) => setForm(f => ({ ...f, education:f.education.filter((_,idx)=>idx!==i) }));

  if (!user) return null;
  const initials = user.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className="page-content">
      <div className="fade-in" style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, marginBottom:6 }}>My Profile</h1>
        <p style={{ color:"var(--text-secondary)", fontSize:14 }}>Manage your stats, reputation, and personal information</p>
      </div>

      {/* ── Stats Banner ── */}
      <div className="card fade-in fade-in-1" style={{ marginBottom:24 }}>
        <div className="profile-banner" style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
          <div className="avatar avatar-xl avatar-placeholder" style={{ fontSize:28, flexShrink:0 }}>{initials}</div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <h2 style={{ fontSize:22 }}>{user.name}</h2>
              {user.isIdVerified && <span className="badge badge-success">✓ Verified</span>}
            </div>
            <div style={{ fontSize:14, color:"var(--text-secondary)", marginBottom:8, textTransform:"capitalize" }}>{user.role}</div>
            {user.bio && <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom: 12 }}>{user.bio}</p>}
            
            {(user.skills?.length > 0 || user.education?.length > 0) && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {user.skills?.map((s, i) => (
                  <span key={`skill-${i}`} className="tag" style={{ fontSize: 11, padding: "2px 8px", background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(0, 240, 255, 0.3)" }}>{s}</span>
                ))}
                {user.education?.map((e, i) => (
                  <span key={`edu-${i}`} className="tag" style={{ fontSize: 11, padding: "2px 8px", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid rgba(245, 200, 66, 0.3)" }}>🎓 {e}</span>
                ))}
              </div>
            )}
          </div>
          <div className="profile-banner-stats" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {[
              { label:"Trust Score", value: getTrustScore(user), color:"var(--accent)" },
              { label:"Jobs Done", value:user.totalJobsCompleted||0, color:"var(--cyan)" },
              { label:"Earnings", value:`₹${(user.totalEarnings||0).toLocaleString("en-IN")}`, color:"var(--gold)" },
              { label:"Rating", value:user.averageRating ? `${user.averageRating}★` : "—", color:"var(--gold)" },
            ].map(s => (
              <div key={s.label} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:18, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:"flex", gap:4, marginBottom:24, borderBottom:"1px solid var(--border)", paddingBottom:0 }}>
        {[{id:"info", label:"Info"}, {id:"skills", label:"Skills & Education"}, {id:"reviews", label:"Reviews"}].map(t => (
          <button key={t.id} className="btn btn-ghost btn-sm"
            style={{ borderBottom: tab===t.id ? "2px solid var(--accent)" : "2px solid transparent",
              color:tab===t.id ? "var(--accent)" : "var(--text-secondary)", borderRadius:"var(--radius-sm) var(--radius-sm) 0 0" }}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "info" && (
        <div className="profile-grid fade-in" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div className="card">
            <h3 style={{ fontSize:16, marginBottom:20 }}>Personal Information</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { label:"Full Name", k:"name", placeholder:"Alex Johnson" },
                { label:"Phone", k:"phone", placeholder:"(555) 123-4567" },
              ].map(f => (
                <div key={f.k} className="input-group">
                  <label className="input-label">{f.label}</label>
                  <input className="input" placeholder={f.placeholder} value={form[f.k]}
                    onChange={e => setForm({...form,[f.k]:e.target.value})} />
                </div>
              ))}
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input" value={user.email} disabled style={{ opacity:0.5 }} />
              </div>
              <div className="input-group">
                <label className="input-label">Bio</label>
                <textarea className="input" rows={3} placeholder="Tell businesses about yourself..."
                  value={form.bio} onChange={e => setForm({...form,bio:e.target.value})} style={{ resize:"vertical" }} />
              </div>
              <button className="btn btn-primary" disabled={saving} onClick={save}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Recent jobs */}
          <div className="card">
            <h3 style={{ fontSize:16, marginBottom:16 }}>Recent Job History</h3>
            <RecentJobHistory />
          </div>
        </div>
      )}

      {tab === "skills" && (
        <div className="card fade-in" style={{ maxWidth:800, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <h3 style={{ fontSize:16, marginBottom:16 }}>Skills</h3>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
              {form.skills.map((s,i) => (
                <div key={i} className="tag active" style={{ cursor:"pointer" }} onClick={() => removeSkill(i)}>
                  {s} ✕
                </div>
              ))}
              {form.skills.length === 0 && <span style={{ color:"var(--text-muted)", fontSize:13 }}>No skills added yet</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Add Skill (press Enter)</label>
              <input className="input" placeholder="e.g. Barista, Data Entry"
                value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={addSkill} />
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize:16, marginBottom:16 }}>Education</h3>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
              {form.education.map((e,i) => (
                <div key={i} className="tag active" style={{ cursor:"pointer", background: "var(--bg-elevated)", color: "var(--text-primary)", borderColor: "var(--border)" }} onClick={() => removeEducation(i)}>
                  {e} ✕
                </div>
              ))}
              {form.education.length === 0 && <span style={{ color:"var(--text-muted)", fontSize:13 }}>No education added yet</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Add Education/Degree (press Enter)</label>
              <input className="input" placeholder="e.g. B.Tech Computer Science"
                value={educationInput} onChange={e=>setEducationInput(e.target.value)} onKeyDown={addEducation} />
            </div>
          </div>
          
          <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <button className="btn btn-primary" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save Profile Details"}
            </button>
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {reviews.length === 0 ? (
            <div className="card" style={{ textAlign:"center", padding:40 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⭐</div>
              <div style={{ color:"var(--text-muted)" }}>No reviews yet</div>
            </div>
          ) : reviews.map(r => (
            <div key={r._id} className="card">
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div className="avatar avatar-md avatar-placeholder" style={{ fontSize:12 }}>
                  {r.reviewer?.name?.[0] || "U"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <div style={{ fontWeight:600 }}>{r.reviewer?.name}</div>
                    <div className="stars">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
                  </div>
                  {r.tags?.length > 0 && (
                    <div style={{ display:"flex", gap:6, margin:"6px 0", flexWrap:"wrap" }}>
                      {r.tags.map(t => <span key={t} className="badge badge-info">{t}</span>)}
                    </div>
                  )}
                  <p style={{ fontSize:13, color:"var(--text-secondary)", marginTop:4 }}>{r.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentJobHistory() {
  const [apps, setApps] = useState([]);
  useEffect(() => {
    import("../services/api").then(({ appsAPI }) =>
      appsAPI.getMine().then(r => setApps((r.data.data||[]).filter(a=>a.status==="completed").slice(0,5)))
    );
  }, []);
  if (apps.length === 0) return <div style={{ color:"var(--text-muted)", fontSize:13 }}>No completed jobs yet.</div>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {apps.map(a => (
        <div key={a._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>{a.job?.title || "Gig"}</div>
            <div style={{ fontSize:12, color:"var(--text-muted)" }}>
              {a.completedAt ? new Date(a.completedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : ""}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:700, color:"var(--accent)" }}>₹{a.totalPaid}</div>
            <span className="badge badge-success" style={{ fontSize:9 }}>Completed</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Earnings Page ─────────────────────────────────────────────────────────────
export function Earnings() {
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("../services/api").then(({ paymentsAPI }) => {
      Promise.all([paymentsAPI.getWallet(), paymentsAPI.getHistory()]).then(([w, h]) => {
        setWallet(w.data.data);
        setHistory(h.data.data || []);
      }).finally(() => setLoading(false));
    });
  }, []);

  return (
    <div className="page-content">
      <div className="fade-in" style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, marginBottom:6 }}>Earnings & Payments</h1>
        <p style={{ color:"var(--text-secondary)", fontSize:14 }}>Manage your income, withdrawals, and tax documents.</p>
      </div>

      {/* Balance card */}
      <div className="card fade-in fade-in-1" style={{ marginBottom:24, background:"linear-gradient(135deg,var(--bg-card),var(--bg-elevated))", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 80% 20%,rgba(59,232,176,0.08),transparent 60%)" }} />
        <div style={{ position:"relative", display:"flex", flexWrap:"wrap", justifyContent:"space-between", gap:20, alignItems:"center" }}>
          <div>
            <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
              Total Available Balance
            </div>
            <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:40, color:"var(--accent)", marginBottom:4 }}>
              ₹{loading ? "—" : (wallet?.walletBalance||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </div>
            <div style={{ fontSize:13, color:"var(--text-muted)" }}>
              +4.2% this week
            </div>
          </div>
          <button className="btn btn-primary">⚡ Instant Withdraw</button>
        </div>
      </div>

      <div className="earnings-grid" style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:24 }}>
        {/* Transaction history */}
        <div className="fade-in fade-in-2">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Recent Transactions
            </div>
            <button className="btn btn-ghost btn-sm">Export CSV</button>
          </div>
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto", gap:16, padding:"12px 16px",
              borderBottom:"1px solid var(--border)", fontSize:11, color:"var(--text-muted)",
              fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>
              <span>Job Title / Gig</span>
              <span>Date</span>
              <span>Duration</span>
              <span>Amount</span>
            </div>
            {loading ? [1,2,3].map(i => (
              <div key={i} style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)" }}>
                <div className="skeleton" style={{ height:18, width:"60%", marginBottom:6 }} />
                <div className="skeleton" style={{ height:14, width:"40%" }} />
              </div>
            )) : history.length === 0 ? (
              <div style={{ padding:40, textAlign:"center", color:"var(--text-muted)" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>💰</div>No transactions yet
              </div>
            ) : history.map((h, i) => (
              <div key={h._id} style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto",
                gap:16, padding:"14px 16px", borderBottom:"1px solid var(--border)", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{h.job?.title || "Gig"}</div>
                  <div style={{ fontSize:12, color:"var(--text-muted)" }}>
                    {h.business?.businessName || h.business?.name}
                  </div>
                </div>
                <div style={{ fontSize:12, color:"var(--text-secondary)", whiteSpace:"nowrap" }}>
                  {h.completedAt ? new Date(h.completedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : ""}
                </div>
                <div style={{ fontSize:12, color:"var(--text-secondary)", whiteSpace:"nowrap" }}>
                  {h.actualHours ? `${h.actualHours}h` : "—"}
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:700, color:"var(--accent)" }}>₹{h.totalPaid}</div>
                  <span className={`badge ${h.isPaid ? "badge-success" : "badge-pending"}`} style={{ fontSize:9 }}>
                    {h.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax & payout methods */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="card fade-in fade-in-3">
            <h4 style={{ fontSize:14, marginBottom:16 }}>Tax Summary</h4>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>Est. Tax</div>
              <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:28, color:"var(--gold)" }}>15%</div>
            </div>
            {[
              { l:"Gross Earnings", v:`₹${(wallet?.totalEarnings||0).toLocaleString("en-IN")}` },
              { l:"Tax Withheld", v:"₹0.00" },
            ].map(r => (
              <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0",
                borderBottom:"1px solid var(--border)", fontSize:13 }}>
                <span style={{ color:"var(--text-secondary)" }}>{r.l}</span>
                <span style={{ fontWeight:600 }}>{r.v}</span>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm btn-full" style={{ marginTop:14 }}>Download Form 16</button>
          </div>

          <div className="card fade-in fade-in-4">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h4 style={{ fontSize:14 }}>Payout Methods</h4>
              <button className="btn btn-ghost btn-sm">+ Add New</button>
            </div>
            {[
              { icon:"💳", label:"Mastercard", last4:"4582", exp:"12/25" },
              { icon:"🏦", label:"Chase Bank", last4:"8821", exp:"Checking" },
            ].map(m => (
              <div key={m.last4} style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 0",
                borderBottom:"1px solid var(--border)" }}>
                <span style={{ fontSize:20 }}>{m.icon}</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{m.label} **** {m.last4}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)" }}>Expires {m.exp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── My Jobs Page ──────────────────────────────────────────────────────────────
export function MyJobs() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [scanApp, setScanApp] = useState(null);

  useEffect(() => {
    import("../services/api").then(({ appsAPI }) =>
      appsAPI.getMine().then(r => { setApps(r.data.data||[]); setLoading(false); })
        .catch(()=>setLoading(false))
    );
  }, []);

  const STATUS_TABS = ["all","pending","accepted","in_progress","completed"];
  const filtered = tab === "all" ? apps : apps.filter(a => a.status === tab);

  const statusColor = { pending:"badge-pending", accepted:"badge-success", completed:"badge-success",
    rejected:"badge-urgent", in_progress:"badge-info", withdrawn:"badge-pending" };

  return (
    <div className="page-content">
      <div className="fade-in" style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, marginBottom:6 }}>My Jobs</h1>
        <p style={{ color:"var(--text-secondary)", fontSize:14 }}>{apps.length} applications total</p>
      </div>

      <div style={{ display:"flex", gap:4, marginBottom:20, flexWrap:"wrap" }}>
        {STATUS_TABS.map(t => (
          <button key={t} className={`tag ${tab===t?"active":""}`} style={{ cursor:"pointer", textTransform:"capitalize" }}
            onClick={()=>setTab(t)}>{t} {t==="all"?`(${apps.length})`:""}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"grid", gap:12 }}>
          {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:100,borderRadius:"var(--radius-lg)"}}/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
          <h3>No {tab === "all" ? "" : tab} jobs</h3>
          <p style={{ color:"var(--text-muted)", marginTop:8 }}>Browse gigs to get started</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(a => (
            <div key={a._id} className="card fade-in">
              <div style={{ display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{a.job?.title || "Job"}</div>
                  <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:8 }}>
                    {a.business?.businessName || a.business?.name} •{" "}
                    {a.job?.date ? new Date(a.job.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : ""}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <span className={`badge ${statusColor[a.status] || "badge-pending"}`} style={{ textTransform:"capitalize" }}>
                      {a.status}
                    </span>
                    {a.job?.payPerHour && <span className="badge badge-info">₹{a.job.payPerHour}/hr</span>}
                    {a.job?.durationHours && <span className="badge badge-info">⏱ {a.job.durationHours}h</span>}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  {a.totalPaid > 0 && <div style={{ fontWeight:700, color:"var(--accent)", fontSize:16 }}>₹{a.totalPaid}</div>}
                  {a.status === "accepted" && (
                    <button className="btn btn-primary btn-sm" style={{ marginTop:8 }}
                      onClick={() => setScanApp(scanApp?.app._id === a._id ? null : { app: a, type: "start" })}>
                      {scanApp?.app._id === a._id ? "Close Panel" : "✓ Check In"}
                    </button>
                  )}
                  {a.status === "in_progress" && (
                    <button className="btn btn-danger btn-sm" style={{ marginTop:8 }}
                      onClick={() => setScanApp(scanApp?.app._id === a._id ? null : { app: a, type: "end" })}>
                      {scanApp?.app._id === a._id ? "Close Panel" : "Check Out"}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Inline Scan / OTP block */}
              {scanApp && scanApp.app._id === a._id && (
                <WorkerScanModal
                  application={scanApp.app}
                  type={scanApp.type}
                  onClose={(success) => {
                    setScanApp(null);
                    if (success) window.location.reload();
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}