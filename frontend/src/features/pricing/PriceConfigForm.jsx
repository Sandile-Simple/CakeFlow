import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5083/api"
  : "http://cakeflow.runasp.net/api";

const COLORS = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  gold: "#B9860F",
  goldSoft: "#FCF1D8",
  border: "#EFE6D6",
  text: "#2B241A",
  muted: "#8C8271",
  green: "#1E9E5A",
  red: "#D7373F",
};

const s = {
  page: { minHeight: "100vh", background: COLORS.bg, padding: "28px 20px 60px", fontFamily: "'Segoe UI', sans-serif" },
  header: { maxWidth: 640, margin: "0 auto 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { color: COLORS.text, fontSize: 21, margin: 0, fontWeight: 700 },
  backBtn: { background: "#fff", border: `1.5px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  card: { maxWidth: 640, margin: "0 auto", background: COLORS.card, borderRadius: 16, padding: "26px", boxShadow: "0 2px 12px rgba(43,36,26,0.06)", border: `1px solid ${COLORS.border}` },
  sectionTitle: { fontSize: 14.5, fontWeight: 700, color: COLORS.gold, margin: "22px 0 10px", textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 6 },
  row: { display: "grid", gridTemplateColumns: "1fr 110px", gap: 12, alignItems: "center", marginBottom: 10 },
  rowLabel: { fontSize: 13.5, color: COLORS.text },
  input: { padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`, fontSize: 13.5, outline: "none", textAlign: "right" },
  saveBtn: { marginTop: 24, width: "100%", padding: 13, background: COLORS.gold, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  message: (isError) => ({
    background: isError ? "#FDECEA" : "#E7F7EE",
    color: isError ? COLORS.red : COLORS.green,
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  }),
  loading: { textAlign: "center", color: COLORS.muted, marginTop: 60 },
};

const ROUND_SIZES = [8, 10, 12, 14, 16];
const SQUARE_SIZES = [8, 10, 12, 14, 16];

// Default shape for the config object. Any field missing from a saved
// config (e.g. because it was added after that config was last saved)
// falls back to these values instead of crashing the form.
const DEFAULT_CONFIG = {
  roundSizes: { 8: 0, 10: 0, 12: 0, 14: 0, 16: 0 },
  squareSizes: { 8: 0, 10: 0, 12: 0, 14: 0, 16: 0 },
  threeDStartingPrice: 0,
  cakeFairyCakePrice: 0,
  tieredCakeStartingPrice: 0,
  weddingStartingPrice: 0,
  buttercreamIcingFee: 0,
  themedFondantSizePrices: { 8: 0, 10: 0, 12: 0, 14: 0, 16: 0 },
  extraFlavorFee: 0,
  accessoriesFee: 0,
  cupcakePlainPrice: 0,
  cupcakeThemedPrice: 0,
};

export default function PriceConfigForm() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("cakeflow_token");
  const role = localStorage.getItem("cakeflow_role");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (role !== "Owner") { navigate("/frontdesk"); return; }
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API_BASE}/priceconfig`);
      const parsed = JSON.parse(res.data.configJson);
      setConfig({
        ...DEFAULT_CONFIG,
        ...parsed,
        roundSizes: { ...DEFAULT_CONFIG.roundSizes, ...parsed.roundSizes },
        squareSizes: { ...DEFAULT_CONFIG.squareSizes, ...parsed.squareSizes },
        themedFondantSizePrices: { ...DEFAULT_CONFIG.themedFondantSizePrices, ...parsed.themedFondantSizePrices },
      });
    } catch (err) {
      setMessage({ text: "Failed to load current prices.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const setField = (path, value) => {
    setConfig((prev) => {
      const next = { ...prev };
      if (path.length === 1) {
        next[path[0]] = value;
      } else {
        next[path[0]] = { ...next[path[0]], [path[1]]: value };
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await axios.put(
        `${API_BASE}/priceconfig`,
        { configJson: JSON.stringify(config) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: "Prices saved — the booking form will use these immediately.", isError: false });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to save prices.", isError: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={s.page}><p style={s.loading}>Loading price settings...</p></div>;
  if (!config) return null;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>Price Configuration 💰</h2>
        <button style={s.backBtn} onClick={() => navigate("/frontdesk")}>← Dashboard</button>
      </div>

      <div style={s.card}>
        {message && <div style={s.message(message.isError)}>{message.text}</div>}

        <div style={s.sectionTitle}>Round Cakes (per inch size)</div>
        {ROUND_SIZES.map((size) => (
          <div key={size} style={s.row}>
            <span style={s.rowLabel}>{size} inches</span>
            <input
              style={s.input}
              type="number"
              value={config.roundSizes[size]}
              onChange={(e) => setField(["roundSizes", String(size)], Number(e.target.value))}
            />
          </div>
        ))}

        <div style={s.sectionTitle}>Square Cakes (per inch size)</div>
        {SQUARE_SIZES.map((size) => (
          <div key={size} style={s.row}>
            <span style={s.rowLabel}>{size} inches</span>
            <input
              style={s.input}
              type="number"
              value={config.squareSizes[size]}
              onChange={(e) => setField(["squareSizes", String(size)], Number(e.target.value))}
            />
          </div>
        ))}

        <div style={s.sectionTitle}>Other Cake Types</div>
        <div style={s.row}>
          <span style={s.rowLabel}>3D Cakes — starting price</span>
          <input style={s.input} type="number" value={config.threeDStartingPrice} onChange={(e) => setField(["threeDStartingPrice"], Number(e.target.value))} />
        </div>
        <div style={s.row}>
          <span style={s.rowLabel}>Cake Fairy Cake — flat price</span>
          <input style={s.input} type="number" value={config.cakeFairyCakePrice} onChange={(e) => setField(["cakeFairyCakePrice"], Number(e.target.value))} />
        </div>
        <div style={s.row}>
          <span style={s.rowLabel}>Tiered Cake — starting price</span>
          <input style={s.input} type="number" value={config.tieredCakeStartingPrice} onChange={(e) => setField(["tieredCakeStartingPrice"], Number(e.target.value))} />
        </div>
        <div style={s.row}>
          <span style={s.rowLabel}>Wedding Cake — starting price</span>
          <input style={s.input} type="number" value={config.weddingStartingPrice} onChange={(e) => setField(["weddingStartingPrice"], Number(e.target.value))} />
        </div>

        <div style={s.sectionTitle}>Themed Cake Icing Rules</div>
        <div style={s.row}>
          <span style={s.rowLabel}>Buttercream — extra fee</span>
          <input style={s.input} type="number" value={config.buttercreamIcingFee} onChange={(e) => setField(["buttercreamIcingFee"], Number(e.target.value))} />
        </div>
        <p style={{ fontSize: 12.5, color: COLORS.muted, margin: "4px 0 8px" }}>
          Fondant icing on Themed Cakes overrides the size price below (flat price per size):
        </p>
        {ROUND_SIZES.map((size) => (
          <div key={size} style={s.row}>
            <span style={s.rowLabel}>Fondant — {size} inches</span>
            <input
              style={s.input}
              type="number"
              value={config.themedFondantSizePrices[size]}
              onChange={(e) => setField(["themedFondantSizePrices", String(size)], Number(e.target.value))}
            />
          </div>
        ))}

        <div style={s.sectionTitle}>General Fees</div>
        <div style={s.row}>
          <span style={s.rowLabel}>Extra flavour fee</span>
          <input style={s.input} type="number" value={config.extraFlavorFee} onChange={(e) => setField(["extraFlavorFee"], Number(e.target.value))} />
        </div>
        <div style={s.row}>
          <span style={s.rowLabel}>Accessories flat fee</span>
          <input style={s.input} type="number" value={config.accessoriesFee} onChange={(e) => setField(["accessoriesFee"], Number(e.target.value))} />
        </div>

        <div style={s.sectionTitle}>Cupcakes (per unit)</div>
        <div style={s.row}>
          <span style={s.rowLabel}>Plain</span>
          <input style={s.input} type="number" step="0.5" value={config.cupcakePlainPrice} onChange={(e) => setField(["cupcakePlainPrice"], Number(e.target.value))} />
        </div>
        <div style={s.row}>
          <span style={s.rowLabel}>Themed</span>
          <input style={s.input} type="number" step="0.5" value={config.cupcakeThemedPrice} onChange={(e) => setField(["cupcakeThemedPrice"], Number(e.target.value))} />
        </div>

        <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Prices"}
        </button>
      </div>
    </div>
  );
}