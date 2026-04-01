import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const categoryEmoji = {
  cafe_staff:"☕", kitchen_help:"🍳", event_crew:"🎪", warehouse_loader:"📦",
  delivery:"🚚", retail_assistant:"🛍️", data_entry:"💻", cleaning:"🧹",
  security:"🔒", photography:"📸", promoter:"📣", other:"⚡",
};

export default function GigCard({ job, onApply, showApply = true }) {
  const navigate = useNavigate();
  const distanceText = job.workerDistance ? `${job.workerDistance.toFixed(1)} mi` : null;
  const timeAgo = job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "";
  const emoji = categoryEmoji[job.category] || "⚡";
  const slotsLeft = job.slotsRequired - (job.slotsFilled || 0);

  return (
    <div className={`gig-card fade-in${job.isUrgent ? " urgent" : ""}`}
      onClick={() => navigate(`/jobs/${job._id}`)}>
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center", flex:1, minWidth:0 }}>
          <div style={{
            width:40, height:40, borderRadius:"var(--radius-md)",
            background: job.isUrgent ? "var(--urgent-dim)" : "var(--accent-dim)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0
          }}>{emoji}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14, color:"var(--text-primary)", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
              {job.title}
            </div>
            <div style={{ fontSize:12, color:"var(--text-muted)" }}>
              {job.postedBy?.businessName || job.postedBy?.name || "Business"}
            </div>
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:18, color: job.isUrgent ? "var(--urgent)" : "var(--accent)" }}>
            ₹{job.payPerHour}
            <span style={{ fontSize:11, fontWeight:400, color:"var(--text-muted)" }}>
              {job.employmentType === "full_time" ? "/mo" : "/hr"}
            </span>
          </div>
        </div>
      </div>

      {/* Tags row */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
        {job.isUrgent && <span className="badge badge-urgent">🔴 Urgent</span>}
        <span className="badge badge-info">⏱ {job.durationHours}h</span>
        {distanceText && <span className="badge" style={{ background:"var(--bg-elevated)", color:"var(--text-secondary)" }}>📍 {distanceText}</span>}
        {slotsLeft > 0 && <span className="badge badge-success">{slotsLeft} slot{slotsLeft>1?"s":""} left</span>}
        {job.paymentMode === "platform_wallet" && <span className="badge badge-success">⚡ Instant Pay</span>}
      </div>

      {/* Description */}
      <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:14, lineHeight:1.5,
        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
        {job.description}
      </p>

      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {job.postedBy?.avatar ? (
            <img src={job.postedBy.avatar} alt="" className="avatar avatar-sm" />
          ) : (
            <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize:10 }}>
              {job.postedBy?.name?.[0] || "B"}
            </div>
          )}
          <div>
            <div style={{ fontSize:11, color:"var(--text-muted)" }}>{timeAgo}</div>
            {job.postedBy?.averageRating > 0 && (
              <div style={{ fontSize:11, color:"var(--gold)" }}>
                ★ {job.postedBy.averageRating.toFixed(1)}
                {job.postedBy.isIdVerified && <span style={{ color:"var(--accent)", marginLeft:4 }}>✓</span>}
              </div>
            )}
          </div>
        </div>

        {showApply && (
          <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onApply?.(job); }}>
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
}
