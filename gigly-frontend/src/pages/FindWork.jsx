import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { jobsAPI, appsAPI } from "../services/api";
import GigCard from "../components/GigCard";
import toast from "react-hot-toast";

const CATEGORIES = [
  { v:"", l:"All" },
  { v:"cafe_staff", l:"☕ Cafe Staff" },
  { v:"event_crew", l:"🎪 Event Crew" },
  { v:"warehouse_loader", l:"📦 Warehouse" },
  { v:"delivery", l:"🚚 Delivery" },
  { v:"cleaning", l:"🧹 Cleaning" },
  { v:"data_entry", l:"💻 Data Entry" },
  { v:"kitchen_help", l:"🍳 Kitchen" },
  { v:"other", l:"⚡ Other" },
];
const SORT_OPTIONS = [
  { v:"-isUrgent,-createdAt", l:"Recommended" },
  { v:"-payPerHour", l:"Highest Pay" },
  { v:"payPerHour", l:"Lowest Pay" },
  { v:"-createdAt", l:"Newest" },
];

export default function FindWork() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [applying, setApplying] = useState(null);

  const filters = {
    q: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    category: searchParams.get("category") || "",
    isUrgent: searchParams.get("isUrgent") === "true",
    minPay: searchParams.get("minPay") || "",
    sort: searchParams.get("sort") || "-isUrgent,-createdAt",
  };

  const setFilter = (k, v) => {
    const p = new URLSearchParams(searchParams);
    if (v) p.set(k, v); else p.delete(k);
    setSearchParams(p);
    setPage(1);
  };

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status:"open", page, limit:12, sort:filters.sort };
      if (filters.category) params.category = filters.category;
      if (filters.isUrgent) params.isUrgent = true;
      if (filters.minPay)   params.minPay = filters.minPay;
      if (filters.q)        params.q = filters.q;
      if (filters.city)     params.city = filters.city;
      const { data } = await jobsAPI.getAll(params);
      if (page === 1) setJobs(data.data || []);
      else setJobs(prev => [...prev, ...(data.data || [])]);
      setTotal(data.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [page, filters.category, filters.isUrgent, filters.minPay, filters.sort, filters.q, filters.city]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const handleApply = async (job) => {
    setApplying(job._id);
    try {
      await appsAPI.apply(job._id);
      toast.success("Applied successfully! 🎉 We'll notify you when accepted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not apply");
    } finally { setApplying(null); }
  };

  return (
    <div className="page-content">
      {/* ── Header ── */}
      <div className="fade-in" style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, marginBottom:6 }}>Find instant gigs near you</h1>
        <p style={{ color:"var(--text-secondary)", fontSize:14 }}>
          {total > 0 ? `${total} gigs available` : "Browse local opportunities"}
        </p>
      </div>

      {/* ── Search + Location bar ── */}
      <div className="fade-in fade-in-1 card" style={{ padding:16, marginBottom:20, display:"flex", gap:12, flexWrap:"wrap" }}>
        <div className="input-icon-wrap" style={{ flex:"1 1 200px" }}>
          <span className="input-icon" style={{ fontSize:13 }}>📍</span>
          <input id="city-input" className="input" placeholder="New York, NY" style={{ background:"var(--bg-base)" }}
            defaultValue={filters.city}
            onKeyDown={e => e.key === "Enter" && setFilter("city", e.target.value)} />
        </div>
        <div className="input-icon-wrap" style={{ flex:"2 1 300px" }}>
          <span className="input-icon" style={{ fontSize:13 }}>🔍</span>
          <input id="q-input" className="input" placeholder="Search by keywords, skills, or gig type..."
            defaultValue={filters.q}
            style={{ background:"var(--bg-base)" }}
            onKeyDown={e => e.key === "Enter" && setFilter("q", e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => {
          const qVal = document.getElementById("q-input").value;
          const cityVal = document.getElementById("city-input").value;
          const p = new URLSearchParams(searchParams);
          if (qVal) p.set("q", qVal); else p.delete("q");
          if (cityVal) p.set("city", cityVal); else p.delete("city");
          setSearchParams(p);
          setPage(1);
        }}>Search</button>
      </div>

      {/* ── Filter chips ── */}
      <div className="fade-in fade-in-2" style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
        <button className={`tag ${filters.isUrgent ? "active" : ""}`} style={{ cursor:"pointer" }}
          onClick={() => setFilter("isUrgent", filters.isUrgent ? "" : "true")}>
          🔴 Urgent Only
        </button>
        <button className={`tag ${filters.minPay === "50" ? "active" : ""}`} style={{ cursor:"pointer" }}
          onClick={() => setFilter("minPay", filters.minPay === "50" ? "" : "50")}>
          💰 High Pay (₹50+/hr)
        </button>
        <div style={{ width:1, height:24, background:"var(--border)", margin:"0 4px" }} />
        {CATEGORIES.map(c => (
          <button key={c.v} className={`tag ${filters.category === c.v ? "active" : ""}`} style={{ cursor:"pointer" }}
            onClick={() => setFilter("category", c.v)}>
            {c.l}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"var(--text-muted)" }}>Sort by:</span>
          <select className="input" style={{ padding:"6px 10px", width:"auto", background:"var(--bg-base)", fontSize:13 }}
            value={filters.sort} onChange={e => setFilter("sort", e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
      </div>

      {/* ── Job Grid ── */}
      {loading && page === 1 ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton" style={{ height:180, borderRadius:"var(--radius-lg)" }} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
          <h3 style={{ marginBottom:8 }}>No gigs found</h3>
          <p style={{ color:"var(--text-muted)", fontSize:14 }}>Try different filters or check back later</p>
        </div>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
            {jobs.map(job => (
              <div key={job._id} style={{ opacity: applying === job._id ? 0.6 : 1, transition:"opacity 0.2s" }}>
                <GigCard job={job} onApply={handleApply} />
              </div>
            ))}
          </div>
          {jobs.length < total && (
            <div style={{ textAlign:"center", marginTop:24 }}>
              <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={loading}>
                {loading ? "Loading…" : `Load More Gigs (${total - jobs.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
