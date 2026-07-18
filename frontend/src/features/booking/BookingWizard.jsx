import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../assets/logo.png";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5083/api"
  : "http://cakeflow.runasp.net/api";

// ---------- CONFIG — non-price lists live here; prices come from the server ----------
const BRANCHES = ["Harare", "Bulawayo"];

const PRODUCT_TYPES = [
  { key: "Cake", label: "Cake", desc: "Custom cakes for any occasion", icon: "🎂" },
  { key: "Cupcakes", label: "Cupcakes", desc: "Boxes of 6, 12, 18, 24 and above", icon: "🧁" },
];

const CUPCAKE_QTY_PRESETS = [6, 12, 18, 24];
const CUPCAKE_QTY_STEP = 6;
const CUPCAKE_FLAVOR_COUNT = 2;

const CAKE_TYPES = [
  { key: "Cake Fairy Cake", label: "Cake Fairy Cake", desc: "Our signature cakes", flavorList: "basic", hasIcing: false, usesSizeTable: false, size: "8 inches", icon: "✨" },
  { key: "Fresh Cream Cake", label: "Fresh Cream Cake", desc: "Classic fresh cream cakes", flavorList: "basic", hasIcing: false, usesSizeTable: true, icon: "🎂" },
  { key: "Themed Cake", label: "Themed Cake", desc: "Custom themed designs", flavorList: "extended", hasIcing: true, usesSizeTable: true, icon: "🎨" },
  { key: "Tiered Cake", label: "Tiered Cake", desc: "2-tier and 3-tier cakes", flavorList: "extended", hasIcing: true, usesSizeTable: false, size: "2-tier", icon: "📚" },
  { key: "3D Cake", label: "3D Cake", desc: "Custom sculpted 3D cakes", flavorList: "extended", hasIcing: true, usesSizeTable: false, size: "Custom", icon: "🧊" },
];

const CAKE_SIZES = [8, 10, 12, 14, 16];
const CAKE_SHAPES = ["Round", "Square"];

const OCCASIONS = [
  { key: "Birthday", icon: "🎉" },
  { key: "Wedding", icon: "🤍" },
  { key: "Engagement", icon: "💍" },
  { key: "Anniversary", icon: "✨" },
  { key: "Party", icon: "🎈" },
  { key: "Valentine's/Mother's Day", icon: "🤍" },
  { key: "Other", icon: "🎁" },
];

const BASIC_FLAVORS = ["Strawberry", "Orange", "Lemon", "Chocolate", "Vanilla"];
const EXTENDED_FLAVORS = [
  "Black Forest", "Cookies and Cream", "Chocolate", "Cheesecake", "Strawberry",
  "Lemon", "Blueberry", "Choc Mint", "Marble", "Funfetti", "Coconut",
  "Fruit Cake", "Red Velvet", "Red Velvet Cheese", "Coffee", "Pistachio", "Orange", "Vanilla",
  "Choc Orange", "Vanilla Cherry", "Amarula", "Caramel", "Strawberry Pistachio",
  "Choc Marble", "Rainbow", "Bubble Gum", "Red Velvet Marble", "Passion Velvet", "Chocolate Mousse",
];
const SIDE_CAKE_FLAVORS = ["Chocolate", "Vanilla", "Marble", "Red Velvet", "Lemon", "Coconut"];

const ICING_TYPES = ["Buttercream", "Fondant", "Whipped Cream", "Custom"];

const TIME_WINDOWS_WEEKDAY = [
  "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM",
  "11:30 AM - 12:00 PM", "12:00 PM - 12:30 PM", "12:30 PM - 1:00 PM",
  "1:00 PM - 1:30 PM", "1:30 PM - 2:00 PM", "2:00 PM - 2:30 PM",
  "2:30 PM - 3:00 PM", "3:00 PM - 3:30 PM", "3:30 PM - 4:00 PM",
  "4:00 PM - 4:30 PM", "4:30 PM - 5:00 PM", "5:00 PM - 5:30 PM",
];
const TIME_WINDOWS_SATURDAY = [
  "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM",
  "11:30 AM - 12:00 PM", "12:00 PM - 12:30 PM", "12:30 PM - 1:00 PM",
  "1:00 PM - 1:30 PM", "1:30 PM - 2:00 PM", "2:00 PM - 2:30 PM",
  "2:30 PM - 3:00 PM", "3:00 PM - 3:30 PM", "3:30 PM - 4:00 PM",
  "4:00 PM - 4:30 PM",
];
const TIME_WINDOWS_SUNDAY = [
  "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM",
  "11:30 AM - 12:00 PM", "12:00 PM - 12:30 PM", "12:30 PM - 1:00 PM",
  "1:00 PM - 1:30 PM", "1:30 PM - 2:00 PM",
];

function getTimeWindowsForDate(date) {
  const day = date.getDay();
  if (day === 0) return TIME_WINDOWS_SUNDAY;
  if (day === 6) return TIME_WINDOWS_SATURDAY;
  return TIME_WINDOWS_WEEKDAY;
}

