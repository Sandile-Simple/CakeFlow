import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.png";

const API_BASE = "http://cakeflow.runasp.net/api";

const MIN_BRANCHES = 1;
const MAX_BRANCHES = 20;

const COLORS = {
  bg: "#FFF5F7",
  card: "#FFFFFF",
  pink: "#E91E63",
  pinkDark: "#C2185B",
  pinkSoft: "#FDE6EF",
  border: "#F3C4D3",
  text: "#3A2A2E",
  muted: "#9E7B85",
};

const styles = {
  page: { minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: "32px 16px" },
  card: { width: "100%", maxWidth: 420, background: COLORS.card, borderRadius: 16, padding: "36px 28px", boxShadow: "0 8px 24px rgba(233,30,99,0.12)" },
  wideCard: { width: "100%", maxWidth: 640, background: COLORS.card, borderRadius: 16, padding: "36px 28px", boxShadow: "0 8px 24px rgba(233,30,99,0.12)" },

  logoWrap: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 },
  logoImg: { height: 56, marginBottom: 6, objectFit: "contain" },
  logoTextWrap: { display: "flex", alignItems: "baseline", fontFamily: "Georgia, serif", fontSize: 30 },
  logoTextCake: { color: COLORS.text },
  logoTextFlow: { color: COLORS.pink },
  logoEmoji: { fontSize: 34, marginBottom: 4 },

  tabRow: { display: "flex", background: COLORS.pinkSoft, borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: (active) => ({
    flex: 1,
    textAlign: "center",
    padding: "9px 0",
    borderRadius: 9,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    color: active ? "#fff" : COLORS.pinkDark,
    background: active ? COLORS.pink : "transparent",
    transition: "all .15s",
  }),

  heading: { color: COLORS.pinkDark, fontSize: 22, marginBottom: 4, textAlign: "center" },
  subheading: { color: COLORS.muted, fontSize: 13, textAlign: "center", marginBottom: 20 },

  sectionTitle: { fontSize: 14, fontWeight: 700, color: COLORS.text, marginTop: 22, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: COLORS.muted, marginBottom: 10 },

  label: { display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginTop: 14, marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#FFFBFC" },
  numberInput: { width: 90, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none", background: "#FFFBFC" },

  branchGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 },
  branchCard: { border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 14px 6px", marginTop: 12, background: "#FFFBFC" },
  branchTitle: { fontSize: 13, fontWeight: 700, color: COLORS.pinkDark, marginBottom: 4 },

  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  button: { marginTop: 22, width: "100%", padding: 12, background: COLORS.pink, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  buttonDisabled: { marginTop: 22, width: "100%", padding: 12, background: "#F0C7D6", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "not-allowed" },

  error: { background: "#FDECEA", color: "#C62828", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 14 },
  success: { background: "#E9F7EF", color: "#1E7E44", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 14 },
  smallNote: { fontSize: 12, color: COLORS.muted, marginTop: 6 },
};

function Logo() {
  return (
    <div style={styles.logoWrap}>
      <img src="/logo.png" alt="CakeFlow by Fairy" style={styles.logoImg} />
    </div>
  );
}

function emptyBranch() {
  return { name: "", address: "", phone: "" };
}

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const navigate = useNavigate();

  // ---------- LOGIN STATE ----------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
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
      else if (role === "Developer") navigate("/analytics");
      else navigate("/");
    } catch (err) {
      setLoginError("Invalid email or password.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ---------- REGISTER STATE ----------
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerConfirmPassword, setOwnerConfirmPassword] = useState("");

  const [branchCount, setBranchCount] = useState(1);
  const [branches, setBranches] = useState([emptyBranch()]);

  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleBranchCountChange = (raw) => {
    let n = parseInt(raw, 10);
    if (isNaN(n)) n = "";
    setBranchCount(n);

    if (n === "" || n < MIN_BRANCHES) return;
    const clamped = Math.min(n, MAX_BRANCHES);

    setBranches((prev) => {
      const next = [...prev];
      if (clamped > next.length) {
        while (next.length < clamped) next.push(emptyBranch());
      } else if (clamped < next.length) {
        next.length = clamped;
      }
      return next;
    });
  };

  const updateBranch = (index, field, value) => {
    setBranches((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const registerFormValid = () => {
    const n = Number(branchCount);
    return (
      companyName.trim() !== "" &&
      companyEmail.trim() !== "" &&
      companyPhone.trim() !== "" &&
      ownerName.trim() !== "" &&
      ownerEmail.trim() !== "" &&
      ownerPassword.length >= 6 &&
      ownerPassword === ownerConfirmPassword &&
      n >= MIN_BRANCHES &&
      n <= MAX_BRANCHES &&
      branches.length === n &&
      branches.every((b) => b.name.trim() !== "")
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");

    if (ownerPassword !== ownerConfirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }
    if (ownerPassword.length < 6) {
      setRegisterError("Password must be at least 6 characters.");
      return;
    }
    if (!registerFormValid()) {
      setRegisterError("Please fill in all required fields, including a name for every branch.");
      return;
    }

    setRegisterLoading(true);
    try {
      const payload = {
        companyName,
        companyEmail,
        companyPhone,
        owner: {
          name: ownerName,
          email: ownerEmail,
          password: ownerPassword,
        },
        branches: branches.map((b) => ({
          name: b.name,
          address: b.address,
          phone: b.phone,
        })),
      };

      await axios.post(`${API_BASE}/companies/register`, payload);

      setRegisterSuccess("Your company has been registered! You can now sign in below.");
      setCompanyName("");
      setCompanyEmail("");
      setCompanyPhone("");
      setOwnerName("");
      setOwnerPassword("");
      setOwnerConfirmPassword("");
      setBranchCount(1);
      setBranches([emptyBranch()]);

      setEmail(ownerEmail);
      setOwnerEmail("");
      setTimeout(() => setMode("login"), 1200);
    } catch (err) {
      setRegisterError(
        err?.response?.data?.message || "Something went wrong registering your company. Please try again."
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  // ---------- RENDER ----------
  return (
    <div style={styles.page}>
      <div style={mode === "register" ? styles.wideCard : styles.card}>
        <Logo />

        <div style={styles.tabRow}>
          <div style={styles.tab(mode === "login")} onClick={() => setMode("login")}>
            Sign In
          </div>
          <div style={styles.tab(mode === "register")} onClick={() => setMode("register")}>
            Register Company
          </div>
        </div>

        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <h2 style={styles.heading}>Staff Login</h2>
            <p style={styles.subheading}>Sign in to access your dashboard</p>

            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {loginError && <div style={styles.error}>{loginError}</div>}

            <button type="submit" style={loginLoading ? styles.buttonDisabled : styles.button} disabled={loginLoading}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister}>
            <h2 style={styles.heading}>Register Your Company</h2>
            <p style={styles.subheading}>Set up your bakery and configure your branches</p>

            <div style={styles.sectionTitle}>Company Details</div>
            <div style={styles.sectionSub}>Basic information about your business</div>

            <label style={styles.label}>Company Name *</label>
            <input style={styles.input} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Fairy Cakes (Pvt) Ltd" required />

            <div style={styles.row2}>
              <div>
                <label style={styles.label}>Company Email *</label>
                <input style={styles.input} type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} required />
              </div>
              <div>
                <label style={styles.label}>Company Phone *</label>
                <input style={styles.input} value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} required />
              </div>
            </div>

            <div style={styles.sectionTitle}>Owner Account</div>
            <div style={styles.sectionSub}>This account will have full access to manage the company</div>

            <label style={styles.label}>Full Name *</label>
            <input style={styles.input} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />

            <label style={styles.label}>Email *</label>
            <input style={styles.input} type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required />

            <div style={styles.row2}>
              <div>
                <label style={styles.label}>Password *</label>
                <input style={styles.input} type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} required />
              </div>
              <div>
                <label style={styles.label}>Confirm Password *</label>
                <input style={styles.input} type="password" value={ownerConfirmPassword} onChange={(e) => setOwnerConfirmPassword(e.target.value)} required />
              </div>
            </div>
            {ownerPassword && ownerPassword.length < 6 && (
              <p style={styles.smallNote}>Password must be at least 6 characters.</p>
            )}
            {ownerConfirmPassword && ownerPassword !== ownerConfirmPassword && (
              <p style={styles.smallNote}>Passwords do not match.</p>
            )}

            <div style={styles.sectionTitle}>Branches</div>
            <div style={styles.sectionSub}>How many branches does your company have?</div>

            <input
              style={styles.numberInput}
              type="number"
              min={MIN_BRANCHES}
              max={MAX_BRANCHES}
              value={branchCount}
              onChange={(e) => handleBranchCountChange(e.target.value)}
            />
            <p style={styles.smallNote}>Between {MIN_BRANCHES} and {MAX_BRANCHES} branches.</p>

            {branches.map((b, i) => (
              <div key={i} style={styles.branchCard}>
                <div style={styles.branchTitle}>Branch {i + 1}</div>
                <label style={styles.label}>Branch Name *</label>
                <input
                  style={styles.input}
                  value={b.name}
                  onChange={(e) => updateBranch(i, "name", e.target.value)}
                  placeholder={`e.g. ${i === 0 ? "Harare" : "Bulawayo"} Branch`}
                  required
                />
                <div style={styles.row2}>
                  <div>
                    <label style={styles.label}>Address</label>
                    <input style={styles.input} value={b.address} onChange={(e) => updateBranch(i, "address", e.target.value)} />
                  </div>
                  <div>
                    <label style={styles.label}>Branch Phone</label>
                    <input style={styles.input} value={b.phone} onChange={(e) => updateBranch(i, "phone", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            {registerError && <div style={styles.error}>{registerError}</div>}
            {registerSuccess && <div style={styles.success}>{registerSuccess}</div>}

            <button
              type="submit"
              style={!registerFormValid() || registerLoading ? styles.buttonDisabled : styles.button}
              disabled={!registerFormValid() || registerLoading}
            >
              {registerLoading ? "Registering..." : "Register Company"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}