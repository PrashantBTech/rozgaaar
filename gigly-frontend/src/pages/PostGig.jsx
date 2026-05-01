import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jobsAPI } from "../services/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  { v:"cafe_staff",l:"☕ Cafe Staff"}, { v:"kitchen_help",l:"🍳 Kitchen Help"},
  { v:"event_crew",l:"🎪 Event Crew"}, { v:"warehouse_loader",l:"📦 Warehouse"},
  { v:"delivery",l:"🚚 Delivery"}, { v:"retail_assistant",l:"🛍️ Retail"},
  { v:"data_entry",l:"💻 Data Entry"}, { v:"cleaning",l:"🧹 Cleaning"},
  { v:"other",l:"⚡ Other"},
];
const PAYMENT_MODES = [
  { v:"platform_wallet",l:"⚡ Instant Pay (Platform)"}, { v:"upi",l:"📱 UPI"},
  { v:"cash",l:"💵 Cash"}, { v:"bank_transfer",l:"🏦 Bank Transfer"},
];

export default function PostGig() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title:"", category:"", description:"", durationHours:2,
    payPerHour:"", date:"", startTime:"", endTime:"",
    address:"", city:"", pincode:"", landmark:"",
    slotsRequired:1, isUrgent:false, paymentMode:"platform_wallet",
    employmentType:"part_time",
    requirements:{ minAge:18, gender:"any", experience:"none", requireResume:false },
  });

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const updNested = (parent, k) => (e) => setForm({ ...form, [parent]:{ ...form[parent], [k]: e.target.value }});
  const totalPay = (parseFloat(form.payPerHour)||0) * (parseInt(form.durationHours)||0);

  useEffect(() => {
    if (form.startTime && form.durationHours) {
      const [h, m] = form.startTime.split(":");
      const start = new Date();
      start.setHours(parseInt(h), parseInt(m), 0, 0);
      start.setHours(start.getHours() + parseInt(form.durationHours));
      const endH = String(start.getHours()).padStart(2, "0");
      const endM = String(start.getMinutes()).padStart(2, "0");
      setForm(prev => ({ ...prev, endTime: `${endH}:${endM}` }));
    }
  }, [form.startTime, form.durationHours]);

  const submit = async () => {
    if (!form.title || !form.category || !form.payPerHour || !form.date || !form.startTime || !form.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        payPerHour: parseFloat(form.payPerHour),
        durationHours: parseInt(form.durationHours),
        slotsRequired: parseInt(form.slotsRequired),
        location: {
          type:"Point", coordinates:[0,0],
          address: form.address, city: form.city, pincode: form.pincode, landmark: form.landmark,
        },
      };
      const { data } = await jobsAPI.create(payload);
      toast.success("Gig posted! Workers are being notified 🎉");
      navigate(`/jobs/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post gig");
    } finally { setLoading(false); }
  };

  return (
    <div className="page-content">
      <div className="fade-in" style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, marginBottom:6 }}>Post a Gig</h1>
        <p style={{ color:"var(--text-secondary)", fontSize:14 }}>Fill in the details below to find help instantly in your area.</p>
      </div>

      <div className="post-gig-grid" style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:24, alignItems:"start" }}>
        {/* ── Form ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Step 1 */}
          <div className="card fade-in fade-in-1">
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--accent)", color:"#080d1a",
                display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13 }}>1</div>
              <h3 style={{ fontSize:16 }}>Job Details</h3>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div className="input-group">
                <label className="input-label">Job Title *</label>
                <input className="input" placeholder='e.g. "Help me move a sofa"' value={form.title} onChange={upd("title")} />
              </div>
              {/* Removed Hiring Type radio buttons (focused on part-time only) */}
              <div className="grid-2" style={{ gap:14 }}>
                <div className="input-group">
                  <label className="input-label">Category *</label>
                  <select className="input" value={form.category} onChange={upd("category")}>
                    <option value="">Select category…</option>
                    {CATEGORIES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">
                    Duration (hours) *
                  </label>
                  <input className="input" type="number" min={1} max={12} value={form.durationHours} onChange={upd("durationHours")} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Description *</label>
                <textarea className="input" rows={4} placeholder="Describe the task clearly..."
                  value={form.description} onChange={upd("description")}
                  style={{ resize:"vertical", minHeight:100 }} />
              </div>
              <div className="grid-2" style={{ gap:14 }}>
                <div className="input-group">
                  <label className="input-label">Slots Required</label>
                  <input className="input" type="number" min={1} max={50} value={form.slotsRequired} onChange={upd("slotsRequired")} />
                </div>
                <div className="input-group">
                  <label className="input-label">Payment Mode</label>
                  <select className="input" value={form.paymentMode} onChange={upd("paymentMode")}>
                    {PAYMENT_MODES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card fade-in fade-in-2">
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--cyan)", color:"#080d1a",
                display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13 }}>2</div>
              <h3 style={{ fontSize:16 }}>Rate & Location</h3>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div className="grid-2" style={{ gap:14 }}>
                <div className="input-group">
                  <label className="input-label">
                    Hourly Rate (₹) *
                  </label>
                  <div className="input-icon-wrap">
                    <span className="input-icon" style={{ fontSize:13, fontWeight:700 }}>₹</span>
                    <input className="input" type="number" min={0} placeholder="150" value={form.payPerHour} onChange={upd("payPerHour")} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Date *</label>
                  <input className="input" type="date" value={form.date} onChange={upd("date")} min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="input-group">
                  <label className="input-label">Start Time *</label>
                  <input className="input" type="time" value={form.startTime} onChange={upd("startTime")} />
                </div>
                <div className="input-group">
                  <label className="input-label">End Time</label>
                  <input className="input" type="time" value={form.endTime} readOnly style={{ background:"var(--bg-base)" }} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Location / Address *</label>
                <input className="input" placeholder="123 Main St, Downtown" value={form.address} onChange={upd("address")} />
              </div>
              <div className="grid-3" style={{ gap:12 }}>
                <div className="input-group">
                  <label className="input-label">City</label>
                  <input className="input" placeholder="New Delhi" value={form.city} onChange={upd("city")} />
                </div>
                <div className="input-group">
                  <label className="input-label">Pincode</label>
                  <input className="input" placeholder="110001" value={form.pincode} onChange={upd("pincode")} />
                </div>
                <div className="input-group">
                  <label className="input-label">Landmark</label>
                  <input className="input" placeholder="Near metro" value={form.landmark} onChange={upd("landmark")} />
                </div>
              </div>

              {/* Full-time extras removed */}

              {/* Urgent toggle */}
              <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"16px", background:"var(--urgent-dim)", borderRadius:"var(--radius-md)", border:"1px solid rgba(255,107,107,0.2)" }}>
                <input type="checkbox" id="urgent" checked={form.isUrgent}
                  onChange={e => setForm({...form, isUrgent:e.target.checked})}
                  style={{ marginTop:3, accentColor:"var(--urgent)", width:16, height:16 }} />
                <label htmlFor="urgent" style={{ cursor:"pointer" }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"var(--urgent)", marginBottom:2 }}>🔴 Urgent Request?</div>
                  <div style={{ fontSize:12, color:"var(--text-secondary)" }}>Boost visibility for gigs needed within 2 hours.</div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:12 }}>
            <button className="btn btn-secondary btn-lg" style={{ flex:1 }}
              onClick={() => jobsAPI.create({...form, status:"draft"}).then(() => toast.success("Saved as draft"))}>
              Save Draft
            </button>
            <button className="btn btn-primary btn-lg" style={{ flex:2 }} disabled={loading} onClick={submit}>
              {loading ? "Posting…" : "⚡ Post Gig Now"}
            </button>
          </div>
        </div>

        {/* ── Live Preview ── */}
        <div className="post-gig-preview fade-in fade-in-3" style={{ position:"sticky", top:96 }}>
          <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>
            Live Preview
          </div>
          <div className="card" style={{ border:"1px solid var(--border-active)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div style={{ fontSize:11, color:"var(--text-muted)" }}>📱 Mobile View</div>
              {form.isUrgent && <span className="badge badge-urgent">URGENT</span>}
            </div>
            <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:18, color:"var(--text-primary)", marginBottom:4 }}>
              {form.title || "Job Title"}
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
              {form.category && <span className="badge badge-info">{CATEGORIES.find(c=>c.v===form.category)?.l || form.category}</span>}
              {form.durationHours && <span className="badge badge-info">⏱ {form.durationHours}h / gig</span>}
            </div>
            <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:16, lineHeight:1.6,
              display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
              {form.description || "Your job description will appear here."}
            </p>
            <div className="divider" style={{ margin:"12px 0" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:2 }}>Est. Earnings</div>
                <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:22, color:"var(--accent)" }}>
                  {totalPay > 0 ? `₹${totalPay.toLocaleString("en-IN")}` : "₹—"}
                </div>
                <div style={{ fontSize:11, color:"var(--text-muted)" }}>
                  {`₹${form.payPerHour||"—"}/hr × ${form.durationHours}h`}
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:2 }}>Distance</div>
                <div style={{ fontWeight:700 }}>0.8 mi</div>
              </div>
            </div>
            {form.address && <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:12 }}>📍 {form.address}</div>}
            <button className="btn btn-primary btn-full btn-sm" disabled>Apply for Gig</button>
            <p style={{ fontSize:11, color:"var(--text-muted)", textAlign:"center", marginTop:8 }}>
              The preview updates in real-time as you type. This is exactly how gig workers will see your post.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}