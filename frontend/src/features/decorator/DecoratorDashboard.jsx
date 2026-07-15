import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5083/api";

const COLORS = {
  bg: "#FFF5F7",
  card: "#FFFFFF",
  pink: "#E91E63",
  pinkDark: "#C2185B",
  border: "#F3C4D3",
  text: "#3A2A2E",
  teal: "#00B4D8",
};

const styles = {
  page: { minHeight: "100vh", background: COLORS.bg, padding: "24px 16px", fontFamily: "'Segoe UI', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 900, margin: "0 auto 20px" },
  title: { color: COLORS.pinkDark, fontSize: 24, margin: 0 },
  subtitle: { color: "#9E7B85", fontSize: 13, margin: 0 },
  logoutBtn: { background: "none", border: `1.5px solid ${COLORS.pink}`, color: COLORS.pink, borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" },
  grid: { maxWidth: 900, margin: "0 auto", display: "grid", gap: 16 },
  card: { background: COLORS.card, borderRadius: 14, padding: 20, boxShadow: "0 4px 14px rgba(233,30,99,0.08)", borderLeft: `5px solid ${COLORS.teal}`, display: "flex", gap: 18 },
  imageBox: { width: 120, height: 120, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: `1.5px solid ${COLORS.border}` },
  imagePlaceholder: { width: 120, height: 120, borderRadius: 10, flexShrink: 0, background: "#FFF0F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: `1.5px solid ${COLORS.border}` },
  cardBody: { flex: 1 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  clientName: { fontSize: 16, fontWeight: 700, color: COLORS.text, margin: 0 },
  dispatchTime: { fontSize: 13, color: COLORS.pinkDark, fontWeight: 600 },
  itemRow: { fontSize: 14, color: COLORS.text, marginTop: 8 },
  itemLabel: { fontWeight: 600, color: "#9E7B85" },
  designRow: { fontSize: 13.5, color: COLORS.text, marginTop: 4 },
  designLabel: { fontWeight: 600, color: COLORS.teal },
  notes: { fontSize: 13, color: "#9E7B85", marginTop: 6, fontStyle: "italic" },
  button: { marginTop: 14, background: COLORS.teal, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  empty: { textAlign: "center", color: "#9E7B85", marginTop: 60, fontSize: 15 },
  loading: { textAlign: "center", color: "#9E7B85", marginTop: 60 },
};

export default function DecoratorDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const name = localStorage.getItem("cakeflow_name");
  const token = localStorage.getItem("cakeflow_token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async () => {
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
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchOrders();
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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Decorator Dashboard 🎨</h2>
          <p style={styles.subtitle}>Welcome back, {name}</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
      </div>

      {loading && <p style={styles.loading}>Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <p style={styles.empty}>No baked orders waiting to be decorated right now 🎉</p>
      )}

      <div style={styles.grid}>
        {orders.map((order) => {
          const design = order.designInstruction;
          return (
            <div key={order.orderId} style={styles.card}>
              {design?.referenceImageUrl ? (
                <img src={design.referenceImageUrl} alt="reference" style={styles.imageBox} />
              ) : (
                <div style={styles.imagePlaceholder}>🎂</div>
              )}

              <div style={styles.cardBody}>
                <div style={styles.cardTop}>
                  <h3 style={styles.clientName}>{order.clientName}</h3>
                  <span style={styles.dispatchTime}>
                    Due: {new Date(order.dispatchTime).toLocaleDateString()}
                  </span>
                </div>

                {order.orderItems?.map((item, i) => (
                  <div key={i} style={styles.itemRow}>
                    <span style={styles.itemLabel}>{item.cakeType}</span> — {item.flavour}, {item.size}
                    {item.notes && <div style={styles.notes}>{item.notes}</div>}
                  </div>
                ))}

                {design?.designNotes && (
                  <div style={styles.designRow}>
                    <span style={styles.designLabel}>Theme: </span>{design.designNotes}
                  </div>
                )}
                {design?.colourScheme && (
                  <div style={styles.designRow}>
                    <span style={styles.designLabel}>Colours: </span>{design.colourScheme}
                  </div>
                )}
                {design?.decoratorNotes && (
                  <div style={styles.designRow}>
                    <span style={styles.designLabel}>Special requests: </span>{design.decoratorNotes}
                  </div>
                )}

                <button style={styles.button} onClick={() => markAsReady(order.orderId)}>
                  Mark as Ready
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}