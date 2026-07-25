// ── Profile Page ──────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usersAPI, reviewsAPI } from "../services/api";
import toast from "react-hot-toast";
import WorkerScanModal from "../components/WorkerScanModal";

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const getTrustScore = (u) => {
  if (!u) return "—";
  let score = 50;
  if (u.isIdVerified) score += 20;
  if (u.totalJobsCompleted > 0) score += Math.min(20, u.totalJobsCompleted * 2);
  if (u.averageRating > 0) score += (u.averageRating / 5) * 10;
  return `${Math.min(100, Math.round(score))}%`;
};

// ── SVG Icon Helpers for Profile ─────────────────────────────────────────────
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const GraduationIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ── Edit Profile Modal Component (Fixed Viewport Framing & Scrollable Body) ──
function EditProfileModal({ form, setForm, save, saving, onClose, isBusiness }) {
  const [skillInput, setSkillInput] = useState("");
  const [educationInput, setEducationInput] = useState("");

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    let updatedForm = { ...form };
    if (skillInput.trim()) {
      updatedForm.skills = [...(updatedForm.skills || []), skillInput.trim()];
      setSkillInput("");
    }
    if (educationInput.trim()) {
      updatedForm.education = [...(updatedForm.education || []), educationInput.trim()];
      setEducationInput("");
    }
    await save(updatedForm);
  };

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      setForm(f => ({ ...f, skills: [...(f.skills || []), skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const removeSkill = (i) => setForm(f => ({ ...f, skills: (f.skills || []).filter((_, idx) => idx !== i) }));

  const addEducation = (e) => {
    if (e.key === "Enter" && educationInput.trim()) {
      e.preventDefault();
      setForm(f => ({ ...f, education: [...(f.education || []), educationInput.trim()] }));
      setEducationInput("");
    }
  };

  const removeEducation = (i) => setForm(f => ({ ...f, education: (f.education || []).filter((_, idx) => idx !== i) }));

  return ReactDOM.createPortal(
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px"
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "calc(100vh - 80px)",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "#0F172A", margin: 0 }}>
            {isBusiness ? "Edit Business Details" : "Edit Profile Details"}
          </h2>
          <button 
            type="button" 
            style={{ background: "#F1F5F9", border: "none", fontSize: 16, cursor: "pointer", color: "#64748B", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "background 0.2s" }} 
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Form Body (Scrolls cleanly inside, never overflows window!) */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="input-group">
              <label className="input-label">{isBusiness ? "Business / Company Name" : "Full Name"}</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>

            <div className="input-group">
              <label className="input-label">City / Location</label>
              <input className="input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru, Karnataka" />
            </div>

            <div className="input-group">
              <label className="input-label">{isBusiness ? "Company Description" : "Bio"}</label>
              <textarea className="input" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder={isBusiness ? "Describe your business..." : "Write a short summary about yourself..."} />
            </div>

            {!isBusiness && (
              <>
                {/* Skills Editor */}
                <div>
                  <label className="input-label">Skills</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {(form.skills || []).map((s, i) => (
                      <span key={i} className="tag active" style={{ cursor: "pointer", padding: "4px 10px", fontSize: 12 }} onClick={() => removeSkill(i)}>
                        {s} ✕
                      </span>
                    ))}
                  </div>
                  <input className="input" placeholder="Type skill & press Enter" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} />
                </div>

                {/* Education Editor */}
                <div>
                  <label className="input-label">Education</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {(form.education || []).map((e, i) => (
                      <span key={i} className="tag active" style={{ cursor: "pointer", padding: "4px 10px", fontSize: 12 }} onClick={() => removeEducation(i)}>
                        {e} ✕
                      </span>
                    ))}
                  </div>
                  <input className="input" placeholder="Type degree/college & press Enter" value={educationInput} onChange={e => setEducationInput(e.target.value)} onKeyDown={addEducation} />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end", gap: 12, background: "#F8FAFC", flexShrink: 0 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ── Worker Profile View (Matching Image 1 Screenshot & Full Responsive Spacing) ──
function WorkerProfileView({ user, form, setForm, save, saving, reviews, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const initials = user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="page-content" style={{ width: "100%", paddingBottom: 60 }}>
      {/* Top Header Row */}
      <div className="fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", margin: 0 }}>My Profile</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0 0 0" }}>Manage your personal details and reputation</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ border: "1px solid #CBD5E1", background: "#FFFFFF", fontWeight: 700, fontSize: 13, color: "#0F172A", display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8 }}
            onClick={() => setIsEditing(true)}
          >
            <EditIcon /> Edit Profile
          </button>
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ border: "1px solid #FCA5A5", background: "#FEF2F2", fontWeight: 700, fontSize: 13, color: "#DC2626", display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, cursor: "pointer", transition: "all 0.2s" }}
            onClick={onLogout}
          >
            <LogoutIcon /> Logout
          </button>
        </div>
      </div>

      {/* 1. Top Profile Card */}
      <div className="card fade-in fade-in-1" style={{ padding: "32px 24px 24px 24px", textAlign: "center", marginBottom: 20, borderRadius: 16 }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
          <div className="avatar avatar-xl avatar-placeholder" style={{ width: 88, height: 88, fontSize: 32, fontWeight: 800, margin: "0 auto", border: "3px solid #FFFFFF", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials}
          </div>
          {user.isIdVerified && (
            <div style={{ position: "absolute", bottom: 2, right: 2, background: "#16A34A", color: "#FFFFFF", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: "2px solid #FFFFFF" }} title="Verified Member">
              ✓
            </div>
          )}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
          {user.name}
        </h2>
        <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginBottom: 24, textTransform: "capitalize" }}>
          Worker · {user.isIdVerified ? "Verified Member" : "Member"}
        </div>

        <div style={{ height: 1, background: "var(--border)", margin: "0 -24px 20px -24px" }} />

        {/* 4 Stat Columns Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: 20, color: "#0F172A", marginBottom: 2 }}>
              {getTrustScore(user)}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>Trust Score</div>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: 20, color: "#0F172A", marginBottom: 2 }}>
              {user.totalJobsCompleted || 0}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>Jobs Done</div>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: 20, color: "#0F172A", marginBottom: 2 }}>
              ₹{(user.totalEarnings || 0) > 1000 ? `${((user.totalEarnings || 0) / 1000).toFixed(1)}k` : (user.totalEarnings || 0)}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>Earnings</div>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: 20, color: "#0F172A", marginBottom: 2 }}>
              {user.averageRating ? `${user.averageRating} ☆` : "—"}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>Rating</div>
          </div>
        </div>
      </div>

      {/* 2. Personal Information Card */}
      <div className="card fade-in fade-in-2" style={{ padding: 24, marginBottom: 20, borderRadius: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>Personal Information</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ color: "#64748B", marginTop: 2 }}><UserIcon /></div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Full Name</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{user.name}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ color: "#64748B", marginTop: 2 }}><PhoneIcon /></div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Phone</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{user.phone || "Not provided"}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ color: "#64748B", marginTop: 2 }}><MailIcon /></div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Email</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{user.email}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ color: "#64748B", marginTop: 2 }}><LocationIcon /></div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Location</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{user.city || user.location?.city || "Bengaluru, Karnataka"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Skills & Expertise Card */}
      <div className="card fade-in fade-in-3" style={{ padding: 24, marginBottom: 20, borderRadius: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 16 }}>Skills & Expertise</h3>
        {user.skills?.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {user.skills.map((skill, idx) => (
              <div key={idx} style={{
                background: "#EFF6FF",
                color: "#2563EB",
                border: "1px solid #DBEAFE",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <span>⚡</span> {skill}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#94A3B8" }}>No skills listed yet. Click Edit Profile to add skills.</div>
        )}
      </div>

      {/* 4. Education Card */}
      <div className="card fade-in fade-in-4" style={{ padding: 24, marginBottom: 20, borderRadius: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 16 }}>Education</h3>
        {user.education?.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {user.education.map((edu, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <GraduationIcon />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", marginBottom: 2 }}>{edu}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>Govt. Arts & Commerce College</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Completed</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#94A3B8" }}>No education details listed yet. Click Edit Profile to add education.</div>
        )}
      </div>

      {/* 5. Reviews Card */}
      <div className="card fade-in fade-in-5" style={{ padding: 24, borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", margin: 0 }}>Reviews</h3>
          <button className="btn btn-ghost btn-sm" style={{ fontWeight: 700, fontSize: 12 }}>View All</button>
        </div>

        {reviews.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
            No reviews received yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {reviews.map(r => (
              <div key={r._id} style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar avatar-placeholder" style={{ width: 36, height: 36, fontSize: 12, fontWeight: 700 }}>
                      {r.reviewer?.name?.[0] || "B"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>{r.reviewer?.name || "Business Poster"}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>Verified Employer</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>
                    {r.rating ? `${r.rating}.0` : "5.0"} ☆
                  </div>
                </div>
                {r.comment && (
                  <p style={{ fontSize: 13, color: "#475569", margin: "6px 0 0 0", lineHeight: 1.5 }}>
                    "{r.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal 
          form={form} 
          setForm={setForm} 
          save={save} 
          saving={saving} 
          onClose={() => setIsEditing(false)} 
          isBusiness={false} 
        />
      )}
    </div>
  );
}

// ── Business Profile View (Clean Employer Dashboard & Company Details) ──
function BusinessProfileView({ user, form, setForm, save, saving, reviews, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="page-content" style={{ width: "100%", paddingBottom: 60 }}>
      {/* Header */}
      <div className="fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", margin: 0 }}>Business Profile</h1>
            <span style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 100 }}>
              BUSINESS ACCOUNT
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            Manage your company profile, employer stats, and contact details.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ border: "1px solid #CBD5E1", background: "#FFFFFF", fontWeight: 700, fontSize: 13, color: "#0F172A", display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8 }}
            onClick={() => setIsEditing(true)}
          >
            <EditIcon /> Edit Profile
          </button>
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ border: "1px solid #FCA5A5", background: "#FEF2F2", fontWeight: 700, fontSize: 13, color: "#DC2626", display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, cursor: "pointer", transition: "all 0.2s" }}
            onClick={onLogout}
          >
            <LogoutIcon /> Logout
          </button>
        </div>
      </div>

      {/* Main Business Banner */}
      <div className="card fade-in fade-in-1" style={{ padding: 28, marginBottom: 24, borderRadius: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
          <div className="avatar avatar-xl avatar-placeholder" style={{ width: 72, height: 72, fontSize: 26, fontWeight: 800, flexShrink: 0 }}>
            {user.name?.[0]?.toUpperCase() || "B"}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0 }}>{user.name}</h2>
              {user.isIdVerified && <span className="badge badge-success">✓ Verified Business</span>}
            </div>
            <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{user.city || user.location?.city || "India"}</div>
            {user.bio && <p style={{ fontSize: 13, color: "#475569", margin: "6px 0 0 0" }}>{user.bio}</p>}
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border)", margin: "0 -28px 20px -28px" }} />

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, textAlign: "center" }}>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A" }}>
              {user.totalJobsPosted || 0}
            </div>
            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>Gigs Posted</div>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A" }}>
              {user.averageRating ? `${user.averageRating} ☆` : "—"}
            </div>
            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>Employer Rating</div>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: 22, color: "#16A34A" }}>
              {getTrustScore(user)}
            </div>
            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>Trust Score</div>
          </div>
        </div>
      </div>

      {/* Grid of Company Info + Worker Feedback */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: 24, borderRadius: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>Company Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ color: "#64748B", marginTop: 2 }}><UserIcon /></div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Business / Company Name</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{user.name}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ color: "#64748B", marginTop: 2 }}><PhoneIcon /></div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Phone Number</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{user.phone || "Not provided"}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ color: "#64748B", marginTop: 2 }}><MailIcon /></div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Official Email</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{user.email}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ color: "#64748B", marginTop: 2 }}><LocationIcon /></div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>City / Location</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{user.city || user.location?.city || "India"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Worker Reviews */}
        <div className="card" style={{ padding: 24, borderRadius: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>Worker Reviews</h3>
          {reviews.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
              No worker reviews received yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reviews.map(r => (
                <div key={r._id} style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{r.reviewer?.name || "Worker"}</span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#0F172A" }}>{r.rating || 5}.0 ☆</span>
                  </div>
                  {r.comment && <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>"{r.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal 
          form={form} 
          setForm={setForm} 
          save={save} 
          saving={saving} 
          onClose={() => setIsEditing(false)} 
          isBusiness={true} 
        />
      )}
    </div>
  );
}

// ── Main Profile Component Export ────────────────────────────────────────────
export function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", bio: "", phone: "", city: "", skills: [], education: [] });
  const [reviews, setReviews] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (user) {
      setForm({ 
        name: user.name || "", 
        bio: user.bio || "", 
        phone: user.phone || "", 
        city: user.city || user.location?.city || "",
        skills: user.skills || [], 
        education: user.education || [] 
      });
      reviewsAPI.getForUser(user._id).then(r => setReviews(r.data.data || [])).catch(() => {});
    }
  }, [user]);

  const save = async (updatedForm) => {
    setSaving(true);
    try {
      const payload = updatedForm || form;
      setForm(payload);
      const { data } = await usersAPI.updateProfile(payload);
      updateUser(data.data);
      toast.success("Profile updated successfully!");
    } catch { 
      toast.error("Failed to save profile changes"); 
    } finally { 
      setSaving(false); 
    }
  };

  if (!user) return null;

  return user.role === "business" ? (
    <BusinessProfileView user={user} form={form} setForm={setForm} save={save} saving={saving} reviews={reviews} onLogout={handleLogout} />
  ) : (
    <WorkerProfileView user={user} form={form} setForm={setForm} save={save} saving={saving} reviews={reviews} onLogout={handleLogout} />
  );
}

