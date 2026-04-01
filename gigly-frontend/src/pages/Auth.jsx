import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ── Shared auth card wrapper ──────────────────────────────────────────────────
function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg-base)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, position:"relative",
    }}>
      <Link
        to="/"
        style={{
          position:"absolute",
          top:20,
          left:20,
          fontSize:13,
          color:"var(--accent)",
          textDecoration:"none",
          fontWeight:600,
          zIndex:2,
        }}
      >
        ← Back
      </Link>
      <div style={{ width:"100%", maxWidth:420, position:"relative" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:28, color:"var(--text-primary)", letterSpacing:"-0.02em" }}>
              Rozgaaar
            </div>
          </Link>
          <h2 style={{ fontSize:22, marginTop:20, marginBottom:8 }}>{title}</h2>
          <p style={{ color:"var(--text-secondary)", fontSize:14 }}>{subtitle}</p>
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
export function Login() {
  const [form, setForm] = useState({ email:"", password:"", remember:false });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}! ⚡`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Welcome Back" subtitle="Enter your credentials to access your dashboard.">
      <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <div className="input-icon-wrap">
            <span className="input-icon" style={{ fontSize:14 }}>✉️</span>
            <input className="input" type="email" placeholder="name@rozgaaar.app"
              value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
        </div>
        <div className="input-group">
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <label className="input-label">Password</label>
            <Link to="/forgot-password" style={{ fontSize:11, color:"var(--accent)", textDecoration:"none" }}>Forgot password?</Link>
          </div>
          <input className="input" type="password" placeholder="••••••••"
            value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"var(--text-secondary)" }}>
          <input type="checkbox" checked={form.remember} onChange={e=>setForm({...form,remember:e.target.checked})}
            style={{ accentColor:"var(--accent)" }} />
          Remember me for 30 days
        </label>
        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div style={{ marginTop:20, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ flex:1, height:1, background:"var(--border)" }} />
        <span style={{ fontSize:12, color:"var(--text-muted)" }}>Or continue with</span>
        <div style={{ flex:1, height:1, background:"var(--border)" }} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:16 }}>
        {["Facebook","Google"].map(p => (
          <button key={p} className="btn btn-secondary btn-sm">{p}</button>
        ))}
      </div>
      <p style={{ textAlign:"center", fontSize:13, color:"var(--text-muted)", marginTop:20 }}>
        New to Rozgaaar?{" "}
        <Link to="/register" style={{ color:"var(--accent)", fontWeight:600, textDecoration:"none" }}>Create an account</Link>
      </p>
    </AuthCard>
  );
}

// ── Register Page ─────────────────────────────────────────────────────────────
export function Register() {
  const [searchParams] = useSearchParams();
  const initRole = searchParams.get("role") || "worker";
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", role:initRole, businessName:"", city:"" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!agreed) { toast.error("Please agree to Terms of Service"); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to Rozgaaar, ${user.name.split(" ")[0]}! ⚡`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Create Account" subtitle="Join the fastest growing local gig community.">
      {/* Role toggle */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
        {[{ v:"worker", l:"👷 Worker" }, { v:"business", l:"🏪 Business" }].map(r => (
          <button key={r.v} type="button"
            className={`btn btn-sm ${form.role===r.v ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setForm({...form,role:r.v})}>
            {r.l}
          </button>
        ))}
      </div>

      <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div className="input-group">
          <label className="input-label">Full Name</label>
          <input className="input" placeholder="Alex Morgan" value={form.name} onChange={upd("name")} required />
        </div>
        {form.role === "business" && (
          <div className="input-group">
            <label className="input-label">Business Name</label>
            <input className="input" placeholder="Brew & Grind Café" value={form.businessName} onChange={upd("businessName")} />
          </div>
        )}
        <div className="input-group">
          <label className="input-label">City</label>
          <div className="input-icon-wrap">
            <span className="input-icon" style={{ fontSize:13 }}>📍</span>
            <input className="input" placeholder="New Delhi" value={form.city} onChange={upd("city")} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <div className="input-icon-wrap">
            <span className="input-icon" style={{ fontSize:13 }}>✉️</span>
            <input className="input" type="email" placeholder="alex@example.com" value={form.email} onChange={upd("email")} required />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Phone Number</label>
          <div className="input-icon-wrap">
            <span className="input-icon" style={{ fontSize:13 }}>📱</span>
            <input className="input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={upd("phone")} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={upd("password")} required minLength={8} />
        </div>
        <label style={{ display:"flex", alignItems:"flex-start", gap:8, cursor:"pointer", fontSize:13, color:"var(--text-secondary)" }}>
          <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}
            style={{ marginTop:2, accentColor:"var(--accent)" }} />
          I agree to the <Link to="/terms" style={{ color:"var(--accent)", textDecoration:"none" }}>Terms of Service</Link> and <Link to="/privacy" style={{ color:"var(--accent)", textDecoration:"none" }}>Privacy Policy</Link>
        </label>
        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <div style={{ marginTop:20, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ flex:1, height:1, background:"var(--border)" }} />
        <span style={{ fontSize:12, color:"var(--text-muted)" }}>Or continue with</span>
        <div style={{ flex:1, height:1, background:"var(--border)" }} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:16 }}>
        {["Google","Facebook"].map(p => (
          <button key={p} className="btn btn-secondary btn-sm">{p}</button>
        ))}
      </div>
      <p style={{ textAlign:"center", fontSize:13, color:"var(--text-muted)", marginTop:20 }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color:"var(--accent)", fontWeight:600, textDecoration:"none" }}>Log in</Link>
      </p>

      {/* Side info */}
      <div style={{ marginTop:24, borderTop:"1px solid var(--border)", paddingTop:20 }}>
        <div style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:8 }}>Work on your own terms</div>
        <div style={{ fontSize:12, color:"var(--text-muted)" }}>
          Connect with local businesses and neighbors who need your skills. Immediate payment, flexible hours.
        </div>
      </div>
    </AuthCard>
  );
}
