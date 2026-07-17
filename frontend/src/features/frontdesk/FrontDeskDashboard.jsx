import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://cakeflow.runasp.net/api";

const COLORS = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  pink: "#E91E63",
  pinkDark: "#C2185B",
  pinkSoft: "#FDE6EF",
  gold: "#FFC857",
  goldDark: "#B9860F",
  goldSoft: "#FCF1D8",
  border: "#EFE6D6",
  text: "#2B241A",
  muted: "#8C8271",
  green: "#1E9E5A",
  greenSoft: "#E7F7EE",
  orange: "#E27A2F",
  orangeSoft: "#FCEEE1",
  red: "#D7373F",
  redSoft: "#FCEAEA",
  slateSoft: "#F5F1E8",
};

const styles = {
  page: { minHeight: "100vh", background: COLORS.bg, padding: "28px 20px 60px", fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" },

  header: { maxWidth: 1080, margin: "0 auto 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 },
  brandRow: { display: "flex", alignItems: "center", gap: 12 },
  brandIcon: { width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 12px rgba(185,134,15,0.28)" },
  title: { color: COLORS.text, fontSize: 21, margin: 0, fontWeight: 700, letterSpacing: -0.3 },
  subtitle: { color: COLORS.muted, fontSize: 13, margin: "2px 0 0" },
  headerActions: { display: "flex", alignItems: "center", gap: 10 },
  refreshBtn: { background: "#fff", border: `1.5px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  logoutBtn: { background: "none", border: `1.5px solid ${COLORS.pink}`, color: COLORS.pink, borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  statsRow: { maxWidth: 1080, margin: "0 auto 26px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 },
  statCard: { background: COLORS.card, borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px rgba(43,36,26,0.05)", border: `1px solid ${COLORS.border}` },
  statLabel: { fontSize: 12.5, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 },
  statValue: { fontSize: 28, fontWeight: 800, color: COLORS.text, marginTop: 6 },

  sectionHeadRow: { maxWidth: 1080, margin: "0 auto 14px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  sectionHead: { fontSize: 15, fontWeight: 700, color: COLORS.text, margin: 0 },
  sectionCount: { fontSize: 12.5, color: COLORS.muted },

  grid: { maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },

  card: { background: COLORS.card, borderRadius: 16, padding: "18px 20px 16px", boxShadow: "0 2px 12px rgba(43,36,26,0.06)", border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  clientRow: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: "50%", background: COLORS.goldSoft, color: COLORS.goldDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 },
  clientName: { fontSize: 15.5, fontWeight: 700, color: COLORS.text, margin: 0 },
  contactRow: { fontSize: 12.5, color: COLORS.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 5 },
  contactLink: { color: COLORS.goldDark, textDecoration: "none", fontWeight: 600 },

  badge: (bg, fg) => ({ background: bg, color: fg, fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 999, whiteSpace: "nowrap" }),

  divider: { height: 1, background: COLORS.border, margin: "14px 0 12px" },

  itemCard: { background: COLORS.slateSoft, borderRadius: 10, padding: "10px 12px", marginBottom: 8 },
  itemTop: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5 },
  itemType: { fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 },
  itemQty: { fontSize: 12, color: COLORS.muted, fontWeight: 600 },
  itemDetail: { fontSize: 12.5, color: COLORS.muted, marginTop: 3 },

  footerRow: { marginTop: "auto", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" },
  dueLabel: { fontSize: 12, color: COLORS.muted },
  button: { background: COLORS.goldDark, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(185,134,15,0.28)" },

  empty: { maxWidth: 1080, margin: "70px auto 0", textAlign: "center", color: COLORS.muted },
  emptyIcon: { fontSize: 46, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 4 },

  skeletonGrid: { maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  skeletonCard: { background: COLORS.card, borderRadius: 16, padding: 20, border: `1px solid ${COLORS.border}`, height: 180 },
};

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDueInfo(dispatchTime) {
  if (!dispatchTime) return { label: "No date", bg: COLORS.slateSoft, fg: COLORS.muted, days: null };
  const due = new Date(dispatchTime);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / 86400000);

  if (diffDays < 0) return { label: `Overdue ${Math.abs(diffDays)}d`, bg: COLORS.redSoft, fg: COLORS.red, days: diffDays };
  if (diffDays === 0) return { label: "Due Today", bg: COLORS.orangeSoft, fg: COLORS.orange, days: diffDays };
  if (diffDays === 1) return { label: "Due Tomorrow", bg: COLORS.orangeSoft, fg: COLORS.orange, days: diffDays };
  return { label: `Due in ${diffDays}d`, bg: COLORS.greenSoft, fg: COLORS.green, days: diffDays };
}

function itemIcon(cakeType) {
  const t = (cakeType || "").toLowerCase();
  if (t.includes("cupcake")) return "🧁";
  if (t.includes("wedding")) return "💍";
  return "🎂";
}

function isPhoneLike(contact) {
  return !!contact && /^[+\d][\d\s()-]{5,}$/.test(contact.trim());
}

export default function FrontDeskDashboard() {
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
      const ready = res.data
        .filter((o) => o.status === "Ready")
        .sort((a, b) => new Date(a.dispatchTime) - new Date(b.dispatchTime));
      setOrders(ready);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
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

  const markAsDispatched = async (orderId) => {
    try {
      await axios.put(`${API_BASE}/orders/${orderId}/status`, "Dispatched", {
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
        .cf-order-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(43,36,26,0.10); }
        .cf-mark-btn { transition: background .15s ease, transform .1s ease; }
        .cf-mark-btn:hover { background: #96700c; }
        .cf-mark-btn:active { transform: scale(0.97); }
        .cf-refresh-btn:hover { border-color: ${COLORS.goldDark}; color: ${COLORS.goldDark}; }
        .cf-logout-btn:hover { background: ${COLORS.pink}; color: #fff; }
      `}</style>

      <div style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.brandIcon}>📦</div>
          <div>
            <h2 style={styles.title}>Front Desk — Ready for Dispatch</h2>
            <p style={styles.subtitle}>Welcome back, {name || "there"}</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button className="cf-refresh-btn" style={styles.refreshBtn} onClick={() => fetchOrders({ showRefresh: true })} disabled={refreshing}>
            <span style={{ display: "inline-block", transform: refreshing ? "rotate(180deg)" : "none", transition: "transform .3s" }}>⟳</span>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button className="cf-logout-btn" style={styles.logoutBtn} onClick={() => navigate("/reports")}>📊 Reports</button>
	  <button className="cf-logout-btn" style={styles.logoutBtn} onClick={() => navigate("/analytics")}>📈 Analytics</button>
          <button className="cf-logout-btn" style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
	     <button className="cf-logout-btn" style={styles.logoutBtn} onClick={() => navigate("/invite-staff")}>👥 Invite Staff</button>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Ready for Dispatch</div>
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
        <h3 style={styles.sectionHead}>Orders Ready for Collection</h3>
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
          <div style={styles.emptyTitle}>Nothing waiting on the counter</div>
          <p>Orders will appear here as soon as they're ready for dispatch.</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div style={styles.grid}>
          {orders.map((order) => {
            const due = getDueInfo(order.dispatchTime);
            return (
              <div key={order.orderId} className="cf-order-card" style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.clientRow}>
                    <div style={styles.avatar}>{getInitials(order.clientName)}</div>
                    <div>
                      <h3 style={styles.clientName}>{order.clientName}</h3>
                      {order.clientContact && (
                        <div style={styles.contactRow}>
                          📞{" "}
                          {isPhoneLike(order.clientContact) ? (
                            <a href={`tel:${order.clientContact}`} style={styles.contactLink}>{order.clientContact}</a>
                          ) : (
                            order.clientContact
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={styles.badge(due.bg, due.fg)}>{due.label}</span>
                </div>

                <div style={styles.divider} />

                {order.orderItems?.map((item, i) => (
                  <div key={i} style={styles.itemCard}>
                    <div style={styles.itemTop}>
                      <span style={styles.itemType}>
                        <span>{itemIcon(item.cakeType)}</span>
                        {item.cakeType}
                      </span>
                      <span style={styles.itemQty}>Qty: {item.quantity}</span>
                    </div>
                    <div style={styles.itemDetail}>{item.flavour} · {item.size}</div>
                  </div>
                ))}

                <div style={styles.footerRow}>
                  <span style={styles.dueLabel}>
                    Due {new Date(order.dispatchTime).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <button className="cf-mark-btn" style={styles.button} onClick={() => markAsDispatched(order.orderId)}>
                    Mark as Dispatched
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