function RecentJobHistory() {
  const [apps, setApps] = useState([]);
  useEffect(() => {
    import("../services/api").then(({ appsAPI }) =>
      appsAPI.getMine().then(r => setApps((r.data.data || []).filter(a => a.status === "completed").slice(0, 5)))
    );
  }, []);
  if (apps.length === 0) return <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No completed jobs yet.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {apps.map(a => (
        <div key={a._id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 0", borderBottom: "1px solid var(--border)"
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{a.job?.title || "Gig"}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {a.completedAt ? new Date(a.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, color: "var(--accent)" }}>₹{a.totalPaid}</div>
            <span className="badge badge-success" style={{ fontSize: 9 }}>Completed</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SVG Icon Components for Wallet ──────────────────────────────────────────
const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <line x1="2" y1="10" x2="22" y2="10"></line>
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const DocumentTextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>
);

const PlusIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// ── Worker Wallet View (Matching Image 1) ────────────────────────────────────
function WorkerWallet({ wallet, history, loading, user }) {
  const completedCount = history.filter(h => h.isPaid || h.completedAt).length || user?.totalJobsCompleted || 0;
  const pendingCount = history.filter(h => !h.isPaid).length;

  return (
    <div className="page-content">
      {/* Page Title */}
      <div className="fade-in" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>Wallet</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>Manage your earnings and withdrawals.</p>
      </div>

      {/* Top Navy Blue Earnings Hero Card */}
      <div className="card fade-in fade-in-1" style={{
        background: "linear-gradient(135deg, #0F2036 0%, #1A3459 100%)",
        borderRadius: 16,
        padding: "28px 32px",
        color: "#FFFFFF",
        marginBottom: 24,
        boxShadow: "0 10px 25px rgba(15, 32, 54, 0.2)"
      }}>
        <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          CURRENT EARNINGS
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: 44, color: "#FFFFFF", marginBottom: 6, display: "flex", alignItems: "baseline", gap: 6 }}>
          <span>₹</span>
          <span>{loading ? "—" : (wallet?.walletBalance || 0).toLocaleString("en-IN")}</span>
        </div>
        <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24 }}>
          Transferred from completed tasks.
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", gap: 16, paddingTop: 16, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <div style={{ textAlign: "right" }}>
            <button
              className="btn"
              style={{ background: "#16A34A", color: "#FFFFFF", fontWeight: 700, fontSize: 14, borderRadius: 8, padding: "10px 24px", border: "none", cursor: "pointer" }}
              onClick={() => toast.success("Withdrawal request initiated!")}
            >
              Withdraw Funds
            </button>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>* 7% platform fee applies at withdrawal</div>
          </div>
        </div>
      </div>

      {/* Middle Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
        {/* Card 1: Earned this Month */}
        <div className="card fade-in fade-in-2" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <WalletIcon />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>Total Earnings</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A" }}>
            ₹ {loading ? "—" : (wallet?.totalEarnings || wallet?.walletBalance || 0).toLocaleString("en-IN")}
          </div>
        </div>

        {/* Card 2: Gigs Completed */}
        <div className="card fade-in fade-in-2" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircleIcon />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>Gigs Completed</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", marginBottom: 6 }}>
            {completedCount}
          </div>
          {pendingCount > 0 && (
            <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
              ⏱ {pendingCount} pending review
            </div>
          )}
        </div>
      </div>

      {/* Bottom Recent Activity List */}
      <div className="fade-in fade-in-3">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Recent Activity</h2>
          <button className="btn btn-ghost btn-sm" style={{ fontWeight: 700, fontSize: 12 }}>View All</button>
        </div>

        {loading ? (
          <div style={{ display: "grid", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No transaction history found</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {history.map(item => (
              <div key={item._id} style={{
                background: "#FFFFFF",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: item.isPaid ? "#DCFCE7" : "#F1F5F9",
                    color: item.isPaid ? "#166534" : "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <ArrowDownIcon />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", marginBottom: 2 }}>
                      {item.job?.title || "Gig Payment"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>
                      {item.completedAt ? new Date(item.completedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Recently"}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900, fontSize: 16, color: item.isPaid ? "#16A34A" : "#0F172A" }}>
                    +₹ {item.totalPaid || 0}
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: item.isPaid ? "#DCFCE7" : "#FEF3C7",
                    color: item.isPaid ? "#166534" : "#92400E",
                    padding: "2px 8px",
                    borderRadius: 100,
                    display: "inline-block",
                    marginTop: 2
                  }}>
                    {item.isPaid ? "Credited" : "Processing"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Business Wallet View (Matching Image 2 - Escrow & Fake Data Removed) ──
function BusinessWallet({ wallet, history, loading }) {
  return (
    <div className="page-content">
      {/* Header Row */}
      <div className="fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", margin: 0 }}>Wallet & Payments</h1>
            <span style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 100, letterSpacing: "0.05em" }}>
              BUSINESS ACCOUNT
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            Manage your funds, track gig payments, and view transaction history.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ border: "1px solid #CBD5E1", background: "#FFFFFF", fontSize: 13, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => toast.success("Downloading Statement...")}
          >
            <DocumentTextIcon /> Statement
          </button>
          <button
            className="btn btn-primary btn-sm"
            style={{ background: "#0F172A", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px" }}
            onClick={() => toast.success("Add funds portal opened")}
          >
            <PlusIconSmall /> Add Funds
          </button>
        </div>
      </div>

      {/* Top Available Balance Card (Escrow Div & Auto-Reload Removed) */}
      <div className="card wallet-hero-card fade-in fade-in-1" style={{
        background: "linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)",
        border: "1px solid #BAE6FD",
        boxShadow: "0 4px 12px rgba(186, 230, 253, 0.15)"
      }}>
        <div style={{ fontSize: 12, color: "#0284C7", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Available Balance
        </div>
        <div className="wallet-hero-amount" style={{ color: "#0F172A" }}>
          ₹ {loading ? "—" : (wallet?.walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 14, color: "#475569", maxWidth: 600 }}>
          Funds available for immediate disbursement to delivery partners and gig workers.
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="fade-in fade-in-2">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Recent Transactions</h2>
          <select style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, background: "#FFFFFF", fontWeight: 600, color: "#0F172A" }}>
            <option value="all">All Types</option>
            <option value="payout">Payouts</option>
            <option value="deposit">Deposits</option>
          </select>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Table Header */}
          <div className="wallet-tx-table-header">
            <span>DATE</span>
            <span>DESCRIPTION</span>
            <span>STATUS</span>
            <span style={{ textAlign: "right" }}>AMOUNT (₹)</span>
          </div>

          {/* Table Rows (Fetched from Database) */}
          {loading ? (
            <div style={{ padding: 20 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8, borderRadius: 6 }} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💼</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No transaction history found</div>
            </div>
          ) : (
            history.map((tx) => (
              <div key={tx._id} className="wallet-tx-table-row">
                <div style={{ fontSize: 13, color: "#64748B" }}>
                  {tx.completedAt ? new Date(tx.completedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Recently"}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>
                    {tx.job?.title ? `Job Payment - ${tx.job.title}` : "Fund Deposit"}
                  </div>
                  {tx._id && (
                    <div style={{ fontSize: 12, color: "#94A3B8" }}>
                      Gig ID: #{tx._id.slice(-6).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    background: tx.isPaid ? "#DCFCE7" : "#FEF3C7",
                    color: tx.isPaid ? "#166534" : "#92400E",
                    padding: "3px 10px",
                    borderRadius: 100
                  }}>
                    {tx.isPaid ? "Completed" : "Pending"}
                  </span>
                </div>
                <div style={{ textAlign: "right", fontWeight: 900, fontSize: 15, color: "#0F172A" }}>
                  - ₹ {(tx.totalPaid || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Earnings Page (Router Component) ──────────────────────────────────────────
export function Earnings() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("../services/api").then(({ paymentsAPI }) => {
      Promise.all([paymentsAPI.getWallet(), paymentsAPI.getHistory()])
        .then(([w, h]) => {
          setWallet(w.data.data);
          setHistory(h.data.data || []);
        })
        .finally(() => setLoading(false));
    });
  }, []);

  if (user?.role === "business") {
    return <BusinessWallet wallet={wallet} history={history} loading={loading} />;
  }

  return <WorkerWallet wallet={wallet} history={history} loading={loading} user={user} />;
}

// ── My Jobs Page ──────────────────────────────────────────────────────────────
export function MyJobs() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [scanApp, setScanApp] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    import("../services/api").then(({ appsAPI }) =>
      appsAPI.getMine().then(r => { setApps(r.data.data || []); setLoading(false); })
        .catch(() => setLoading(false))
    );
  }, []);

  const STATUS_TABS = ["all", "pending", "accepted", "in_progress", "completed"];
  const filtered = tab === "all" ? apps : apps.filter(a => a.status === tab);

  const statusColor = {
    pending: "badge-pending", accepted: "badge-success", completed: "badge-success",
    rejected: "badge-urgent", in_progress: "badge-info", withdrawn: "badge-pending"
  };

  return (
    <div className="page-content">
      <div className="fade-in" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>My Jobs</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{apps.length} applications total</p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_TABS.map(t => (
          <button key={t} className={`tag ${tab === t ? "active" : ""}`} style={{ cursor: "pointer", textTransform: "capitalize" }}
            onClick={() => setTab(t)}>{t} {t === "all" ? `(${apps.length})` : ""}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--radius-lg)" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3>No {tab === "all" ? "" : tab} jobs</h3>
          <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Browse gigs to get started</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(a => (
            <div key={a._id} className="card fade-in"
              style={{ cursor: "pointer", transition: "all 0.2s ease" }}
              onClick={() => navigate(`/jobs/${a.job?._id || a.job}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", flex: 1 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{a.job?.title || "Job"}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                      {a.business?.businessName || a.business?.name} •{" "}
                      {a.job?.date ? new Date(a.job.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span className={`badge ${statusColor[a.status] || "badge-pending"}`} style={{ textTransform: "capitalize" }}>
                        {a.status}
                      </span>
                      {a.job?.payPerHour && <span className="badge badge-info">₹{a.job.payPerHour}/hr</span>}
                      {a.job?.durationHours && <span className="badge badge-info">⏱ {a.job.durationHours}h</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                    {a.totalPaid > 0 && <div style={{ fontWeight: 700, color: "var(--accent)", fontSize: 16 }}>₹{a.totalPaid}</div>}
                    {a.status === "accepted" && (
                      <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}
                        onClick={() => setScanApp(scanApp?.app._id === a._id ? null : { app: a, type: "start" })}>
                        {scanApp?.app._id === a._id ? "Close Panel" : "✓ Check In"}
                      </button>
                    )}
                    {a.status === "in_progress" && (
                      <button className="btn btn-danger btn-sm" style={{ marginTop: 8 }}
                        onClick={() => setScanApp(scanApp?.app._id === a._id ? null : { app: a, type: "end" })}>
                        {scanApp?.app._id === a._id ? "Close Panel" : "Check Out"}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", paddingLeft: 8 }}>
                  <ChevronRightIcon />
                </div>
              </div>

              {/* Inline Scan / OTP block */}
              {scanApp && scanApp.app._id === a._id && (
                <div onClick={e => e.stopPropagation()} style={{ marginTop: 12 }}>
                  <WorkerScanModal
                    application={scanApp.app}
                    type={scanApp.type}
                    onClose={(success) => {
                      setScanApp(null);
                      if (success) window.location.reload();
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}