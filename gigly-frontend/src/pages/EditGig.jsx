import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { jobsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  { v: "cafe_staff", l: "☕ Cafe Staff" },
  { v: "kitchen_help", l: "🍳 Kitchen Help" },
  { v: "event_crew", l: "🎪 Event Crew" },
  { v: "warehouse_loader", l: "📦 Warehouse" },
  { v: "delivery", l: "🚚 Delivery" },
  { v: "retail_assistant", l: "🛍️ Retail" },
  { v: "data_entry", l: "💻 Data Entry" },
  { v: "cleaning", l: "🧹 Cleaning" },
  { v: "security", l: "🛡️ Security" },
  { v: "photography", l: "📸 Photography" },
  { v: "promoter", l: "📣 Promoter" },
  { v: "other", l: "⚡ Other" },
];

const PAYMENT_MODES = [
  { v: "platform_wallet", l: "⚡ Instant Pay (Platform)" },
  { v: "upi", l: "📱 UPI" },
  { v: "cash", l: "💵 Cash" },
  { v: "bank_transfer", l: "🏦 Bank Transfer" },
];

const toDateInput = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().split("T")[0];
};

export default function EditGig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [job, setJob] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    durationHours: 2,
    payPerHour: "",
    date: "",
    startTime: "",
    endTime: "",
    address: "",
    city: "",
    pincode: "",
    landmark: "",
    slotsRequired: 1,
    isUrgent: false,
    paymentMode: "platform_wallet",
    employmentType: "part_time",
    requirements: { minAge: 18, gender: "any", experience: "none", ownVehicle: false, ownEquipment: false, requireResume: false },
    // Preserve existing coordinates if present (no geocoding on frontend).
    locationCoordinates: [0, 0],
    status: "open",
  });

  const categoriesForSelect = useMemo(() => {
    if (!job?.category) return CATEGORIES;
    const exists = CATEGORIES.some((c) => c.v === job.category);
    return exists ? CATEGORIES : [{ v: job.category, l: job.category }, ...CATEGORIES];
  }, [job?.category]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    jobsAPI
      .getOne(id)
      .then((r) => {
        if (!mounted) return;
        const j = r.data.data;
        setJob(j);
        setForm({
          title: j.title || "",
          category: j.category || "",
          description: j.description || "",
          durationHours: j.durationHours ?? 2,
          payPerHour: j.payPerHour ?? "",
          date: toDateInput(j.date),
          startTime: j.startTime || "",
          endTime: j.endTime || "",
          address: j.location?.address || "",
          city: j.location?.city || "",
          pincode: j.location?.pincode || "",
          landmark: j.location?.landmark || "",
          slotsRequired: j.slotsRequired ?? 1,
          isUrgent: !!j.isUrgent,
          paymentMode: j.paymentMode || "platform_wallet",
          employmentType: j.employmentType || "part_time",
          requirements: {
            minAge: j.requirements?.minAge ?? 18,
            gender: j.requirements?.gender ?? "any",
            experience: j.requirements?.experience ?? "none",
            ownVehicle: j.requirements?.ownVehicle ?? false,
            ownEquipment: j.requirements?.ownEquipment ?? false,
            requireResume: j.requirements?.requireResume ?? false,
          },
          locationCoordinates: j.location?.coordinates?.length ? j.location.coordinates : [0, 0],
          status: j.status || "open",
        });
      })
      .catch(() => toast.error("Could not load gig"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const updNested = (parent, k) => (e) =>
    setForm({ ...form, [parent]: { ...form[parent], [k]: e.target.value } });

  const totalPay = (parseFloat(form.payPerHour) || 0) * (parseInt(form.durationHours) || 0);
  
  useEffect(() => {
    if (form.startTime && form.durationHours && !loading) {
      const [h, m] = form.startTime.split(":");
      const start = new Date();
      start.setHours(parseInt(h), parseInt(m), 0, 0);
      start.setHours(start.getHours() + parseInt(form.durationHours));
      const endH = String(start.getHours()).padStart(2, "0");
      const endM = String(start.getMinutes()).padStart(2, "0");
      setForm(prev => ({ ...prev, endTime: `${endH}:${endM}` }));
    }
  }, [form.startTime, form.durationHours, loading]);

  const validateRequired = () => {
    return (
      form.title &&
      form.category &&
      form.description &&
      form.payPerHour !== "" &&
      form.date &&
      form.startTime &&
      form.endTime &&
      form.address
    );
  };

  const update = async (nextStatus) => {
    if (!validateRequired()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        durationHours: parseInt(form.durationHours),
        payPerHour: parseFloat(form.payPerHour),
        date: new Date(form.date),
        startTime: form.startTime,
        endTime: form.endTime,
        location: {
          type: "Point",
          coordinates: form.locationCoordinates,
          address: form.address,
          landmark: form.landmark,
          city: form.city,
          pincode: form.pincode,
        },
        slotsRequired: parseInt(form.slotsRequired),
        isUrgent: !!form.isUrgent,
        paymentMode: form.paymentMode,
        requirements: form.requirements,
        employmentType: form.employmentType,
        status: nextStatus,
        // Keep cron expiration consistent when date changes.
        endsAt: new Date(form.date),
      };

      await jobsAPI.update(id, payload);
      toast.success(nextStatus === "draft" ? "Saved draft" : "Gig updated!");
      navigate(`/my-gigs`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update gig");
    } finally {
      setUpdating(false);
    }
  };

  const deleteJob = async () => {
    setUpdating(true);
    try {
      await jobsAPI.delete(id);
      toast.success("Job deleted");
      navigate("/my-gigs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete job");
    } finally {
      setUpdating(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 96, borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-content" style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2>Gig not found</h2>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate("/my-gigs")}>
          Back to My Gigs
        </button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="fade-in" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 6 }}>Edit Gig</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Update the details below. Deleted gigs can’t be recovered.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/my-gigs`)}>
              ← Back
            </button>
            <button
              className="btn btn-danger btn-sm"
              disabled={updating || !user}
              onClick={() => setConfirmDelete(true)}
              style={{ whiteSpace: "nowrap" }}
              title="Delete this job post"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
        {/* ── Form ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Step 1 */}
          <div className="card fade-in fade-in-1">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  color: "#080d1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: 16 }}>Job Details</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Job Title *</label>
                <input className="input" placeholder='e.g. "Help me move a sofa"' value={form.title} onChange={upd("title")} />
              </div>
              {/* Hiring Type removed */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Category *</label>
                  <select className="input" value={form.category} onChange={upd("category")}>
                    <option value="">Select category…</option>
                    {categoriesForSelect.map((c) => (
                      <option key={c.v} value={c.v}>
                        {c.l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Duration (hours) *</label>
                  <input className="input" type="number" min={1} max={12} value={form.durationHours} onChange={upd("durationHours")} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Description *</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Describe the task clearly..."
                  value={form.description}
                  onChange={upd("description")}
                  style={{ resize: "vertical", minHeight: 100 }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Slots Required</label>
                  <input className="input" type="number" min={1} max={50} value={form.slotsRequired} onChange={upd("slotsRequired")} />
                </div>
                <div className="input-group">
                  <label className="input-label">Payment Mode</label>
                  <select className="input" value={form.paymentMode} onChange={upd("paymentMode")}>
                    {PAYMENT_MODES.map((p) => (
                      <option key={p.v} value={p.v}>
                        {p.l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card fade-in fade-in-2">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--cyan)",
                  color: "#080d1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: 16 }}>Rate & Location</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Hourly Rate (₹) *</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon" style={{ fontSize: 13, fontWeight: 700 }}>
                      ₹
                    </span>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
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
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "16px",
                  background: "var(--urgent-dim)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255,107,107,0.2)",
                }}
              >
                <input
                  type="checkbox"
                  id="urgent"
                  checked={form.isUrgent}
                  onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
                  style={{ marginTop: 3, accentColor: "var(--urgent)", width: 16, height: 16 }}
                />
                <label htmlFor="urgent" style={{ cursor: "pointer" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--urgent)", marginBottom: 2 }}>🔴 Urgent Request?</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Boost visibility for gigs needed within 2 hours.</div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-secondary btn-lg" style={{ flex: 1, minWidth: 220 }} disabled={updating} onClick={() => update("draft")}>
              {updating ? "…" : "Save Draft"}
            </button>
            <button className="btn btn-primary btn-lg" style={{ flex: 2, minWidth: 240 }} disabled={updating} onClick={() => update("open")}>
              {updating ? "…" : "⚡ Update Gig Now"}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="card fade-in" style={{ border: "1px solid rgba(255,107,107,0.35)", background: "rgba(255,107,107,0.02)" }}>
            <div style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 6, color: "var(--urgent)" }}>Danger Zone</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                    Deleting <b>{job.title}</b> will remove the post and all applications for it.
                  </p>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ whiteSpace: "nowrap" }}
                  disabled={updating || !user}
                  onClick={() => setConfirmDelete(true)}
                >
                  🗑️ Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Live Preview ── */}
        <div className="fade-in fade-in-3" style={{ position: "sticky", top: 96 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Live Preview
          </div>
          <div className="card" style={{ border: "1px solid var(--border-active)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>📱 Mobile View</div>
              {form.isUrgent && <span className="badge badge-urgent">URGENT</span>}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 4 }}>
              {form.title || "Job Title"}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {form.category && <span className="badge badge-info">{categoriesForSelect.find((c) => c.v === form.category)?.l || form.category}</span>}
              {form.durationHours && <span className="badge badge-info">⏱ {form.durationHours}h / gig</span>}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {form.description || "Your job description will appear here."}
            </p>
            <div className="divider" style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Est. Earnings</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--accent)" }}>
                  {totalPay > 0 ? `₹${totalPay}` : "₹—"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  ₹{form.payPerHour || "—"}/hr × {form.durationHours}h
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Distance</div>
                <div style={{ fontWeight: 700 }}>0.8 mi</div>
              </div>
            </div>
            {form.address && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>📍 {form.address}</div>}
            <button className="btn btn-primary btn-full btn-sm" disabled>
              Apply for Gig
            </button>
            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
              The preview updates in real-time as you type.
            </p>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 16,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmDelete(false);
          }}
        >
          <div
            className="card fade-in"
            style={{
              width: 560,
              maxWidth: "100%",
              border: "1px solid rgba(255,107,107,0.45)",
              background: "var(--bg-card)",
            }}
          >
            <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 800, color: "var(--urgent)", marginBottom: 6, fontSize: 16 }}>Delete this gig?</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                This will permanently remove <b>{job.title}</b> and all applications for it.
              </div>
            </div>
            <div style={{ padding: 18, display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)} disabled={updating}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={deleteJob} disabled={updating} style={{ minWidth: 140 }}>
                {updating ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

