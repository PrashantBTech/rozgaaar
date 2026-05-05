import React, { useEffect, useState, useCallback } from "react";
import { adminAPI } from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

/* ─── Tiny SVG Bar Chart ─────────────────────────────────────────── */
function BarChart({ data = [], color = "#D4A853", label }) {
  const max = Math.max(...data, 1);
  const W = 480, H = 120, pad = 8, barW = Math.max(8, (W - pad * 2) / data.length - 4);
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        {data.map((v, i) => {
          const bh = Math.max(2, (v / max) * (H - 24));
          const x = pad + i * ((W - pad * 2) / data.length);
          const y = H - bh - 4;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh} rx={3} fill={color} opacity={0.85} />
              {v > 0 && <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fill={color}>{v}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Tiny SVG Line Chart ────────────────────────────────────────── */
function LineChart({ datasets = [], labels = [] }) {
  const W = 480, H = 120;
  const allVals = datasets.flatMap(d => d.data);
  const max = Math.max(...allVals, 1);
  const toX = (i) => (i / (labels.length - 1)) * W;
  const toY = (v) => H - (v / max) * (H - 16) - 4;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {datasets.map((ds, di) => {
        const pts = ds.data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
        return (
          <g key={di}>
            <polyline points={pts} fill="none" stroke={ds.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {ds.data.map((v, i) => (
              <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill={ds.color} />
            ))}
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text key={i} x={toX(i)} y={H + 14} textAnchor="middle" fontSize={9} fill="rgba(26,26,26,0.4)">{l}</text>
      ))}
    </svg>
  );
}

/* ─── Donut Chart ────────────────────────────────────────────────── */
function DonutChart({ segments = [] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  const R = 40, C = 2 * Math.PI * R;
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * C;
        const gap = C - dash;
        const rot = offset * 360;
        offset += pct;
        return (
          <circle key={i} cx={60} cy={60} r={R} fill="none"
            stroke={seg.color} strokeWidth={18}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={C * 0.25}
            transform={`rotate(${rot} 60 60)`}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        );
      })}
      <text x={60} y={64} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--text-primary)">{total}</text>
      <text x={60} y={76} textAnchor="middle" fontSize={8} fill="var(--text-muted)">TOTAL</text>
    </svg>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ label, value, icon, accent = "var(--accent)", sub }) {
  return (
    <div className="stat-card fade-in" style={{ borderTop: `3px solid ${accent}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>{value ?? "—"}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [tab, setTab] = useState("overview");
  const [loadingStats, setLoadingStats] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const LIMIT = 10;

  if (user && user.role !== "admin") return <Navigate to="/dashboard" replace />;

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const [dashRes, growthRes, pendRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getGrowth(),
        adminAPI.getPendingVerifications(),
      ]);
      setStats(dashRes.data.data);
      setGrowth(growthRes.data.data);
      setPending(pendRes.data.data);
    } catch { toast.error("Failed to load dashboard stats"); }
    finally { setLoadingStats(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminAPI.getUsers({ page: userPage, limit: LIMIT, search, role: roleFilter });
      setUsers(res.data.data);
      setUserTotal(res.data.total);
    } catch { toast.error("Failed to load users"); }
  }, [userPage, search, roleFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === "users") fetchUsers(); }, [tab, fetchUsers]);

  const handleBan = async (uid, isBanned) => {
    try {
      await adminAPI.banUser(uid, { isBanned: !isBanned, banReason: !isBanned ? "Admin action" : undefined });
      toast.success(!isBanned ? "User banned" : "User unbanned");
      fetchUsers();
    } catch { toast.error("Action failed"); }
  };

  const handleVerify = async (uid, approved) => {
    try {
      await adminAPI.verifyId(uid, approved);
      toast.success(approved ? "ID Verified ✅" : "ID Rejected ❌");
      fetchStats();
    } catch { toast.error("Action failed"); }
  };

  const TABS = ["overview", "users", "verifications"];
  const tabStyle = (t) => ({
    padding: "8px 20px", borderRadius: "var(--radius-xl)", fontFamily: "var(--font-display)",
    fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
    background: tab === t ? "var(--dark-accent)" : "transparent",
    color: tab === t ? "#fff" : "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "0.06em", transition: "all 0.2s",
  });

  return (
    <div className="page-content fade-in" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>🛡️</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>Admin Panel</h1>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Platform control center — monitor, manage, and moderate.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "var(--bg-surface)", padding: 4, borderRadius: "var(--radius-xl)", width: "fit-content", border: "1px solid var(--border)" }}>
        {TABS.map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {t === "verifications" ? `Verifications${pending.length ? ` (${pending.length})` : ""}` : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <>
          {loadingStats ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: "var(--radius-lg)" }} />)}
            </div>
          ) : stats && (
            <>
              {/* Stat Cards */}
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                <StatCard label="Total Users" value={stats.users.total} icon="👥" accent="var(--accent)" />
                <StatCard label="Workers" value={stats.users.workers} icon="👷" accent="#2A9D8F" sub={`${stats.users.total ? Math.round(stats.users.workers / stats.users.total * 100) : 0}% of users`} />
                <StatCard label="Businesses" value={stats.users.businesses} icon="🏢" accent="#5B8DEF" sub={`${stats.users.total ? Math.round(stats.users.businesses / stats.users.total * 100) : 0}% of users`} />
                <StatCard label="Pending KYC" value={stats.pendingVerifications} icon="🔍" accent="#E63946" sub="Awaiting ID review" />
              </div>
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
                <StatCard label="Total Jobs" value={stats.jobs.total} icon="💼" accent="var(--accent)" />
                <StatCard label="Open Jobs" value={stats.jobs.open} icon="📭" accent="#2A9D8F" />
                <StatCard label="Completed Jobs" value={stats.jobs.completed} icon="✅" accent="#5B8DEF" />
                <StatCard label="Revenue (30d)" value={`₹${stats.revenue30d?.toLocaleString?.() ?? 0}`} icon="💰" accent="#D4A853" />
              </div>

              {/* Charts Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
                {/* User Mix Donut */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 20 }}>User Breakdown</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <DonutChart segments={[
                      { value: stats.users.workers, color: "#2A9D8F" },
                      { value: stats.users.businesses, color: "#5B8DEF" },
                    ]} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { label: "Workers", value: stats.users.workers, color: "#2A9D8F" },
                        { label: "Businesses", value: stats.users.businesses, color: "#5B8DEF" },
                      ].map(seg => (
                        <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{seg.label}</span>
                          <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: 14 }}>{seg.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Jobs by Category */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Jobs by Category</h3>
                  {stats.jobsByCategory?.length ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {stats.jobsByCategory.slice(0, 5).map((cat, i) => {
                        const maxV = stats.jobsByCategory[0].count;
                        const pct = (cat.count / maxV) * 100;
                        return (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                              <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{cat._id || "Uncategorized"}</span>
                              <span style={{ fontWeight: 700 }}>{cat.count}</span>
                            </div>
                            <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 4, transition: "width 0.6s ease" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No job data yet.</p>}
                </div>
              </div>

              {/* Growth Charts */}
              {growth && (
                <div className="card" style={{ padding: 24, marginBottom: 28 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Weekly Growth (Last 12 Weeks)</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>New registrations & job postings per week</p>

                  {/* Legend */}
                  <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
                    {[{ label: "Workers", color: "#2A9D8F" }, { label: "Businesses", color: "#5B8DEF" }, { label: "Jobs", color: "#D4A853" }].map(l => (
                      <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l.label}</span>
                      </div>
                    ))}
                  </div>

                  <LineChart
                    labels={growth.labels}
                    datasets={[
                      { data: growth.workerData, color: "#2A9D8F" },
                      { data: growth.businessData, color: "#5B8DEF" },
                      { data: growth.jobData, color: "#D4A853" },
                    ]}
                  />

                  <div style={{ marginTop: 28 }}>
                    <BarChart data={growth.jobData} color="#D4A853" label="Jobs Posted per Week" />
                  </div>
                </div>
              )}

              {/* Jobs Stats */}
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Application Pipeline</h3>
                <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                  {[
                    { label: "Total Applications", value: stats.applications.total, color: "var(--accent)" },
                    { label: "Completed", value: stats.applications.completed, color: "#2A9D8F" },
                    { label: "Completion Rate", value: stats.applications.total ? `${Math.round(stats.applications.completed / stats.applications.total * 100)}%` : "0%", color: "#5B8DEF" },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: "center", flex: 1, minWidth: 120 }}>
                      <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── USERS TAB ── */}
      {tab === "users" && (
        <div className="card fade-in" style={{ padding: 24 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="input" placeholder="🔍 Search name or email…"
              style={{ maxWidth: 280 }} value={search}
              onChange={e => { setSearch(e.target.value); setUserPage(1); }}
            />
            <select className="input" style={{ maxWidth: 160 }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setUserPage(1); }}>
              <option value="">All Roles</option>
              <option value="worker">Workers</option>
              <option value="business">Businesses</option>
              <option value="admin">Admins</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={fetchUsers}>Apply</button>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)" }}>{userTotal} user{userTotal !== 1 ? "s" : ""}</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  {["User", "Role", "Joined", "Verified", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>No users found.</td></tr>
                )}
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: "1px solid var(--border)", opacity: u.isBanned ? 0.5 : 1, transition: "opacity 0.2s" }}>
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      <span className={`badge badge-${u.role === "worker" ? "success" : u.role === "business" ? "info" : "pending"}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: "12px 12px", color: "var(--text-muted)" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      {u.isIdVerified
                        ? <span style={{ color: "#2A9D8F", fontSize: 16 }}>✓</span>
                        : <span style={{ color: "var(--text-muted)", fontSize: 16 }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      <span className={`badge badge-${u.isBanned ? "urgent" : "success"}`}>{u.isBanned ? "Banned" : "Active"}</span>
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      {u.role !== "admin" && (
                        <button
                          className={`btn btn-sm ${u.isBanned ? "btn-secondary" : "btn-danger"}`}
                          onClick={() => handleBan(u._id, u.isBanned)}
                        >
                          {u.isBanned ? "Unban" : "Ban"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {userTotal > LIMIT && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
              {[...Array(Math.ceil(userTotal / LIMIT))].map((_, i) => (
                <button key={i} onClick={() => setUserPage(i + 1)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)",
                    background: userPage === i + 1 ? "var(--dark-accent)" : "transparent",
                    color: userPage === i + 1 ? "#fff" : "var(--text-secondary)",
                    cursor: "pointer", fontWeight: 700, fontSize: 13,
                  }}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VERIFICATIONS TAB ── */}
      {tab === "verifications" && (
        <div className="fade-in">
          {pending.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>All Clear!</h3>
              <p style={{ color: "var(--text-muted)" }}>No pending ID verifications.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {pending.map(u => (
                <div key={u._id} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div className="avatar avatar-md avatar-placeholder" style={{ fontSize: 16, flexShrink: 0 }}>
                    {u.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div>
                    <span className={`badge badge-${u.role === "worker" ? "success" : "info"}`} style={{ marginTop: 4 }}>{u.role}</span>
                  </div>
                  {u.idDocument && (
                    <a href={u.idDocument} target="_blank" rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                      📄 View ID
                    </a>
                  )}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-sm" style={{ background: "#2A9D8F", color: "#fff" }} onClick={() => handleVerify(u._id, true)}>✅ Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleVerify(u._id, false)}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