const REFERRAL_SOURCES = ["IG", "FB", "TikTok", "WhatsApp", "Word of mouth", "Other"];
const MAX_FLAVORS = 3;
const WEDDING_MIN_LEAD_MONTHS = 2;

// ---------- Styles ----------
const COLORS = {
  bg: "#FFF5F8",
  card: "#FFFFFF",
  pink: "#E91E63",
  pinkSoft: "#FDE6EF",
  border: "#F0D3DE",
  text: "#2E2530",
  muted: "#9E7B85",
  gold: "#B98A2E",
  goldSoft: "#FBF2E2",
};

const s = {
  page: { minHeight: "100vh", background: `linear-gradient(180deg, ${COLORS.bg}, #ffffff)`, padding: "36px 16px", fontFamily: "'Segoe UI', sans-serif" },
  brandWrap: { textAlign: "center", marginBottom: 28 },
  brandSub: { fontSize: 15, color: COLORS.muted, marginTop: 4 },
  card: { maxWidth: 620, margin: "0 auto", background: COLORS.card, borderRadius: 20, padding: "30px 26px", boxShadow: "0 10px 30px rgba(233,30,99,0.10)" },
  progressWrap: { maxWidth: 620, margin: "0 auto 14px" },
  progressTop: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: COLORS.muted, marginBottom: 6 },
  progressBarBg: { height: 6, borderRadius: 4, background: "#F1E3E9" },
  progressBarFill: { height: 6, borderRadius: 4, background: COLORS.pink, transition: "width .2s" },
  h1: { fontFamily: "Georgia, serif", fontSize: 24, textAlign: "center", color: COLORS.text, margin: "0 0 4px" },
  h1sub: { fontSize: 13.5, textAlign: "center", color: COLORS.muted, margin: "0 0 22px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  grid5: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 },
  optionCard: (active) => ({
    position: "relative",
    border: `2px solid ${active ? COLORS.pink : COLORS.border}`,
    background: active ? COLORS.pinkSoft : "#fff",
    borderRadius: 14,
    padding: "16px 14px",
    textAlign: "center",
    cursor: "pointer",
  }),
  smallOptionCard: (active) => ({
    position: "relative",
    border: `2px solid ${active ? COLORS.pink : COLORS.border}`,
    background: active ? COLORS.pinkSoft : "#fff",
    borderRadius: 12,
    padding: "12px 8px",
    textAlign: "center",
    cursor: "pointer",
  }),
  optionIcon: { fontSize: 26, marginBottom: 6 },
  optionLabel: { fontWeight: 700, fontSize: 14.5, color: COLORS.text },
  optionDesc: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  badge: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: COLORS.pink, color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 10 },
  pill: (active) => ({
    border: `1.5px solid ${active ? COLORS.pink : COLORS.border}`,
    background: active ? COLORS.pink : "#fff",
    color: active ? "#fff" : COLORS.text,
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  }),
  totalBar: { maxWidth: 620, margin: "14px auto 0", background: COLORS.pinkSoft, borderRadius: 12, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 15, color: COLORS.text },
  totalValue: { fontWeight: 800, color: COLORS.pink, fontSize: 19 },
  navRow: { display: "flex", justifyContent: "space-between", marginTop: 24 },
  backBtn: { background: "none", border: `1.5px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 10, padding: "11px 20px", fontSize: 14, cursor: "pointer" },
  nextBtn: (disabled) => ({
    background: disabled ? "#F0C7D6" : COLORS.pink,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 26px",
    fontSize: 14,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
  }),
  label: { display: "block", fontSize: 13, fontWeight: 700, color: COLORS.text, margin: "16px 0 6px" },
  input: { width: "100%", padding: "11px 13px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "11px 13px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 14, color: COLORS.text },
  error: { background: "#FDECEA", color: "#C62828", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 12 },
  successWrap: { maxWidth: 480, margin: "80px auto 0", textAlign: "center" },
  infoBanner: { background: COLORS.goldSoft, border: `1.5px solid #EAD8AE`, color: "#7A5B18", borderRadius: 10, padding: "12px 14px", fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" },
  smallNote: { fontSize: 12, color: COLORS.muted, marginTop: 6 },
  numberInput: { width: 100, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none" },
  subLabel: { fontSize: 13, fontWeight: 600, color: COLORS.text, marginTop: 14, marginBottom: 6 },
  loadingWrap: { textAlign: "center", color: COLORS.muted, marginTop: 100 },
};

function StepShell({ title, subtitle, children, step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <>
      <div style={s.progressWrap}>
        <div style={s.progressTop}>
          <span>Step {step} of {total}</span>
          <span>{title}</span>
        </div>
        <div style={s.progressBarBg}>
          <div style={{ ...s.progressBarFill, width: `${pct}%` }} />
        </div>
      </div>
      <div style={s.card}>
        <h2 style={s.h1}>{title}</h2>
        {subtitle && <p style={s.h1sub}>{subtitle}</p>}
        {children}
      </div>
    </>
  );
}

export default function BookingWizard() {
  const [page, setPage] = useState("branch");
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [priceConfig, setPriceConfig] = useState(null);
  const [priceError, setPriceError] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/priceconfig`)
      .then((res) => setPriceConfig(JSON.parse(res.data.configJson)))
      .catch(() => setPriceError(true));
  }, []);

  const [form, setForm] = useState({
    branch: "",
    productType: "",
    cakeType: "",
    themeText: "",
    cakeMessage: "",
    cakeColour: "",
    cakeSize: null,
    cakeShape: "",
    flavors: [],
    icing: "",
    cupcakeType: "",
    cupcakeQty: null,
    cupcakeCustomQty: "",
    cupcakeFlavors: [],
    occasion: "",
    occasionOther: "",
    weddingTiers: "",
    weddingFruitTiers: "",
    weddingSideFlavor1: "",
    weddingSideFlavor2: "",
    timeWindow: "",
    heardAbout: "",
    addAccessories: false,
    bakingInstructions: "",
    decoratingInstructions: "",
    fullName: "",
    phone: "",
    email: "",
    whatsappUpdates: false,
    collectionDate: "",
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const selectedCakeType = CAKE_TYPES.find((c) => c.key === form.cakeType);
  const isThemedCake = form.cakeType === "Themed Cake";
  const isWedding = form.productType === "Cake" && form.occasion === "Wedding";
  const usesSizeTable = selectedCakeType?.usesSizeTable;

  const flavorList = () => (selectedCakeType?.flavorList === "extended" ? EXTENDED_FLAVORS : BASIC_FLAVORS);
  const needsIcing = !isWedding && form.productType === "Cake" && selectedCakeType?.hasIcing;

  const getCakeTypeStartingPrice = (key) => {
    if (!priceConfig) return "";
    const type = CAKE_TYPES.find((c) => c.key === key);
    if (type?.usesSizeTable) return priceConfig.roundSizes["8"];
    if (key === "Cake Fairy Cake") return priceConfig.cakeFairyCakePrice;
    if (key === "Tiered Cake") return priceConfig.tieredCakeStartingPrice;
    if (key === "3D Cake") return priceConfig.threeDStartingPrice;
    return "";
  };

  const steps = (() => {
    const arr = ["type"];
    if (form.productType === "Cake") {
      arr.push("cakeType", "occasion");
      if (isWedding) {
        arr.push("weddingDetails");
      } else {
        if (usesSizeTable) arr.push("sizeColourShape");
        arr.push("flavor");
        if (needsIcing) arr.push("icing");
      }
    }
    if (form.productType === "Cupcakes") arr.push("cupcakeDetails");
    arr.push("logistics", "details");
    return arr;
  })();

  const currentKey = steps[stepIndex];
  const totalSteps = steps.length;

  const weddingDummyTiers = () => {
    const t = Number(form.weddingTiers) || 0;
    const f = Number(form.weddingFruitTiers) || 0;
    return Math.max(0, t - f);
  };

  const calcTotal = () => {
    if (!priceConfig) return 0;
    if (form.productType === "Cupcakes") {
      const unit = form.cupcakeType === "Themed" ? priceConfig.cupcakeThemedPrice : priceConfig.cupcakePlainPrice;
      return (form.cupcakeQty || 0) * unit;
    }
    if (isWedding) return null;

    const isThemedFondant = isThemedCake && form.icing === "Fondant";
    if (isThemedFondant) {
      return priceConfig.themedFondantSizePrices?.[form.cakeSize] || 0;
    }

    let base = 0;
    if (usesSizeTable) {
      const table = form.cakeShape === "Round" ? priceConfig.roundSizes : priceConfig.squareSizes;
      base = table?.[form.cakeSize] || 0;
    } else if (form.cakeType === "Cake Fairy Cake") {
      base = priceConfig.cakeFairyCakePrice;
    } else if (form.cakeType === "Tiered Cake") {
      base = priceConfig.tieredCakeStartingPrice;
    } else if (form.cakeType === "3D Cake") {
      base = priceConfig.threeDStartingPrice;
    }

    if (isThemedCake && form.icing === "Buttercream") {
      base += priceConfig.buttercreamIcingFee;
    }

    const extra = Math.max(0, form.flavors.length - 1) * priceConfig.extraFlavorFee;
    const accessories = form.addAccessories ? priceConfig.accessoriesFee : 0;
    return base + extra + accessories;
  };

  const toggleFlavor = (f) => {
    set({
      flavors: form.flavors.includes(f)
        ? form.flavors.filter((x) => x !== f)
        : form.flavors.length < MAX_FLAVORS
        ? [...form.flavors, f]
        : form.flavors,
    });
  };

  const toggleCupcakeFlavor = (f) => {
    set({
      cupcakeFlavors: form.cupcakeFlavors.includes(f)
        ? form.cupcakeFlavors.filter((x) => x !== f)
        : form.cupcakeFlavors.length < CUPCAKE_FLAVOR_COUNT
        ? [...form.cupcakeFlavors, f]
        : form.cupcakeFlavors,
    });
  };

  const pickCupcakeQty = (n) => set({ cupcakeQty: n, cupcakeCustomQty: "" });

  const handleCustomQtyChange = (val) => {
    const n = parseInt(val, 10);
    set({ cupcakeCustomQty: val, cupcakeQty: !isNaN(n) ? n : null });
  };

  const minCollectionDate = () => {
    const d = new Date();
    if (isWedding) d.setMonth(d.getMonth() + WEDDING_MIN_LEAD_MONTHS);
    return d.toISOString().split("T")[0];
  };

  const canContinue = () => {
    switch (currentKey) {
      case "type": return !!form.productType;
      case "cakeType": return !!form.cakeType && (!isThemedCake || form.themeText.trim() !== "");
      case "sizeColourShape": return !!form.cakeSize && !!form.cakeShape && form.cakeColour.trim() !== "";
      case "occasion": return !!form.occasion && (form.occasion !== "Other" || form.occasionOther.trim() !== "");
      case "flavor": return form.flavors.length > 0;
      case "icing": return !!form.icing;
      case "weddingDetails": {
        const tiers = Number(form.weddingTiers);
        const fruit = Number(form.weddingFruitTiers);
        return tiers >= 1 && !isNaN(fruit) && fruit >= 0 && fruit <= tiers && !!form.weddingSideFlavor1 && !!form.weddingSideFlavor2;
      }
      case "cupcakeDetails":
        return !!form.cupcakeType && !!form.cupcakeQty && form.cupcakeQty >= CUPCAKE_QTY_STEP &&
          form.cupcakeQty % CUPCAKE_QTY_STEP === 0 && form.cupcakeFlavors.length === CUPCAKE_FLAVOR_COUNT;
      case "logistics":
        return !!form.collectionDate && (!isWedding || form.collectionDate >= minCollectionDate()) && !!form.timeWindow && !!form.heardAbout;
      case "details":
        return !!form.fullName && !!form.phone;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
    else handleSubmit();
  };
  const goBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else setPage("branch");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setError("");
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

      const occasionLabel = form.occasion === "Other" ? `Other — ${form.occasionOther}` : form.occasion;

      let productLabel, sizeLabel, flavourLabel;
      let notesExtra = [];

      if (form.productType === "Cupcakes") {
        productLabel = `Cupcakes — ${form.cupcakeType}`;
        sizeLabel = `Box of ${form.cupcakeQty}`;
        flavourLabel = form.cupcakeFlavors.join(", ");
      } else if (isWedding) {
        productLabel = "Wedding Cake";
        sizeLabel = `${form.weddingTiers}-Tier`;
        flavourLabel = "Fruit Cake (tiers) + side cakes";
        notesExtra = [
          `Fruit cake tiers: ${form.weddingFruitTiers}`,
          `Dummy tiers: ${weddingDummyTiers()}`,
          `Side cake 1 flavour: ${form.weddingSideFlavor1}`,
          `Side cake 2 flavour: ${form.weddingSideFlavor2}`,
          `Icing: Fondant`,
          `Starting price: $${priceConfig?.weddingStartingPrice}+ (final quote after consultation)`,
          `Installments accepted until 1 week before the wedding date`,
          `Requires wedding coordinator/agent to finalize booking`,
        ];
      } else {
        productLabel = form.cakeType;
        if (usesSizeTable) {
          sizeLabel = `${form.cakeShape} — ${form.cakeSize} inches`;
          notesExtra.push(`Cake colour: ${form.cakeColour}`);
        } else {
          sizeLabel = selectedCakeType?.size;
        }
        flavourLabel = form.flavors.join(", ");
        if (isThemedCake) notesExtra.push(`Theme: ${form.themeText}`);
      }

      if (form.cakeMessage) notesExtra.push(`Message on cake: ${form.cakeMessage}`);

      const itemNotes = [
        `Occasion: ${occasionLabel}`,
        form.icing && `Icing: ${form.icing}`,
        `Time window: ${form.timeWindow}`,
        `Heard about us via: ${form.heardAbout}`,
        form.addAccessories && `Accessories requested (+$${priceConfig?.accessoriesFee})`,
        form.bakingInstructions && `Baking notes: ${form.bakingInstructions}`,
        form.email && `Email: ${form.email}`,
        ...notesExtra,
        isWedding ? `Total: From $${priceConfig?.weddingStartingPrice} (final quote)` : `Total: $${calcTotal()}`,
      ].filter(Boolean).join(" | ");

      const orderPayload = {
        clientName: form.fullName,
        clientContact: form.phone,
        eventDate: form.collectionDate,
        dispatchTime: form.collectionDate,
        branch: form.branch,
        orderItems: [{
          cakeType: productLabel,
          flavour: flavourLabel,
          size: sizeLabel,
          quantity: form.productType === "Cupcakes" ? form.cupcakeQty : 1,
          notes: itemNotes,
        }],
        designInstruction: {
          referenceImageUrl: imageUrl,
          designNotes: occasionLabel,
          colourScheme: form.cakeColour || "",
          decoratorNotes: form.decoratingInstructions,
        },
      };

      await axios.post(`${API_BASE}/orders`, orderPayload);
      setPage("success");
    } catch (err) {
      setError("Something went wrong submitting your order. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!priceConfig && !priceError) {
    return (
      <div style={s.page}>
        <div style={s.loadingWrap}>Loading current prices...</div>
      </div>
    );
  }

  if (priceError) {
    return (
      <div style={s.page}>
        <div style={s.loadingWrap}>
          Sorry, we couldn't load pricing right now. Please refresh the page or try again shortly.
        </div>
      </div>
    );
  }

  if (page === "branch") {
    return (
      <div style={s.page}>
        <div style={s.brandWrap}>
          <img src={logo} alt="CakeFlow by Fairy" style={{ maxWidth: 260, width: "100%", height: "auto" }} />
          <p style={{ ...s.brandSub, fontFamily: "Georgia, serif" }}>by Fairy</p>
        </div>
        <div style={s.card}>
          <h2 style={s.h1}>Order Online</h2>
          <p style={s.h1sub}>Choose your nearest branch to get started</p>
          <div style={s.grid2}>
            {BRANCHES.map((b) => (
              <div key={b} style={s.optionCard(form.branch === b)} onClick={() => { set({ branch: b }); setPage("wizard"); setStepIndex(0); }}>
                <div style={s.optionIcon}>📍</div>
                <div style={s.optionLabel}>{b}</div>
                <div style={s.optionDesc}>{b === "Harare" ? "Main Branch" : `${b} Branch`}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 12.5, color: COLORS.muted, marginTop: 18 }}>Pickup only — Pay on collection</p>
        </div>
      </div>
    );
  }

  if (page === "success") {
    return (
      <div style={s.page}>
        <div style={s.successWrap}>
          <div style={{ fontSize: 52 }}>🎂</div>
          <h2 style={{ fontFamily: "Georgia, serif", color: COLORS.pink, marginTop: 10 }}>Order Received!</h2>
          <p style={{ color: COLORS.muted }}>
            {isWedding
              ? "Thank you — a wedding coordinator will contact you shortly to finalize your design and provide a final quote."
              : "Thank you — we've got your order and will be in touch to confirm details."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.brandWrap}>
        <img src={logo} alt="CakeFlow by Fairy" style={{ maxWidth: 260, width: "100%", height: "auto" }} />
      </div>

      <StepShell
        title={{
          type: "What would you like to order?",
          cakeType: "Choose your cake type",
          sizeColourShape: "Size, Colour & Shape",
          cupcakeDetails: "Cupcake Details",
          occasion: "What's the occasion?",
          weddingDetails: "Wedding Cake Details",
          flavor: "Choose your flavour(s)",
          icing: "Choose your icing",
          logistics: "Time & Details",
          details: "Your Details",
        }[currentKey]}
        subtitle={{
          type: "Choose your product type",
          cakeType: "Select the cake that fits your order",
          sizeColourShape: "Pick a size, tell us your colour, then choose round or square",
          cupcakeDetails: `Choose type, quantity (multiples of ${CUPCAKE_QTY_STEP}) and ${CUPCAKE_FLAVOR_COUNT} flavours`,
          occasion: "Select the celebration type",
          weddingDetails: "Tell us about your tiers, side cakes and icing",
          flavor: `Select up to ${MAX_FLAVORS} — extra flavours add $${priceConfig.extraFlavorFee} each`,
          icing: "Select your preferred icing style",
          logistics: "Collection date, pickup window, referral, and any special requests",
          details: "Tell us how to reach you",
        }[currentKey]}
        step={stepIndex + 1}
        total={totalSteps}
      >
        {error && <div style={s.error}>{error}</div>}

        {currentKey === "type" && (
          <div style={s.grid2}>
            {PRODUCT_TYPES.map((p) => (
              <div key={p.key} style={s.optionCard(form.productType === p.key)} onClick={() => set({
                productType: p.key, cakeType: "", themeText: "", flavors: [], cakeSize: null, cakeShape: "", cakeColour: "",
                cupcakeType: "", cupcakeQty: null, cupcakeCustomQty: "", cupcakeFlavors: [], occasion: "", occasionOther: "",
              })}>
                {form.productType === p.key && <div style={s.badge}>✓</div>}
                <div style={s.optionIcon}>{p.icon}</div>
                <div style={s.optionLabel}>{p.label}</div>
                <div style={s.optionDesc}>{p.desc}</div>
              </div>
            ))}
          </div>
        )}

        {currentKey === "cakeType" && (
          <>
            <div style={s.grid2}>
              {CAKE_TYPES.map((c) => (
                <div key={c.key} style={s.optionCard(form.cakeType === c.key)} onClick={() => set({ cakeType: c.key, flavors: [], themeText: "", cakeSize: null, cakeShape: "", cakeColour: "" })}>
                  {form.cakeType === c.key && <div style={s.badge}>✓</div>}
                  <div style={s.optionIcon}>{c.icon}</div>
                  <div style={s.optionLabel}>{c.label}</div>
                  <div style={s.optionDesc}>From ${getCakeTypeStartingPrice(c.key)} — {c.desc}</div>
                </div>
              ))}
            </div>

            {isThemedCake && (
              <>
                <label style={s.label}>What's the theme? *</label>
                <input style={s.input} value={form.themeText} onChange={(e) => set({ themeText: e.target.value })} placeholder="e.g. Sofia the First, Spiderman, Superman..." />
              </>
            )}

            <label style={s.label}>Message to write on the cake (optional)</label>
            <input style={s.input} value={form.cakeMessage} onChange={(e) => set({ cakeMessage: e.target.value })} placeholder="e.g. Happy Birthday Tanya!" />
          </>
        )}

        {currentKey === "sizeColourShape" && (
          <>
            <label style={s.label}>Size *</label>
            <div style={s.grid5}>
              {CAKE_SIZES.map((size) => (
                <div key={size} style={s.smallOptionCard(form.cakeSize === size)} onClick={() => set({ cakeSize: size })}>
                  <div style={s.optionLabel}>{size}"</div>
                </div>
              ))}
            </div>

            <label style={s.label}>Cake Colour *</label>
            <input style={s.input} value={form.cakeColour} onChange={(e) => set({ cakeColour: e.target.value })} placeholder="e.g. Pink and gold, All white..." />

            <label style={s.label}>Shape *</label>
            <div style={s.grid2}>
              {CAKE_SHAPES.map((shape) => (
                <div key={shape} style={s.optionCard(form.cakeShape === shape)} onClick={() => set({ cakeShape: shape })}>
                  {form.cakeShape === shape && <div style={s.badge}>✓</div>}
                  <div style={s.optionLabel}>{shape}</div>
                  {form.cakeSize && (
                    <div style={s.optionDesc}>
                      ${shape === "Round" ? priceConfig.roundSizes[form.cakeSize] : priceConfig.squareSizes[form.cakeSize]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {currentKey === "cupcakeDetails" && (
          <>
            <label style={s.label}>Cupcake Type *</label>
            <div style={s.grid2}>
              <div style={s.optionCard(form.cupcakeType === "Plain")} onClick={() => set({ cupcakeType: "Plain" })}>
                {form.cupcakeType === "Plain" && <div style={s.badge}>✓</div>}
                <div style={s.optionIcon}>🧁</div>
                <div style={s.optionLabel}>Plain Cupcakes</div>
                <div style={s.optionDesc}>${priceConfig.cupcakePlainPrice.toFixed(2)} each — Simple, classic finish</div>
              </div>
              <div style={s.optionCard(form.cupcakeType === "Themed")} onClick={() => set({ cupcakeType: "Themed" })}>
                {form.cupcakeType === "Themed" && <div style={s.badge}>✓</div>}
                <div style={s.optionIcon}>🎨</div>
                <div style={s.optionLabel}>Themed Cupcakes</div>
                <div style={s.optionDesc}>${priceConfig.cupcakeThemedPrice.toFixed(2)} each — Custom themed decoration</div>
              </div>
            </div>

            <label style={s.label}>Quantity * (minimum 6, in multiples of 6)</label>
            <div style={s.pillRow}>
              {CUPCAKE_QTY_PRESETS.map((n) => (
                <div key={n} style={s.pill(form.cupcakeQty === n && form.cupcakeCustomQty === "")} onClick={() => pickCupcakeQty(n)}>{n}</div>
              ))}
              <div style={s.pill(form.cupcakeCustomQty !== "")} onClick={() => set({ cupcakeCustomQty: form.cupcakeCustomQty || "30", cupcakeQty: form.cupcakeQty && form.cupcakeQty > 24 ? form.cupcakeQty : 30 })}>
                Above 24
              </div>
            </div>
            {form.cupcakeCustomQty !== "" && (
              <>
                <input style={{ ...s.numberInput, marginTop: 10 }} type="number" min={CUPCAKE_QTY_STEP} step={CUPCAKE_QTY_STEP} value={form.cupcakeCustomQty} onChange={(e) => handleCustomQtyChange(e.target.value)} />
                {form.cupcakeQty && form.cupcakeQty % CUPCAKE_QTY_STEP !== 0 && <p style={s.smallNote}>Quantity must be a multiple of {CUPCAKE_QTY_STEP}.</p>}
              </>
            )}
            {form.cupcakeQty > 0 && (
              <p style={s.smallNote}>
                {form.cupcakeQty} cupcakes × ${(form.cupcakeType === "Themed" ? priceConfig.cupcakeThemedPrice : priceConfig.cupcakePlainPrice).toFixed(2)} = $
                {(form.cupcakeQty * (form.cupcakeType === "Themed" ? priceConfig.cupcakeThemedPrice : priceConfig.cupcakePlainPrice)).toFixed(2)}
              </p>
            )}

            <label style={s.label}>Choose {CUPCAKE_FLAVOR_COUNT} flavours *</label>
            <div style={s.pillRow}>
              {BASIC_FLAVORS.map((f) => (
                <div key={f} style={s.pill(form.cupcakeFlavors.includes(f))} onClick={() => toggleCupcakeFlavor(f)}>{f}</div>
              ))}
            </div>
            <p style={s.smallNote}>Selected: {form.cupcakeFlavors.length}/{CUPCAKE_FLAVOR_COUNT}</p>
          </>
        )}

        {currentKey === "occasion" && (
          <>
            <div style={s.grid3}>
              {OCCASIONS.map((o) => (
                <div key={o.key} style={s.optionCard(form.occasion === o.key)} onClick={() => set({ occasion: o.key })}>
                  <div style={s.optionIcon}>{o.icon}</div>
                  <div style={s.optionLabel}>{o.key}</div>
                </div>
              ))}
            </div>
            {form.occasion === "Other" && (
              <>
                <label style={s.label}>Please specify *</label>
                <input style={s.input} value={form.occasionOther} onChange={(e) => set({ occasionOther: e.target.value })} placeholder="Tell us the occasion" />
              </>
            )}
            {form.productType === "Cake" && form.occasion === "Wedding" && (
              <div style={{ ...s.infoBanner, marginTop: 16 }}>💍 Wedding cakes have a dedicated booking flow — next you'll set your tiers, side cakes and icing.</div>
            )}
          </>
        )}

        {currentKey === "weddingDetails" && (
          <>
            <div style={s.infoBanner}>
              Wedding cakes start from ${priceConfig.weddingStartingPrice} and the final price depends on design and tiers.
              All wedding cakes are finished in fondant icing. A wedding coordinator will contact you to finalize your booking and confirm the exact quote.
            </div>

            <label style={s.label}>Number of tiers *</label>
            <input style={s.numberInput} type="number" min={1} value={form.weddingTiers} onChange={(e) => set({ weddingTiers: e.target.value })} />

            <label style={s.label}>How many of those tiers are fruit cake? *</label>
            <input style={s.numberInput} type="number" min={0} max={form.weddingTiers || undefined} value={form.weddingFruitTiers} onChange={(e) => set({ weddingFruitTiers: e.target.value })} />
            {form.weddingTiers !== "" && form.weddingFruitTiers !== "" && (
              <p style={s.smallNote}>{form.weddingFruitTiers} fruit cake tier(s) + {weddingDummyTiers()} dummy tier(s) = {form.weddingTiers} total tiers</p>
            )}

            <div style={s.subLabel}>Side Cake 1 — flavour *</div>
            <div style={s.pillRow}>
              {SIDE_CAKE_FLAVORS.map((f) => (
                <div key={f} style={s.pill(form.weddingSideFlavor1 === f)} onClick={() => set({ weddingSideFlavor1: f })}>{f}</div>
              ))}
            </div>

            <div style={s.subLabel}>Side Cake 2 — flavour *</div>
            <div style={s.pillRow}>
              {SIDE_CAKE_FLAVORS.map((f) => (
                <div key={f} style={s.pill(form.weddingSideFlavor2 === f)} onClick={() => set({ weddingSideFlavor2: f })}>{f}</div>
              ))}
            </div>

            <label style={s.label}>Icing</label>
            <div style={{ ...s.pill(true), cursor: "default", display: "inline-block" }}>Fondant (standard for all wedding cakes)</div>

            <label style={s.label}>Message to write on the cake (optional)</label>
            <input style={s.input} value={form.cakeMessage} onChange={(e) => set({ cakeMessage: e.target.value })} placeholder="e.g. Mr & Mrs Moyo" />

            <label style={s.label}>Design / decorating notes (optional)</label>
            <textarea style={s.textarea} rows={2} value={form.decoratingInstructions} onChange={(e) => set({ decoratingInstructions: e.target.value })} placeholder="Colour scheme, flowers, toppers, inspiration..." />

            <label style={s.label}>Reference Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && <img src={imagePreview} alt="preview" style={{ width: "100%", marginTop: 10, borderRadius: 10, border: `1.5px solid ${COLORS.border}` }} />}

            <p style={s.smallNote}>Note: your wedding date must be booked at least {WEDDING_MIN_LEAD_MONTHS} months in advance. We accept installment payments up to 1 week before the wedding day.</p>
          </>
        )}

        {currentKey === "flavor" && (
          <>
            <div style={s.pillRow}>
              {flavorList().map((f) => (
                <div key={f} style={s.pill(form.flavors.includes(f))} onClick={() => toggleFlavor(f)}>{f}</div>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 12 }}>Selected: {form.flavors.length}/{MAX_FLAVORS}</p>
          </>
        )}

        {currentKey === "icing" && (
          <>
            <div style={s.pillRow}>
              {ICING_TYPES.map((i) => (
                <div key={i} style={s.pill(form.icing === i)} onClick={() => set({ icing: i })}>
                  {i}
                  {isThemedCake && i === "Buttercream" ? ` (+$${priceConfig.buttercreamIcingFee})` : ""}
                  {isThemedCake && i === "Fondant" && form.cakeSize ? ` ($${priceConfig.themedFondantSizePrices[form.cakeSize]} flat)` : ""}
                </div>
              ))}
            </div>
            {isThemedCake && form.icing === "Fondant" && (
              <p style={s.smallNote}>Fondant icing on Themed Cakes sets your total to a flat ${priceConfig.themedFondantSizePrices[form.cakeSize]} for the {form.cakeSize}" size, regardless of flavours or accessories.</p>
            )}
          </>
        )}

        {currentKey === "logistics" && (
          <>
            <label style={s.label}>{isWedding ? "Wedding Date *" : "Collection Date *"}</label>
            <input style={s.input} type="date" value={form.collectionDate} onChange={(e) => set({ collectionDate: e.target.value, timeWindow: "" })} min={minCollectionDate()} />
            {isWedding && (
              <p style={s.smallNote}>Wedding bookings require at least {WEDDING_MIN_LEAD_MONTHS} months' notice. Installments are accepted up until 1 week before your wedding date. Our agent will follow up to finalize your booking and confirm the final quote.</p>
            )}

            <label style={s.label}>Time Window *</label>
            <div style={s.grid2}>
              {(form.collectionDate ? getTimeWindowsForDate(new Date(form.collectionDate)) : []).map((t) => (
                <div key={t} style={{ ...s.optionCard(form.timeWindow === t), padding: "10px" }} onClick={() => set({ timeWindow: t })}>
                  <div style={{ fontSize: 13 }}>🕐 {t}</div>
                </div>
              ))}
            </div>
            {!form.collectionDate && <p style={s.smallNote}>Pick a date above to see available time slots.</p>}

            <label style={s.label}>How did you hear about us? *</label>
            <div style={s.pillRow}>
              {REFERRAL_SOURCES.map((r) => (
                <div key={r} style={s.pill(form.heardAbout === r)} onClick={() => set({ heardAbout: r })}>{r}</div>
              ))}
            </div>

            {form.productType === "Cake" && !isWedding && (
              <label style={s.checkboxRow}>
                <input type="checkbox" checked={form.addAccessories} onChange={(e) => set({ addAccessories: e.target.checked })} />
                Add accessories (+${priceConfig.accessoriesFee} flat fee)
              </label>
            )}

            <label style={s.label}>Baking Instructions (optional)</label>
            <textarea style={s.textarea} rows={2} value={form.bakingInstructions} onChange={(e) => set({ bakingInstructions: e.target.value })} placeholder="e.g., Extra moist, No nuts, Gluten-free..." />

            {!isWedding && (
              <>
                <label style={s.label}>Decorating Instructions (optional)</label>
                <textarea style={s.textarea} rows={2} value={form.decoratingInstructions} onChange={(e) => set({ decoratingInstructions: e.target.value })} placeholder="e.g., Write name in blue, Add edible flowers..." />

                <label style={s.label}>Reference Image (optional)</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="preview" style={{ width: "100%", marginTop: 10, borderRadius: 10, border: `1.5px solid ${COLORS.border}` }} />}
              </>
            )}
          </>
        )}

        {currentKey === "details" && (
          <>
            <label style={s.label}>Full Name *</label>
            <input style={s.input} value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} placeholder="Enter your full name" />

            <label style={s.label}>Phone Number *</label>
            <input style={s.input} value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="Enter your phone number" />

            <label style={s.label}>Email (optional)</label>
            <input style={s.input} type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="your@email.com" />

            <label style={s.checkboxRow}>
              <input type="checkbox" checked={form.whatsappUpdates} onChange={(e) => set({ whatsappUpdates: e.target.checked })} />
              Send order updates via WhatsApp
            </label>

            <div style={{ ...s.pill(true), marginTop: 14, cursor: "default", display: "inline-block" }}>📍 Pickup from: {form.branch} Branch</div>
          </>
        )}

        <div style={s.navRow}>
          <button style={s.backBtn} onClick={goBack} disabled={submitting}>← Back</button>
          <button style={s.nextBtn(!canContinue() || submitting)} onClick={goNext} disabled={!canContinue() || submitting}>
            {submitting ? "Submitting..." : stepIndex === steps.length - 1 ? "Submit Order" : "Continue →"}
          </button>
        </div>
      </StepShell>

      {form.productType && (
        <div style={s.totalBar}>
          <span>Total:</span>
          {isWedding ? (
            <span style={s.totalValue}>From ${priceConfig.weddingStartingPrice}+</span>
          ) : (
            <span style={s.totalValue}>${calcTotal()}</span>
          )}
        </div>
      )}
    </div>
  );
}