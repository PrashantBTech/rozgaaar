import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

// ── Typing animation dots ─────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display:"flex", gap:4, alignItems:"center", padding:"12px 16px" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:7, height:7, borderRadius:"50%",
          background:"var(--accent)", display:"inline-block",
          animation:"pulse 1.2s ease infinite",
          animationDelay:`${i*0.2}s`,
          opacity:0.7,
        }} />
      ))}
    </div>
  );
}

// ── Inline Job Card shown inside chat ─────────────────────────────────────────
function ChatJobCard({ job, onApply, onDetails }) {
  const totalPay = (job.payPerHour || 0) * (job.durationHours || 0);
  return (
    <div style={{
      background:"var(--bg-elevated)",
      border:"1px solid var(--border-active)",
      borderRadius:"var(--radius-md)",
      padding:"12px 14px",
      marginTop:8,
      transition:"all 0.2s",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
        <div style={{ fontWeight:700, fontSize:14, color:"var(--text-primary)", flex:1, marginRight:8 }}>
          {job.isUrgent && <span style={{ color:"var(--urgent)", marginRight:6 }}>🔴</span>}
          {job.title}
        </div>
        <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:16, color:"var(--accent)", flexShrink:0 }}>
          ₹{job.payPerHour}/hr
        </div>
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
        <span style={{ fontSize:11, color:"var(--text-muted)" }}>⏱ {job.durationHours}h</span>
        <span style={{ fontSize:11, color:"var(--text-muted)" }}>💰 ₹{totalPay} total</span>
        {job.location?.city && <span style={{ fontSize:11, color:"var(--text-muted)" }}>📍 {job.location.city}</span>}
        {job.location?.address && <span style={{ fontSize:11, color:"var(--text-muted)" }}>• {job.location.address.slice(0,30)}</span>}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ flex:1 }}
          onClick={() => onApply(job)}>
          ⚡ Apply Now
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onDetails(job._id)}>
          Details
        </button>
      </div>
    </div>
  );
}

// ── Business Gig Card shown inside chat ──────────────────────────────────────
function BusinessGigCard({ gig, onViewApplicants }) {
  const statusColor = {
    open:"var(--accent)", completed:"var(--cyan)", expired:"var(--text-muted)",
    cancelled:"var(--urgent)", draft:"var(--gold)",
  };
  return (
    <div style={{
      background:"var(--bg-elevated)", border:"1px solid var(--border)",
      borderRadius:"var(--radius-md)", padding:"12px 14px", marginTop:8,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
        <div style={{ fontWeight:700, fontSize:14, flex:1, marginRight:8 }}>
          {gig.isUrgent && <span style={{ color:"var(--urgent)", marginRight:4 }}>🔴</span>}
          {gig.title}
        </div>
        <span style={{ fontSize:11, fontWeight:700, color: statusColor[gig.status] || "var(--text-muted)",
          background:"var(--bg-card)", padding:"2px 8px", borderRadius:10, flexShrink:0 }}>
          {gig.status}
        </span>
      </div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:8, fontSize:11, color:"var(--text-muted)" }}>
        <span>₹{gig.payPerHour}/hr</span>
        <span>⏱ {gig.durationHours}h</span>
        <span>👥 {gig.slotsFilled}/{gig.slotsRequired} filled</span>
        <span>📩 {gig.applications} applications</span>
        <span>👁 {gig.views} views</span>
        {gig.location && <span>📍 {gig.location}</span>}
      </div>
      {gig.applications > 0 && (
        <button className="btn btn-secondary btn-sm" style={{ width:"100%" }}
          onClick={() => onViewApplicants(gig)}>
          View {gig.applications} Applicant{gig.applications !== 1 ? "s" : ""} →
        </button>
      )}
    </div>
  );
}

