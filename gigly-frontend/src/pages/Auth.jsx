import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";
import { useGoogleLogin } from "@react-oauth/google";

// ── Shared auth card wrapper ──────────────────────────────────────────────────
function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg-base)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"clamp(16px, 4vw, 24px)", position:"relative", overflow: "hidden"
    }}>
      {/* Background Watermark */}
      <div style={{ 
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", 
        fontSize: "clamp(120px, 25vw, 400px)", fontWeight: 900, color: "rgba(0,0,0,0.015)", 
        pointerEvents: "none", zIndex: 0, whiteSpace: "nowrap", fontFamily: "var(--font-display)" 
      }}>
        ROZGAAAR
      </div>

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
          <Link to="/" style={{ textDecoration:"none" }}>
            <div style={{ 
              fontFamily:"var(--font-display)", fontWeight:800, fontSize:32, 
              color:"var(--text-primary)", letterSpacing:"-0.04em", textTransform: "uppercase" 
            }}>
              Rozgaaar<span style={{ color: "var(--accent)" }}>.</span>
            </div>
          </Link>
          <h2 style={{ 
            fontSize:38, marginTop:24, marginBottom:12, 
            fontFamily: "var(--font-display)", letterSpacing: "-0.02em",
            textTransform: "uppercase"
          }}>{title}</h2>
          <p style={{ 
            color:"var(--text-secondary)", fontSize:16, 
            fontFamily: "var(--font-editorial)", fontStyle: "italic" 
          }}>{subtitle}</p>
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

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const user = await googleLogin(tokenResponse.access_token, "worker"); // defaulting to worker on login
      toast.success(`Welcome back, ${user.name.split(" ")[0]}! ⚡`);
      navigate("/dashboard");
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
      toast.success(`Welcome back, ${user.name.split(" ")[0]}! ⚡`);
      navigate("/dashboard");
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
      toast.error(err.response?.data?.message || "Invalid OTP or request expired");
    } finally { setLoading(false); }
  };

  if (forgotMode === "email") {
    return (
      <AuthCard title="Reset Password" subtitle="Enter your email to receive an OTP.">
        <form onSubmit={handleForgotRequest} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input className="input" type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
          <button className="btn btn-ghost btn-sm btn-full" type="button" onClick={() => setForgotMode(false)}>Cancel</button>
        </form>
      </AuthCard>
    );
  }

  if (forgotMode === "otp") {
    return (
      <AuthCard title="Enter OTP" subtitle="Enter the 6-digit OTP sent to your email.">
        <form onSubmit={handleForgotReset} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="input-group">
            <label className="input-label">OTP</label>
            <input className="input" type="text" value={resetOTP} onChange={e=>setResetOTP(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <div className="input-icon-wrap" style={{ position: "relative" }}>
              <input className="input" type={showPassword ? "text" : "password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required minLength={8} />
              <span onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16 }}>
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </span>
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <button className="btn btn-ghost btn-sm btn-full" type="button" onClick={() => setForgotMode(false)}>Cancel</button>
        </form>
      </AuthCard>
    );
  }

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
            <span onClick={() => setForgotMode("email")} style={{ fontSize:11, color:"var(--accent)", cursor:"pointer" }}>Forgot password?</span>
          </div>
          <div className="input-icon-wrap" style={{ position: "relative" }}>
            <input className="input" type={showPassword ? "text" : "password"} placeholder="••••••••"
              value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
            <span onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16 }}>
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </span>
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
  const [showPassword, setShowPassword] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);
  const [otp, setOtp] = useState("");
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      await googleLogin(tokenResponse.access_token, form.role);
      toast.success("Logged in with Google! ⚡");
      navigate("/dashboard");
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
      toast.success("Email verified! Welcome to Rozgaaar ⚡");
      navigate("/dashboard");
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
          <div className="input-icon-wrap" style={{ position: "relative" }}>
            <input className="input" type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={form.password} onChange={upd("password")} required minLength={8} />
            <span onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16 }}>
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </span>
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
