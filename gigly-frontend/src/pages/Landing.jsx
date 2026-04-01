import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: "***", label: "FlashGiggers Joined" },
  { value: "***", label: "Gigs Completed" },
  { value: "< 5m", label: "Avg. Response Time" },
  { value: "***", label: "App Store Rating" },
];
const STEPS = [
  { num: "1", title: "Post a Gig", desc: "Describe the task, set your price, and post it to the local feed. Takes less than 2 minutes." },
  { num: "2", title: "Apply Instantly", desc: "Workers browse nearby gigs on a map view and apply with one tap. No lengthy cover letters." },
  { num: "3", title: "Get It Done", desc: "Work gets completed, secure payment is released automatically, and everyone leaves a review." },
];
const TRUST = [
  { icon: "🪪", title: "ID Verification", desc: "Government ID checks for all users." },
  { icon: "🔐", title: "Secure Escrow", desc: "Money is held safely until the job is done." },
  { icon: "🛡️", title: "Spam Protection", desc: "AI spam detection and prevention." },
  { icon: "⭐", title: "Real Reviews", desc: "Reviews from verified completed gigs." },
];
const CATEGORIES = ["Delivery", "Cleaning", "Moving", "Pet Care", "Cafe Staff", "Event Crew", "Warehouse", "Data Entry"];

const FEATURES = [
  { icon: "💸", title: "Instant Ledger Payouts", desc: "Our Stripe-integrated ledger releases funds automatically. Platform takes a flat 10% routing fee." },
  { icon: "📡", title: "Real-Time Telemetry", desc: "Built on Socket.io, track worker locations live and communicate via low-latency terminal chat." },
  { icon: "🤖", title: "AI Matching Engine", desc: "The 'Ask Gigi' concierge cross-references over 50 data points to auto-match your specific gig skill requirements." },
];

const OPERATIONS = [
  { audience: "Business Nodes", image: "🏪", desc: "Restaurants, retail chains, and event organizers scaling their workforce instantly without full-time commitments." },
  { audience: "Gig Workers", image: "👷", desc: "Students, freelancers, and night-owls plugging into the system for high-flexibility 2-5 hour operational shifts." },
];

