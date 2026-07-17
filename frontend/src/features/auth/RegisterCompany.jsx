import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5083/api"
  : "http://cakeflow.runasp.net/api";

const COLORS = {
  bg: "#FFF5F7",
  card: "#FFFFFF",
  pink: "#E91E63",
  pinkDark: "#C2185B",
  border: "#F3C4D3",
  text: "#3A2A2E",
  muted: "#9E7B85",
};

const styles = {
  page: { minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: "32px 16px" },
  card: { width: "100%", maxWidth: 480, background: COLORS.card, borderRadius: 16, padding: "36px 28px", boxShadow: "0 8px 24px rgba(233,30,99,0.12)" },
  logoWrap: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 },
  logoImg: { height: 56, marginBottom: 6, objectFit: "contain" },
  heading: { fontSize: 22, textAlign: "center", color: COLORS.pinkDark, margin: "0 0 4px" },
  subheading: { fontSize: 13, textAlign: "center", color: COLORS.muted, marginBottom: 22 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginTop: 14, marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none", boxSizing: "border-box" },
  button: { marginTop: 22, width: "100%", padding: 12, background: COLORS.pink, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  error: { background: "#FDECEA", color: "#C62828", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 14 },
  successWrap: { textAlign: "center" },
  loginLink: { display: "block", textAlign: "center", marginTop: 16, fontSize: 13, color: COLORS.pink, textDecoration: "none", fontWeight: 600 },
};

export default function RegisterCompany() {
  const [form, setForm] = useState({
    companyName: "",
    businessRegNumber: "",
    ownerName: "",
    ownerEmail: "",
    password: "",
    branch: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/company/register`, form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successWrap}>
            <div style={{ fontSize: 48 }}>📧</div>
            <h2 style={styles.heading}>Check your email</h2>
            <p style={{ ...styles.subheading, marginBottom: 0 }}>
              We've sent a verification link to <strong>{form.ownerEmail}</strong>.
              Click it to activate your CakeFlow account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.logoWrap}>
          <img src="/logo.png" alt="CakeFlow" style={styles.logoImg} onError={(e) => (e.target.style.display = "none")} />
        </div>
        <h2 style={styles.heading}>Register Your Company</h2>
        <p style={styles.subheading}>Set up CakeFlow for your bakery</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Company Name *</label>
        <input style={styles.input} value={form.companyName} onChange={(e) => set({ companyName: e.target.value })} required />

        <label style={styles.label}>Business Registration Number</label>
        <input style={styles.input} value={form.businessRegNumber} onChange={(e) => set({ businessRegNumber: e.target.value })} placeholder="Optional, if registered" />

        <label style={styles.label}>Your Name *</label>
        <input style={styles.input} value={form.ownerName} onChange={(e) => set({ ownerName: e.target.value })} required />

        <label style={styles.label}>Your Email *</label>
        <input style={styles.input} type="email" value={form.ownerEmail} onChange={(e) => set({ ownerEmail: e.target.value })} required />

        <label style={styles.label}>Password *</label>
        <input style={styles.input} type="password" value={form.password} onChange={(e) => set({ password: e.target.value })} required minLength={6} />

        <label style={styles.label}>Main Branch Name *</label>
        <input style={styles.input} value={form.branch} onChange={(e) => set({ branch: e.target.value })} placeholder="e.g. Bulawayo" required />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Registering..." : "Register Company"}
        </button>

        <Link to="/login" style={styles.loginLink}>Already have an account? Sign in</Link>
      </form>
    </div>
  );
}