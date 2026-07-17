import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5083/api"
  : "http://cakeflow.runasp.net/api";

const COLORS = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  pink: "#E91E63",
  pinkDark: "#C2185B",
  gold: "#FFC857",
  goldDark: "#B9860F",
  border: "#EFE6D6",
  text: "#2B241A",
  muted: "#8C8271",
};

const ROLES = ["Baker", "Decorator", "FrontDesk", "Owner"];

const s = {
  page: { minHeight: "100vh", background: COLORS.bg, padding: "28px 20px 60px", fontFamily: "'Segoe UI', sans-serif" },
  header: { maxWidth: 520, margin: "0 auto 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { color: COLORS.text, fontSize: 21, margin: 0, fontWeight: 700 },
  backBtn: { background: "#fff", border: `1.5px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  card: { maxWidth: 520, margin: "0 auto", background: COLORS.card, borderRadius: 16, padding: "28px 26px", boxShadow: "0 2px 12px rgba(43,36,26,0.06)", border: `1px solid ${COLORS.border}` },
  label: { display: "block", fontSize: 13, fontWeight: 700, color: COLORS.text, margin: "16px 0 6px" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff" },
  button: { marginTop: 22, width: "100%", padding: 12, background: COLORS.goldDark, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  error: { background: "#FDECEA", color: "#C62828", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 14 },
  success: { background: "#E7F7EE", color: "#1E9E5A", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 14 },
};

export default function InviteStaff() {
  const [form, setForm] = useState({ name: "", email: "", role: "Baker", branch: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("cakeflow_token");

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/company/invite-staff`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(res.data.message || "Invitation sent successfully.");
      setForm({ name: "", email: "", role: "Baker", branch: "" });
    } catch (err) {
      setError(err.response?.data || "Something went wrong sending the invite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>Invite Staff 👥</h2>
        <button style={s.backBtn} onClick={() => navigate("/frontdesk")}>← Dashboard</button>
      </div>

      <form onSubmit={handleSubmit} style={s.card}>
        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <label style={s.label}>Full Name *</label>
        <input style={s.input} value={form.name} onChange={(e) => set({ name: e.target.value })} required />

        <label style={s.label}>Email *</label>
        <input style={s.input} type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} required />

        <label style={s.label}>Role *</label>
        <select style={s.select} value={form.role} onChange={(e) => set({ role: e.target.value })}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <label style={s.label}>Branch *</label>
        <input style={s.input} value={form.branch} onChange={(e) => set({ branch: e.target.value })} placeholder="e.g. Bulawayo" required />

        <button type="submit" style={s.button} disabled={loading}>
          {loading ? "Sending invite..." : "Send Invite"}
        </button>
      </form>
    </div>
  );
}