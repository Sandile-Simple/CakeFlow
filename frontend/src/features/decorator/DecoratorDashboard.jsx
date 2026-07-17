import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://cakeflow.runasp.net/api";

const COLORS = {
  bg: "#F5F8F9",
  card: "#FFFFFF",
  pink: "#E91E63",
  pinkDark: "#C2185B",
  pinkSoft: "#FDE6EF",
  teal: "#00B4D8",
  tealDark: "#0091AD",
  tealSoft: "#E4F7FB",
  border: "#E4EDEF",
  text: "#20272B",
  muted: "#849097",
  green: "#1E9E5A",
  greenSoft: "#E7F7EE",
  orange: "#E27A2F",
  orangeSoft: "#FCEEE1",
  red: "#D7373F",
  redSoft: "#FCEAEA",
  slateSoft: "#EFF4F5",
};

const styles = {
  page: { minHeight: "100vh", background: COLORS.bg, padding: "28px 20px 60px", fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" },

  header: { maxWidth: 1080, margin: "0 auto 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 },
  brandRow: { display: "flex", alignItems: "center", gap: 12 },
  brandIcon: { width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 12px rgba(0,180,216,0.28)" },
  title: { color: COLORS.text, fontSize: 21, margin: 0, fontWeight: 700, letterSpacing: -0.3 },
  subtitle: { color: COLORS.muted, fontSize: 13, margin: "2px 0 0" },
  headerActions: { display: "flex", alignItems: "center", gap: 10 },
  refreshBtn: { background: "#fff", border: `1.5px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  logoutBtn: { background: "none", border: `1.5px solid ${COLORS.pink}`, color: COLORS.pink, borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  statsRow: { maxWidth: 1080, margin: "0 auto 26px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 },
  statCard: { background: COLORS.card, borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px rgba(20,30,33,0.05)", border: `1px solid ${COLORS.border}` },
  statLabel: { fontSize: 12.5, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 },
  statValue: { fontSize: 28, fontWeight: 800, color: COLORS.text, marginTop: 6 },

  sectionHeadRow: { maxWidth: 1080, margin: "0 auto 14px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  sectionHead: { fontSize: 15, fontWeight: 700, color: COLORS.text, margin: 0 },
  sectionCount: { fontSize: 12.5, color: COLORS.muted },

  grid: { maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 },

  card: { background: COLORS.card, borderRadius: 16, boxShadow: "0 2px 12px rgba(20,30,33,0.06)", border: `1px solid ${COLORS.border}`, overflow: "hidden", display: "flex", flexDirection: "column" },
  imageBox: { width: "100%", height: 170, objectFit: "cover", display: "block", background: COLORS.slateSoft },
  imagePlaceholder: { width: "100%", height: 170, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, background: `linear-gradient(135deg, ${COLORS.tealSoft}, ${COLORS.slateSoft})`, color: COLORS.tealDark },

  cardBody: { padding: "16px 18px 16px", display: "flex", flexDirection: "column", flex: 1 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  clientRow: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: COLORS.tealSoft, color: COLORS.tealDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 },
  clientName: { fontSize: 15.5, fontWeight: 700, color: COLORS.text, margin: 0 },
  clientMeta: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  badge: (bg, fg) => ({ background: bg, color: fg, fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 999, whiteSpace: "nowrap" }),

  divider: { height: 1, background: COLORS.border, margin: "13px 0 12px" },

  itemCard: { background: COLORS.slateSoft, borderRadius: 10, padding: "10px 12px", marginBottom: 8 },
  itemTop: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5 },
  itemType: { fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 },
  itemDetail: { fontSize: 12.5, color: COLORS.muted, marginTop: 3 },
  notes: { fontSize: 12.5, color: COLORS.tealDark, marginTop: 6, fontStyle: "italic", background: COLORS.tealSoft, padding: "6px 9px", borderRadius: 8 },

  designWrap: { marginTop: 4 },
  designChipRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 },
  designChip: { fontSize: 11.5, fontWeight: 600, color: COLORS.tealDark, background: COLORS.tealSoft, borderRadius: 999, padding: "5px 10px" },
  designNote: { fontSize: 12.5, color: COLORS.text, marginTop: 8, background: COLORS.slateSoft, borderRadius: 8, padding: "8px 10px" },
  designNoteLabel: { fontWeight: 700, color: COLORS.tealDark, marginRight: 4 },

  footerRow: { marginTop: "auto", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" },
  dueLabel: { fontSize: 12, color: COLORS.muted },
  button: { background: COLORS.teal, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(0,180,216,0.28)" },

  empty: { maxWidth: 1080, margin: "70px auto 0", textAlign: "center", color: COLORS.muted },
  emptyIcon: { fontSize: 46, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 4 },

  skeletonGrid: { maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 },
  skeletonCard: { background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, height: 300 },
};

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDueInfo(dispatchTime) {
  if (!dispatchTime) return { label: "No date", fg: COLORS.muted, days: null };
  const due = new Date(dispatchTime);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / 86400000);

  if (diffDays < 0) return { label: `Overdue ${Math.abs(diffDays)}d`, fg: COLORS.red, days: diffDays };
  if (diffDays === 0) return { label: "Due Today", fg: COLORS.orange, days: diffDays };
  if (diffDays === 1) return { label: "Due Tomorrow", fg: COLORS.orange, days: diffDays };
  return { label: `Due in ${diffDays}d`, fg: COLORS.green, days: diffDays };
}

function statusBadgeColors(status) {
  if (status === "Decorating") return [COLORS.orangeSoft, COLORS.orange];
  return [COLORS.tealSoft, COLORS.tealDark]; // Baked
}

function itemIcon(cakeType) {
  const t = (cakeType || "").toLowerCase();
  if (t.includes("cupcake")) return "🧁";
  if (t.includes("wedding")) return "💍";
  return "🎂";
}

export default function DecoratorDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const name = localStorage.getItem("cakeflow_name");
  const token = localStorage.getItem("cakeflow_token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async ({ showRefresh } = {}) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await axios.get(`${API_BASE}/orders`, authHeader);
      const baked = res.data
        .filter((o) => o.status === "Baked" || o.status === "Decorating")
        .sort((a, b) => new Date(a.dispatchTime) - new Date(b.dispatchTime));
      setOrders(baked);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsReady = async (orderId) => {
    try {
      await axios.put(`${API_BASE}/orders/${orderId}/status`, "Ready", {
        ...authHeader,
        headers: { ...authHeader.headers, "Content-Type": "application/json" },
      });
      fetchOrders();
    } catch (err) {
      alert("Failed to update order status.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const stats = useMemo(() => {
    let dueToday = 0;
    let overdue = 0;
    orders.forEach((o) => {
      const info = getDueInfo(o.dispatchTime);
      if (info.days === 0) dueToday += 1;
      if (info.days < 0) overdue += 1;
    });
    return { total: orders.length, dueToday, overdue };
  }, [orders]);

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes cf-pulse {
          0% { opacity: 0.55; }
          50% { opacity: 1; }
          100% { opacity: 0.55; }
        }
        .cf-skeleton { animation: cf-pulse 1.3s ease-in-out infinite; }
        .cf-order-card { transition: transform .15s ease, box-shadow .15s ease; }
        .cf-order-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(20,30,33,0.10); }
        .cf-order-card img { transition: transform .25s ease; }
        .cf-order-card:hover img { transform: scale(1.04); }
        .cf-mark-btn { transition: background .15s ease, transform .1s ease; }
        .cf-mark-btn:hover { background: ${COLORS.tealDark}; }
        .cf-mark-btn:active { transform: scale(0.97); }
        .cf-refresh-btn:hover { border-color: ${COLORS.teal}; color: ${COLORS.tealDark}; }
        .cf-logout-btn:hover { background: ${COLORS.pink}; color: #fff; }
      `}</style>

      <div style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.brandIcon}>🎨</div>
          <div>
            <h2 style={styles.title}>Decorator Dashboard</h2>
            <p style={styles.subtitle}>Welcome back, {name || "Decorator"}</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button className="cf-refresh-btn" style={styles.refreshBtn} onClick={() => fetchOrders({ showRefresh: true })} disabled={refreshing}>
            <span style={{ display: "inline-block", transform: refreshing ? "rotate(180deg)" : "none", transition: "transform .3s" }}>⟳</span>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button className="cf-logout-btn" style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Awaiting Decoration</div>
          <div style={styles.statValue}>{loading ? "—" : stats.total}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Due Today</div>
          <div style={{ ...styles.statValue, color: stats.dueToday > 0 ? COLORS.orange : COLORS.text }}>{loading ? "—" : stats.dueToday}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Overdue</div>
          <div style={{ ...styles.statValue, color: stats.overdue > 0 ? COLORS.red : COLORS.text }}>{loading ? "—" : stats.overdue}</div>
        </div>
      </div>

      <div style={styles.sectionHeadRow}>
        <h3 style={styles.sectionHead}>Orders To Decorate</h3>
        {!loading && <span style={styles.sectionCount}>{orders.length} order{orders.length === 1 ? "" : "s"}</span>}
      </div>

      {loading && (
        <div style={styles.skeletonGrid}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="cf-skeleton" style={styles.skeletonCard} />
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🎉</div>
          <div style={styles.emptyTitle}>Nothing to decorate right now</div>
          <p>Baked orders will show up here as soon as they're ready.</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div style={styles.grid}>
          {orders.map((order) => {
            const design = order.designInstruction;
            const due = getDueInfo(order.dispatchTime);
            const [statusBg, statusFg] = statusBadgeColors(order.status);
            return (
              <div key={order.orderId} className="cf-order-card" style={styles.card}>
                {design?.referenceImageUrl ? (
                  <img src={design.referenceImageUrl} alt="reference" style={styles.imageBox} />
                ) : (
                  <div style={styles.imagePlaceholder}>🎂</div>
                )}

                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <div style={styles.clientRow}>
                      <div style={styles.avatar}>{getInitials(order.clientName)}</div>
                      <div>
                        <h3 style={styles.clientName}>{order.clientName}</h3>
                        <div style={styles.clientMeta}>
                          {new Date(order.dispatchTime).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <span style={styles.badge(statusBg, statusFg)}>{order.status || "Baked"}</span>
                  </div>

                  <div style={styles.divider} />

                  {order.orderItems?.map((item, i) => (
                    <div key={i} style={styles.itemCard}>
                      <div style={styles.itemTop}>
                        <span style={styles.itemType}>
                          <span>{itemIcon(item.cakeType)}</span>
                          {item.cakeType}
                        </span>
                      </div>
                      <div style={styles.itemDetail}>{item.flavour} · {item.size}</div>
                      {item.notes && <div style={styles.notes}>{item.notes}</div>}
                    </div>
                  ))}

                  {(design?.designNotes || design?.colourScheme || design?.decoratorNotes) && (
                    <div style={styles.designWrap}>
                      <div style={styles.designChipRow}>
                        {design?.designNotes && <span style={styles.designChip}>🎭 {design.designNotes}</span>}
                        {design?.colourScheme && <span style={styles.designChip}>🎨 {design.colourScheme}</span>}
                      </div>
                      {design?.decoratorNotes && (
                        <div style={styles.designNote}>
                          <span style={styles.designNoteLabel}>Special requests:</span>
                          {design.decoratorNotes}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={styles.footerRow}>
                    <span style={{ ...styles.dueLabel, color: due.fg, fontWeight: 700 }}>{due.label}</span>
                    <button className="cf-mark-btn" style={styles.button} onClick={() => markAsReady(order.orderId)}>
                      Mark as Ready
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
