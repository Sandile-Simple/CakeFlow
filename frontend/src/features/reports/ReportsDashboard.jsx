import { useEffect, useState, useMemo, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5083/api"
  : "http://cakeflow.runasp.net/api";

const COLORS = {
  bg: "#FAF7F8",
  card: "#FFFFFF",
  pink: "#E91E63",
  pinkDark: "#C2185B",
  pinkSoft: "#FDE6EF",
  teal: "#00B4D8",
  tealDark: "#0091AD",
  tealSoft: "#E4F7FB",
  gold: "#FFC857",
  goldDark: "#B9860F",
  goldSoft: "#FCF1D8",
  green: "#1E9E5A",
  greenSoft: "#E7F7EE",
  orange: "#E27A2F",
  orangeSoft: "#FCEEE1",
  red: "#D7373F",
  redSoft: "#FCEAEA",
  border: "#EDE3E6",
  text: "#241C1E",
  muted: "#8B7680",
  slateSoft: "#F5F1F2",
};

const s = {
  page: { minHeight: "100vh", background: COLORS.bg, padding: "28px 20px 60px", fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" },

  header: { maxWidth: 1120, margin: "0 auto 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 },
  brandRow: { display: "flex", alignItems: "center", gap: 12 },
  brandIcon: { width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.pink}, ${COLORS.pinkDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 12px rgba(233,30,99,0.28)" },
  title: { color: COLORS.text, fontSize: 21, margin: 0, fontWeight: 700, letterSpacing: -0.3 },
  subtitle: { color: COLORS.muted, fontSize: 13, margin: "2px 0 0" },
  headerActions: { display: "flex", alignItems: "center", gap: 10 },
  backBtn: { background: "#fff", border: `1.5px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  logoutBtn: { background: "none", border: `1.5px solid ${COLORS.pink}`, color: COLORS.pink, borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  wrap: { maxWidth: 1120, margin: "0 auto" },

  filterCard: { background: COLORS.card, borderRadius: 14, padding: 16, boxShadow: "0 2px 10px rgba(30,20,24,0.05)", border: `1px solid ${COLORS.border}`, marginBottom: 18, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" },
  presetBtn: (active) => ({
    border: `1.5px solid ${active ? COLORS.pink : COLORS.border}`,
    background: active ? COLORS.pink : "#fff",
    color: active ? "#fff" : COLORS.text,
    borderRadius: 9,
    padding: "8px 15px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  }),
  dateInput: { padding: "9px 11px", borderRadius: 9, border: `1.5px solid ${COLORS.border}`, fontSize: 13, background: "#FFFBFC" },

  searchWrap: { position: "relative", flex: 1, minWidth: 220 },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: COLORS.muted, pointerEvents: "none" },
  searchInput: { width: "100%", padding: "9px 12px 9px 32px", borderRadius: 9, border: `1.5px solid ${COLORS.border}`, fontSize: 13, boxSizing: "border-box", background: "#FFFBFC" },
  select: { padding: "9px 11px", borderRadius: 9, border: `1.5px solid ${COLORS.border}`, fontSize: 13, background: "#FFFBFC" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 22 },
  statCard: { background: COLORS.card, borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px rgba(30,20,24,0.05)", border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${COLORS.pink}` },
  statNumber: { fontSize: 26, fontWeight: 800, color: COLORS.pinkDark },
  statLabel: { fontSize: 12, color: COLORS.muted, marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 },

  sectionHeadRow: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 0 12px" },
  sectionHead: { color: COLORS.text, fontSize: 15, fontWeight: 700, margin: 0 },
  sectionCount: { fontSize: 12.5, color: COLORS.muted },

  tableCard: { background: COLORS.card, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(30,20,24,0.05)", border: `1px solid ${COLORS.border}` },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: 11.5, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `1.5px solid ${COLORS.border}`, background: COLORS.slateSoft },
  td: { padding: "13px 16px", fontSize: 13.5, color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, verticalAlign: "middle" },
  clientCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 30, height: 30, borderRadius: "50%", background: COLORS.pinkSoft, color: COLORS.pinkDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11.5, flexShrink: 0 },
  chevron: (open) => ({ display: "inline-block", transition: "transform .15s ease", transform: open ? "rotate(90deg)" : "rotate(0deg)", color: COLORS.muted, marginRight: 8, fontSize: 11 }),

  badge: (bg, fg) => ({ background: bg, color: fg, fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 999, whiteSpace: "nowrap", display: "inline-block" }),

  expandRow: { background: COLORS.slateSoft },
  expandInner: { padding: "14px 16px 16px" },
  detailLine: { fontSize: 12.5, color: COLORS.muted, marginBottom: 10 },
  detailLabel: { fontWeight: 700, color: COLORS.text },
  timelineTitle: { fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.3 },
  timelineItem: { display: "flex", gap: 10, fontSize: 12.5, padding: "5px 0", color: COLORS.muted, alignItems: "flex-start" },
  timelineDot: (status) => ({ width: 8, height: 8, borderRadius: "50%", background: statusColors(status)[1], marginTop: 5, flexShrink: 0 }),
  timelineText: { color: COLORS.text },

  empty: { textAlign: "center", color: COLORS.muted, padding: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  loading: { textAlign: "center", color: COLORS.muted, marginTop: 80, fontSize: 14 },
};

function statusColors(status) {
  switch (status) {
    case "Pending": return [COLORS.pinkSoft, COLORS.pinkDark];
    case "Baking": return [COLORS.orangeSoft, COLORS.orange];
    case "Baked":
    case "Decorating": return [COLORS.tealSoft, COLORS.tealDark];
    case "Ready": return [COLORS.goldSoft, COLORS.goldDark];
    case "Dispatched": return [COLORS.greenSoft, COLORS.green];
    default: return [COLORS.slateSoft, COLORS.muted];
  }
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }
function startOfWeek(d) { const x = startOfDay(d); const day = x.getDay(); const diff = (day === 0 ? -6 : 1) - day; x.setDate(x.getDate() + diff); return x; }
function startOfMonth(d) { const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0, 0, 0, 0); return x; }

const STATUS_OPTIONS = ["Dispatched", "All", "Pending", "Baking", "Baked", "Decorating", "Ready"];

export default function ReportsDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("Dispatched");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("cakeflow_token");
  const role = localStorage.getItem("cakeflow_role");
  const name = localStorage.getItem("cakeflow_name");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (role !== "Owner" && role !== "FrontDesk") { navigate("/"); return; }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const range = useMemo(() => {
    const now = new Date();
    if (preset === "today") return { from: startOfDay(now), to: endOfDay(now) };
    if (preset === "week") return { from: startOfWeek(now), to: endOfDay(now) };
    if (preset === "month") return { from: startOfMonth(now), to: endOfDay(now) };
    if (preset === "custom" && customFrom && customTo) return { from: startOfDay(new Date(customFrom)), to: endOfDay(new Date(customTo)) };
    return { from: null, to: null };
  }, [preset, customFrom, customTo]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (range.from && range.to) {
        const d = new Date(o.dispatchTime);
        if (d < range.from || d > range.to) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = o.clientName?.toLowerCase().includes(q);
        const matchesContact = o.clientContact?.toLowerCase().includes(q);
        if (!matchesName && !matchesContact) return false;
      }
      return true;
    });
  }, [orders, statusFilter, range, search]);

  const dispatchedInRange = useMemo(
    () => orders.filter((o) => {
      if (o.status !== "Dispatched") return false;
      if (!range.from || !range.to) return true;
      const d = new Date(o.dispatchTime);
      return d >= range.from && d <= range.to;
    }),
    [orders, range]
  );

  const byType = useMemo(() => {
    const map = {};
    dispatchedInRange.forEach((o) => {
      const type = o.orderItems?.[0]?.cakeType || "Unspecified";
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [dispatchedInRange]);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.loading}>Loading reports...</div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{`
        .cf-preset-btn:hover { border-color: ${COLORS.pink}; }
        .cf-row { transition: background .12s ease; cursor: pointer; }
        .cf-row:hover { background: ${COLORS.slateSoft}; }
        .cf-back-btn:hover { border-color: ${COLORS.pink}; color: ${COLORS.pink}; }
        .cf-logout-btn:hover { background: ${COLORS.pink}; color: #fff; }
      `}</style>

      <div style={s.header}>
        <div style={s.brandRow}>
          <div style={s.brandIcon}>📊</div>
          <div>
            <h2 style={s.title}>Reports &amp; Audit Trail</h2>
            <p style={s.subtitle}>Welcome back, {name || "there"}</p>
          </div>
        </div>
        <div style={s.headerActions}>
          <button className="cf-back-btn" style={s.backBtn} onClick={() => navigate("/frontdesk")}>← Dashboard</button>
          <button className="cf-logout-btn" style={s.logoutBtn} onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div style={s.wrap}>
        {/* Date range filters */}
        <div style={s.filterCard}>
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
            { key: "all", label: "All Time" },
            { key: "custom", label: "Custom" },
          ].map((p) => (
            <button key={p.key} className="cf-preset-btn" style={s.presetBtn(preset === p.key)} onClick={() => setPreset(p.key)}>
              {p.label}
            </button>
          ))}
          {preset === "custom" && (
            <>
              <input type="date" style={s.dateInput} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              <span style={{ color: COLORS.muted, fontSize: 13 }}>to</span>
              <input type="date" style={s.dateInput} value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </>
          )}
        </div>

        {/* Stat cards */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statNumber}>{dispatchedInRange.length}</div>
            <div style={s.statLabel}>Total Dispatched</div>
          </div>
          {byType.map(([type, count]) => (
            <div key={type} style={{ ...s.statCard, borderLeftColor: COLORS.teal }}>
              <div style={{ ...s.statNumber, color: COLORS.tealDark }}>{count}</div>
              <div style={s.statLabel}>{type}</div>
            </div>
          ))}
        </div>

        {/* Search + status filter for history table */}
        <div style={s.filterCard}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search by client name or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select style={s.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div style={s.sectionHeadRow}>
          <h3 style={s.sectionHead}>Order History</h3>
          <span style={s.sectionCount}>{filtered.length} order{filtered.length === 1 ? "" : "s"}</span>
        </div>

        {filtered.length === 0 ? (
          <div style={s.tableCard}>
            <div style={s.empty}>
              <div style={s.emptyIcon}>🔎</div>
              No orders match your filters.
            </div>
          </div>
        ) : (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Client</th>
                  <th style={s.th}>Contact</th>
                  <th style={s.th}>Item</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Dispatch Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const isOpen = expandedId === o.orderId;
                  const [badgeBg, badgeFg] = statusColors(o.status);
                  const history = (o.statusHistory || o.StatusHistory || [])
                    .slice()
                    .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));

                  return (
                    <Fragment key={o.orderId}>
                      <tr className="cf-row" onClick={() => setExpandedId(isOpen ? null : o.orderId)}>
                        <td style={s.td}>
                          <div style={s.clientCell}>
                            <span style={s.chevron(isOpen)}>▶</span>
                            <div style={s.avatar}>{getInitials(o.clientName)}</div>
                            {o.clientName}
                          </div>
                        </td>
                        <td style={s.td}>{o.clientContact}</td>
                        <td style={s.td}>{o.orderItems?.[0]?.cakeType} — {o.orderItems?.[0]?.flavour}</td>
                        <td style={s.td}><span style={s.badge(badgeBg, badgeFg)}>{o.status}</span></td>
                        <td style={s.td}>{new Date(o.dispatchTime).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td>
                      </tr>
                      {isOpen && (
                        <tr style={s.expandRow}>
                          <td style={s.td} colSpan={5}>
                            <div style={s.expandInner}>
                              <div style={s.detailLine}>
                                <span style={s.detailLabel}>Size: </span>{o.orderItems?.[0]?.size || "—"}
                                {"   "}
                                <span style={s.detailLabel}>Notes: </span>{o.orderItems?.[0]?.notes || "—"}
                              </div>

                              <div style={s.timelineTitle}>Audit Trail</div>
                              {history.length > 0 ? (
                                history.map((h, i) => (
                                  <div key={i} style={s.timelineItem}>
                                    <div style={s.timelineDot(h.status)} />
                                    <div>
                                      <span style={{ ...s.timelineText, fontWeight: 700 }}>{h.status}</span>
                                      {" — "}{new Date(h.changedAt).toLocaleString()} (by {h.changedBy})
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ fontSize: 12.5, color: COLORS.muted }}>No history recorded.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
