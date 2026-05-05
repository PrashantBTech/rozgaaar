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
  const [isEditing, setIsEditing] = useState(false);

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
      setIsEditing(false);
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
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontSize:16 }}>Personal Information</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>✏️ Edit</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>Full Name</div>
                <div style={{ fontWeight:600 }}>{user.name || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>Email</div>
                <div style={{ fontWeight:600 }}>{user.email}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>Phone</div>
                <div style={{ fontWeight:600 }}>{user.phone || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>Bio</div>
                <div style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.5 }}>{user.bio || "No bio added."}</div>
              </div>
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
        <div className="card fade-in" style={{ maxWidth:800 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h3 style={{ fontSize:16 }}>Skills & Education</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>✏️ Edit</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
            <div>
              <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:12, textTransform:"uppercase", fontWeight:700 }}>Skills</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {user.skills?.length > 0 ? user.skills.map((s,i) => (
                  <span key={i} className="tag active">{s}</span>
                )) : <span style={{ color:"var(--text-muted)", fontSize:13 }}>No skills added.</span>}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:12, textTransform:"uppercase", fontWeight:700 }}>Education</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {user.education?.length > 0 ? user.education.map((e,i) => (
                  <span key={i} className="tag active" style={{ background:"var(--bg-elevated)", color:"var(--text-primary)", borderColor:"var(--border)" }}>🎓 {e}</span>
                )) : <span style={{ color:"var(--text-muted)", fontSize:13 }}>No education details added.</span>}
              </div>
            </div>
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

      {/* ── Edit Modal ── */}
      {isEditing && (
        <div className="modal-overlay" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding: 16 }}>
          <div className="card fade-in" style={{ width:"100%", maxWidth:600, maxHeight:"90vh", overflowY:"auto" }}>
            <h3 style={{ fontSize:18, marginBottom:20 }}>Edit Profile</h3>
            
            <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
              <div className="grid-2" style={{ gap:16 }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
                </div>
              </div>
              
              <div className="input-group">
                <label className="input-label">Bio</label>
                <textarea className="input" rows={3} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} style={{ resize:"vertical" }} />
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                <div>
                  <label className="input-label" style={{ marginBottom:8, display:"block" }}>Skills</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10, minHeight:32 }}>
                    {form.skills.length === 0 && <span style={{ color:"var(--text-muted)", fontSize:12 }}>No skills added yet</span>}
                    {form.skills.map((s,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", background:"var(--accent-dim)", color:"var(--accent)", border:"1px solid rgba(0,240,255,0.3)", borderRadius:"var(--radius-sm)", fontSize:12, fontWeight:600 }}>
                        {s}
                        <button onClick={() => removeSkill(i)} style={{ background:"none", border:"none", color:"var(--accent)", cursor:"pointer", fontSize:13, lineHeight:1, padding:0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <input
                      className="input"
                      placeholder="e.g. Barista, Data Entry"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={addSkill}
                      style={{ flex:1 }}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { if (skillInput.trim()) { setForm(f => ({ ...f, skills:[...f.skills, skillInput.trim()] })); setSkillInput(""); } }}
                    >+ Add</button>
                  </div>
                </div>

                <div>
                  <label className="input-label" style={{ marginBottom:8, display:"block" }}>Education</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10, minHeight:32 }}>
                    {form.education.length === 0 && <span style={{ color:"var(--text-muted)", fontSize:12 }}>No education added yet</span>}
                    {form.education.map((e,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", background:"var(--gold-dim)", color:"var(--gold)", border:"1px solid rgba(245,200,66,0.3)", borderRadius:"var(--radius-sm)", fontSize:12, fontWeight:600 }}>
                        🎓 {e}
                        <button onClick={() => removeEducation(i)} style={{ background:"none", border:"none", color:"var(--gold)", cursor:"pointer", fontSize:13, lineHeight:1, padding:0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <input
                      className="input"
                      placeholder="e.g. B.Tech Computer Science"
                      value={educationInput}
                      onChange={e => setEducationInput(e.target.value)}
                      onKeyDown={addEducation}
                      style={{ flex:1 }}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { if (educationInput.trim()) { setForm(f => ({ ...f, education:[...f.education, educationInput.trim()] })); setEducationInput(""); } }}
                    >+ Add</button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
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
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    import("../services/api").then(({ paymentsAPI }) => {
      Promise.all([paymentsAPI.getWallet(), paymentsAPI.getHistory()]).then(([w, h]) => {
        setWallet(w.data.data);
        setHistory(h.data.data || []);
      }).finally(() => setLoading(false));
    });
  }, []);

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0 || amt > (wallet?.walletBalance||0)) {
      import("react-hot-toast").then(toast => toast.default.error("Invalid amount"));
      return;
    }
    setWithdrawing(true);
    try {
      const { paymentsAPI } = await import("../services/api");
      const { data } = await paymentsAPI.withdraw(amt);
      import("react-hot-toast").then(toast => toast.default.success(data.message));
      setWallet(prev => ({ ...prev, walletBalance: data.walletBalance }));
      setShowWithdraw(false);
      setWithdrawAmount("");
    } catch (err) {
      import("react-hot-toast").then(toast => toast.default.error(err.response?.data?.message || "Failed to withdraw"));
    } finally {
      setWithdrawing(false);
    }
  };

  const amtNum = parseFloat(withdrawAmount) || 0;
  const fee = amtNum * 0.07;
  const net = amtNum - fee;

  const exportCSV = () => {
    if (history.length === 0) {
      import("react-hot-toast").then(t => t.default.error("No transactions to export"));
      return;
    }
    
    const headers = ["Job Title", "Business", "Date", "Duration (Hours)", "Amount (INR)", "Status"];
    const rows = history.map(h => [
      `"${h.job?.title || "Gig"}"`,
      `"${h.business?.businessName || h.business?.name || "—"}"`,
      h.completedAt ? new Date(h.completedAt).toLocaleDateString("en-IN") : "—",
      h.actualHours || "—",
      h.totalPaid || "0",
      h.isPaid ? "Paid" : "Pending"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rozgaaar_transactions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-content">
      <div className="fade-in" style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, marginBottom:6 }}>Wallet & Payments</h1>
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
          <button className="btn btn-primary" onClick={() => setShowWithdraw(true)}>⚡ Instant Withdraw</button>
        </div>
      </div>
      
      {showWithdraw && (
        <div className="modal-overlay" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div className="card fade-in" style={{ width:"100%", maxWidth:400 }}>
            <h3 style={{ fontSize:18, marginBottom:16 }}>Withdraw Funds</h3>
            <div className="input-group">
              <label className="input-label">Amount (₹)</label>
              <input type="number" className="input" placeholder="e.g. 1000" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
              <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>
                Available: ₹{(wallet?.walletBalance||0).toLocaleString("en-IN")}
              </div>
            </div>
            {amtNum > 0 && (
              <div style={{ padding:12, background:"var(--bg-base)", borderRadius:"var(--radius-md)", marginBottom:16, fontSize:13 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ color:"var(--text-secondary)" }}>Amount Requested</span>
                  <span>₹{amtNum.toFixed(2)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ color:"var(--text-secondary)" }}>Platform Fee (7%)</span>
                  <span style={{ color:"var(--urgent)" }}>-₹{fee.toFixed(2)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, marginTop:8, paddingTop:8, borderTop:"1px solid var(--border)" }}>
                  <span>You Receive</span>
                  <span style={{ color:"var(--success)" }}>₹{net.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:12, marginTop:20 }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={handleWithdraw} disabled={withdrawing || amtNum <= 0 || amtNum > wallet?.walletBalance}>
                {withdrawing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="earnings-grid" style={{ display:"grid", gridTemplateColumns:"1fr", gap:24 }}>
        {/* Transaction history */}
        <div className="fade-in fade-in-2">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Recent Transactions
            </div>
            <button className="btn btn-ghost btn-sm" onClick={exportCSV}>Export CSV</button>
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