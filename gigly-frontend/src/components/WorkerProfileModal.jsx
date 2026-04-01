import React, { useState, useEffect } from "react";
import { usersAPI, reviewsAPI } from "../services/api";
import toast from "react-hot-toast";

const getTrustScore = (u) => {
  if (!u) return "—";
  let score = 50;
  if (u.isIdVerified) score += 20;
  if (u.totalJobsCompleted > 0) score += Math.min(20, u.totalJobsCompleted * 2);
  if (u.averageRating > 0) score += (u.averageRating / 5) * 10;
  return `${Math.min(100, Math.round(score))}%`;
};

export default function WorkerProfileModal({ applicantId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicantId) return;
    setLoading(true);
    usersAPI.getProfile(applicantId)
      .then((res) => {
        setProfile(res.data.data);
        return reviewsAPI.getForUser(applicantId);
      })
      .then((res) => setReviews(res?.data?.data || []))
      .catch((err) => toast.error(err.response?.data?.message || "Could not load profile"))
      .finally(() => setLoading(false));
  }, [applicantId]);

  if (!applicantId) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20
    }} onClick={onClose}>
      <div className="card fade-in" style={{
        width: "100%", maxWidth: 500, position: "relative",
        background: "var(--bg-card)", overflowY: "auto", maxHeight: "90vh",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "var(--bg-elevated)", border: "1px solid var(--border)",
          color: "var(--text-primary)", borderRadius: "50%",
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, cursor: "pointer", transition: "all 0.2s"
        }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseOut={e => e.currentTarget.style.background = "var(--bg-elevated)"}>×</button>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 10 }}>
            <div className="skeleton" style={{ height: 100, borderRadius: "var(--radius-md)" }} />
            <div className="skeleton" style={{ height: 60, borderRadius: "var(--radius-md)" }} />
            <div className="skeleton" style={{ height: 60, borderRadius: "var(--radius-md)" }} />
          </div>
        ) : profile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 10 }}>
            {/* Header / Basic Info */}
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="avatar" style={{ width: 80, height: 80, objectFit: "cover", border: "2px solid var(--border)" }} />
              ) : (
                <div className="avatar avatar-placeholder" style={{ width: 80, height: 80, fontSize: 32, border: "2px solid var(--border)" }}>
                  {profile.name?.[0] || "?"}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 24, marginBottom: 6, color: "var(--text-primary)" }}>{profile.name}</h2>
                <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--text-secondary)", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: "var(--gold)", fontSize: 16 }}>★</span>
                    <strong style={{ color: "var(--text-primary)" }}>{profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "New"}</strong>
                    {profile.totalReviews > 0 ? ` (${profile.totalReviews} reviews)` : ""}
                  </span>
                  <span>•</span>
                  <span><strong>{profile.totalJobsCompleted || 0}</strong> jobs</span>
                  <span>•</span>
                  <span><strong style={{ color: "var(--accent)" }}>{getTrustScore(profile)}</strong> Trust Score</span>
                  {profile.isIdVerified && (
                    <>
                      <span>•</span>
                      <span style={{ color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        Verified
                      </span>
                    </>
                  )}
                </div>

                {(profile.skills?.length > 0 || profile.education?.length > 0) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {profile.skills?.map((s, i) => (
                      <span key={`skill-${i}`} className="tag" style={{ fontSize: 11, padding: "2px 8px", background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(0, 240, 255, 0.3)" }}>{s}</span>
                    ))}
                    {profile.education?.map((e, i) => (
                      <span key={`edu-${i}`} className="tag" style={{ fontSize: 11, padding: "2px 8px", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid rgba(245, 200, 66, 0.3)" }}>🎓 {e}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {profile.location?.city && (
              <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: 18 }}>📍</span>
                <span>
                  <span style={{ color: "var(--text-muted)" }}>Location: </span>
                  <strong>{profile.location.city}</strong> {profile.location.address && `- ${profile.location.address}`}
                </span>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div style={{ background: "var(--bg-surface)", padding: 20, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <h4 style={{ marginBottom: 12, fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em" }}>About</h4>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>{profile.bio}</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: profile.skills?.length && profile.education?.length ? "1fr 1fr" : "1fr", gap: 24 }}>
              {/* Skills */}
              {profile.skills?.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 16, fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em" }}>Skills & Expertise</h4>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="tag active" style={{ padding: "6px 14px", fontSize: 13 }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profile.education?.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 16, fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em" }}>Education & Certifications</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {profile.education.map((edu, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", fontSize: 13 }}>
                        <span style={{ fontSize: 16 }}>🎓</span>
                        <span>{edu}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <h4 style={{ marginBottom: 16, fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em" }}>Recent Reviews</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ background: "var(--bg-elevated)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{r.reviewer?.name}</div>
                        <div style={{ color: "var(--gold)", fontSize: 16, letterSpacing: 2 }}>
                          {"★".repeat(r.rating)}
                          <span style={{ color: "var(--text-muted)", opacity: 0.3 }}>{"★".repeat(5-r.rating)}</span>
                        </div>
                      </div>
                      {r.comment && <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, fontStyle: "italic" }}>"{r.comment}"</div>}
                      {r.tags?.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {r.tags.map(t => (
                            <span key={t} className="tag" style={{ fontSize: 10, padding: "2px 8px", background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(0, 240, 255, 0.2)" }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btn btn-primary" onClick={onClose}>Close Profile</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 16 }}>
            Profile could not be loaded.
          </div>
        )}
      </div>
    </div>
  );
}
