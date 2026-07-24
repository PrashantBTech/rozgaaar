import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RozgaaarLogo, { RozgaaarMiniLogo, RozgaaarNameLogo } from "../components/RozgaaarLogo";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ── Data ──────────────────────────────────────────────── */
const STATS = [
  { value: "50K+", label: "Workers Registered" },
  { value: "120K+", label: "Gigs Completed" },
  { value: "< 5m", label: "Avg. Response Time" },
  { value: "4.9★", label: "App Store Rating" },
];

const STEPS = [
  { num: "01", title: "Post a Gig", desc: "Describe the task, set your price, and post it to the local feed. Takes less than 2 minutes." },
  { num: "02", title: "Apply Instantly", desc: "Workers browse nearby gigs and apply with one tap. No lengthy cover letters required." },
  { num: "03", title: "Get It Done", desc: "Work gets completed, secure payment releases automatically, and everyone leaves a review." },
];

const CATEGORIES = ["Delivery", "Cleaning", "Moving", "Pet Care", "Cafe Staff", "Event Crew", "Warehouse", "Data Entry", "Photography", "Security"];

const TRUST = [
  { num: "1.", title: "ID Verification", desc: "Government ID checks for all users on the platform." },
  { num: "2.", title: "Secure Escrow", desc: "Money is held safely until the job is verified complete." },
  { num: "3.", title: "AI Spam Guard", desc: "AI detection prevents fake listings and bad actors." },
  { num: "4.", title: "Real Reviews", desc: "Reviews only from verified, completed gigs. Always." },
];

const FAQS = [
  { q: "How fast do I receive payout?", a: "Funds are released from secure escrow the moment the business verifies gig completion. Transfers usually take < 24 hours." },
  { q: "Is a formal resume required?", a: "No. Rozgaaar operates on skill-tags, verified reviews, and a centralized identity check. No cover letters needed." },
  { q: "What happens on a no-show?", a: "Workers who drop a shift without notice face trust-score penalties, and businesses receive instant re-routing options." },
];