const FAQS = [
  { q: "How fast do I receive payout?", a: "Funds are released from secure escrow the moment the business node verifies gig completion. Transfers usually take <24 hours." },
  { q: "Is a formal resume required?", a: "Negative. The network operates on skill-tags, verified reviews, and a centralized identity check. No cover letters needed." },
  { q: "What happens on a no-show?", a: "All users are protected. Workers who drop a shift without notice face trust-score penalties, and businesses receive instant re-routing options." }
];
export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero Animations
      const tl = gsap.timeline();
      tl.from(".hero-text", { y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" })
        .from(".hero-btn", { scale: 0.8, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)" }, "-=0.4")
        .from(".hero-glass", { x: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8");

      // Stats Stagger Reveal
      gsap.from(".stat-reveal", {
        scrollTrigger: { trigger: ".stats-section", start: "top 80%" },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out"
      });

      // Steps Entrance
      gsap.from(".step-card", {
        scrollTrigger: { trigger: ".steps-section", start: "top 75%" },
        y: 50, rotationZ: -2, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power3.out"
      });

      // Trust Cards 3D Effect
      gsap.from(".trust-item", {
        scrollTrigger: { trigger: ".trust-section", start: "top 75%" },
        scale: 0.9, rotationX: 15, y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power2.out"
      });

      // Features Reveal
      gsap.from(".feature-card", {
        scrollTrigger: { trigger: ".features-section", start: "top 75%" },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out"
      });

      // Audience Split Reveal
      gsap.from(".audience-panel", {
        scrollTrigger: { trigger: ".audience-section", start: "top 75%" },
        scale: 0.95, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out"
      });

      // FAQ Reveal
      gsap.from(".faq-item", {
        scrollTrigger: { trigger: ".faq-section", start: "top 80%" },
        x: -30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"
      });

    }, mainRef);

    return () => ctx.revert(); // Cleanup on unmount
  }, []);

  return (
    <div ref={mainRef} style={{ minHeight: "100vh", background: "#05050A", color: "#e8eef8", overflow: "hidden", position: "relative" }}>

      {/* ── Background Liquid Blobs ── */}
      <div className="blob" style={{ top: "-10%", left: "-10%", width: "60vw", height: "60vw", background: "var(--neon-blue)" }} />
      <div className="blob" style={{ top: "40%", right: "-20%", width: "50vw", height: "50vw", background: "var(--neon-pink)", animationDelay: "-4s" }} />
      <div className="blob" style={{ bottom: "-20%", left: "20%", width: "40vw", height: "40vw", background: "var(--accent)" }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(5, 5, 10, 0.6)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--dark-glass-border)",
        padding: "0 40px", height: 64, display: "flex", alignItems: "center", gap: 32
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>
          <span className="text-gradient">R</span>ozgaaar
        </div>
        <div className="landing-nav-links hide-tablet" style={{ display: "flex", gap: 28, marginLeft: 12, flex: 1 }}>
          {["Find Work", "Post Work", "How it Works", "Trust & Safety"].map(l => (
            <span key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 600, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
              onClick={() => l === "Find Work" ? navigate("/find-work") : l === "Post Work" ? navigate("/post-gig") : null}
            >{l}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/login")}>Log In</button>
          <button style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-pink))", color: "#000", border: "none", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }} onClick={() => navigate("/register")}>Sign Up</button>
        </div>
      </nav>

      {/* ── Live ticker ── */}
      <div style={{ background: "rgba(0,240,255,0.05)", borderBottom: "1px solid rgba(0,240,255,0.1)", padding: "8px 40px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--neon-blue)", animation: "pulse 2s infinite", display: "inline-block" }} />
        <span style={{ fontSize: 13, color: "var(--neon-blue)", fontWeight: 600, letterSpacing: "0.04em" }}>
          SYSTEM LIVE // active gigs near you
        </span>
      </div>

      {/* ── Hero ── */}
      <section className="hero-grid" style={{ padding: "120px 40px", maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 420px", gap: 80, alignItems: "center", position: "relative", zIndex: 10 }}>
        <div>
          <div style={{ marginBottom: 24 }}>
            <span className="hero-text" style={{ padding: "6px 12px", border: "1px solid var(--neon-blue)", borderRadius: 20, color: "var(--neon-blue)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-flex", marginBottom: 20 }}>
              ⚡ Hyper-local Era
            </span>
            <h1 className="hero-text" style={{ fontSize: "clamp(48px,6vw,84px)", lineHeight: 1, marginBottom: 0 }}>
              Work <br />
              <span className="text-gradient">Instantly.</span>
            </h1>
            <h1 className="hero-text" style={{ fontSize: "clamp(48px,6vw,84px)", lineHeight: 1, marginBottom: 24 }}>
              Hire <br />
              <span className="text-gradient">Seamlessly.</span>
            </h1>
          </div>
          <p className="hero-text" style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 40, maxWidth: 480 }}>
            The hyper-local marketplace for the modern gig economy. Connect with workers or find jobs dynamically in your neighborhood without the friction.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", zIndex: 20, position: "relative" }}>
            <button className="hero-btn" style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-pink))", color: "#000", border: "none", padding: "14px 28px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 16 }} onClick={() => navigate("/register?role=worker")}>
              Find Work
            </button>
            <button className="hero-btn" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "14px 28px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 16 }} onClick={() => navigate("/register?role=business")}>
              Post Work
            </button>
          </div>
        </div>

        {/* Live gig sample card */}
        <div className="hero-glass hide-tablet">
          <div className="glass-panel" style={{ padding: 32, borderRadius: 24, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>0.5 mi away</span>
              <span style={{ background: "var(--neon-pink)", color: "#000", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 800 }}>URGENT</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, marginBottom: 8, letterSpacing: "-0.02em" }}>Lightings Installation</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--neon-blue)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>AJ</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Ash J.</div>
                <div style={{ fontSize: 12, color: "var(--gold)" }}>★ 4.9 <span style={{ color: "rgba(255,255,255,0.5)" }}>(124 jobs)</span></div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
              {["Electrical", "Night Shift"].map(s => <span key={s} style={{ background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s}</span>)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: "var(--neon-blue)", lineHeight: 1 }}>
                ₹95<span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>/hr</span>
              </div>
              <button style={{ background: "var(--neon-blue)", color: "#000", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 800 }}>Apply</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section" style={{ padding: "40px 40px 80px", maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="stat-reveal glass-panel" style={{ padding: "24px", borderRadius: 16, borderTop: `2px solid ${i % 2 === 0 ? "var(--neon-blue)" : "var(--neon-pink)"}` }}>
              <div className="text-gradient" style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="steps-section" style={{ padding: "100px 40px", position: "relative", zIndex: 10, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", borderTop: "1px solid var(--dark-glass-border)", borderBottom: "1px solid var(--dark-glass-border)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.02em" }}>Synchronize in <span className="text-gradient">3 Steps</span></h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 16, maxWidth: 540, margin: "16px auto 0", fontSize: 16 }}>
              Our platform bridges the gap natively. Fluidly move from seeking to earning in minutes.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {STEPS.map((s) => (
              <div key={s.num} className="step-card glass-panel" style={{ padding: 40, borderRadius: 20, textAlign: "center" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%", background: "rgba(255,0,60,0.1)", border: "1px solid var(--neon-pink)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24,
                  color: "var(--neon-pink)", margin: "0 auto 24px"
                }}>{s.num}</div>
                <h3 style={{ fontSize: 22, marginBottom: 16 }}>{s.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Safety ── */}
      <section className="trust-section" style={{ padding: "100px 40px", maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--neon-blue)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>System Security Core</div>
            <h2 style={{ fontSize: "clamp(32px,4vw,48px)", marginBottom: 24, lineHeight: 1.1 }}>Encrypted & <br /> <span className="text-gradient">Verified.</span></h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>
              Rozgaaar ensures trust through digital identity verification, secure ledger transactions, and a transparent review architecture.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              {TRUST.map(t => (
                <div key={t.title} className="trust-item" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{t.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hide-tablet">
            <div className="glass-panel" style={{ padding: 40, borderRadius: 24 }}>
              <h3 style={{ fontSize: 20, marginBottom: 24, borderBottom: "1px solid var(--dark-glass-border)", paddingBottom: 16 }}>Live Network Activity</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { title: "Server Rack Migration", pay: "₹1500", dist: "0.8m", cat: "🖥️" },
                  { title: "Pop-up Shop Setup", pay: "₹800", dist: "1.2m", cat: "🛠️" },
                  { title: "Event Photography", pay: "₹450/hr", dist: "0.4m", cat: "📸" },
                ].map(j => (
                  <div key={j.title} style={{ padding: 20, background: "rgba(0,0,0,0.3)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <span style={{ fontSize: 24 }}>{j.cat}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{j.title}</div>
                          <div style={{ fontSize: 12, color: "var(--neon-blue)", marginTop: 4 }}>📍 Network Node {j.dist}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "#fff", fontSize: 18 }}>{j.pay}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Architecture (Features) ── */}
      <section className="features-section" style={{ padding: "100px 40px", maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 13, color: "var(--neon-blue)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>The Core Architecture</div>
          <h2 style={{ fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.02em" }}>Under the <span className="text-gradient">Hood</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card glass-panel" style={{ padding: 40, borderRadius: 24, borderTop: `2px solid ${i % 2 === 0 ? "var(--neon-blue)" : "var(--neon-pink)"}` }}>
              <div style={{ fontSize: 40, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, marginBottom: 12 }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Network Operators (Audience) ── */}
      <section className="audience-section" style={{ padding: "80px 40px", position: "relative", zIndex: 10, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", borderTop: "1px solid var(--dark-glass-border)", borderBottom: "1px solid var(--dark-glass-border)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.02em" }}>Network <span className="text-gradient">Operators</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32 }}>
            {OPERATIONS.map((op) => (
              <div key={op.audience} className="audience-panel" style={{ display: "flex", gap: 24, alignItems: "center", padding: 32, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24 }}>
                <div style={{ fontSize: 60, flexShrink: 0 }}>{op.image}</div>
                <div>
                  <h3 style={{ fontSize: 24, marginBottom: 8, color: "var(--neon-blue)" }}>{op.audience}</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6 }}>{op.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── System Queries (FAQ) ── */}
      <section className="faq-section" style={{ padding: "100px 40px", maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.02em" }}>System <span className="text-gradient">Queries</span></h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FAQS.map((faq, index) => (
            <div key={index} className="faq-item glass-panel" style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all 0.3s" }} onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
              <div style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, fontSize: 18 }}>
                {faq.q}
                <span style={{ color: "var(--neon-pink)", transform: activeFaq === index ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>▼</span>
              </div>
              <div style={{ padding: "0 24px 24px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontSize: 15, display: activeFaq === index ? "block" : "none" }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 40px 100px", maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div className="glass-panel" style={{ padding: "80px 40px", textAlign: "center", borderRadius: 32, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "2px", background: "linear-gradient(90deg, transparent, var(--neon-blue), var(--neon-pink), transparent)" }} />
          <h2 style={{ fontSize: "clamp(32px,4vw,56px)", marginBottom: 20 }}>Initialize your gig.</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            Connect your coordinates to the network and instantly interface with hyperlocal opportunities.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-pink))", color: "#000", border: "none", padding: "16px 32px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 16 }} onClick={() => navigate("/register")}>
              Initialize Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--dark-glass-border)", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, position: "relative", zIndex: 10, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
          <span className="text-gradient">R</span>ozgaaar
        </span>
        <div style={{ display: "flex", gap: 32 }}>
          {["About Us", "Privacy Protocol", "Terms of Service", "Support Relay"].map(l => (
            <span key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", cursor: "pointer", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}>{l}</span>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2026 Rozgaaar Network. All rights reserved.</span>
      </footer>
    </div>
  );
}