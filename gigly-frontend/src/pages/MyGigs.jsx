import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jobsAPI, appsAPI } from "../services/api";
import toast from "react-hot-toast";

function ContactButton({ applicationId }) {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  const reveal = async () => {
    setLoading(true);
    try {
      const { data } = await import("../services/api")
        .then(({ default: api }) => api.get(`/applications/${applicationId}/contact`));
      setContact(data.data);
    } catch (err) {
      const toastLib = await import("react-hot-toast").then(m => m.default);
      toastLib.error(err.response?.data?.message || "Could not load contact");
    } finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(contact.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!contact) return (
    <button className="btn btn-secondary btn-sm" onClick={reveal} disabled={loading}>
      {loading ? "..." : "📞 View Phone"}
    </button>
  );

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      background: "var(--accent-dim)",
      border: "1px solid rgba(59,232,176,0.3)",
      borderRadius: "var(--radius-md)", padding: "6px 12px",
    }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>
        📞 {contact.phone}
      </span>
      <button className="btn btn-primary btn-sm" onClick={copy}>
        {copied ? "✓ Copied!" : "Copy"}
      </button>
      <a href={`tel:${contact.phone}`} className="btn btn-secondary btn-sm"
        style={{ textDecoration: "none" }}>
        Call
      </a>
    </div>
  );
}

