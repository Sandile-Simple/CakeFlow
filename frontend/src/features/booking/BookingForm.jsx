import { useState } from "react";
import axios from "axios";

const API_BASE = "http://cakeflow.runasp.net/api";

const COLORS = {
  bg: "#FFF5F7",
  card: "#FFFFFF",
  pink: "#E91E63",
  pinkDark: "#C2185B",
  border: "#F3C4D3",
  text: "#3A2A2E",
};

const styles = {
  page: { minHeight: "100vh", background: COLORS.bg, padding: "40px 16px", fontFamily: "'Segoe UI', sans-serif" },
  card: { maxWidth: 640, margin: "0 auto", background: COLORS.card, borderRadius: 16, padding: "32px 28px", boxShadow: "0 8px 24px rgba(233,30,99,0.12)" },
  heading: { color: COLORS.pinkDark, fontSize: 26, marginBottom: 4, textAlign: "center" },
  subheading: { color: "#9E7B85", fontSize: 14, textAlign: "center", marginBottom: 20 },
  sectionTitle: { color: COLORS.pinkDark, fontSize: 14, fontWeight: 700, marginTop: 22, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 6 },
  label: { display: "block", fontSize: 12.5, fontWeight: 600, color: COLORS.text, marginBottom: 6 },
  input: { width: "100%", padding: "9px 11px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 13.5, outline: "none", boxSizing: "border-box", background: "#FFFBFC" },
  textarea: { width: "100%", padding: "9px 11px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 13.5, outline: "none", boxSizing: "border-box", resize: "vertical", background: "#FFFBFC" },
  radioRow: { display: "flex", gap: 16, marginTop: 6 },
  radioLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: COLORS.text, cursor: "pointer" },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 },
  field: {},
  button: { marginTop: 20, width: "100%", padding: 13, background: COLORS.pink, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  error: { background: "#FDECEA", color: "#C62828", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 8 },
  preview: { width: "100%", marginTop: 10, borderRadius: 10, border: `1.5px solid ${COLORS.border}` },
  successCard: { maxWidth: 480, margin: "0 auto", background: COLORS.card, borderRadius: 16, padding: "48px 28px", textAlign: "center", boxShadow: "0 8px 24px rgba(233,30,99,0.12)" },
};

const ORDER_TYPES = ["Cake", "Cupcakes", "Chocolate Bouquet"];

export default function BookingForm() {
  const [form, setForm] = useState({
    orderType: "Cake",
    flavour: "",
    filling: "",
    icing: "",
    shape: "",
    size: "",
    preferredColours: "",
    dateDue: "",
    time: "",
    theme: "",
    message: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    heardAboutUs: "",
    specialRequests: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.contactPerson || !form.contactNumber || !form.dateDue) {
      setError("Please fill in your name, contact number, and date due.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (form.dateDue < today) {
      setError("Date due cannot be in the past.");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const imgForm = new FormData();
        imgForm.append("file", imageFile);
        const uploadRes = await axios.post(`${API_BASE}/upload/image`, imgForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.url;
      }

      const itemNotes = [
        form.filling && `Filling: ${form.filling}`,
        form.icing && `Icing: ${form.icing}`,
        form.shape && `Shape: ${form.shape}`,
        form.message && `Message on cake: ${form.message}`,
        form.email && `Email: ${form.email}`,
        form.heardAboutUs && `Heard about us via: ${form.heardAboutUs}`,
      ].filter(Boolean).join(" | ");

      const orderPayload = {
        clientName: form.contactPerson,
        clientContact: form.contactNumber,
        eventDate: form.dateDue,
        dispatchTime: form.dateDue,
        branch: "Bulawayo",
        orderItems: [
          {
            cakeType: form.orderType,
            flavour: form.flavour,
            size: form.size,
            quantity: 1,
            notes: itemNotes,
          },
        ],
        designInstruction: {
          referenceImageUrl: imageUrl,
          designNotes: form.theme,
          colourScheme: form.preferredColours,
          decoratorNotes: form.specialRequests,
        },
      };

      await axios.post(`${API_BASE}/orders`, orderPayload);
      setSuccess(true);
    } catch (err) {
      setError("Something went wrong submitting your order. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={{ fontSize: 48 }}>🎂</div>
          <h2 style={{ color: COLORS.pinkDark, marginTop: 12 }}>Order Received!</h2>
          <p style={{ color: "#9E7B85" }}>
            Thank you — we've got your order and will be in touch to confirm details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.heading}>Order Your Cake 🎂</h2>
        <p style={styles.subheading}>Tell us what you'd like and we'll take it from there</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.sectionTitle}>Order Type</div>
        <div style={styles.radioRow}>
          {ORDER_TYPES.map((type) => (
            <label key={type} style={styles.radioLabel}>
              <input
                type="radio"
                name="orderType"
                value={type}
                checked={form.orderType === type}
                onChange={handleChange}
              />
              {type}
            </label>
          ))}
        </div>

        <div style={styles.sectionTitle}>Cake Details</div>

        <div style={styles.row3}>
          <div>
            <label style={styles.label}>Flavour</label>
            <input style={styles.input} name="flavour" value={form.flavour} onChange={handleChange} placeholder="Chocolate" />
          </div>
          <div>
            <label style={styles.label}>Filling</label>
            <input style={styles.input} name="filling" value={form.filling} onChange={handleChange} placeholder="Vanilla cream" />
          </div>
          <div>
            <label style={styles.label}>Icing</label>
            <input style={styles.input} name="icing" value={form.icing} onChange={handleChange} placeholder="Buttercream" />
          </div>
        </div>

        <div style={styles.row3}>
          <div>
            <label style={styles.label}>Shape</label>
            <input style={styles.input} name="shape" value={form.shape} onChange={handleChange} placeholder="Round" />
          </div>
          <div>
            <label style={styles.label}>Size</label>
            <input style={styles.input} name="size" value={form.size} onChange={handleChange} placeholder="Serves 20" />
          </div>
          <div>
            <label style={styles.label}>Preferred Colours</label>
            <input style={styles.input} name="preferredColours" value={form.preferredColours} onChange={handleChange} placeholder="Pink & gold" />
          </div>
        </div>

        <label style={styles.label}>Message on Cake</label>
        <input style={{ ...styles.input, marginBottom: 4 }} name="message" value={form.message} onChange={handleChange} placeholder="e.g. Happy Birthday Tanya" />

        <div style={styles.sectionTitle}>Occasion</div>
        <div style={styles.row3}>
          <div>
            <label style={styles.label}>Date Due *</label>
            <input style={styles.input} name="dateDue" type="date" value={form.dateDue} onChange={handleChange} required />
          </div>
          <div>
            <label style={styles.label}>Time</label>
            <input style={styles.input} name="time" type="time" value={form.time} onChange={handleChange} />
          </div>
          <div>
            <label style={styles.label}>Theme</label>
            <input style={styles.input} name="theme" value={form.theme} onChange={handleChange} placeholder="Princess" />
          </div>
        </div>

        <div style={styles.sectionTitle}>Your Details</div>
        <div style={styles.row3}>
          <div>
            <label style={styles.label}>Contact Person *</label>
            <input style={styles.input} name="contactPerson" value={form.contactPerson} onChange={handleChange} required />
          </div>
          <div>
            <label style={styles.label}>Contact Number *</label>
            <input style={styles.input} name="contactNumber" value={form.contactNumber} onChange={handleChange} required />
          </div>
          <div>
            <label style={styles.label}>Email</label>
            <input style={styles.input} name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
        </div>

        <div style={styles.row2}>
          <div>
            <label style={styles.label}>How did you hear about us?</label>
            <input style={styles.input} name="heardAboutUs" value={form.heardAboutUs} onChange={handleChange} placeholder="Facebook, referral..." />
          </div>
          <div>
            <label style={styles.label}>Special Requests</label>
            <textarea style={{ ...styles.textarea, minHeight: 38 }} name="specialRequests" value={form.specialRequests} onChange={handleChange} rows={1} />
          </div>
        </div>

        <div style={styles.sectionTitle}>Reference Image</div>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="preview" style={styles.preview} />}

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Submitting..." : "Submit Order"}
        </button>
      </form>
    </div>
  );
}