/* ── Marquee Component ──────────────────────────────────── */
function Marquee({ items, speed = 30, reverse = false }) {
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", borderTop: "1px solid rgba(26,26,26,0.12)", borderBottom: "1px solid rgba(26,26,26,0.12)", padding: "18px 0" }}>
      <div style={{
        display: "inline-flex", gap: 0,
        animation: `marquee${reverse ? "Rev" : ""} ${speed}s linear infinite`,
      }}>
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(13px, 1.4vw, 16px)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(26,26,26,0.4)",
            padding: "0 32px",
          }}>
            {item} <span style={{ color: "#D4A853", marginLeft: 4 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const navRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* redirect if logged in */
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  /* ── Navbar Scroll ── */
  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── GSAP Animations ── */
  useEffect(() => {
    let ctx = gsap.context(() => {

      /* Hero text clip reveal */
      gsap.fromTo(".hero-line", {
        clipPath: "inset(0 0 100% 0)",
        y: 40,
      }, {
        clipPath: "inset(0 0 0% 0)",
        y: 0,
        duration: 1.1,
        stagger: 0.18,
        ease: "power3.out",
        delay: 0.3,
      });

      gsap.fromTo(".hero-sub", {
        opacity: 0,
        y: 20,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay: 0.9,
        ease: "power2.out",
      });

      gsap.fromTo(".hero-cta", {
        opacity: 0,
        scale: 0.92,
      }, {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        delay: 1.1,
        ease: "back.out(1.5)",
      });

      /* Stats reveal */
      gsap.from(".stat-item", {
        scrollTrigger: { trigger: ".stats-row", start: "top 82%" },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });

      /* Steps clip reveal */
      gsap.from(".step-block", {
        scrollTrigger: { trigger: ".steps-section", start: "top 78%" },
        clipPath: "inset(0 0 100% 0)",
        y: 30,
        duration: 0.9,
        stagger: 0.2,
        ease: "power3.out",
      });

      /* Trust items */
      gsap.from(".trust-row", {
        scrollTrigger: { trigger: ".trust-section", start: "top 80%" },
        x: -40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
      });

      /* FAQ */
      gsap.from(".faq-row", {
        scrollTrigger: { trigger: ".faq-section", start: "top 80%" },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });

      /* Section headings */
      gsap.utils.toArray(".section-heading").forEach(el => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 85%" },
          clipPath: "inset(0 0 100% 0)",
          y: 20,
          duration: 0.9,
          ease: "power3.out",
        });
      });

      /* Parallax hero bg text */
      gsap.to(".hero-bg-text", {
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: -120,
        opacity: 0.02,
      });

    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} style={{ background: "#F8FAFC", minHeight: "100vh", color: "#0F172A", overflow: "hidden", position: "relative" }}>

      {/* ── Keyframes injection ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Playfair+Display:ital,wght@1,400;1,700&display=swap');

        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marqueeRev { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        @keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .pill-nav {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: clamp(16px, 2.5vw, 32px);
          background: #103461;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 100px;
          padding: 10px 24px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 12px 40px rgba(16,52,97,0.3);
          width: max-content;
          max-width: calc(100vw - 32px);
        }
        .pill-nav.scrolled {
          background: rgba(16,52,97,0.96);
          backdrop-filter: blur(20px);
          box-shadow: 0 16px 48px rgba(16,52,97,0.4);
          padding: 8px 20px;
        }

        .nav-logo-img {
          height: 38px !important;
          max-height: 38px !important;
          transition: all 0.3s ease;
        }

        .nav-links-group {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-link {
          color: rgba(255,255,255,0.85);
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
          padding: 4px 10px;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
        }
        .nav-link:hover { color: #ffffff; }

        .nav-link-login {
          color: rgba(255,255,255,0.85) !important;
          font-weight: 600 !important;
        }
        .nav-link-login:hover {
          color: #ffffff !important;
        }

        .btn-pill-white {
          background: #ffffff;
          color: #103461;
          border: none;
          padding: 8px 20px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 0.01em;
        }
        .btn-pill-white:hover {
          background: #006e37;
          color: #ffffff;
          transform: translateY(-1px);
        }

        .btn-pill-dark {
          background: #103461;
          color: #ffffff;
          border: none;
          padding: 16px 36px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          letter-spacing: 0.01em;
        }
        .btn-pill-dark:hover {
          background: #006e37;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,110,55,0.3);
        }

        .btn-pill-dark-sm {
          background: #103461;
          color: #ffffff;
          border: none;
          padding: 12px 28px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.25s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-pill-dark-sm:hover {
          background: #006e37;
          color: #ffffff;
        }

        .btn-outline {
          background: transparent;
          color: #103461;
          border: 1.5px solid #103461;
          padding: 15px 32px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s;
        }
        .btn-outline:hover {
          background: #103461;
          color: #ffffff;
        }

        .hero-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 160px 6vw 80px;
          position: relative;
          overflow: hidden;
        }

        .serif-italic {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 400;
        }

        .hero-bg-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(160px, 22vw, 340px);
          color: rgba(16,52,97,0.04);
          white-space: nowrap;
          user-select: none;
          pointer-events: none;
          letter-spacing: -0.05em;
          z-index: 0;
        }

        .hero-line {
          display: block;
          overflow: hidden;
        }

        .step-num {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 13px;
          color: rgba(16,52,97,0.5);
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }

        .divider-line {
          height: 1px;
          background: rgba(16,52,97,0.1);
          width: 100%;
        }

        .live-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #006e37;
          display: inline-block;
          animation: blink 2s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(0,110,55,0.6);
        }

        .tag-pill {
          display: inline-flex;
          align-items: center;
          padding: 7px 18px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          border: 1.5px solid rgba(16,52,97,0.2);
          color: rgba(16,52,97,0.8);
          background: rgba(16,52,97,0.04);
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          cursor: pointer;
          letter-spacing: 0.01em;
        }
        .tag-pill:hover {
          background: #103461;
          color: #ffffff;
          border-color: #103461;
        }

        .gig-card-preview {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(16,52,97,0.1);
          padding: 24px;
          transition: transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 4px 20px rgba(16,52,97,0.06);
        }
        .gig-card-preview:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(16,52,97,0.14);
          border-color: rgba(16,52,97,0.2);
        }

        .faq-item-row {
          padding: 28px 0;
          border-bottom: 1px solid rgba(16,52,97,0.1);
          cursor: pointer;
        }
        .faq-item-row:first-child {
          border-top: 1px solid rgba(16,52,97,0.1);
        }

        .rotate-circle {
          animation: rotateSlow 20s linear infinite;
        }

        @media (max-width: 768px) {
          .pill-nav {
            width: calc(100vw - 32px) !important;
            max-width: 480px !important;
            padding: 8px 20px !important;
            justify-content: space-between !important;
            top: 16px !important;
          }
          .nav-logo-img {
            height: 28px !important;
            max-height: 28px !important;
          }
          .nav-links-group { display: none !important; }
          .btn-pill-white {
            padding: 7px 16px !important;
            font-size: 12px !important;
          }
          .nav-link-login {
            font-size: 12px !important;
            padding: 4px 8px !important;
          }
          .hero-section { padding: 140px 24px 60px !important; }
          .hero-bg-text { display: none; }
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>



      {/* ── Floating Pill Navbar ── */}
      <nav ref={navRef} className={`pill-nav${navScrolled ? " scrolled" : ""}`}>
        {/* Logo */}
        <RozgaaarLogo height={38} textColor="#FFFFFF" className="nav-logo-img" style={{ cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />

        {/* Nav links */}
        <div className="nav-links-group">
          {[
            { label: "About",           id: "about-section" },
            { label: "How It Works",    id: "how-it-works-section" },
            { label: "Trust & Safety",  id: "trust-section" },
          ].map(({ label, id }) => (
            <span key={label} className="nav-link"
              onClick={() => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >{label}</span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: "clamp(4px, 1.5vw, 8px)", alignItems: "center", flexShrink: 0 }}>
          <span className="nav-link nav-link-login" onClick={() => navigate("/login")}>Log in</span>
          <button className="btn-pill-white" onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        {/* Large background watermark */}
        <div className="hero-bg-text">ROZGAAAR</div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", width: "100%" }}>

          {/* Top label */}
          <div className="hero-sub" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <span style={{ width: 32, height: 1.5, background: "#103461", display: "inline-block" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#475569" }}>
              ⚡ Hyper-local Hiring Platform · India
            </span>
          </div>

          {/* Hero Typography */}
          <div style={{ lineHeight: 1.0, marginBottom: 48 }}>
            <div className="hero-line">
              <span className="resp-h1" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, textTransform: "uppercase", color: "#0F172A" }}>
                FIND
              </span>
            </div>
            <div className="hero-line" style={{ display: "flex", alignItems: "baseline", gap: "0.3em", flexWrap: "wrap" }}>
              <span className="resp-h1" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, textTransform: "uppercase", color: "#0F172A" }}>
                WORK
              </span>
              <span className="serif-italic" style={{ fontSize: "clamp(32px, 7vw, 90px)", color: "rgba(15,23,42,0.45)", lineHeight: 1.1 }}>
                and
              </span>
            </div>
            <div className="hero-line">
              <span className="serif-italic" style={{ fontSize: "clamp(40px, 8.5vw, 110px)", color: "#103461" }}>
                hire seamlessly
              </span>
            </div>
            <div className="hero-line">
              <span className="resp-h1" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, textTransform: "uppercase", color: "#0F172A" }}>
                INSTANTLY.
              </span>
            </div>
          </div>

          {/* Sub + CTA row */}
          <div className="hero-cta" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(15px, 1.5vw, 18px)", color: "#475569", maxWidth: 420, lineHeight: 1.7, margin: 0 }}>
              The hyper-local marketplace connecting businesses with on-demand workers in your neighborhood — no friction, no delays.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn-pill-dark" onClick={() => navigate("/find-work")}>
                Find Work →
              </button>
              <button className="btn-outline" onClick={() => navigate("/register?role=business")}>
                Post a Gig
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee 1 — Categories ── */}
      <Marquee items={CATEGORIES} speed={35} />

      {/* ── Stats Row ── */}
      <section className="stats-row" style={{ padding: "clamp(40px, 8vw, 100px) 6vw", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "clamp(20px, 4vw, 40px)" }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(40px, 5vw, 64px)", letterSpacing: "-0.03em", color: "#103461", lineHeight: 1 }}>
                {s.value}
              </div>
              <div className="divider-line" style={{ margin: "16px 0 12px" }} />
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about-section" style={{ background: "#103461", padding: "clamp(60px, 10vw, 100px) 6vw", scrollMarginTop: "90px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Scrolling "ABOUT" label */}
          <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "14px 0", marginBottom: 80 }}>
            <div style={{ display: "inline-flex", animation: "marquee 25s linear infinite" }}>
              {["ABOUT", "ABOUT", "ABOUT", "ABOUT", "ABOUT", "ABOUT", "ABOUT", "ABOUT"].map((t, i) => (
                <span key={i} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)", padding: "0 40px" }}>{t}</span>
              ))}
            </div>
          </div>

          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div className="section-heading" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 4.5vw, 58px)", color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 32 }}>
                India's fastest<br />
                <span className="serif-italic" style={{ color: "#006e37" }}>gig network.</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: 40 }}>
                Rozgaaar is a playground dedicated to flexible work — a vibrant community of workers and businesses across India's cities. From restaurants to retail chains, event organizers to individual households.
              </p>
              <button className="btn-pill-white" style={{ padding: "14px 32px", fontSize: 14 }} onClick={() => navigate("/register")}>
                Join the network →
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { emoji: "🍕", label: "Food & Cafes", count: "12K+ gigs" },
                { emoji: "📦", label: "Delivery", count: "8K+ gigs" },
                { emoji: "🎪", label: "Events", count: "5K+ gigs" },
                { emoji: "🏠", label: "Home Services", count: "15K+ gigs" },
              ].map((c, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  padding: 24,
                  transition: "all 0.3s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,110,55,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{c.emoji}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "#FFFFFF", marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: "#006e37", fontWeight: 700 }}>{c.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee 2 ── */}
      <div style={{ overflow: "hidden", whiteSpace: "nowrap", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0", padding: "18px 0", background: "#F1F5F9" }}>
        <div style={{ display: "inline-flex", gap: 0, animation: "marqueeRev 40s linear infinite" }}>
          {["INSTANT HIRING", "SECURE PAYMENTS", "VERIFIED WORKERS", "REAL REVIEWS", "AI MATCHING", "NO RESUMES NEEDED", "HYPERLOCAL"].flatMap((t, i) => [
            <span key={`a${i}`} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.2em", color: "#475569", padding: "0 32px" }}>{t}</span>,
            <span key={`b${i}`} style={{ color: "#006e37", padding: "0 4px" }}>✦</span>
          ])}
        </div>
      </div>

      {/* ── How It Works ── */}
      <section id="how-it-works-section" className="steps-section" style={{ padding: "clamp(60px, 10vw, 100px) 6vw", scrollMarginTop: "90px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Section label */}
          <div style={{ overflow: "hidden", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0", padding: "14px 0", marginBottom: 80 }}>
            <div style={{ display: "inline-flex", animation: "marquee 30s linear infinite" }}>
              {["HOW IT WORKS", "HOW IT WORKS", "HOW IT WORKS", "HOW IT WORKS", "HOW IT WORKS", "HOW IT WORKS"].map((t, i) => (
                <span key={i} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.25em", color: "#94A3B8", padding: "0 40px" }}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 60 }}>
            <div className="section-heading" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 4.5vw, 60px)", letterSpacing: "-0.03em", lineHeight: 1, color: "#0F172A" }}>
              Synchronize in <span className="serif-italic" style={{ color: "#103461" }}>3 steps.</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={i} className="step-block" style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr auto",
                alignItems: "center",
                gap: 40,
                padding: "48px 0",
                borderBottom: "1px solid #E2E8F0",
              }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, color: "#94A3B8", letterSpacing: "0.1em" }}>{s.num}</div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 2.5vw, 30px)", color: "#0F172A", marginBottom: 12, letterSpacing: "-0.02em" }}>
                    {s.title}
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#475569", lineHeight: 1.7, margin: 0, maxWidth: 480 }}>{s.desc}</p>
                </div>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  border: "1.5px solid #E2E8F0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#103461",
                  background: "#F8FAFC",
                  flexShrink: 0,
                }}>
                  {i === 0 ? "📝" : i === 1 ? "⚡" : "✅"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Gig Cards ── */}
      <section style={{ background: "#F1F5F9", padding: "clamp(60px, 10vw, 100px) 6vw" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
            <div className="section-heading" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.03em", lineHeight: 1, color: "#0F172A" }}>
              Live Gigs Near <span className="serif-italic" style={{ color: "#103461" }}>You.</span>
            </div>
            <button className="btn-pill-dark-sm" onClick={() => navigate("/find-work")}>Browse all gigs →</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {[
              { title: "Lighting Installation", pay: "₹95/hr", dist: "0.5 km", urgent: true, tags: ["Electrical", "Night Shift"], employer: "AJ", rating: "4.9" },
              { title: "Pop-up Shop Setup", pay: "₹800", dist: "1.2 km", urgent: false, tags: ["Physical", "One Day"], employer: "RS", rating: "4.7" },
              { title: "Event Photography", pay: "₹450/hr", dist: "0.4 km", urgent: false, tags: ["Creative", "Weekend"], employer: "MK", rating: "5.0" },
            ].map((job, i) => (
              <div key={i} className="gig-card-preview">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontSize: 12, color: "#475569", fontWeight: 600, letterSpacing: "0.05em" }}>📍 {job.dist}</span>
                  {job.urgent && <span style={{ background: "#C53030", color: "#fff", padding: "3px 10px", borderRadius: 100, fontSize: 10, fontWeight: 800, letterSpacing: "0.05em" }}>URGENT</span>}
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#0F172A", marginBottom: 16, letterSpacing: "-0.02em" }}>{job.title}</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {job.tags.map(t => <span key={t} className="tag-pill" style={{ fontSize: 12 }}>{t}</span>)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#103461", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>{job.employer}</div>
                    <span style={{ fontSize: 12, color: "#006e37", fontWeight: 700 }}>★ {job.rating}</span>
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: "#103461" }}>{job.pay}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Safety ── */}
      <section id="trust-section" className="trust-section" style={{ padding: "clamp(60px, 10vw, 100px) 6vw", background: "#F8FAFC", scrollMarginTop: "90px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <div style={{ overflow: "hidden", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0", padding: "14px 0", marginBottom: 80 }}>
            <div style={{ display: "inline-flex", animation: "marquee 28s linear infinite" }}>
              {["TRUST & SAFETY", "TRUST & SAFETY", "TRUST & SAFETY", "TRUST & SAFETY", "TRUST & SAFETY", "TRUST & SAFETY"].map((t, i) => (
                <span key={i} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.25em", color: "#94A3B8", padding: "0 40px" }}>{t}</span>
              ))}
            </div>
          </div>

          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              <div className="section-heading" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 4.5vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.1, color: "#0F172A", marginBottom: 28 }}>
                Encrypted &<br /><span className="serif-italic" style={{ color: "#103461" }}>verified.</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#475569", lineHeight: 1.8 }}>
                Rozgaaar ensures trust through digital identity verification, secure ledger transactions, and a transparent review architecture that holds every user accountable.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {TRUST.map((t, i) => (
                <div key={i} className="trust-row" style={{
                  display: "grid",
                  gridTemplateColumns: "30px 1fr",
                  gap: 16,
                  padding: "28px 0",
                  borderBottom: i < TRUST.length - 1 ? "1px solid #E2E8F0" : "none",
                  alignItems: "start",
                }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#103461", letterSpacing: "0.05em", paddingTop: 2 }}>{t.num}</span>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#0F172A", marginBottom: 8 }}>{t.title}</div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories / Tags ── */}
      <section style={{ padding: "80px 6vw", background: "#103461" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
            <div className="section-heading" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 48px)", letterSpacing: "-0.03em", color: "#FFFFFF" }}>
              What we <span className="serif-italic" style={{ color: "#006e37" }}>offer.</span>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {CATEGORIES.map(cat => (
              <span key={cat} style={{
                display: "inline-flex", alignItems: "center", padding: "10px 22px", borderRadius: 100,
                border: "1.5px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer",
                transition: "all 0.2s", letterSpacing: "0.01em",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#006e37"; e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.borderColor = "#006e37"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.9)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              >{cat}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section" style={{ padding: "100px 6vw", background: "#F8FAFC" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="section-heading" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-0.03em", color: "#0F172A", marginBottom: 64, lineHeight: 1 }}>
            System <span className="serif-italic" style={{ color: "#103461" }}>Queries.</span>
          </div>

          {FAQS.map((faq, index) => (
            <div key={index} className="faq-row faq-item-row" onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(16px, 1.8vw, 20px)", color: "#0F172A", lineHeight: 1.3 }}>{faq.q}</span>
                <span style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "1.5px solid #E2E8F0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 18, flexShrink: 0,
                  transform: activeFaq === index ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.3s",
                  color: activeFaq === index ? "#103461" : "#0F172A",
                  background: activeFaq === index ? "#F1F5F9" : "transparent"
                }}>+</span>
              </div>
              {activeFaq === index && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#475569", lineHeight: 1.8, marginTop: 20, marginBottom: 0, animation: "fadeUp 0.3s ease" }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 6vw 120px", background: "#F8FAFC" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            background: "#103461",
            borderRadius: 28,
            padding: "clamp(60px, 8vw, 100px) clamp(40px, 6vw, 80px)",
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            position: "relative", overflow: "hidden",
            boxShadow: "0 20px 40px rgba(16,52,97,0.25)"
          }}>
            {/* Decorative circle */}
            <div style={{
              position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.15)", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none",
            }} />

            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 68px)", color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24 }}>
              Initialize <span className="serif-italic" style={{ color: "#006e37" }}>your gig</span><br />today.
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.8)", maxWidth: 440, lineHeight: 1.7, marginBottom: 48 }}>
              Connect your coordinates to the network and instantly interface with hyperlocal opportunities across your city.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <button className="btn-pill-white" style={{ padding: "16px 36px", fontSize: 15 }} onClick={() => navigate("/register")}>
                Get Started →
              </button>
              <button style={{
                background: "transparent", color: "#FFFFFF", border: "1.5px solid rgba(255,255,255,0.4)",
                padding: "16px 32px", borderRadius: 100,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer",
                transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.borderColor = "#FFFFFF"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#0F172A", padding: "48px 6vw", color: "#ffffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <RozgaaarMiniLogo size={68} textColor="#FFFFFF" />
            <RozgaaarNameLogo height={50} textColor="#FFFFFF" />
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {["About Us", "Privacy", "Terms", "Support"].map(l => (
              <span key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#ffffff"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
              >{l}</span>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>© 2026 Rozgaaar Network.</span>
        </div>
      </footer>

    </div>
  );
}