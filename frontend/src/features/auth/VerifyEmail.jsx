import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5083/api"
  : "http://cakeflow.runasp.net/api";

const COLORS = {
  bg: "#FFF5F7",
  card: "#FFFFFF",
  pink: "#E91E63",
  pinkDark: "#C2185B",
  muted: "#9E7B85",
  green: "#1E9E5A",
  red: "#D7373F",
};

const styles = {
  page: { minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: "32px 16px" },
  card: { width: "100%", maxWidth: 440, background: COLORS.card, borderRadius: 16, padding: "40px 28px", boxShadow: "0 8px 24px rgba(233,30,99,0.12)", textAlign: "center" },
  heading: { fontSize: 22, color: COLORS.pinkDark, margin: "14px 0 8px" },
  text: { fontSize: 14, color: COLORS.muted, marginBottom: 20 },
  loginBtn: { display: "inline-block", background: COLORS.pink, color: "#fff", border: "none", borderRadius: 10, padding: "11px 26px", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none" },
};

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    axios.get(`${API_BASE}/company/verify`, { params: { token } })
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified. You can now log in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data || "This verification link is invalid or has expired.");
      });
  }, [searchParams]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === "verifying" && (
          <>
            <div style={{ fontSize: 48 }}>⏳</div>
            <h2 style={styles.heading}>Verifying...</h2>
            <p style={styles.text}>Please wait a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ fontSize: 48 }}>✅</div>
            <h2 style={{ ...styles.heading, color: COLORS.green }}>Verified!</h2>
            <p style={styles.text}>{message}</p>
            <Link to="/login" style={styles.loginBtn}>Go to Login</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: 48 }}>⚠️</div>
            <h2 style={{ ...styles.heading, color: COLORS.red }}>Verification Failed</h2>
            <p style={styles.text}>{message}</p>
            <Link to="/register-company" style={styles.loginBtn}>Back to Registration</Link>
          </>
        )}
      </div>
    </div>
  );
}