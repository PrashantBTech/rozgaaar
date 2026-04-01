import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ReviewWorkerModal({ application, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const TAG_OPTIONS = ["Punctual", "Hardworking", "Professional", "Skilled", "Great Attitude", "Fast"];

  const toggleTag = (t) => {
    if (selectedTags.includes(t)) setSelectedTags(p => p.filter(tag => tag !== t));
    else setSelectedTags(p => [...p, t]);
  };

  const submit = async () => {
    if (rating < 1) return toast.error("Please select a rating");
    setSubmitting(true);
    try {
      const { reviewsAPI } = await import("../services/api");
      await reviewsAPI.create({
        applicationId: application._id,
        rating,
        comment,
        tags: selectedTags
      });
      toast.success("Review submitted!");
      onSuccess(application._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20
    }} onClick={onClose}>
      <div className="card fade-in" style={{ width: "100%", maxWidth: 460, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 20, marginBottom: 8, color: "var(--text-primary)" }}>Rate {application.worker?.name}</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>How was it working with them on "{application.job?.title || "this gig"}"?</p>
        
        {/* Rating Stars */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          {[1,2,3,4,5].map(star => (
            <button key={star} onClick={() => setRating(star)} style={{
              background: "transparent", border: "none", fontSize: 36, cursor: "pointer",
              color: star <= rating ? "var(--gold)" : "var(--bg-elevated)", transition: "color 0.2s"
            }}>
              ★
            </button>
          ))}
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.08em" }}>Select attributes</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TAG_OPTIONS.map(t => (
              <button key={t} onClick={() => toggleTag(t)}
                className={`tag ${selectedTags.includes(t) ? "active" : ""}`}
                style={{ cursor: "pointer", background: selectedTags.includes(t) ? "var(--accent-dim)" : "var(--bg-elevated)", 
                  color: selectedTags.includes(t) ? "var(--accent)" : "var(--text-secondary)",
                  border: selectedTags.includes(t) ? "1px solid rgba(0, 240, 255, 0.3)" : "1px solid var(--border)" }}>
                {t} {selectedTags.includes(t) && "✓"}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="input-group" style={{ marginBottom: 24 }}>
          <label className="input-label">Additional Comments (Optional)</label>
          <textarea className="input" rows={3} placeholder="Share details of your experience..."
            value={comment} onChange={e => setComment(e.target.value)} style={{ resize: "vertical" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button className="btn btn-secondary" disabled={submitting} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={submitting || rating < 1} onClick={submit}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
