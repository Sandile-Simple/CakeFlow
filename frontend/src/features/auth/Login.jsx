import { useState } from "react";
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
};

const styles = {
  page: { minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" },
  card: { width: "100%", maxWidth: 380, background: COLORS.card, borderRadius: 16, padding: "36px 28px", boxShadow: "0 8px 24px rgba(233,30,99,0.12)" },
  heading: { color: COLORS.pinkDark, fontSize: 24, marginBottom: 4, textAlign: "center" },
  subheading: { color: "#9E7B85", fontSize: 13, textAlign: "center", marginBottom: 24 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginTop: 14, marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#FFFBFC" },
  button: { marginTop: 22, width: "100%", padding: 12, background: COLORS.pink, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  error: { background: "#FDECEA", color: "#C62828", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 14 },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token, role, name, branch, userId } = res.data;

      localStorage.setItem("cakeflow_token", token);
      localStorage.setItem("cakeflow_role", role);
      localStorage.setItem("cakeflow_name", name);
      localStorage.setItem("cakeflow_branch", branch);
      localStorage.setItem("cakeflow_userId", userId);

      if (role === "Baker") navigate("/baker");
      else if (role === "Decorator") navigate("/decorator");
      else if (role === "FrontDesk" || role === "Owner") navigate("/frontdesk");
      else navigate("/");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.heading}>CakeFlow Staff Login 🎂</h2>
        <p style={styles.subheading}>Sign in to access your dashboard</p>

        <label style={styles.label}>Email</label>
        <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}