// ── Applicant Card shown inside chat ──────────────────────────────────────────
function ApplicantCard({ applicant }) {
  const statusColor = {
    pending:"var(--gold)", shortlisted:"var(--cyan)",
    accepted:"var(--accent)", rejected:"var(--urgent)", completed:"var(--accent)",
  };
  return (
    <div style={{
      background:"var(--bg-elevated)", border:"1px solid var(--border)",
      borderRadius:"var(--radius-md)", padding:"12px 14px", marginTop:6,
      display:"flex", gap:10, alignItems:"center",
    }}>
      <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize:10, flexShrink:0 }}>
        {applicant.name?.[0] || "W"}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:13 }}>{applicant.name}</div>
        <div style={{ fontSize:11, color:"var(--text-muted)" }}>
          ★ {applicant.rating || "New"} • {applicant.jobsDone || 0} jobs
          {applicant.isVerified && <span style={{ color:"var(--accent)", marginLeft:4 }}>✓ Verified</span>}
          {applicant.city && <span> • 📍 {applicant.city}</span>}
        </div>
        {applicant.skills?.length > 0 && (
          <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>
            {applicant.skills.slice(0,3).map(s => (
              <span key={s} style={{ fontSize:10, background:"var(--bg-card)",
                padding:"1px 6px", borderRadius:8, color:"var(--text-secondary)" }}>{s}</span>
            ))}
          </div>
        )}
      </div>
      <span style={{ fontSize:11, fontWeight:700, flexShrink:0,
        color: statusColor[applicant.status] || "var(--text-muted)" }}>
        {applicant.status}
      </span>
    </div>
  );
}

// ── Suggestion chip ───────────────────────────────────────────────────────────
function SuggestionChip({ text, onClick }) {
  return (
    <button
      onClick={() => onClick(text)}
      style={{
        background:"var(--bg-elevated)",
        border:"1px solid var(--border)",
        borderRadius:20,
        padding:"6px 14px",
        fontSize:12, fontWeight:500,
        color:"var(--text-secondary)",
        cursor:"pointer",
        transition:"all 0.15s",
        whiteSpace:"nowrap",
      }}
      onMouseEnter={e => { e.target.style.borderColor="var(--accent)"; e.target.style.color="var(--accent)"; }}
      onMouseLeave={e => { e.target.style.borderColor="var(--border)"; e.target.style.color="var(--text-secondary)"; }}
    >
      {text}
    </button>
  );
}

// ── Parse job cards from worker tool results ──────────────────────────────────
function parseJobsFromToolResults(toolResults) {
  if (!toolResults?.length) return [];
  const jobs = [];
  toolResults.forEach(tr => {
    if (tr.tool === "search_jobs" && tr.result?.jobs) jobs.push(...tr.result.jobs);
    if (tr.tool === "get_job_details" && tr.result?.job) jobs.push(tr.result.job);
  });
  const seen = new Set();
  return jobs.filter(j => { if (seen.has(j._id)) return false; seen.add(j._id); return true; });
}

// ── Parse business gig cards from business tool results ───────────────────────
function parseGigsFromToolResults(toolResults) {
  if (!toolResults?.length) return [];
  const gigs = [];
  toolResults.forEach(tr => {
    if (tr.tool === "get_my_gigs" && tr.result?.gigs) gigs.push(...tr.result.gigs);
  });
  return gigs;
}

// ── Parse applicants from business tool results ───────────────────────────────
function parseApplicantsFromToolResults(toolResults) {
  if (!toolResults?.length) return [];
  let applicants = [];
  toolResults.forEach(tr => {
    if (tr.tool === "get_gig_applications" && tr.result?.applicants) {
      applicants = tr.result.applicants;
    }
  });
  return applicants;
}

