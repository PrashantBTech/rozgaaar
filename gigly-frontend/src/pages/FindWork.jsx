import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { jobsAPI, appsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

// ── SVG Icons ──
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const LightningIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const CashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    <circle cx="12" cy="12" r="2"></circle>
    <path d="M6 12h.01M18 12h.01"></path>
  </svg>
);

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const LocationPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const BookmarkOutlineIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);

const BookmarkFilledIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const FilterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const CategoryIcon = ({ category }) => {
  const size = 20;
  const stroke = "currentColor";
  const strokeWidth = 2.2;

  switch (category) {
    case "cafe_staff":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      );
    case "kitchen_help":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18h12a2 2 0 0 0 2-2V8a6 6 0 0 0-16 0v8a2 2 0 0 0 2 2z"></path>
          <line x1="9" y1="18" x2="9" y2="22"></line>
          <line x1="15" y1="18" x2="15" y2="22"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
        </svg>
      );
    case "event_crew":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      );
    case "warehouse_loader":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
          <polygon points="12 22.08 12 12 3 6.92 3 17 12 22.08"></polygon>
          <polygon points="12 22.08 12 12 21 6.92 21 17 12 22.08"></polygon>
          <polygon points="12 12 3 6.92 12 1.84 21 6.92 12 12"></polygon>
        </svg>
      );
    case "delivery":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      );
    case "retail_assistant":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      );
    case "data_entry":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="2" y1="20" x2="22" y2="20"></line>
          <line x1="12" y1="17" x2="12" y2="20"></line>
        </svg>
      );
    case "cleaning":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      );
  }
};

const CATEGORY_DETAILS = {
  cafe_staff: { label: "Cafe Staff", color: "#8B5CF6" },
  kitchen_help: { label: "Kitchen Help", color: "#F59E0B" },
  event_crew: { label: "Event Crew", color: "#EC4899" },
  warehouse_loader: { label: "Warehouse", color: "#103461" },
  delivery: { label: "Delivery", color: "#006e37" },
  retail_assistant: { label: "Retail", color: "#06B6D4" },
  data_entry: { label: "Data Entry", color: "#103461" },
  cleaning: { label: "Cleaning", color: "#006e37" },
  other: { label: "Other", color: "#6B7280" },
};

