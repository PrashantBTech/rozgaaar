import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";
import { useGoogleLogin } from "@react-oauth/google";
import RozgaaarFullLogo, { RozgaaarMiniLogo, RozgaaarNameLogo } from "../components/RozgaaarLogo";

/* ── Inline SVG Icons (No Emojis) ────────────────────────── */
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const LocationPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// ── Shared auth card wrapper ──────────────────────────────────────────────────
function AuthCard({ title, subtitle, notice, children }) {
  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg-base)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"clamp(16px, 4vw, 24px)", position:"relative", overflow: "hidden"
    }}>
      <Link
        to="/"
        className="auth-back-link"
        style={{
          position:"absolute", top:30, left:30,
          fontSize:12, color:"var(--text-primary)",
          textDecoration:"none", fontWeight:800, zIndex:2,
          textTransform: "uppercase", letterSpacing: "0.1em",
          display: "flex", alignItems: "center", gap: 8
        }}
      >
        ← Back to network
      </Link>

      <div style={{ width:"100%", maxWidth:480, position:"relative", zIndex: 1 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <Link to="/" style={{ textDecoration:"none", display: "inline-flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
            <RozgaaarMiniLogo size={50} textColor="var(--text-primary)" />
            <RozgaaarNameLogo height={40} textColor="var(--text-primary)" />
          </Link>
          <p style={{ 
            color:"var(--text-secondary)", fontSize:15, marginTop: 16,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500
          }}>{subtitle}</p>

          {notice && (
            <p style={{ 
              color: "#dc2626", 
              fontSize: "13px", 
              fontWeight: "600", 
              marginTop: "10px",
              padding: "6px 14px",
              backgroundColor: "rgba(220, 38, 38, 0.08)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              borderRadius: "8px",
              display: "inline-block",
              lineHeight: "1.4"
            }}>
              {notice}
            </p>
          )}
        </div>
        <div className="card" style={{ padding: "clamp(24px, 8vw, 40px)", border: "1px solid rgba(0,0,0,0.05)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
export function Login() {
  const [form, setForm] = useState({ email:"", password:"", remember:false });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const user = await googleLogin(tokenResponse.access_token, "worker"); // defaulting to worker on login
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(redirectTarget);
    } catch (err) {
      toast.error(err.response?.data?.message || "Google Login failed");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Google Login Failed"),
  });

  const [forgotMode, setForgotMode] = useState(false); // false | 'email' | 'otp'
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOTP, setResetOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(redirectTarget);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail);
      toast.success("OTP sent to your email!");
      setForgotMode("otp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword(resetOTP, newPassword);
      toast.success("Password reset successfully! You can now login.");
      setForgotMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally { setLoading(false); }
  };

  if (forgotMode === "email") {
    return (
      <AuthCard title="Reset Password" subtitle="Enter your registered email address to receive an OTP.">
        <form onSubmit={handleForgotRequest} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="input-group">
            <label className="input-label">Email address</label>
            <input className="input" type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
          <button className="btn btn-ghost btn-sm btn-full" type="button" onClick={() => setForgotMode(false)}>Back to Sign In</button>
        </form>
      </AuthCard>
    );
  }

  if (forgotMode === "otp") {
    return (
      <AuthCard title="Set New Password" subtitle="Enter the OTP sent to your email and your new password.">
        <form onSubmit={handleForgotReset} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="input-group">
            <label className="input-label">OTP</label>
            <input className="input" type="text" value={resetOTP} onChange={e=>setResetOTP(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <input className="input" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <button className="btn btn-ghost btn-sm btn-full" type="button" onClick={() => setForgotMode(false)}>Back to Sign In</button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to manage your gigs, earnings, and applications.">
      <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div className="input-group">
          <label className="input-label">Email address</label>
          <input className="input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
        </div>
        <div className="input-group">
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <label className="input-label">Password</label>
            <span onClick={() => setForgotMode("email")} style={{ fontSize:11, color:"var(--accent)", cursor:"pointer" }}>Forgot password?</span>
          </div>
          <div className="input-icon-wrap" style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input className="input" type={showPassword ? "text" : "password"} placeholder="••••••••"
              value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required style={{ paddingRight: "40px" }} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
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
      <div style={{ marginTop:16 }}>
        <button className="btn btn-secondary btn-sm btn-full" onClick={() => loginWithGoogle()} type="button" disabled={loading}>Google</button>
      </div>
      <p style={{ textAlign:"center", fontSize:13, color:"var(--text-muted)", marginTop:20 }}>
        New to Rozgaaar?{" "}
        <Link to={`/register${redirectTarget !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`} style={{ color:"var(--accent)", fontWeight:600, textDecoration:"none" }}>Create an account</Link>
      </p>
    </AuthCard>
  );
}

// ── Register Page ─────────────────────────────────────────────────────────────
export function Register() {
  const [searchParams] = useSearchParams();
  const initRole = searchParams.get("role") || "worker";
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const reasonParam = searchParams.get("reason");
  const [noticeMsg, setNoticeMsg] = useState(
    reasonParam === "business_required"
      ? "Only business accounts can hire talent. Please create a business account."
      : null
  );

  useEffect(() => {
    if (noticeMsg) {
      const timer = setTimeout(() => {
        setNoticeMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [noticeMsg]);

  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", role:initRole, businessName:"", city:"" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);
  const [otp, setOtp] = useState("");
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      await googleLogin(tokenResponse.access_token, form.role);
      toast.success("Logged in with Google!");
      navigate(redirectTarget);
    } catch (err) {
      toast.error(err.response?.data?.message || "Google Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signupWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Google Signup Failed"),
  });

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!agreed) { toast.error("Please agree to Terms of Service"); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! OTP sent to your email.");
      setVerifyMode(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyEmail(otp);
      toast.success("Email verified! Welcome to Rozgaaar");
      navigate(redirectTarget);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally { setLoading(false); }
  };

  if (verifyMode) {
    return (
      <AuthCard title="Verify Email" subtitle="Enter the 6-digit OTP sent to your email.">
        <form onSubmit={handleVerify} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="input-group">
            <label className="input-label">OTP</label>
            <input className="input" type="text" value={otp} onChange={e=>setOtp(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
          <button className="btn btn-ghost btn-sm btn-full" type="button" onClick={() => navigate("/dashboard")}>Skip for now</button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create Account" subtitle="Join the fastest growing local gig community." notice={noticeMsg}>
      {/* Role toggle */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
        {[{ v:"worker", l:"Worker" }, { v:"business", l:"Business" }].map(r => (
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
          <div className="input-icon-wrap" style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span className="input-icon" style={{ position: "absolute", left: 12, display: "flex", alignItems: "center" }}><LocationPinIcon /></span>
            <input className="input" placeholder="New Delhi" value={form.city} onChange={upd("city")} style={{ paddingLeft: "36px" }} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <div className="input-icon-wrap" style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span className="input-icon" style={{ position: "absolute", left: 12, display: "flex", alignItems: "center" }}><MailIcon /></span>
            <input className="input" type="email" placeholder="alex@example.com" value={form.email} onChange={upd("email")} required style={{ paddingLeft: "36px" }} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Phone Number</label>
          <div className="input-icon-wrap" style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span className="input-icon" style={{ position: "absolute", left: 12, display: "flex", alignItems: "center" }}><PhoneIcon /></span>
            <input className="input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={upd("phone")} style={{ paddingLeft: "36px" }} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <div className="input-icon-wrap" style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input className="input" type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={form.password} onChange={upd("password")} required minLength={8} style={{ paddingRight: "40px" }} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
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
      <div style={{ marginTop:16 }}>
        <button className="btn btn-secondary btn-sm btn-full" onClick={() => signupWithGoogle()} type="button" disabled={loading}>Google</button>
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
