import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RozgaaarFullLogo from "../components/RozgaaarLogo";
import toast from "react-hot-toast";

/* ── Inline SVG Icons (No Emojis) ────────────────────────── */
const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LocationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHireTalentClick = (e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (!user) {
      navigate("/register?role=business&reason=business_required");
    } else if (user.role === "worker") {
      navigate("/register?role=business&reason=business_required");
    } else {
      navigate("/post-gig");
    }
  };

  const heroBgUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBI1StzMoJg_IjKZ9z6UTcgVZPz3SvwpoKW6MMCcpVtof5mWoMrAhiJRy7xg0XFfsqcDSuH_Zi8fBSw1hWNkK7J7MBXKE3GVJpOrHb23FSmjGaWy_dj_lUsme8IDH4odMYVKINMAoVFDcv5lOV9rDjiJlrAM48ADwAosM2px5aOSMNjLXqiwqUasl9D4X-ES82ZJ58RM84Ijdj3zTylbSOgWhmQYdAV6B8wDxglnENVuTgXPV1wexwi2SmPr54bHl-RfcrtVyHslqfU";

  return (
    <div style={{ fontFamily: "'Inter', 'DM Sans', -apple-system, sans-serif", color: "#0f172a", backgroundColor: "#ffffff", overflowX: "hidden" }}>

      {/* ── 1. NAVBAR ───────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          padding: "16px 24px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <RozgaaarFullLogo height={40} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <Link to="/find-work" style={{ textDecoration: "none", color: "#334155", fontWeight: "600", fontSize: "14px", transition: "color 0.2s" }}>
              Find Work
            </Link>
            <a href="/post-gig" onClick={handleHireTalentClick} style={{ textDecoration: "none", color: "#334155", fontWeight: "600", fontSize: "14px", transition: "color 0.2s" }}>
              Hire Talent
            </a>
            <a href="#how-it-works" style={{ textDecoration: "none", color: "#334155", fontWeight: "600", fontSize: "14px", transition: "color 0.2s" }}>
              How it Works
            </a>
            <a href="#why-rozgaaar" style={{ textDecoration: "none", color: "#334155", fontWeight: "600", fontSize: "14px", transition: "color 0.2s" }}>
              Categories
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  backgroundColor: "#0b1e36",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                    color: "#0f172a",
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "8px 16px",
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    textDecoration: "none",
                    backgroundColor: "#0b1e36",
                    color: "#ffffff",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    transition: "background-color 0.2s",
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: "20px 0",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginTop: "12px",
            }}
          >
            <Link to="/find-work" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>
              Find Work
            </Link>
            <a href="/post-gig" onClick={handleHireTalentClick} style={{ textDecoration: "none", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>
              Hire Talent
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>
              How it Works
            </a>
            <a href="#why-rozgaaar" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>
              Categories
            </a>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none", color: "#0f172a", fontWeight: "600", textAlign: "center", padding: "10px" }}>
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  textDecoration: "none",
                  backgroundColor: "#0b1e36",
                  color: "#ffffff",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. HERO SECTION ───────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          backgroundImage: `url("${heroBgUrl}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "repeat",
          padding: "160px 24px 220px 24px",
          minHeight: "75vh",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Light Overlay Mask to ensure strong text legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(2px)",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "860px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: "900",
              color: "#0b1e36",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: "24px",
            }}
          >
            Find reliable local staff and helpers for your business.
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              color: "#475569",
              lineHeight: 1.6,
              maxWidth: "680px",
              margin: "0 auto 36px auto",
              fontWeight: "400",
            }}
          >
            Get part-time and full-time support from verified workers in your neighborhood. The premier marketplace connecting businesses with reliable local staff. Fast, secure, and efficient.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={handleHireTalentClick}
              style={{
                backgroundColor: "#152e4d",
                color: "#ffffff",
                padding: "14px 32px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "15px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 14px rgba(21, 46, 77, 0.25)",
                transition: "all 0.2s ease",
              }}
            >
              Hire Talent <ArrowRightIcon />
            </button>

            <button
              onClick={() => navigate("/find-work")}
              style={{
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "14px 32px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "15px",
                border: "1px solid #cbd5e1",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                transition: "all 0.2s ease",
              }}
            >
              Find Work
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. WHY ROZGAAAR ───────────────────────────────────── */}
      <section id="why-rozgaaar" style={{ padding: "100px 24px", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "800", color: "#0b1e36", marginBottom: "12px" }}>
              Why Rozgaaar
            </h2>
            <p style={{ fontSize: "16px", color: "#64748b" }}>
              Built for reliability, speed, and trust.
            </p>
          </div>

          <div className="grid-3-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>

            {/* Card 1 */}
            <div className="why-card">
              <div className="why-icon-box">
                <StoreIcon />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                Local Staffing
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
                Hire cleaners, retail staff, delivery drivers, and more from a pool of vetted local professionals ready to support your business.
              </p>
            </div>

            {/* Card 2 */}
            <div className="why-card">
              <div className="why-icon-box">
                <CalendarIcon />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                Flexible Hiring
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
                Choose between part-time shifts or full-time roles. Our platform adapts to your business needs with transparent, escrow-protected payments.
              </p>
            </div>

            {/* Card 3 */}
            <div className="why-card">
              <div className="why-icon-box">
                <LocationIcon />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                Local Reach
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
                Connect with workers in your exact zip code. Our intelligent matching ensures your help is just around the corner, reducing commute times and delays.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. FEATURE SHOWCASE (USER PROVIDED IMAGES INTEGRATION) ────────────── */}
      <section style={{ padding: "80px 24px", backgroundColor: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: "800", color: "#0b1e36", marginBottom: "10px" }}>
              Empower Your Business With Local Talent
            </h2>
            <p style={{ fontSize: "15px", color: "#64748b" }}>
              Connecting local merchants, retail stores, and services with verified neighborhood workers.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "stretch" }}>

            {/* Feature Image 1: Local Market */}
            <div className="feature-card">
              <div className="feature-img-box" style={{ backgroundColor: "#fff7ed" }}>
                <img
                  src="/images/local-market.png"
                  alt="Local Market Illustration"
                />
              </div>
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <CheckCircleIcon />
                  <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#16a34a" }}>Local Merchants</span>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                  Support for Storefronts & Markets
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.5 }}>
                  Easily hire part-time store helpers, cashiers, stockers, and neighborhood delivery runners during peak demand hours.
                </p>
              </div>
            </div>

            {/* Feature Image 2: Team Cheering */}
            <div className="feature-card">
              <div className="feature-img-box" style={{ backgroundColor: "#f0fdf4" }}>
                <img
                  src="/images/team-cheering.png"
                  alt="Team Cheering Illustration"
                />
              </div>
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <CheckCircleIcon />
                  <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#16a34a" }}>Verified Staff</span>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                  Reliable & Motivated Workforce
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.5 }}>
                  Join thousands of happy teams who rely on Rozgaaar for fast hiring, instant payouts, and clear ratings.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "100px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "800", color: "#0b1e36", marginBottom: "12px" }}>
              How it Works
            </h2>
            <p style={{ fontSize: "16px", color: "#64748b" }}>
              Simple steps to get your work done efficiently.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>

            {/* Step 1 */}
            <div className="step-card">
              <div className="step-badge">
                1
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                Post a Job
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
                Describe your needs and budget in minutes. Our platform makes it easy to specify exactly what you're looking for.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-badge">
                2
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                Review Matches
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
                Get instant proposals from vetted local talent. Compare profiles, ratings, and previous work history.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-badge">
                3
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                Hire & Manage
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
                Approve work and pay securely through our platform. Manage schedules and communication all in one place.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 6. FOOTER ─────────────────────────────────────────── */}
      <footer style={{ backgroundColor: "#0b1e36", color: "#ffffff", padding: "80px 24px 32px 24px" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "48px",
              paddingBottom: "60px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Brand Column */}
            <div style={{ gridColumn: "span 1" }}>
              <div style={{ marginBottom: "16px" }}>
                <RozgaaarFullLogo height={48} textColor="#FFFFFF" />
              </div>
              <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.6, maxWidth: "280px" }}>
                The professional marketplace for reliable help and top-tier talent.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>
                Platform
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                <li>
                  <Link to="/find-work" style={{ textDecoration: "none", color: "#94a3b8", fontSize: "14px", transition: "color 0.2s" }}>
                    Find Work
                  </Link>
                </li>
                <li>
                  <a href="/post-gig" onClick={handleHireTalentClick} style={{ textDecoration: "none", color: "#94a3b8", fontSize: "14px", transition: "color 0.2s" }}>
                    Hire Talent
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" style={{ textDecoration: "none", color: "#94a3b8", fontSize: "14px", transition: "color 0.2s" }}>
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>
                Company
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                <li>
                  <a href="#why-rozgaaar" style={{ textDecoration: "none", color: "#94a3b8", fontSize: "14px" }}>
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#why-rozgaaar" style={{ textDecoration: "none", color: "#94a3b8", fontSize: "14px" }}>
                    Press Kit
                  </a>
                </li>
                <li>
                  <a href="#why-rozgaaar" style={{ textDecoration: "none", color: "#94a3b8", fontSize: "14px" }}>
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>
                Legal & Safety
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                <li>
                  <a href="#why-rozgaaar" style={{ textDecoration: "none", color: "#94a3b8", fontSize: "14px" }}>
                    Safety Guide
                  </a>
                </li>
                <li>
                  <a href="#why-rozgaaar" style={{ textDecoration: "none", color: "#94a3b8", fontSize: "14px" }}>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#why-rozgaaar" style={{ textDecoration: "none", color: "#94a3b8", fontSize: "14px" }}>
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright Bottom Bar */}
          <div style={{ paddingTop: "32px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
            <p>© 2024 Rozgaaar. All rights reserved. Professional Marketplace.</p>
          </div>

        </div>
      </footer>

      {/* ── CSS Responsive Helper & Hover Effect Styles ── */}
      <style>{`
        .why-card {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 40px 32px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(11, 30, 54, 0.03);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .why-card:hover {
          transform: translateY(-8px);
          background-color: #ffffff;
          border-color: rgba(37, 99, 235, 0.3);
          box-shadow: 0 20px 40px -10px rgba(11, 30, 54, 0.12), 0 0 0 1px rgba(37, 99, 235, 0.2);
        }

        .why-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background-color: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .why-card:hover .why-icon-box {
          background-color: #2563eb;
          color: #ffffff;
          transform: scale(1.08) rotate(-3deg);
          box-shadow: 0 8px 18px rgba(37, 99, 235, 0.35);
        }

        .feature-card {
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(11, 30, 54, 0.03);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          border-color: rgba(37, 99, 235, 0.3);
          box-shadow: 0 20px 40px -10px rgba(11, 30, 54, 0.12), 0 0 0 1px rgba(37, 99, 235, 0.2);
        }

        .feature-card .feature-img-box {
          height: 260px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-card .feature-img-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .feature-card:hover .feature-img-box img {
          transform: scale(1.06);
        }

        .step-card {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 44px 32px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .step-card:hover {
          transform: translateY(-8px);
          border-color: rgba(220, 38, 38, 0.3);
          box-shadow: 0 20px 40px -10px rgba(220, 38, 38, 0.12), 0 0 0 1px rgba(220, 38, 38, 0.2);
        }

        .step-badge {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background-color: #dc2626;
          color: #ffffff;
          font-size: 20px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .step-card:hover .step-badge {
          transform: scale(1.1) rotate(4deg);
          box-shadow: 0 8px 18px rgba(220, 38, 38, 0.35);
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>

    </div>
  );
}