export default function FindWork() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [applying, setApplying] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedJobs") || "[]");
    } catch {
      return [];
    }
  });

  // Local Filter state
  const [salaryRange, setSalaryRange] = useState([0, 150000]); // [min, max]
  const [workModes, setWorkModes] = useState({ remote: false, field: false });
  const [activeTab, setActiveTab] = useState("all"); // "all", "wfh", "urgent", "high_pay", "flexible"
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // URL Filters
  const filters = useMemo(() => ({
    q: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    category: searchParams.get("category") || "",
    isUrgent: searchParams.get("isUrgent") === "true",
    datePosted: searchParams.get("datePosted") || "",
    sort: searchParams.get("sort") || "-isUrgent,-createdAt",
  }), [searchParams]);

  // Helper: Set URL Filters
  const setFilter = (k, v) => {
    const p = new URLSearchParams(searchParams);
    if (v) p.set(k, v); else p.delete(k);
    setSearchParams(p);
    setPage(1);
  };

  // Fetch jobs
  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status: "open", page, limit: 30, sort: filters.sort };
      if (filters.category) params.category = filters.category;
      if (filters.isUrgent) params.isUrgent = true;
      if (filters.q) params.q = filters.q;
      if (filters.city) params.city = filters.city;
      if (filters.datePosted) params.datePosted = filters.datePosted;

      const { data } = await jobsAPI.getAll(params);
      if (page === 1) {
        setJobs(data.data || []);
      } else {
        setJobs(prev => [...prev, ...(data.data || [])]);
      }
      setTotal(data.total || 0);
    } catch (err) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Handle bookmarking
  const toggleSaveJob = (jobId, e) => {
    e.stopPropagation();
    let updated;
    if (savedJobIds.includes(jobId)) {
      updated = savedJobIds.filter(id => id !== jobId);
    } else {
      updated = [...savedJobIds, jobId];
    }
    setSavedJobIds(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
  };

  // Helper: Infer work mode
  const getWorkMode = (job) => {
    const text = (job.title + " " + job.description + " " + (job.location?.address || "")).toLowerCase();
    if (text.includes("remote") || text.includes("work from home") || text.includes("wfh") || text.includes("home")) {
      return "remote";
    }
    return "field";
  };

  // Helper: Calculate monthly salary equivalent
  const getMonthlySalary = (job) => {
    if (job.employmentType === "full_time") {
      return job.payPerHour; // for full_time, payPerHour represents monthly salary
    }
    // For part_time, estimate monthly pay assuming 160 hours/month
    return job.payPerHour * 160;
  };

  // Client-side filtering on top of server data for instantaneous feedback
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 1. Tab quick filter
      if (activeTab === "wfh" && getWorkMode(job) !== "remote") return false;
      if (activeTab === "urgent" && !job.isUrgent) return false;
      if (activeTab === "high_pay" && getMonthlySalary(job) < 20000) return false;
      if (activeTab === "flexible" && job.employmentType !== "part_time") return false;

      // 2. Sidebar Work mode checkbox filter
      const mode = getWorkMode(job);
      if (workModes.remote && !workModes.field && mode !== "remote") return false;
      if (workModes.field && !workModes.remote && mode !== "field") return false;

      // 3. Sidebar Salary slider filter
      const sal = getMonthlySalary(job);
      if (sal < salaryRange[0] || sal > salaryRange[1]) return false;

      // 4. Saved Jobs only filter
      if (showSavedOnly && !savedJobIds.includes(job._id)) return false;

      return true;
    });
  }, [jobs, activeTab, workModes, salaryRange, showSavedOnly, savedJobIds]);

  // Apply job
  const handleApply = async (job, e) => {
    e.stopPropagation();
    if (!user) {
      navigate(`/login?redirect=/jobs/${job._id}`);
      return;
    }
    if (user.role !== "worker") {
      toast.error("Please log in with a Worker account to apply for gigs.");
      return;
    }
    setApplying(job._id);
    try {
      await appsAPI.apply(job._id);
      toast.success("Applied successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not apply");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="findwork-container fade-in">
      <style>{`
        .findwork-container {
          padding: 24px clamp(16px, 3vw, 32px);
          max-width: 100%;
          width: 100%;
          box-sizing: border-box;
          font-family: var(--font-body);
          color: #1E293B;
          overflow-x: hidden;
        }
        
        /* ── Header ── */
        .page-header {
          margin-bottom: 28px;
        }
        .jobs-count-title {
          font-family: var(--font-body);
          font-size: 32px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 6px;
          letter-spacing: -0.025em;
        }
        .jobs-subtitle {
          color: #64748B;
          font-size: 15px;
          margin-bottom: 22px;
          font-family: var(--font-body);
          font-style: normal;
        }
        
        /* ── Search Bar ── */
        .search-bar-wrapper {
          position: relative;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          padding: 4px 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          margin-bottom: 24px;
          transition: border-color 0.2s, box-shadow 0.2s;
          max-width: 100%;
          width: 100%;
          box-sizing: border-box;
        }
        .search-bar-wrapper:focus-within {
          border-color: #103461;
          box-shadow: 0 0 0 3px rgba(16, 52, 97, 0.1);
        }
        .search-icon {
          color: #94A3B8;
          margin-left: 12px;
          margin-right: 10px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .search-input {
          border: none;
          background: transparent;
          font-size: 16px;
          padding: 14px 4px;
          width: 100%;
          outline: none;
          color: #1E293B;
          font-family: var(--font-body);
          min-width: 0;
        }
        .search-input::placeholder {
          color: #94A3B8;
        }

        /* ── Quick Filter Tabs ── */
        .quick-tabs-container {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 12px;
          margin-bottom: 24px;
          scrollbar-width: none;
          max-width: 100%;
          width: 100%;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
        }
        .quick-tabs-container::-webkit-scrollbar {
          display: none;
        }
        .quick-tab-btn {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 100px;
          padding: 11px 22px;
          font-size: 15px;
          font-weight: 500;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          font-family: var(--font-body);
          flex-shrink: 0;
        }
        .quick-tab-btn:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }
        .quick-tab-btn.active {
          background: #006e37;
          color: #FFFFFF;
          border-color: #006e37;
          font-weight: 600;
        }
        .quick-tab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Main Layout ── */
        .layout-grid {
          display: grid;
          grid-template-columns: 290px minmax(0, 1fr);
          gap: 32px;
          align-items: start;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        /* ── Sidebar Filters ── */
        .filters-panel {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 26px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          box-sizing: border-box;
        }
        .filters-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #F1F5F9;
          padding-bottom: 14px;
        }
        .filters-panel-title {
          font-size: 17px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.01em;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .reset-filter-btn {
          font-size: 13px;
          color: #103461;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-family: var(--font-body);
        }
        .reset-filter-btn:hover {
          text-decoration: underline;
        }
        .filter-section {
          margin-bottom: 24px;
        }
        .filter-section:last-child {
          margin-bottom: 0;
        }
        .filter-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-body);
        }
        .filter-options-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .filter-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #334155;
          cursor: pointer;
          user-select: none;
          font-family: var(--font-body);
        }
        .filter-radio, .filter-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #103461;
          cursor: pointer;
        }

        /* ── Range Slider ── */
        .salary-range-display {
          font-size: 14px;
          font-weight: 700;
          color: #006e37;
          font-family: var(--font-body);
        }
        .slider-input {
          width: 100%;
          accent-color: #103461;
          margin-top: 10px;
          margin-bottom: 6px;
          cursor: pointer;
        }
        .slider-markers {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #94A3B8;
          font-weight: 500;
          font-family: var(--font-body);
        }

        /* ── Job Listing ── */
        .jobs-list-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        
        /* ── Job Card ── */
        .job-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.01);
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
        .job-card:hover {
          border-color: #103461;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
          transform: translateY(-2px);
        }
        .job-card-top {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .job-logo-box {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
          border: 1px solid #F1F5F9;
        }
        .job-details-mid {
          flex: 1;
          min-width: 0;
          max-width: 100%;
          overflow: hidden;
        }
        .job-title-text {
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          font-family: var(--font-body);
        }
        .job-company-text {
          font-size: 14px;
          color: #64748B;
          margin-bottom: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          font-family: var(--font-body);
        }
        .job-meta-row {
          display: flex;
          flex-wrap: wrap;
          column-gap: 20px;
          row-gap: 6px;
          font-size: 14px;
          color: #475569;
          font-weight: 500;
          font-family: var(--font-body);
          max-width: 100%;
        }
        .job-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          max-width: 100%;
          word-break: break-word;
        }
        .job-meta-item.pay-item {
          color: #0F172A;
          font-weight: 700;
        }
        .job-meta-icon {
          color: #006e37;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        
        /* Actions */
        .job-card-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 16px;
          margin-left: 12px;
          align-self: stretch;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .bookmark-btn {
          background: transparent;
          border: none;
          color: #64748B;
          cursor: pointer;
          padding: 6px;
          transition: color 0.15s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bookmark-btn:hover {
          color: #E11D48;
          transform: scale(1.1);
        }
        .bookmark-btn.saved {
          color: #E11D48;
        }
        .chevron-arrow-icon {
          color: #94A3B8;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          margin-top: auto;
        }
        .job-card:hover .chevron-arrow-icon {
          transform: translateX(4px);
          color: #103461;
        }
        
        /* ── Load More / Empty ── */
        .no-jobs-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          text-align: center;
          padding: 48px 24px;
          box-sizing: border-box;
          max-width: 100%;
        }
        .no-jobs-icon-wrap {
          margin-bottom: 12px;
          color: #94A3B8;
          display: flex;
          justify-content: center;
        }
        .no-jobs-title {
          font-size: 16px;
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 6px;
          font-family: var(--font-body);
        }
        .no-jobs-desc {
          font-size: 13px;
          color: #64748B;
          font-family: var(--font-body);
        }

        /* ── Mobile Filters Drawer & FAB ── */
        .mobile-filter-fab {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #0F172A;
          color: #FFFFFF;
          border: none;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.35);
          cursor: pointer;
          z-index: 1000;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .mobile-filter-fab:active {
          transform: scale(0.9);
        }
        .mobile-filter-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          z-index: 1050;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .layout-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 20px;
          }
          .filters-panel {
            display: none; /* Hide standard filters panel on mobile */
          }
          .filters-panel.mobile-open {
            display: block !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1100;
            border-radius: 20px 20px 0 0;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
            animation: slideUp 0.3s cubic-bezier(0.25, 1, 0.5, 1);
            max-height: 80vh;
            overflow-y: auto;
            padding: 24px;
            padding-bottom: 40px;
          }
          .mobile-filter-fab {
            display: flex;
          }
        }

        @media (max-width: 640px) {
          .findwork-container {
            padding: 16px 12px;
          }
          .jobs-count-title {
            font-size: 24px;
            margin-bottom: 4px;
          }
          .jobs-subtitle {
            font-size: 13px;
            margin-bottom: 16px;
          }
          .search-bar-wrapper {
            margin-bottom: 16px;
            padding: 2px 6px;
          }
          .search-input {
            font-size: 14px;
            padding: 10px 4px;
          }
          .quick-tabs-container {
            gap: 8px;
            margin-bottom: 16px;
            padding-bottom: 8px;
          }
          .quick-tab-btn {
            padding: 8px 14px;
            font-size: 13px;
            gap: 6px;
          }
          .job-card {
            padding: 14px 16px;
            border-radius: 14px;
          }
          .job-card-top {
            gap: 12px;
          }
          .job-logo-box {
            width: 46px;
            height: 46px;
            font-size: 20px;
            border-radius: 10px;
          }
          .job-title-text {
            font-size: 15px;
            margin-bottom: 3px;
          }
          .job-company-text {
            font-size: 13px;
            margin-bottom: 8px;
          }
          .job-meta-row {
            font-size: 12px;
            column-gap: 12px;
            row-gap: 4px;
          }
          .job-card-actions {
            margin-left: 6px;
            gap: 12px;
          }
        }

        @media (max-width: 420px) {
          .findwork-container {
            padding: 12px 10px;
          }
          .job-card {
            padding: 12px 14px;
          }
          .job-logo-box {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }
          .job-meta-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="page-header">
        <h1 className="jobs-count-title">
          {total > 0 ? `${total.toLocaleString()} Jobs Found` : "Find Jobs"}
        </h1>
        <p className="jobs-subtitle">Find the latest opportunities near you</p>
      </div>

      {/* ── Search Input ── */}
      <div className="search-bar-wrapper">
        <span className="search-icon"><SearchIcon /></span>
        <input
          type="text"
          className="search-input"
          placeholder="Search for 'Delivery Partner' or 'Data Entry'"
          value={filters.q}
          onChange={(e) => {
            const p = new URLSearchParams(searchParams);
            if (e.target.value) p.set("q", e.target.value); else p.delete("q");
            setSearchParams(p);
            setPage(1);
          }}
        />
      </div>

      {/* ── Quick Filter Tabs Row ── */}
      <div className="quick-tabs-container">
        <button
          className={`quick-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <span className="quick-tab-icon"><CheckCircleIcon /></span> All Jobs
        </button>
        <button
          className={`quick-tab-btn ${activeTab === "wfh" ? "active" : ""}`}
          onClick={() => setActiveTab("wfh")}
        >
          <span className="quick-tab-icon"><HomeIcon /></span> Work from Home
        </button>
        <button
          className={`quick-tab-btn ${activeTab === "urgent" ? "active" : ""}`}
          onClick={() => setActiveTab("urgent")}
        >
          <span className="quick-tab-icon"><LightningIcon /></span> Immediate Start
        </button>
        <button
          className={`quick-tab-btn ${activeTab === "high_pay" ? "active" : ""}`}
          onClick={() => setActiveTab("high_pay")}
        >
          <span className="quick-tab-icon"><CashIcon /></span> High Pay
        </button>
        <button
          className={`quick-tab-btn ${activeTab === "flexible" ? "active" : ""}`}
          onClick={() => setActiveTab("flexible")}
        >
          <span className="quick-tab-icon"><ClockIcon /></span> Flexible
        </button>
      </div>

      {/* ── Main Layout (Sidebar + List) ── */}
      <div className="layout-grid">
        {/* Left Sidebar Filters */}
        <aside className={`filters-panel ${showMobileFilters ? "mobile-open" : ""}`}>
          <div className="filters-title-row">
            <span className="filters-panel-title">
              <FilterIcon /> Filters
            </span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                className="reset-filter-btn"
                onClick={() => {
                  const p = new URLSearchParams();
                  setSearchParams(p);
                  setSalaryRange([0, 150000]);
                  setWorkModes({ remote: false, field: false });
                  setShowSavedOnly(false);
                  setActiveTab("all");
                  setPage(1);
                }}
              >
                Reset All
              </button>
              <button
                className="reset-filter-btn close-btn"
                style={{ color: "#EF4444", fontWeight: 700, display: "none" }}
                onClick={() => setShowMobileFilters(false)}
              >
                Close
              </button>
            </div>
          </div>

          {/* Filter: Date Posted */}
          <div className="filter-section">
            <div className="filter-section-title">
              Date Posted
            </div>
            <div className="filter-options-list">
              <label className="filter-label">
                <input
                  type="radio"
                  name="datePosted"
                  className="filter-radio"
                  checked={filters.datePosted === ""}
                  onChange={() => setFilter("datePosted", "")}
                />
                All
              </label>
              <label className="filter-label">
                <input
                  type="radio"
                  name="datePosted"
                  className="filter-radio"
                  checked={filters.datePosted === "24h"}
                  onChange={() => setFilter("datePosted", "24h")}
                />
                Last 24 hours
              </label>
              <label className="filter-label">
                <input
                  type="radio"
                  name="datePosted"
                  className="filter-radio"
                  checked={filters.datePosted === "7d"}
                  onChange={() => setFilter("datePosted", "7d")}
                />
                Last 7 days
              </label>
            </div>
          </div>

          {/* Filter: Salary Slider */}
          <div className="filter-section">
            <div className="filter-section-title">
              Salary (Monthly)
              <span className="salary-range-display">
                ₹{Math.floor(salaryRange[0] / 1000)}k - ₹{Math.floor(salaryRange[1] / 1000)}k
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="5000"
              className="slider-input"
              value={salaryRange[1]}
              onChange={(e) => setSalaryRange([salaryRange[0], parseInt(e.target.value)])}
            />
            <div className="slider-markers">
              <span>₹0</span>
              <span>₹1.5 Lakhs</span>
            </div>
          </div>

          {/* Filter: Work Mode Checkboxes */}
          <div className="filter-section">
            <div className="filter-section-title">
              Work Mode
            </div>
            <div className="filter-options-list">
              <label className="filter-label">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={workModes.remote}
                  onChange={(e) => setWorkModes({ ...workModes, remote: e.target.checked })}
                />
                Work from home
              </label>
              <label className="filter-label">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={workModes.field}
                  onChange={(e) => setWorkModes({ ...workModes, field: e.target.checked })}
                />
                Work from field
              </label>
            </div>
          </div>

          {/* Filter: Bookmarks */}
          <div className="filter-section">
            <div className="filter-section-title">
              Bookmarks
            </div>
            <div className="filter-options-list">
              <label className="filter-label">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={showSavedOnly}
                  onChange={(e) => setShowSavedOnly(e.target.checked)}
                />
                Saved Gigs Only
              </label>
            </div>
          </div>
        </aside>

        {/* Right Listings Column */}
        <main className="jobs-list-column">
          {loading && page === 1 ? (
            // Skeleton Loading State
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 160, borderRadius: 16 }}
              />
            ))
          ) : filteredJobs.length === 0 ? (
            <div className="no-jobs-card">
              <div className="no-jobs-icon-wrap">
                <SearchIcon />
              </div>
              <h3 className="no-jobs-title">No jobs match your criteria</h3>
              <p className="no-jobs-desc">Try resetting your filters or updating your search query</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const details = CATEGORY_DETAILS[job.category] || CATEGORY_DETAILS.other;
              const isSaved = savedJobIds.includes(job._id);
              const monthlySalary = getMonthlySalary(job);
              const timeAgo = job.createdAt
                ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
                : "";

              return (
                <div
                  key={job._id}
                  className="job-card"
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  <div className="job-card-top">
                    {/* Logo Box */}
                    <div
                      className="job-logo-box"
                      style={{ background: `${details.color}15`, color: details.color }}
                    >
                      <CategoryIcon category={job.category} />
                    </div>

                    {/* Job Details */}
                    <div className="job-details-mid">
                      <h3 className="job-title-text">{job.title}</h3>
                      <div className="job-company-text">
                        {job.postedBy?.businessName || job.postedBy?.name || "Verified Business"}
                      </div>
                      <div className="job-meta-row">
                        <div className="job-meta-item pay-item">
                          <span className="job-meta-icon"><CashIcon /></span>
                          {job.employmentType === "full_time"
                            ? `₹${monthlySalary.toLocaleString()}/mo`
                            : `₹${job.payPerHour}/hr + Incentives`}
                        </div>
                        <div className="job-meta-item">
                          <span className="job-meta-icon"><LocationPinIcon /></span>
                          {job.location?.address || job.location?.city || "Local opportunity"}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (Bookmark & Chevron) */}
                    <div className="job-card-actions">
                      <button
                        className={`bookmark-btn ${isSaved ? "saved" : ""}`}
                        onClick={(e) => toggleSaveJob(job._id, e)}
                        title={isSaved ? "Remove bookmark" : "Bookmark job"}
                      >
                        {isSaved ? <BookmarkFilledIcon /> : <BookmarkOutlineIcon />}
                      </button>
                      <span className="chevron-arrow-icon"><ChevronRightIcon /></span>
                    </div>
                  </div>

                </div>
              );
            })
          )}

          {/* Pagination Load More */}
          {jobs.length < total && filteredJobs.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
              >
                {loading ? "Loading…" : "Load More Gigs"}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Floating Filter FAB & Backdrop */}
      {showMobileFilters && (
        <div className="mobile-filter-backdrop" onClick={() => setShowMobileFilters(false)} />
      )}
      <button className="mobile-filter-fab" onClick={() => setShowMobileFilters(true)} aria-label="Open Filters">
        <FilterIcon />
      </button>
    </div>
  );
}
