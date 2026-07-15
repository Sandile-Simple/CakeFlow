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
  gold: "#FFC857",
};

const styles = {
  page: { minHeight: "100vh", background: COLORS.bg, padding: "24px 16px", fontFamily: "'Segoe UI', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 900, margin: "0 auto 20px" },
  title: { color: COLORS.pinkDark, fontSize: 24, margin: 0 },
  subtitle: { color: "#9E7B85", fontSize: 13, margin: 0 },
  logoutBtn: { background: "none", border: `1.5px solid ${COLORS.pink}`, color: COLORS.pink, borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" },
  grid: { maxWidth: 900, margin: "0 auto", display: "grid", gap: 16 },
  card: { background: COLORS.card, borderRadius: 14, padding: 20, boxShadow: "0 4px 14px rgba(233,30,99,0.08)", borderLeft: `5px solid ${COLORS.gold}` },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  clientName: { fontSize: 16, fontWeight: 700, color: COLORS.text, margin: 0 },
  contact: { fontSize: 13, color: "#9E7B85" },
  dispatchTime: { fontSize: 13, color: COLORS.pinkDark, fontWeight: 600 },
  itemRow: { fontSize: 14, color: COLORS.text, marginTop: 10 },
  itemLabel: { fontWeight: 600, color: "#9E7B85" },
  button: { marginTop: 14, background: COLORS.pink, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  empty: { textAlign: "center", color: "#9E7B85", marginTop: 60, fontSize: 15 },
  loading: { textAlign: "center", color: "#9E7B85", marginTop: 60 },
};

export default function FrontDeskDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const name = localStorage.getItem("cakeflow_name");
  const token = localStorage.getItem("cakeflow_token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async () => {
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
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchOrders();
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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Front Desk — Ready for Dispatch 📦</h2>
          <p style={styles.subtitle}>Welcome back, {name}</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
      </div>

      {loading && <p style={styles.loading}>Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <p style={styles.empty}>No orders ready for dispatch right now 🎉</p>
      )}

      <div style={styles.grid}>
        {orders.map((order) => (
          <div key={order.orderId} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <h3 style={styles.clientName}>{order.clientName}</h3>
                <div style={styles.contact}>{order.clientContact}</div>
              </div>
              <span style={styles.dispatchTime}>
                Due: {new Date(order.dispatchTime).toLocaleDateString()}
              </span>
            </div>

            {order.orderItems?.map((item, i) => (
              <div key={i} style={styles.itemRow}>
                <span style={styles.itemLabel}>{item.cakeType}</span> — {item.flavour}, {item.size}, Qty: {item.quantity}
              </div>
            ))}

            <button style={styles.button} onClick={() => markAsDispatched(order.orderId)}>
              Mark as Dispatched
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}