// ── Main AI Concierge Page ────────────────────────────────────────────────────
export default function AIConcierge() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [messages, setMessages]       = useState([]);   // conversation history
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set()); // track applied job IDs

  const bottomRef  = useRef();
  const inputRef   = useRef();

  // ── Initial greeting ────────────────────────────────────────────────────────
  useEffect(() => {
    const firstName = user?.name?.split(" ")[0] || "there";
    const isWorker  = user?.role === "worker";

    const greeting = isWorker
      ? `Hey ${firstName}! 👋 I'm **Gigi**, your AI job assistant.\n\nTell me what kind of work you're looking for — I'll find the best gigs near you and can even apply on your behalf!\n\nWhat would you like to work today?`
      : `Hey ${firstName}! 👋 I'm **Gigi**, your AI business assistant.\n\nI can help you manage your gig postings, check applications, view applicant profiles, and much more!\n\nWhat would you like to know about your business today?`;

    setMessages([{
      role:        "assistant",
      content:     greeting,
      toolResults: [],
      jobCards:    [],
      timestamp:   new Date(),
    }]);

    // Load suggestion chips
    api.get("/ai/suggestions")
      .then(r => setSuggestions(r.data.data || []))
      .catch(() => setSuggestions([
        "Find urgent gigs nearby",
        "Show cafe work",
        "What pays the most?",
        "Find delivery work",
      ]));
  }, [user]);

  // ── Auto scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  // ── Send message to AI ───────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    setInput("");

    // Add user message to UI
    const userMsg = { role:"user", content:msgText, timestamp:new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build history for API (only role + content, no extra fields)
      const history = [...messages, userMsg].map(m => ({
        role:    m.role,
        content: m.content,
      }));

      const { data } = await api.post("/ai/chat", {
        messages:     history,
        userLocation: { city: user?.location?.city || "" },
      });

      const jobCards    = parseJobsFromToolResults(data.toolResults);
      const gigCards    = parseGigsFromToolResults(data.toolResults);
      const appCards    = parseApplicantsFromToolResults(data.toolResults);

      setMessages(prev => [...prev, {
        role:        "assistant",
        content:     data.reply,
        toolResults: data.toolResults || [],
        jobCards,
        gigCards,
        appCards,
        timestamp:   new Date(),
      }]);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Unknown error";
      console.error("Gigi error:", errMsg);
      setMessages(prev => [...prev, {
        role:      "assistant",
        content:   `Sorry, something went wrong: ${errMsg}. Please try again! 🙏`,
        jobCards:  [],
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, messages, loading, user]);

  // ── Apply to a job directly via backend (bypasses AI for reliability) ─────────
  const handleApplyViaAI = async (job) => {
    if (appliedJobs.has(job._id)) {
      toast("You already applied for this gig!", { icon:"ℹ️" });
      return;
    }

    // Show user message in chat
    const userMsg = {
      role:      "user",
      content:   `Apply for "${job.title}"`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Call backend directly with the jobId — no AI needed for apply
      const { data } = await api.post("/ai/apply", {
        jobId:     job._id,
        coverNote: "Applied via Gigly AI Assistant — Gigi",
      });

      setAppliedJobs(prev => new Set([...prev, job._id]));

      setMessages(prev => [...prev, {
        role:        "assistant",
        content:     `✅ Done! You've successfully applied for **${job.title}**!\n\n💰 ₹${job.payPerHour}/hr • ⏱ ${job.durationHours || ""}h\n\nThe business will review your application soon. I'll let you know when they respond! 🎉`,
        toolResults: [{ tool: "apply_to_job", result: { success: true } }],
        jobCards:    [],
        timestamp:   new Date(),
      }]);

      toast.success(`Applied for ${job.title}! 🎉`);
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Could not apply. Please try again.";
      setMessages(prev => [...prev, {
        role:      "assistant",
        content:   `Sorry, I couldn\'t apply: ${errMsg}`,
        jobCards:  [],
        timestamp: new Date(),
      }]);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // ── View applicants for a business gig ──────────────────────────────────────
  const handleViewApplicants = async (gig) => {
    const msg = `Show applicants for "${gig.title}"`;
    await sendMessage(msg);
  };

  // ── Format message content (basic markdown) ──────────────────────────────────
  const formatContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      height:        "calc(100vh - var(--header-h))",
      background:    "var(--bg-base)",
      position:      "relative",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        padding:       "14px 20px",
        borderBottom:  "1px solid var(--border)",
        background:    "var(--bg-surface)",
        display:       "flex",
        alignItems:    "center",
        gap:           14,
        flexShrink:    0,
      }}>
        {/* Gigi avatar */}
        <div style={{
          width:46, height:46, borderRadius:"50%",
          background:"linear-gradient(135deg,var(--accent),var(--cyan))",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:22, flexShrink:0,
          boxShadow:"0 0 20px var(--accent-glow)",
          animation:"glow 3s ease infinite",
        }}>
          🤖
        </div>
        <div>
          <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:16 }}>
            Gigi
            <span style={{
              marginLeft:8, fontSize:10, fontWeight:600,
              background:"var(--accent-dim)", color:"var(--accent)",
              border:"1px solid rgba(59,232,176,0.3)",
              borderRadius:10, padding:"2px 8px", verticalAlign:"middle",
            }}>AI</span>
          </div>
          <div style={{ fontSize:12, color:"var(--text-muted)" }}>
            Your personal job concierge • Always online
          </div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <div style={{
            width:8, height:8, borderRadius:"50%",
            background:"var(--accent)",
            boxShadow:"0 0 8px var(--accent-glow)",
            animation:"pulse 2s ease infinite",
          }} />
          <span style={{ fontSize:12, color:"var(--accent)", fontWeight:600 }}>Online</span>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div style={{
        flex:       1,
        overflowY:  "auto",
        padding:    "20px 16px",
        display:    "flex",
        flexDirection: "column",
        gap:        16,
      }}>

        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display:       "flex",
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            gap:           10,
            alignItems:    "flex-end",
            animation:     "fadeIn 0.3s ease both",
          }}>

            {/* Avatar */}
            {msg.role === "assistant" && (
              <div style={{
                width:32, height:32, borderRadius:"50%", flexShrink:0,
                background:"linear-gradient(135deg,var(--accent),var(--cyan))",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, alignSelf:"flex-start",
              }}>🤖</div>
            )}
            {msg.role === "user" && (
              <div className="avatar avatar-sm avatar-placeholder"
                style={{ fontSize:10, alignSelf:"flex-end", flexShrink:0 }}>
                {user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
            )}

            {/* Bubble */}
            <div style={{ maxWidth:"75%", display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{
                padding:      "10px 14px",
                borderRadius: msg.role === "user"
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
                background:   msg.role === "user"
                  ? "var(--accent)"
                  : "var(--bg-card)",
                color: msg.role === "user" ? "#080d1a" : "var(--text-primary)",
                border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                fontSize:    14,
                lineHeight:  1.6,
                boxShadow:   msg.role === "user"
                  ? "0 2px 12px rgba(59,232,176,0.2)"
                  : "var(--shadow-card)",
              }}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />

              {/* Worker: Job cards from search */}
              {msg.jobCards?.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {msg.jobCards.map(job => (
                    <ChatJobCard key={job._id} job={job}
                      onApply={handleApplyViaAI}
                      onDetails={(id) => navigate(`/jobs/${id}`)} />
                  ))}
                </div>
              )}

              {/* Business: Gig cards */}
              {msg.gigCards?.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {msg.gigCards.map(gig => (
                    <BusinessGigCard key={gig._id} gig={gig}
                      onViewApplicants={handleViewApplicants} />
                  ))}
                </div>
              )}

              {/* Business: Applicant cards */}
              {msg.appCards?.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {msg.appCards.map(app => (
                    <ApplicantCard key={app.applicationId} applicant={app} />
                  ))}
                </div>
              )}

              {/* Apply success confirmation */}
              {msg.toolResults?.some(tr => tr.tool === "apply_to_job" && tr.result?.success) && (
                <div style={{
                  background: "var(--accent-dim)",
                  border:     "1px solid rgba(59,232,176,0.3)",
                  borderRadius:"var(--radius-md)",
                  padding:    "10px 14px",
                  fontSize:   13,
                  color:      "var(--accent)",
                  fontWeight: 600,
                }}>
                  ✅ Application submitted successfully!
                  <button className="btn btn-ghost btn-sm"
                    style={{ marginLeft:8, fontSize:12, color:"var(--accent)" }}
                    onClick={() => navigate("/my-jobs")}>
                    View in My Jobs →
                  </button>
                </div>
              )}

              {/* Timestamp */}
              <div style={{
                fontSize:    10,
                color:       "var(--text-muted)",
                textAlign:   msg.role === "user" ? "right" : "left",
                paddingLeft: msg.role === "assistant" ? 4 : 0,
              }}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                  hour:"2-digit", minute:"2-digit"
                }) : ""}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display:"flex", gap:10, alignItems:"flex-end", animation:"fadeIn 0.3s ease" }}>
            <div style={{
              width:32, height:32, borderRadius:"50%", flexShrink:0,
              background:"linear-gradient(135deg,var(--accent),var(--cyan))",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
            }}>🤖</div>
            <div style={{
              background:"var(--bg-card)", border:"1px solid var(--border)",
              borderRadius:"18px 18px 18px 4px", overflow:"hidden",
            }}>
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggestion chips ── */}
      {messages.length <= 2 && !loading && (
        <div style={{
          padding:    "8px 16px 4px",
          borderTop:  "1px solid var(--border)",
          display:    "flex",
          gap:        8,
          overflowX:  "auto",
          flexShrink: 0,
          background: "var(--bg-surface)",
        }}>
          {suggestions.map(s => (
            <SuggestionChip key={s} text={s} onClick={sendMessage} />
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div style={{
        padding:    "12px 16px",
        borderTop:  "1px solid var(--border)",
        background: "var(--bg-surface)",
        display:    "flex",
        gap:        10,
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          className="input"
          placeholder="Ask Gigi anything... 'find me cafe work today'"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey && !loading) {
              e.preventDefault();
              sendMessage();
            }
          }}
          style={{ flex:1, background:"var(--bg-base)" }}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{ padding:"10px 20px", flexShrink:0 }}>
          {loading ? "..." : "Send →"}
        </button>
      </div>

    </div>
  );
}