export default function MyGigs() {
  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [applicants, setApplicants]   = useState({});
  const [loadingApps, setLoadingApps] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    jobsAPI.getMine()
      .then(r => { setJobs(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadApplicants = async (jobId) => {
    if (applicants[jobId]) {
      setExpandedJob(expandedJob === jobId ? null : jobId);
      return;
    }
    setLoadingApps(p => ({ ...p, [jobId]: true }));
    try {
      const { data } = await appsAPI.getForJob(jobId);
      setApplicants(p => ({ ...p, [jobId]: data.data || [] }));
      setExpandedJob(jobId);
    } catch {
      toast.error("Could not load applicants");
    } finally {
      setLoadingApps(p => ({ ...p, [jobId]: false }));
    }
  };

  const updateStatus = async (appId, status, jobId) => {
    try {
      await appsAPI.updateStatus(appId, status);
      setApplicants(p => ({
        ...p,
        [jobId]: p[jobId].map(a => a._id === appId ? { ...a, status } : a),
      }));
      const messages = {
        shortlisted: "Candidate shortlisted! ⭐",
        accepted:    "Candidate accepted! 🎉",
        rejected:    "Candidate rejected.",
      };
      toast.success(messages[status] || `Status updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const markCompleted = async (appId, jobId) => {
    try {
      await appsAPI.updateStatus(appId, "completed");
      setApplicants(p => ({
        ...p,
        [jobId]: p[jobId].map(a => a._id === appId ? { ...a, status: "completed" } : a),
      }));
      toast.success("Gig marked as completed! Payment will be processed. ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark completed");
    }
  };

  const statusBadge = (status) => {
    const map = {
      open:        "badge-success",
      in_progress: "badge-info",
      completed:   "badge-success",
      cancelled:   "badge-urgent",
      expired:     "badge-pending",
      draft:       "badge-pending",
    };
    return map[status] || "badge-pending";
  };

  return (
    <div className="page-content">

      {/* Header */}
      <div className="fade-in" style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 28,
      }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>My Gigs</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {jobs.length} listing{jobs.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/post-gig")}>
          + Post New Gig
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton"
              style={{ height: 80, borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>

      /* Empty */
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ marginBottom: 8 }}>No gigs posted yet</h3>
          <button className="btn btn-primary" style={{ marginTop: 16 }}
            onClick={() => navigate("/post-gig")}>
            Post Your First Gig
          </button>
        </div>

      /* Job list */
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {jobs.map(job => (
            <div key={job._id} className="card fade-in">

              {/* Job summary row */}
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{
                    display: "flex", gap: 10, alignItems: "center",
                    marginBottom: 6, flexWrap: "wrap",
                  }}>
                    <h3 style={{ fontSize: 16 }}>{job.title}</h3>
                    {job.isUrgent && <span className="badge badge-urgent">URGENT</span>}
                    <span className={`badge ${statusBadge(job.status)}`}
                      style={{ textTransform: "capitalize" }}>
                      {job.status}
                    </span>
                  </div>
                  <div style={{
                    display: "flex", gap: 12, fontSize: 12,
                    color: "var(--text-muted)", flexWrap: "wrap",
                  }}>
                    <span>₹{job.payPerHour}/hr</span>
                    <span>⏱ {job.durationHours}h</span>
                    <span>📅 {job.date
                      ? new Date(job.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                      : "—"}
                    </span>
                    <span>👥 {job.slotsFilled}/{job.slotsRequired} filled</span>
                    <span>👁 {job.views} views</span>
                    <span>📩 {job.applicationsCount} applications</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/jobs/${job._id}`)}>
                    View
                  </button>
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/jobs/${job._id}/edit`)}>
                    Edit
                  </button>
                  <button className="btn btn-primary btn-sm"
                    onClick={() => loadApplicants(job._id)}
                    disabled={loadingApps[job._id]}>
                    {loadingApps[job._id]
                      ? "..."
                      : expandedJob === job._id
                        ? "Hide Applicants ▲"
                        : `Applicants (${job.applicationsCount}) ▼`}
                  </button>
                </div>
              </div>

              {/* Applicants panel */}
              {expandedJob === job._id && (
                <div style={{
                  marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16,
                }}>
                  <div style={{
                    fontSize: 12, color: "var(--text-muted)", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
                  }}>
                    Applicants
                  </div>

                  {!applicants[job._id]?.length ? (
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      No applicants yet
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {applicants[job._id].map(app => (
                        <div key={app._id} style={{
                          display: "flex", gap: 12, alignItems: "center",
                          padding: "12px 14px",
                          background: "var(--bg-surface)",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border)",
                          flexWrap: "wrap",
                        }}>

                          {/* Avatar */}
                          <div className="avatar avatar-md avatar-placeholder"
                            style={{ fontSize: 13 }}>
                            {app.worker?.name?.[0] || "W"}
                          </div>

                          {/* Worker info */}
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                              {app.worker?.name}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              ★ {app.worker?.averageRating || "New"} •{" "}
                              {app.worker?.totalJobsCompleted || 0} jobs
                              {app.worker?.isIdVerified && " • ✓ Verified"}
                            </div>
                            {app.worker?.skills?.length > 0 && (
                              <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                                {app.worker.skills.slice(0, 3).map(s => (
                                  <span key={s} className="tag"
                                    style={{ fontSize: 10, padding: "2px 6px" }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                            {app.coverNote && (
                              <div style={{
                                fontSize: 12, color: "var(--text-secondary)",
                                marginTop: 4, fontStyle: "italic",
                              }}>
                                "{app.coverNote}"
                              </div>
                            )}
                          </div>

                          {/* Status + action buttons */}
                          <div style={{
                            display: "flex", gap: 8,
                            alignItems: "center", flexWrap: "wrap",
                          }}>

                            {/* Status badge */}
                            <span className={`badge ${
                              app.status === "accepted"    ? "badge-success" :
                              app.status === "shortlisted" ? "badge-pending" :
                              app.status === "completed"   ? "badge-success" :
                              app.status === "rejected"    ? "badge-urgent"  :
                              "badge-pending"
                            }`} style={{ textTransform: "capitalize" }}>
                              {app.status}
                            </span>

                            {/* PENDING — Shortlist + Accept + Reject */}
                            {app.status === "pending" && (
                              <>
                                <button className="btn btn-secondary btn-sm"
                                  onClick={() => updateStatus(app._id, "shortlisted", job._id)}>
                                  ⭐ Shortlist
                                </button>
                                <button className="btn btn-primary btn-sm"
                                  onClick={() => updateStatus(app._id, "accepted", job._id)}>
                                  Accept
                                </button>
                                <button className="btn btn-danger btn-sm"
                                  onClick={() => updateStatus(app._id, "rejected", job._id)}>
                                  Reject
                                </button>
                              </>
                            )}

                            {/* SHORTLISTED — View Phone + Accept + Reject */}
                            {app.status === "shortlisted" && (
                              <>
                                <ContactButton applicationId={app._id} />
                                <button className="btn btn-primary btn-sm"
                                  onClick={() => updateStatus(app._id, "accepted", job._id)}>
                                  ✅ Accept
                                </button>
                                <button className="btn btn-danger btn-sm"
                                  onClick={() => updateStatus(app._id, "rejected", job._id)}>
                                  Reject
                                </button>
                              </>
                            )}

                            {/* ACCEPTED — View Phone + Mark Completed */}
                            {app.status === "accepted" && (
                              <>
                                <ContactButton applicationId={app._id} />
                                <button className="btn btn-primary btn-sm"
                                  onClick={() => markCompleted(app._id, job._id)}>
                                  ✓ Mark Completed
                                </button>
                              </>
                            )}

                            {/* REJECTED */}
                            {app.status === "rejected" && (
                              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                Not selected
                              </span>
                            )}

                            {/* COMPLETED */}
                            {app.status === "completed" && (
                              <span className="badge badge-success">✓ Completed</span>
                            )}

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}