import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5083/api"
  : "http://cakeflow.runasp.net/api";

const COLORS = {
  bg: "#F4F6F8",
  navy: "#0D1B2A",
  teal: "#00B4D8",
  gold: "#FFC857",
  card: "#FFFFFF",
  text: "#1A2530",
  muted: "#6B7684",
  border: "#E2E7EC",
  red: "#D7373F",
  green: "#1E9E5A",
};

const CHART_COLORS = ["#00B4D8", "#FFC857", "#0D1B2A", "#8ECAE6", "#E27A2F", "#6A4C93", "#1E9E5A", "#D7373F"];

const s = {
  page: { minHeight: "100vh", background: COLORS.bg, padding: "24px 20px 60px", fontFamily: "'Segoe UI', sans-serif" },
  header: { maxWidth: 1200, margin: "0 auto 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  title: { color: COLORS.navy, fontSize: 22, margin: 0, fontWeight: 800 },
  subtitle: { color: COLORS.muted, fontSize: 13, margin: "2px 0 0" },
  navBtn: { background: "#fff", border: `1.5px solid ${COLORS.border}`, color: COLORS.navy, borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  wrap: { maxWidth: 1200, margin: "0 auto" },
  filterCard: { background: COLORS.card, borderRadius: 12, padding: 16, boxShadow: "0 2px 10px rgba(13,27,42,0.06)", marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" },
  presetBtn: (active) => ({
    border: `1.5px solid ${active ? COLORS.navy : COLORS.border}`,
    background: active ? COLORS.navy : "#fff",
    color: active ? "#fff" : COLORS.text,
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  }),
  select: { padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`, fontSize: 13 },
  dateInput: { padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`, fontSize: 13 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 },
  kpiCard: { background: COLORS.card, borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(13,27,42,0.06)", borderTop: `3px solid ${COLORS.teal}` },
  kpiLabel: { fontSize: 12, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 },
  kpiValue: { fontSize: 26, fontWeight: 800, color: COLORS.navy, marginTop: 6 },
  kpiSub: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 },
  chartCard: { background: COLORS.card, borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(13,27,42,0.06)" },
  chartTitle: { fontSize: 14.5, fontWeight: 700, color: COLORS.navy, marginBottom: 14 },
  fullWidthCard: { gridColumn: "1 / -1" },
  table: { width: "100%", background: COLORS.card, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(13,27,42,0.06)", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 14px", fontSize: 12, color: COLORS.muted, borderBottom: `1.5px solid ${COLORS.border}`, background: "#FAFBFC", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 },
  td: { padding: "12px 14px", fontSize: 13.5, color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` },
  loading: { textAlign: "center", color: COLORS.muted, marginTop: 80 },
  empty: { textAlign: "center", color: COLORS.muted, padding: 40 },
};

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }
function startOfWeek(d) { const x = startOfDay(d); const day = x.getDay(); const diff = (day === 0 ? -6 : 1) - day; x.setDate(x.getDate() + diff); return x; }
function startOfMonth(d) { const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0, 0, 0, 0); return x; }

function parseRevenue(notes) {
  if (!notes) return 0;
  const match = notes.match(/Total:\s*\$(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function dayKey(d) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function AnalyticsDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  const navigate = useNavigate();
  const token = localStorage.getItem("cakeflow_token");
  const role = localStorage.getItem("cakeflow_role");
  const name = localStorage.getItem("cakeflow_name");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (role !== "Owner" && role !== "Developer") { navigate("/"); return; }
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

  const branches = useMemo(() => {
    const set = new Set(orders.map((o) => o.branch).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (branchFilter !== "All" && o.branch !== branchFilter) return false;
      if (range.from && range.to) {
        const d = new Date(o.dispatchTime);
        if (d < range.from || d > range.to) return false;
      }
      return true;
    });
  }, [orders, branchFilter, range]);

  const kpis = useMemo(() => {
    const totalRevenue = filtered.reduce((sum, o) => sum + parseRevenue(o.orderItems?.[0]?.notes), 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const dispatched = filtered.filter((o) => o.status === "Dispatched").length;
    return { totalRevenue, totalOrders, avgOrderValue, dispatched };
  }, [filtered]);

  const branchComparison = useMemo(() => {
    const map = {};
    filtered.forEach((o) => {
      const b = o.branch || "Unspecified";
      if (!map[b]) map[b] = { branch: b, orders: 0, revenue: 0 };
      map[b].orders += 1;
      map[b].revenue += parseRevenue(o.orderItems?.[0]?.notes);
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  const topCakeTypes = useMemo(() => {
    const map = {};
    filtered.forEach((o) => {
      const type = o.orderItems?.[0]?.cakeType || "Unspecified";
      if (!map[type]) map[type] = { name: type, orders: 0, revenue: 0 };
      map[type].orders += 1;
      map[type].revenue += parseRevenue(o.orderItems?.[0]?.notes);
    });
    return Object.values(map).sort((a, b) => b.orders - a.orders).slice(0, 8);
  }, [filtered]);

  const revenueTrend = useMemo(() => {
    const map = {};
    filtered.forEach((o) => {
      const key = dayKey(o.dispatchTime);
      if (!map[key]) map[key] = { date: key, revenue: 0, orders: 0, sortKey: new Date(o.dispatchTime).getTime() };
      map[key].revenue += parseRevenue(o.orderItems?.[0]?.notes);
      map[key].orders += 1;
    });
    return Object.values(map).sort((a, b) => a.sortKey - b.sortKey);
  }, [filtered]);

  const statusBreakdown = useMemo(() => {
    const map = {};
    filtered.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  if (loading) return <div style={s.page}><p style={s.loading}>Loading analytics...</p></div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Analytics 📈</h2>
          <p style={s.subtitle}>Welcome back, {name} — all branches overview</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={s.navBtn} onClick={() => navigate("/reports")}>📋 Reports</button>
          <button style={s.navBtn} onClick={() => navigate("/frontdesk")}>← Dashboard</button>
          <button style={s.navBtn} onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div style={s.wrap}>
        {/* Filters */}
        <div style={s.filterCard}>
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
            { key: "all", label: "All Time" },
            { key: "custom", label: "Custom" },
          ].map((p) => (
            <button key={p.key} style={s.presetBtn(preset === p.key)} onClick={() => setPreset(p.key)}>
              {p.label}
            </button>
          ))}
          {preset === "custom" && (
            <>
              <input type="date" style={s.dateInput} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              <span style={{ color: COLORS.muted }}>to</span>
              <input type="date" style={s.dateInput} value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </>
          )}
          <select style={s.select} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            {branches.map((b) => <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>)}
          </select>
        </div>

        {/* KPI cards */}
        <div style={s.kpiGrid}>
          <div style={s.kpiCard}>
            <div style={s.kpiLabel}>Total Revenue</div>
            <div style={s.kpiValue}>${kpis.totalRevenue.toFixed(2)}</div>
          </div>
          <div style={{ ...s.kpiCard, borderTopColor: COLORS.gold }}>
            <div style={s.kpiLabel}>Total Orders</div>
            <div style={s.kpiValue}>{kpis.totalOrders}</div>
          </div>
          <div style={{ ...s.kpiCard, borderTopColor: COLORS.navy }}>
            <div style={s.kpiLabel}>Avg Order Value</div>
            <div style={s.kpiValue}>${kpis.avgOrderValue.toFixed(2)}</div>
          </div>
          <div style={{ ...s.kpiCard, borderTopColor: COLORS.green }}>
            <div style={s.kpiLabel}>Dispatched</div>
            <div style={s.kpiValue}>{kpis.dispatched}</div>
            <div style={s.kpiSub}>{kpis.totalOrders ? Math.round((kpis.dispatched / kpis.totalOrders) * 100) : 0}% completion rate</div>
          </div>
        </div>

        {/* Charts */}
        <div style={s.chartsGrid}>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>Revenue by Branch</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={branchComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                <Bar dataKey="revenue" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={s.chartCard}>
            <div style={s.chartTitle}>Orders by Branch</div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={branchComparison} dataKey="orders" nameKey="branch" cx="50%" cy="50%" outerRadius={90} label>
                  {branchComparison.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...s.chartCard, ...s.fullWidthCard }}>
            <div style={s.chartTitle}>Revenue Trend</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                <Line type="monotone" dataKey="revenue" stroke={COLORS.navy} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={s.chartCard}>
            <div style={s.chartTitle}>Best-Selling Cakes (by orders)</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCakeTypes} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11.5 }} />
                <Tooltip />
                <Bar dataKey="orders" fill={COLORS.gold} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={s.chartCard}>
            <div style={s.chartTitle}>Orders by Status</div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {statusBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch comparison table */}
        <div style={s.chartTitle}>Branch Comparison</div>
        {branchComparison.length === 0 ? (
          <div style={s.empty}>No data for the selected filters.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Branch</th>
                <th style={s.th}>Orders</th>
                <th style={s.th}>Revenue</th>
                <th style={s.th}>Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {branchComparison.map((b) => (
                <tr key={b.branch}>
                  <td style={s.td}><strong>{b.branch}</strong></td>
                  <td style={s.td}>{b.orders}</td>
                  <td style={s.td}>${b.revenue.toFixed(2)}</td>
                  <td style={s.td}>${(b.orders ? b.revenue / b.orders : 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}