import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Home, PieChart as PieIcon, Calendar as CalendarIcon, Plus, Menu, Settings,
  Search, ChevronLeft, ChevronRight, X, Check, PiggyBank, TrendingUp,
  TrendingDown, ShoppingCart, Car, Utensils, Zap, Droplet, Wifi, Wrench,
  Film, Gift, Wallet, FileText, Edit2, Trash2, ArrowLeft, DollarSign,
  AlertCircle, Dog, Book, Plane, Heart, Printer, ChevronDown, ChevronUp,
  Landmark, ShoppingBag, Briefcase, List as ListIcon, Sun, Moon,
  Coffee, Pizza, Bus, Fuel, Stethoscope, GraduationCap, Baby, Shirt,
  Smartphone, Tv, Gamepad2, Dumbbell, Scissors, Building2, CreditCard,
  Music, Camera, ShoppingBasket, Bike, Train, Palmtree, HeartPulse,
  Banknote, Users, Sparkles, Cat, TreePine, Pill as PillIcon,
  SlidersHorizontal, Sliders, Beef, Fish, Egg, Drumstick, Soup, Salad,
  Sandwich, IceCreamCone, Cake, Candy, Popcorn, Milk, Wheat, ChefHat,
  CookingPot, Croissant, Wine, CupSoda, Umbrella, Glasses, Watch, Backpack,
  Luggage, Key, Lightbulb, Flame, Thermometer, Paintbrush, Recycle, Leaf,
  Flower2, Sofa, Bed, Bath, Anchor, Ship, Tent, MapPin,
} from "lucide-react";
import { storage } from "./storage";

/* ---------------------------------------------------------------------- */
/* Constants + helpers                                                    */
/* ---------------------------------------------------------------------- */

const STORAGE_KEY = "finanzas_mx_state_v1";

// Brand / status colors never change between light & dark mode
const LIME = "#D8FF3E";
const RED = "#FF5D5D";
const YELLOW = "#FFC94A";
const GREEN = "#33D17A";
const INK = "#101826";   // text used on top of white cards (same both themes)
const CARD = "#FFFFFF";  // card background (same both themes)
const MUTED = "#8B93A3"; // secondary text on white cards (same both themes)
const SLATE_CARD = "#3C4C66";

const RULE_COLORS = ["#D8FF3E", "#5FB8FF", "#FF8A5C", "#B98CFF", "#33D17A", "#FF5D9E"];

// Only the "chrome" (outer background, nav, text directly on the background)
// changes between themes — cards themselves stay the same in both.
const PALETTES = {
  dark: {
    bgTop: "#2E3F58", bgBottom: "#131B29",
    onBg: "#FFFFFF", onBgMuted: "rgba(255,255,255,0.55)",
    pillBg: "rgba(255,255,255,0.12)", pillBgSoft: "rgba(255,255,255,0.08)",
    circleBg: "rgba(255,255,255,0.12)", navBg: "rgba(19,27,41,0.75)",
    emptyBg: "rgba(255,255,255,0.06)",
  },
  light: {
    bgTop: "#EEF1F6", bgBottom: "#DCE1E9",
    onBg: "#141B26", onBgMuted: "rgba(20,27,38,0.5)",
    pillBg: "rgba(20,27,38,0.07)", pillBgSoft: "rgba(20,27,38,0.05)",
    circleBg: "rgba(20,27,38,0.07)", navBg: "rgba(255,255,255,0.75)",
    emptyBg: "rgba(20,27,38,0.05)",
  },
};

const ThemeContext = React.createContext(PALETTES.dark);
function useColors() { return React.useContext(ThemeContext); }

const RULE_PRESETS = {
  "50/30/20": [
    { id: "necesidades", name: "NECESIDADES", percent: 50 },
    { id: "deseos", name: "DESEOS", percent: 30 },
    { id: "ahorros", name: "AHORROS", percent: 20 },
  ],
  "80/20": [
    { id: "gastos", name: "GASTOS", percent: 80 },
    { id: "ahorros", name: "AHORROS", percent: 20 },
  ],
  "70/20/10": [
    { id: "gastos", name: "GASTOS", percent: 70 },
    { id: "ahorros", name: "AHORROS", percent: 20 },
    { id: "deudas", name: "DEUDAS", percent: 10 },
  ],
};

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WEEKDAYS = ["L","M","M","J","V","S","D"];

const ICONS = [
  // Casa / servicios — ámbar-café
  { key: "home", Icon: Home, color: "#F2A65A" }, { key: "zap", Icon: Zap, color: "#F5C445" },
  { key: "water", Icon: Droplet, color: "#4CB8E8" }, { key: "wifi", Icon: Wifi, color: "#5B8DEF" },
  { key: "flame", Icon: Flame, color: "#FF7A4D" }, { key: "tool", Icon: Wrench, color: "#8B93A3" },
  { key: "lightbulb", Icon: Lightbulb, color: "#F6C445" }, { key: "sofa", Icon: Sofa, color: "#C98A5E" },
  { key: "bed", Icon: Bed, color: "#9B87D6" }, { key: "bath", Icon: Bath, color: "#4CB8E8" },
  { key: "thermometer", Icon: Thermometer, color: "#FF6B6B" }, { key: "paintbrush", Icon: Paintbrush, color: "#F27EB0" },
  { key: "building", Icon: Building2, color: "#7A93B8" }, { key: "key", Icon: Key, color: "#E0B341" },
  // Super / comida — rojos, naranjas, verdes cálidos
  { key: "cart", Icon: ShoppingCart, color: "#4CAF7D" }, { key: "basket", Icon: ShoppingBasket, color: "#F2A65A" },
  { key: "food", Icon: Utensils, color: "#FF7A4D" }, { key: "beef", Icon: Beef, color: "#E85D5D" },
  { key: "fish", Icon: Fish, color: "#4CB8E8" }, { key: "egg", Icon: Egg, color: "#F5D06A" },
  { key: "drumstick", Icon: Drumstick, color: "#E0955F" }, { key: "soup", Icon: Soup, color: "#F2915C" },
  { key: "salad", Icon: Salad, color: "#5FBF6B" }, { key: "sandwich", Icon: Sandwich, color: "#E8A857" },
  { key: "icecream", Icon: IceCreamCone, color: "#F2A0C4" }, { key: "cake", Icon: Cake, color: "#F27EB0" },
  { key: "candy", Icon: Candy, color: "#FF6B9E" }, { key: "popcorn", Icon: Popcorn, color: "#F5C445" },
  { key: "milk", Icon: Milk, color: "#9BC6E8" }, { key: "wheat", Icon: Wheat, color: "#D8B355" },
  { key: "chef", Icon: ChefHat, color: "#5A6472" }, { key: "pot", Icon: CookingPot, color: "#E0705F" },
  { key: "croissant", Icon: Croissant, color: "#E0A85C" }, { key: "wine", Icon: Wine, color: "#9B4D6B" },
  { key: "soda", Icon: CupSoda, color: "#FF7A7A" }, { key: "coffee", Icon: Coffee, color: "#8A5A3B" },
  { key: "pizza", Icon: Pizza, color: "#F2915C" },
  // Transporte — azules
  { key: "car", Icon: Car, color: "#5B8DEF" }, { key: "bus", Icon: Bus, color: "#5FA8D3" },
  { key: "fuel", Icon: Fuel, color: "#F2A65A" }, { key: "bike", Icon: Bike, color: "#4CAF7D" },
  { key: "train", Icon: Train, color: "#7A93B8" }, { key: "plane", Icon: Plane, color: "#5B8DEF" },
  { key: "ship", Icon: Ship, color: "#4CB8E8" }, { key: "anchor", Icon: Anchor, color: "#5A7A9B" },
  // Salud / bienestar — rosas y rojos suaves
  { key: "health", Icon: Stethoscope, color: "#E85D8A" }, { key: "medical", Icon: HeartPulse, color: "#FF6B6B" },
  { key: "pill", Icon: PillIcon, color: "#5FBF9B" }, { key: "heart", Icon: Heart, color: "#FF6B9E" },
  { key: "baby", Icon: Baby, color: "#F2A0C4" }, { key: "gym", Icon: Dumbbell, color: "#5A6472" },
  { key: "haircut", Icon: Scissors, color: "#9B87D6" },
  // Ocio / entretenimiento — morados y magentas
  { key: "film", Icon: Film, color: "#9B6BD6" }, { key: "music", Icon: Music, color: "#D65FA8" },
  { key: "games", Icon: Gamepad2, color: "#6B7FE0" }, { key: "tv", Icon: Tv, color: "#5A6472" },
  { key: "camera", Icon: Camera, color: "#F2A65A" }, { key: "vacation", Icon: Palmtree, color: "#4CAF7D" },
  { key: "tent", Icon: Tent, color: "#E0955F" }, { key: "sparkles", Icon: Sparkles, color: "#F5C445" },
  { key: "gift", Icon: Gift, color: "#E85D8A" },
  // Compras / personal — teales y cian
  { key: "bag", Icon: ShoppingBag, color: "#4CB8A8" }, { key: "clothes", Icon: Shirt, color: "#5FA8D3" },
  { key: "phone", Icon: Smartphone, color: "#5A6472" }, { key: "watch", Icon: Watch, color: "#8B93A3" },
  { key: "glasses", Icon: Glasses, color: "#5A6472" }, { key: "backpack", Icon: Backpack, color: "#E0955F" },
  { key: "luggage", Icon: Luggage, color: "#7A93B8" }, { key: "umbrella", Icon: Umbrella, color: "#5B8DEF" },
  // Dinero / trabajo / familia — verdes
  { key: "wallet", Icon: Wallet, color: "#4CAF7D" }, { key: "bank", Icon: Landmark, color: "#5A8A6B" },
  { key: "cash", Icon: Banknote, color: "#4CAF7D" }, { key: "card", Icon: CreditCard, color: "#5B8DEF" },
  { key: "work", Icon: Briefcase, color: "#7A93B8" }, { key: "school", Icon: GraduationCap, color: "#5B8DEF" },
  { key: "book", Icon: Book, color: "#E0955F" }, { key: "family", Icon: Users, color: "#F2A65A" },
  // Otros / naturaleza
  { key: "pet", Icon: Dog, color: "#E0955F" }, { key: "cat", Icon: Cat, color: "#8B93A3" },
  { key: "tree", Icon: TreePine, color: "#4CAF7D" }, { key: "leaf", Icon: Leaf, color: "#5FBF6B" },
  { key: "flower", Icon: Flower2, color: "#F27EB0" }, { key: "recycle", Icon: Recycle, color: "#4CAF7D" },
  { key: "map", Icon: MapPin, color: "#E85D5D" },
];
const iconFor = (key) => (ICONS.find((i) => i.key === key) || ICONS[10]).Icon;
const colorForIcon = (key) => (ICONS.find((i) => i.key === key) || ICONS[10]).color;

function uid(p = "id") { return p + "_" + Math.random().toString(36).slice(2, 10); }

function monthlyEquivalent(amount, periodicity) {
  const a = Number(amount) || 0;
  switch (periodicity) {
    case "diaria": return a * 30;
    case "semanal": return a * 4.33;
    case "quincenal": return a * 2;
    default: return a;
  }
}

function periodicAmounts(monthlyRemaining, daysRemaining) {
  const d = Math.max(daysRemaining, 1);
  const months = d / 30;
  return {
    mensual: monthlyRemaining / Math.max(months, 1 / 30),
    quincenal: monthlyRemaining / Math.max(months, 1 / 30) / 2,
    semanal: monthlyRemaining / (d / 7),
    diario: monthlyRemaining / d,
  };
}

function fmt(n) {
  const v = Number(n) || 0;
  return (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function todayISO() { return new Date().toISOString().slice(0, 10); }

function ym(dateStr) { return dateStr.slice(0, 7); }

function statusColor(spent, budget) {
  if (budget <= 0) return MUTED;
  const pct = spent / budget;
  if (pct > 1) return RED;
  if (pct >= 0.9) return YELLOW;
  return GREEN;
}

function getMonthGrid(year, monthIdx) {
  const first = new Date(year, monthIdx, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/* ---------------------------------------------------------------------- */
/* Small UI atoms                                                         */
/* ---------------------------------------------------------------------- */

function CircleBtn({ children, onClick, active, onCard }) {
  const c = useColors();
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-full"
      style={{
        width: 40, height: 40, flexShrink: 0,
        background: active ? LIME : onCard ? "#F2F3F5" : c.circleBg,
        color: active ? INK : onCard ? INK : c.onBg,
        border: "none", backdropFilter: onCard ? "none" : "blur(8px)", WebkitBackdropFilter: onCard ? "none" : "blur(8px)",
      }}
    >
      {children}
    </button>
  );
}

function Pill({ children, active, onClick, style, onCard }) {
  const c = useColors();
  return (
    <button
      onClick={onClick}
      className="rounded-full whitespace-nowrap"
      style={{
        padding: "8px 16px", fontSize: 15, fontWeight: 600, border: "none",
        background: active ? LIME : onCard ? "#F2F3F5" : c.pillBg,
        color: active ? INK : onCard ? INK : c.onBg,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Sheet({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 flex flex-col justify-end no-print" style={{ zIndex: 50, background: "rgba(10,14,20,0.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-3xl flex flex-col"
        style={{ background: CARD, maxHeight: "88vh", color: INK }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: "1px solid #EEF0F3" }}>
          <div className="font-bold" style={{ fontSize: 19 }}>{title}</div>
          <button onClick={onClose} className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: "#F2F3F5" }}>
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4" style={{ flex: 1 }}>{children}</div>
        {footer && <div className="px-5 py-4" style={{ borderTop: "1px solid #EEF0F3" }}>{footer}</div>}
      </div>
    </div>
  );
}

function TextField({ label, ...props }) {
  return (
    <label className="block mb-3">
      {label && <div className="mb-1" style={{ fontSize: 14, fontWeight: 600, color: "#5A6472" }}>{label}</div>}
      <input
        {...props}
        className="w-full rounded-xl"
        style={{ padding: "12px 14px", background: "#F4F5F7", border: "1px solid #E7E9EC", fontSize: 17, color: INK, ...(props.style || {}) }}
      />
    </label>
  );
}

function PrimaryBtn({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl font-bold"
      style={{ padding: "13px 16px", background: disabled ? "#E7E9EC" : LIME, color: disabled ? "#A6ACB5" : INK, border: "none", fontSize: 17, ...style }}
    >
      {children}
    </button>
  );
}

function Confirm({ text, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center no-print" style={{ zIndex: 60, background: "rgba(10,14,20,0.55)" }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="rounded-2xl p-5" style={{ background: CARD, width: 280, color: INK }}>
        <div style={{ fontSize: 16, marginBottom: 16 }}>{text}</div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-xl py-2" style={{ background: "#F2F3F5", fontWeight: 600, fontSize: 15 }}>Cancelar</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl py-2" style={{ background: RED, color: "#fff", fontWeight: 600, fontSize: 15 }}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Main App                                                                */
/* ---------------------------------------------------------------------- */

export default function FinanzasMX() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]); // [{id,name,percent,subcategories:[{id,name,icon,concepts:[{id,name,amount,periodicity}]}]}]
  const [transactions, setTransactions] = useState([]); // [{id,type,kind,amount,date,time,mainId,subId,subName,conceptName,note}]
  const [goals, setGoals] = useState([]);
  const [theme, setTheme] = useState("dark");

  const [screen, setScreen] = useState("home");
  const [monthCursor, setMonthCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [ruleFilter, setRuleFilter] = useState("todas");
  const [addOpen, setAddOpen] = useState(null); // 'expense' | 'income' | null
  const [moreOpen, setMoreOpen] = useState(false);
  const [dayDetail, setDayDetail] = useState(null); // "YYYY-MM-DD"
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [confirmDel, setConfirmDel] = useState(null); // {type,id}
  const [catManagerCat, setCatManagerCat] = useState(null);
  const [goalDetail, setGoalDetail] = useState(null);
  const [prefillDate, setPrefillDate] = useState(null);
  const [saveNote, setSaveNote] = useState("");
  const [editingTx, setEditingTx] = useState(null); // transaction being edited, or null when adding
  const [templateTx, setTemplateTx] = useState(null); // prefill for a NEW transaction (from "Registrar" on a concept)
  const [viewModeOpen, setViewModeOpen] = useState(false);

  /* ---- load / save ---- */
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(STORAGE_KEY);
        if (res && res.value) {
          const data = JSON.parse(res.value);
          setProfile(data.profile || null);
          setCategories(data.categories || []);
          setTransactions(data.transactions || []);
          setGoals(data.goals || []);
          setTheme(data.theme || "dark");
        }
      } catch (e) { /* nothing stored yet — normal on first use, works fully offline from memory */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try {
        await storage.set(STORAGE_KEY, JSON.stringify({ profile, categories, transactions, goals, theme }));
        setSaveNote("Guardado");
        setTimeout(() => setSaveNote(""), 1200);
      } catch (e) { setSaveNote("Sin conexión — tus datos siguen aquí y se sincronizarán al reconectar"); }
    }, 500);
    return () => clearTimeout(t);
  }, [profile, categories, transactions, goals, theme, loaded]);

  const colors = PALETTES[theme] || PALETTES.dark;

  /* ---- derived ---- */
  const monthKey = `${monthCursor.y}-${String(monthCursor.m + 1).padStart(2, "0")}`;
  const monthLabel = `${MONTHS[monthCursor.m]} ${monthCursor.y}`;
  const monthlyIncome = profile ? monthlyEquivalent(profile.incomeAmount, profile.incomePeriodicity) : 0;

  const monthExpenses = useMemo(() => transactions.filter((t) => t.type === "expense" && ym(t.date) === monthKey), [transactions, monthKey]);
  const monthIncomes = useMemo(() => transactions.filter((t) => t.type === "income" && ym(t.date) === monthKey), [transactions, monthKey]);
  const totalSpentMonth = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const totalIncomeMonth = monthIncomes.reduce((s, t) => s + t.amount, 0);

  function spentInCategory(catId) { return monthExpenses.filter((t) => t.mainId === catId).reduce((s, t) => s + t.amount, 0); }
  function budgetFor(cat) { return (monthlyIncome * cat.percent) / 100; }

  function catById(id) { return categories.find((c) => c.id === id); }

  function shiftMonth(delta) {
    let m = monthCursor.m + delta, y = monthCursor.y;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    setMonthCursor({ y, m });
  }

  /* ---- category tree mutations ---- */
  function addSubcategory(mainId, name, icon) {
    setCategories((prev) => prev.map((c) => c.id === mainId ? { ...c, subcategories: [...c.subcategories, { id: uid("sub"), name, icon, concepts: [] }] } : c));
  }
  function addConcept(mainId, subId, name, amount, isFixed, periodicity, dueDay, dueWeekday) {
    setCategories((prev) => prev.map((c) => {
      if (c.id !== mainId) return c;
      return { ...c, subcategories: c.subcategories.map((s) => s.id === subId ? { ...s, concepts: [...s.concepts, { id: uid("con"), name, amount: Number(amount) || 0, isFixed: !!isFixed, periodicity: isFixed ? periodicity : null, dueDay: dueDay ? Number(dueDay) : null, dueWeekday: periodicity === "semanal" ? dueWeekday : null }] } : s) };
    }));
  }
  function deleteSub(mainId, subId) {
    setCategories((prev) => prev.map((c) => c.id === mainId ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== subId) } : c));
  }
  function deleteConcept(mainId, subId, conId) {
    setCategories((prev) => prev.map((c) => c.id !== mainId ? c : { ...c, subcategories: c.subcategories.map((s) => s.id !== subId ? s : { ...s, concepts: s.concepts.filter((k) => k.id !== conId) }) }));
  }
  function editSub(mainId, subId, name, icon) {
    setCategories((prev) => prev.map((c) => c.id !== mainId ? c : { ...c, subcategories: c.subcategories.map((s) => s.id === subId ? { ...s, name, icon } : s) }));
    // keep existing transactions' displayed sub-name in sync
    setTransactions((prev) => prev.map((t) => t.subId === subId ? { ...t, subName: name, icon } : t));
  }
  function editConcept(mainId, subId, conId, name, amount, isFixed, periodicity, dueDay, dueWeekday) {
    setCategories((prev) => prev.map((c) => c.id !== mainId ? c : { ...c, subcategories: c.subcategories.map((s) => s.id !== subId ? s : { ...s, concepts: s.concepts.map((k) => k.id === conId ? { ...k, name, amount: Number(amount) || 0, isFixed: !!isFixed, periodicity: isFixed ? periodicity : null, dueDay: dueDay ? Number(dueDay) : null, dueWeekday: periodicity === "semanal" ? dueWeekday : null } : k) }) }));
  }

  // Switch to a different financial rule (preset or custom). Subcategories of
  // categories whose name matches the new rule are preserved; the rest start empty.
  function applyRule(newRuleCats, ruleName) {
    setCategories((prev) => newRuleCats.map((rc) => {
      const existing = prev.find((c) => c.name.trim().toLowerCase() === rc.name.trim().toLowerCase());
      return { id: uid("rc"), name: rc.name, percent: rc.percent, subcategories: existing ? existing.subcategories : [] };
    }));
    setProfile((p) => ({ ...p, ruleName }));
  }

  function ensureSub(mainId, subName) {
    const cat = catById(mainId);
    let sub = cat.subcategories.find((s) => s.name.toLowerCase() === subName.toLowerCase());
    if (!sub) { addSubcategory(mainId, subName, "wallet"); return null; }
    return sub.id;
  }

  /* ---- transaction mutations ---- */
  function addTransaction(tx) { setTransactions((prev) => [{ id: uid("tx"), ...tx }, ...prev]); }
  function editTransaction(id, tx) { setTransactions((prev) => prev.map((t) => t.id === id ? { ...tx, id } : t)); }
  function deleteTransaction(id) { setTransactions((prev) => prev.filter((t) => t.id !== id)); }

  /* ---- onboarding ---- */
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(180deg, ${PALETTES.dark.bgTop}, ${PALETTES.dark.bgBottom})`, color: "#fff" }}>
        Cargando…
      </div>
    );
  }
  if (!profile) {
    return <Onboarding onDone={(p, cats) => { setProfile(p); setCategories(cats); }} />;
  }

  /* ---- render ---- */
  return (
    <ThemeContext.Provider value={colors}>
    <div className="min-h-screen w-full flex justify-center" style={{ background: `linear-gradient(180deg, ${colors.bgTop} 0%, ${colors.bgBottom} 65%)`, fontFamily: "'Urbanist', system-ui, sans-serif", transition: "background 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');
        .num { font-family: 'Urbanist', system-ui, sans-serif; font-variant-numeric: tabular-nums; }
        ::-webkit-scrollbar { width: 0px; height: 0px; }
        @media print {
          .no-print { display: none !important; }
          .print-area { color: #000 !important; background: #fff !important; }
          body { background: #fff !important; }
        }
      `}</style>
      <div className="w-full flex flex-col" style={{ maxWidth: 430, minHeight: "100vh", position: "relative" }}>

        {/* Top bar */}
        <div className="no-print flex items-center justify-between px-5 pt-6 pb-2">
          <CircleBtn onClick={() => setMoreOpen(true)}><Menu size={18} /></CircleBtn>
          <div className="text-center">
            <div style={{ color: colors.onBgMuted, fontSize: 13, fontWeight: 600 }}>Hola,</div>
            <div style={{ color: colors.onBg, fontSize: 17, fontWeight: 700 }}>{profile.name}</div>
          </div>
          <CircleBtn onClick={() => setSearchOpen(true)}><Search size={17} /></CircleBtn>
        </div>

        <div className="flex-1 px-5 pb-28" style={{ overflowY: "auto" }}>
          {screen === "home" && (
            <HomeScreen
              profile={profile} categories={categories} monthLabel={monthLabel}
              shiftMonth={shiftMonth} monthlyIncome={monthlyIncome}
              totalSpentMonth={totalSpentMonth} totalIncomeMonth={totalIncomeMonth}
              spentInCategory={spentInCategory} budgetFor={budgetFor}
              monthExpenses={monthExpenses} transactions={transactions}
              deleteTransaction={(id) => setConfirmDel({ type: "tx", id })}
              onEditTransaction={(t) => { setEditingTx(t); setAddOpen(t.type); }}
              onAddExpense={() => setAddOpen("expense")} onAddIncome={() => setAddOpen("income")}
            />
          )}

          {screen === "stats" && (
            <StatsScreen
              categories={categories} ruleFilter={ruleFilter} setRuleFilter={setRuleFilter}
              monthLabel={monthLabel} shiftMonth={shiftMonth}
              monthExpenses={monthExpenses} transactions={transactions} monthCursor={monthCursor}
              spentInCategory={spentInCategory} budgetFor={budgetFor}
            />
          )}

          {screen === "calendar" && (
            <CalendarScreen
              monthCursor={monthCursor} shiftMonth={shiftMonth} monthLabel={monthLabel}
              monthExpenses={monthExpenses}
              onDayClick={(d) => setDayDetail(d)}
            />
          )}

          {screen === "statement" && (
            <StatementScreen
              categories={categories} monthLabel={monthLabel} shiftMonth={shiftMonth}
              monthCursor={monthCursor}
              monthExpenses={monthExpenses} totalIncomeMonth={totalIncomeMonth}
              totalSpentMonth={totalSpentMonth} budgetFor={budgetFor} spentInCategory={spentInCategory}
            />
          )}

          {screen === "log" && (
            <LogScreen
              transactions={transactions}
              onAdd={(dateStr) => { setPrefillDate(dateStr); setAddOpen("expense"); }}
              onDelete={(id) => setConfirmDel({ type: "tx", id })}
              onEdit={(t) => { setEditingTx(t); setAddOpen(t.type); }}
            />
          )}

          {screen === "categories" && (
            <CategoriesScreen
              categories={categories} onOpenCat={(c) => setCatManagerCat(c)}
              spentInCategory={spentInCategory} budgetFor={budgetFor}
            />
          )}

          {screen === "goals" && (
            <GoalsScreen goals={goals} onOpen={(g) => setGoalDetail(g)} onAdd={() => setGoalDetail("new")} />
          )}

          {screen === "rules" && (
            <RulesScreen categories={categories} onApply={applyRule} />
          )}

          {screen === "profile" && (
            <ProfileScreen profile={profile} setProfile={setProfile} saveNote={saveNote} theme={theme} setTheme={setTheme} />
          )}
        </div>

        {/* Bottom nav */}
        <div className="no-print fixed bottom-0 w-full flex justify-center pb-5 pt-3" style={{ maxWidth: 430, background: `linear-gradient(0deg, ${colors.bgBottom} 55%, transparent)` }}>
          <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{ background: colors.navBg, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
            <NavBtn icon={<Home size={19} />} active={screen === "home"} onClick={() => setScreen("home")} />
            <NavBtn icon={<PieIcon size={19} />} active={screen === "stats"} onClick={() => setScreen("stats")} />
            <button onClick={() => { setPrefillDate(null); setAddOpen("expense"); }} className="flex items-center justify-center rounded-full" style={{ width: 48, height: 48, background: LIME, color: INK, border: "none", margin: "0 2px" }}>
              <Plus size={22} />
            </button>
            <NavBtn icon={<CalendarIcon size={19} />} active={screen === "calendar"} onClick={() => setScreen("calendar")} />
            <NavBtn icon={<FileText size={19} />} active={screen === "log"} onClick={() => setScreen("log")} />
          </div>
        </div>

        {/* ---- Overlays ---- */}
        {moreOpen && (
          <Sheet title="Menú" onClose={() => setMoreOpen(false)}>
            <MenuList
              onNavigate={(s) => { setScreen(s); setMoreOpen(false); }}
              onViewMode={() => { setMoreOpen(false); setViewModeOpen(true); }}
            />
          </Sheet>
        )}

        {viewModeOpen && (
          <Sheet title="Modo de vista" onClose={() => setViewModeOpen(false)}>
            <ViewModeEditor profile={profile} setProfile={setProfile} onClose={() => setViewModeOpen(false)} />
          </Sheet>
        )}

        {searchOpen && (
          <Sheet title="Buscar gastos" onClose={() => setSearchOpen(false)}>
            <TextField placeholder="Concepto o nota…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} autoFocus />
            <div className="flex flex-col gap-2 mt-2">
              {transactions.filter((t) => t.type === "expense" && (t.conceptName + " " + (t.note || "")).toLowerCase().includes(searchQ.toLowerCase()) && searchQ.length > 0)
                .slice(0, 30).map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#F4F5F7" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{t.conceptName}</div>
                      <div style={{ fontSize: 13, color: MUTED }}>{t.date} · {t.subName}</div>
                    </div>
                    <div className="num" style={{ fontWeight: 700 }}>{fmt(t.amount)}</div>
                  </div>
                ))}
              {searchQ.length > 0 && transactions.filter((t) => t.type === "expense" && (t.conceptName + " " + (t.note || "")).toLowerCase().includes(searchQ.toLowerCase())).length === 0 && (
                <div style={{ fontSize: 15, color: MUTED, textAlign: "center", padding: "20px 0" }}>Sin resultados</div>
              )}
            </div>
          </Sheet>
        )}

        {addOpen && (
          <AddTransactionSheet
            kind={addOpen}
            categories={categories}
            profile={profile}
            defaultDate={prefillDate || todayISO()}
            editingTx={editingTx}
            template={templateTx}
            onClose={() => { setAddOpen(null); setPrefillDate(null); setEditingTx(null); setTemplateTx(null); }}
            onSave={(tx, newSub, newConcept) => {
              if (newSub) addSubcategory(tx.mainId, newSub.name, newSub.icon);
              if (editingTx) editTransaction(editingTx.id, tx); else addTransaction(tx);
              setAddOpen(null); setPrefillDate(null); setEditingTx(null); setTemplateTx(null);
            }}
            onUpdateIncomeDefault={(amount, periodicity) => setProfile((p) => ({ ...p, incomeAmount: amount, incomePeriodicity: periodicity }))}
            ensureSubFor={ensureSub}
          />
        )}

        {dayDetail && (
          <Sheet title={dayDetail} onClose={() => setDayDetail(null)}>
            <DayDetail
              date={dayDetail}
              transactions={transactions.filter((t) => t.date === dayDetail && t.type === "expense")}
              onDelete={(id) => setConfirmDel({ type: "tx", id })}
              onEdit={(t) => { setEditingTx(t); setDayDetail(null); setAddOpen(t.type); }}
              onAdd={() => { setPrefillDate(dayDetail); setDayDetail(null); setAddOpen("expense"); }}
            />
          </Sheet>
        )}

        {catManagerCat && (
          <Sheet title={catManagerCat.name} onClose={() => setCatManagerCat(null)}>
            <CategoryManager
              cat={categories.find((c) => c.id === catManagerCat.id) || catManagerCat}
              onAddSub={(name, icon) => addSubcategory(catManagerCat.id, name, icon)}
              onAddConcept={(subId, name, amount, isFixed, per, dueDay, dueWeekday) => addConcept(catManagerCat.id, subId, name, amount, isFixed, per, dueDay, dueWeekday)}
              onEditSub={(subId, name, icon) => editSub(catManagerCat.id, subId, name, icon)}
              onEditConcept={(subId, conId, name, amount, isFixed, per, dueDay, dueWeekday) => editConcept(catManagerCat.id, subId, conId, name, amount, isFixed, per, dueDay, dueWeekday)}
              onDeleteSub={(subId) => setConfirmDel({ type: "sub", mainId: catManagerCat.id, subId })}
              onDeleteConcept={(subId, conId) => setConfirmDel({ type: "con", mainId: catManagerCat.id, subId, conId })}
              onQuickRegister={(sub, con) => {
                setTemplateTx({ mainId: catManagerCat.id, subId: sub.id, subName: sub.name, conceptName: con.name, amount: con.amount, icon: sub.icon });
                setCatManagerCat(null);
                setAddOpen("expense");
              }}
            />
          </Sheet>
        )}

        {goalDetail && (
          <Sheet title={goalDetail === "new" ? "Nueva meta" : goalDetail.name} onClose={() => setGoalDetail(null)}>
            <GoalDetail
              goal={goalDetail === "new" ? null : goals.find((g) => g.id === goalDetail.id)}
              onCreate={(g) => {
                const { initialSaved, ...goalFields } = g;
                const contributions = initialSaved > 0 ? [{ id: uid("c"), amount: initialSaved, date: todayISO(), note: "Ahorro inicial" }] : [];
                setGoals((prev) => [...prev, { ...goalFields, id: uid("goal"), createdAt: todayISO(), contributions }]);
                setGoalDetail(null);
              }}
              onContribute={(goalId, amount, note) => {
                setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, contributions: [...g.contributions, { id: uid("c"), amount: Number(amount), date: todayISO(), note }] } : g));
              }}
              onDelete={(goalId) => { setConfirmDel({ type: "goal", id: goalId }); setGoalDetail(null); }}
            />
          </Sheet>
        )}

        {confirmDel && (
          <Confirm
            text="¿Seguro que quieres eliminar esto? No se puede deshacer."
            onCancel={() => setConfirmDel(null)}
            onConfirm={() => {
              if (confirmDel.type === "tx") deleteTransaction(confirmDel.id);
              if (confirmDel.type === "sub") deleteSub(confirmDel.mainId, confirmDel.subId);
              if (confirmDel.type === "con") deleteConcept(confirmDel.mainId, confirmDel.subId, confirmDel.conId);
              if (confirmDel.type === "goal") setGoals((prev) => prev.filter((g) => g.id !== confirmDel.id));
              setConfirmDel(null);
            }}
          />
        )}
      </div>
    </div>
    </ThemeContext.Provider>
  );
}

function NavBtn({ icon, active, onClick }) {
  const c = useColors();
  return (
    <button onClick={onClick} className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: active ? c.pillBg : "transparent", color: active ? LIME : c.onBgMuted, border: "none" }}>
      {icon}
    </button>
  );
}

function MenuList({ onNavigate, onViewMode }) {
  const items = [
    { key: "home", label: "Inicio", icon: Home },
    { key: "log", label: "Registro de gastos", icon: ListIcon },
    { key: "rules", label: "Reglas financieras", icon: Sliders },
    { key: "viewmode", label: "Modo de vista", icon: SlidersHorizontal, action: "viewmode" },
    { key: "categories", label: "Categorías", icon: Wallet },
    { key: "goals", label: "Metas de ahorro", icon: PiggyBank },
    { key: "statement", label: "Estado de cuenta", icon: FileText },
    { key: "stats", label: "Estadísticas", icon: PieIcon },
    { key: "calendar", label: "Calendario", icon: CalendarIcon },
    { key: "profile", label: "Perfil y configuración", icon: Settings },
  ];
  return (
    <div className="flex flex-col gap-1">
      {items.map((it) => (
        <button key={it.key} onClick={() => it.action === "viewmode" ? onViewMode() : onNavigate(it.key)} className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: "#F7F8F9", border: "none", textAlign: "left" }}>
          <it.icon size={18} color={INK} />
          <span style={{ fontSize: 16, fontWeight: 600, color: INK }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Onboarding                                                              */
/* ---------------------------------------------------------------------- */

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [periodicity, setPeriodicity] = useState("mensual");
  const [rulePreset, setRulePreset] = useState("50/30/20");
  const [customCats, setCustomCats] = useState([{ id: uid(), name: "", percent: "" }]);

  const customSum = customCats.reduce((s, c) => s + (Number(c.percent) || 0), 0);

  function finish() {
    let ruleCats;
    if (rulePreset === "personalizada") {
      ruleCats = customCats.filter((c) => c.name.trim()).map((c) => ({ id: uid("rc"), name: c.name.trim().toUpperCase(), percent: Number(c.percent) || 0 }));
    } else {
      ruleCats = RULE_PRESETS[rulePreset].map((c) => ({ ...c, id: uid("rc_" + c.id) }));
    }
    const profile = { name: name.trim() || "Usuario", incomeAmount: Number(amount) || 0, incomePeriodicity: periodicity, ruleName: rulePreset, viewMode: periodicity };
    const cats = ruleCats.map((rc) => ({ id: rc.id, name: rc.name, percent: rc.percent, subcategories: [] }));
    onDone(profile, cats);
  }

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: `linear-gradient(180deg, ${PALETTES.dark.bgTop}, ${PALETTES.dark.bgBottom})`, fontFamily: "'Urbanist', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');`}</style>
      <div className="w-full flex flex-col px-6 py-10" style={{ maxWidth: 430, color: "#fff" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: LIME, letterSpacing: 1 }}>PASO {step + 1} DE 3</div>

        {step === 0 && (
          <div className="mt-4">
            <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25 }}>¿Cómo te llamas?</h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginTop: 8 }}>Así vamos a saludarte cada vez que abras la app.</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="w-full rounded-xl mt-6" style={{ padding: "14px 16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 18 }} />
            <button onClick={() => name.trim() && setStep(1)} disabled={!name.trim()} className="w-full rounded-xl mt-8 font-bold" style={{ padding: "14px", background: name.trim() ? LIME : "rgba(255,255,255,0.15)", color: name.trim() ? INK : "rgba(255,255,255,0.4)", border: "none" }}>Continuar</button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-4">
            <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25 }}>¿Cuál es tu ingreso principal?</h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginTop: 8 }}>Con esto calculamos cuánto te toca por categoría.</p>
            <div className="relative mt-6">
              <span style={{ position: "absolute", left: 16, top: 14, color: "rgba(255,255,255,0.5)" }}>$</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" inputMode="decimal" className="w-full rounded-xl" style={{ padding: "14px 16px 14px 30px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 18 }} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {["diaria", "semanal", "quincenal", "mensual"].map((p) => (
                <button key={p} onClick={() => setPeriodicity(p)} className="rounded-xl py-3 capitalize" style={{ background: periodicity === p ? LIME : "rgba(255,255,255,0.1)", color: periodicity === p ? INK : "#fff", border: "none", fontWeight: 600, fontSize: 15 }}>{p}</button>
              ))}
            </div>
            <div className="flex gap-2 mt-8">
              <button onClick={() => setStep(0)} className="rounded-xl px-5" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none" }}><ChevronLeft size={18} /></button>
              <button onClick={() => Number(amount) > 0 && setStep(2)} disabled={!(Number(amount) > 0)} className="flex-1 rounded-xl font-bold" style={{ padding: "14px", background: Number(amount) > 0 ? LIME : "rgba(255,255,255,0.15)", color: Number(amount) > 0 ? INK : "rgba(255,255,255,0.4)", border: "none" }}>Continuar</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4">
            <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25 }}>Elige tu regla financiera</h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginTop: 8 }}>Así repartimos tu ingreso entre categorías cada mes.</p>
            <div className="flex flex-col gap-2 mt-6">
              {Object.entries(RULE_PRESETS).map(([key, cats]) => (
                <button key={key} onClick={() => setRulePreset(key)} className="rounded-xl px-4 py-3 text-left" style={{ background: rulePreset === key ? LIME : "rgba(255,255,255,0.1)", border: "none" }}>
                  <div style={{ fontWeight: 700, color: rulePreset === key ? INK : "#fff", fontSize: 16 }}>Regla {key}</div>
                  <div style={{ fontSize: 14, color: rulePreset === key ? "#3A3A00" : "rgba(255,255,255,0.55)" }}>{cats.map((c) => `${c.name} ${c.percent}%`).join(" · ")}</div>
                </button>
              ))}
              <button onClick={() => setRulePreset("personalizada")} className="rounded-xl px-4 py-3 text-left" style={{ background: rulePreset === "personalizada" ? LIME : "rgba(255,255,255,0.1)", border: "none" }}>
                <div style={{ fontWeight: 700, color: rulePreset === "personalizada" ? INK : "#fff", fontSize: 16 }}>Personalizada</div>
                <div style={{ fontSize: 14, color: rulePreset === "personalizada" ? "#3A3A00" : "rgba(255,255,255,0.55)" }}>Define tus propias categorías y porcentajes</div>
              </button>
            </div>

            {rulePreset === "personalizada" && (
              <div className="mt-4 flex flex-col gap-2">
                {customCats.map((c, i) => (
                  <div key={c.id} className="flex gap-2">
                    <input value={c.name} onChange={(e) => setCustomCats((prev) => prev.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))} placeholder="Nombre" className="flex-1 rounded-lg" style={{ padding: "10px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 15 }} />
                    <input value={c.percent} onChange={(e) => setCustomCats((prev) => prev.map((x) => x.id === c.id ? { ...x, percent: e.target.value.replace(/[^0-9]/g, "") } : x))} placeholder="%" className="rounded-lg" style={{ width: 60, padding: "10px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 15 }} />
                  </div>
                ))}
                <button onClick={() => setCustomCats((prev) => [...prev, { id: uid(), name: "", percent: "" }])} style={{ color: LIME, background: "none", border: "none", fontSize: 15, fontWeight: 600, textAlign: "left" }}>+ Agregar categoría</button>
                <div style={{ fontSize: 14, color: customSum === 100 ? GREEN : YELLOW }}>Suma actual: {customSum}% {customSum !== 100 && "(debe ser 100%)"}</div>
              </div>
            )}

            <div className="flex gap-2 mt-8 mb-6">
              <button onClick={() => setStep(1)} className="rounded-xl px-5" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none" }}><ChevronLeft size={18} /></button>
              <button
                onClick={finish}
                disabled={rulePreset === "personalizada" && customSum !== 100}
                className="flex-1 rounded-xl font-bold"
                style={{ padding: "14px", background: (rulePreset !== "personalizada" || customSum === 100) ? LIME : "rgba(255,255,255,0.15)", color: (rulePreset !== "personalizada" || customSum === 100) ? INK : "rgba(255,255,255,0.4)", border: "none" }}
              >
                Empezar a usar la app
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Home                                                                     */
/* ---------------------------------------------------------------------- */

function HomeScreen({ profile, categories, monthLabel, shiftMonth, monthlyIncome, totalSpentMonth, totalIncomeMonth, spentInCategory, budgetFor, monthExpenses, transactions, deleteTransaction, onEditTransaction, onAddExpense, onAddIncome }) {
  const c = useColors();
  const viewMode = profile.viewMode || "mensual";
  const customDays = profile.viewModeCustomDays || 7;
  const period = viewMode !== "mensual" ? getViewPeriod(transactions, viewMode, customDays) : null;

  const heroLabel = period ? `DISPONIBLE ${period.label.toUpperCase()}` : "DISPONIBLE ESTE MES";
  const heroBudget = period ? monthlyIncome / period.divisor : monthlyIncome;
  const heroSpent = period ? period.items.reduce((s, t) => s + t.amount, 0) : totalSpentMonth;
  const heroIncomeLabel = period ? "Presupuesto" : "Ingresos";
  const heroIncomeVal = period ? heroBudget : totalIncomeMonth;
  const remaining = heroBudget - heroSpent;

  return (
    <div>
      <MonthSwitcher label={monthLabel} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />

      <div className="rounded-3xl mt-3 p-5" style={{ background: LIME, color: INK, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.25)", filter: "blur(2px)" }} />
        <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.7 }}>{heroLabel}</div>
        <div className="num" style={{ fontSize: 36, fontWeight: 700, marginTop: 4 }}>{fmt(remaining)}</div>
        <div className="flex gap-4 mt-3" style={{ fontSize: 14, fontWeight: 600 }}>
          <div>{heroIncomeLabel}: <span className="num">{fmt(heroIncomeVal)}</span></div>
          <div>Gastado: <span className="num">{fmt(heroSpent)}</span></div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={onAddExpense} className="flex-1 rounded-2xl py-3 flex items-center justify-center gap-2" style={{ background: SLATE_CARD, border: "none", color: "#fff", fontWeight: 600, fontSize: 15 }}><TrendingDown size={16} color={RED} /> Registrar gasto</button>
        <button onClick={onAddIncome} className="flex-1 rounded-2xl py-3 flex items-center justify-center gap-2" style={{ background: SLATE_CARD, border: "none", color: "#fff", fontWeight: 600, fontSize: 15 }}><TrendingUp size={16} color={GREEN} /> Registrar ingreso</button>
      </div>

      <div style={{ color: c.onBg, fontWeight: 700, fontSize: 17, marginTop: 20, marginBottom: 10 }}>
        Tus reglas {period ? `— ${period.label}` : "este mes"}
      </div>
      <div className="flex flex-col gap-3">
        {categories.map((cat) => {
          const spent = period ? period.items.filter((t) => t.mainId === cat.id).reduce((s, t) => s + t.amount, 0) : spentInCategory(cat.id);
          const budget = period ? budgetFor(cat) / period.divisor : budgetFor(cat);
          const diff = budget - spent;
          const color = statusColor(spent, budget);
          const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
          return (
            <div key={cat.id} className="rounded-2xl p-4" style={{ background: CARD }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: INK }}>{cat.percent}% {cat.name}</div>
                  <div style={{ fontSize: 14, color: MUTED }}>Presupuesto {fmt(budget)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="num" style={{ fontWeight: 700, fontSize: 17, color }}>{diff >= 0 ? "Disponible" : "Te pasaste por"}</div>
                  <div className="num" style={{ fontWeight: 700, fontSize: 17, color }}>{fmt(Math.abs(diff))}</div>
                </div>
              </div>
              <div className="rounded-full mt-3" style={{ height: 7, background: "#EFF1F3" }}>
                <div className="rounded-full" style={{ height: 7, width: `${pct}%`, background: color }} />
              </div>
            </div>
          );
        })}
        {categories.length === 0 && <EmptyNote text="Aún no tienes reglas configuradas." />}
      </div>

      <div style={{ color: c.onBg, fontWeight: 700, fontSize: 17, marginTop: 22, marginBottom: 10 }}>Movimientos recientes</div>
      <div className="flex flex-col gap-2">
        {monthExpenses.slice(0, 8).map((t) => (
          <TxRow key={t.id} t={t} onDelete={() => deleteTransaction(t.id)} onEdit={() => onEditTransaction(t)} />
        ))}
        {monthExpenses.length === 0 && <EmptyNote text="Sin gastos registrados este mes todavía." />}
      </div>
    </div>
  );
}

function TxRow({ t, onDelete, onEdit }) {
  const Icon = iconFor(t.icon || "wallet");
  const iconColor = colorForIcon(t.icon || "wallet");
  return (
    <div className="rounded-2xl p-3 flex items-center justify-between" style={{ background: CARD }}>
      <div className="flex items-center gap-3">
        <div className="num flex flex-col items-center justify-center rounded-xl" style={{ minWidth: 64, padding: "6px 4px", background: t.type === "income" ? "#EAFBF1" : "#FBEDED" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: t.type === "income" ? GREEN : RED }}>{t.type === "income" ? "+" : "-"}{fmt(t.amount)}</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, color: INK }}>{t.conceptName}</div>
          <div style={{ fontSize: 13, color: MUTED }}>{t.subName}{t.time ? ` · ${t.time}` : ""} · {t.date}</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: iconColor + "22" }}><Icon size={16} color={iconColor} /></div>
        {onEdit && <button onClick={onEdit} style={{ background: "none", border: "none", padding: 6 }}><Edit2 size={15} color={MUTED} /></button>}
        <button onClick={onDelete} style={{ background: "none", border: "none", padding: 6 }}><Trash2 size={15} color={MUTED} /></button>
      </div>
    </div>
  );
}

function EmptyNote({ text }) {
  const c = useColors();
  return <div className="rounded-2xl p-5 text-center" style={{ background: c.emptyBg, color: c.onBgMuted, fontSize: 15 }}>{text}</div>;
}

function MonthSwitcher({ label, onPrev, onNext }) {
  const c = useColors();
  return (
    <div className="flex items-center justify-between rounded-full px-2 py-1" style={{ background: c.pillBgSoft, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
      <button onClick={onPrev} className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: c.pillBg, border: "none" }}><ChevronLeft size={16} color={c.onBg} /></button>
      <div style={{ color: c.onBg, fontWeight: 700, fontSize: 15 }}>{label}</div>
      <button onClick={onNext} className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: c.pillBg, border: "none" }}><ChevronRight size={16} color={c.onBg} /></button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Stats                                                                    */
/* ---------------------------------------------------------------------- */

function StatsScreen({ categories, ruleFilter, setRuleFilter, monthLabel, shiftMonth, monthExpenses, transactions, monthCursor, spentInCategory, budgetFor }) {
  const c = useColors();
  const donutData = categories.map((c, i) => ({ name: c.name, value: spentInCategory(c.id), color: RULE_COLORS[i % RULE_COLORS.length] })).filter((d) => d.value > 0);

  const filteredCats = ruleFilter === "todas" ? categories : categories.filter((c) => c.id === ruleFilter);
  const subData = [];
  filteredCats.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      const amt = monthExpenses.filter((t) => t.mainId === cat.id && t.subId === sub.id).reduce((s, t) => s + t.amount, 0);
      if (amt > 0) subData.push({ name: sub.name, value: amt });
    });
  });
  subData.sort((a, b) => b.value - a.value);

  const conceptMap = {};
  monthExpenses.filter((t) => ruleFilter === "todas" || t.mainId === ruleFilter).forEach((t) => {
    conceptMap[t.conceptName] = (conceptMap[t.conceptName] || 0) + t.amount;
  });
  const conceptData = Object.entries(conceptMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

  const yearData = MONTHS.map((m, i) => {
    const key = `${monthCursor.y}-${String(i + 1).padStart(2, "0")}`;
    const total = transactions.filter((t) => t.type === "expense" && ym(t.date) === key).reduce((s, t) => s + t.amount, 0);
    return { name: m.slice(0, 3), value: total };
  });

  return (
    <div>
      <MonthSwitcher label={monthLabel} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />

      <div className="flex gap-2 mt-3 overflow-x-auto" style={{ paddingBottom: 2 }}>
        <Pill active={ruleFilter === "todas"} onClick={() => setRuleFilter("todas")}>TODAS</Pill>
        {categories.map((c) => <Pill key={c.id} active={ruleFilter === c.id} onClick={() => setRuleFilter(c.id)}>{c.percent}% {c.name}</Pill>)}
      </div>

      <StatCard title="Distribución del mes por regla">
        {donutData.length === 0 ? <EmptyNote text="Sin gastos este mes." /> : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {donutData.map((d, i) => (
                <div key={i} className="flex items-center gap-1" style={{ fontSize: 13, color: c.onBg }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: d.color }} />
                  {d.name} · {fmt(d.value)}
                </div>
              ))}
            </div>
          </>
        )}
      </StatCard>

      <StatCard title="Gasto por subcategoría">
        {subData.length === 0 ? <EmptyNote text="Sin datos para este filtro." /> : (
          <ResponsiveContainer width="100%" height={Math.max(120, subData.length * 34)}>
            <BarChart data={subData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 13, fill: INK }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="value" fill={LIME} radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </StatCard>

      <StatCard title="Top 10 conceptos">
        {conceptData.length === 0 ? <EmptyNote text="Sin datos para este filtro." /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={conceptData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0F3" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: INK }} interval={0} angle={-35} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12, fill: INK }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="value" fill="#5FB8FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </StatCard>

      <StatCard title={`Comparativo anual ${monthCursor.y}`}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={yearData} margin={{ left: -20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: INK }} />
            <YAxis tick={{ fontSize: 12, fill: INK }} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Bar dataKey="value" fill="#B98CFF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </StatCard>
    </div>
  );
}

function StatCard({ title, children }) {
  return (
    <div className="rounded-2xl p-4 mt-3" style={{ background: CARD }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: INK, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Calendar                                                                 */
/* ---------------------------------------------------------------------- */

function CalendarScreen({ monthCursor, shiftMonth, monthLabel, monthExpenses, onDayClick }) {
  const weeks = getMonthGrid(monthCursor.y, monthCursor.m);
  const totalsByDay = {};
  monthExpenses.forEach((t) => {
    const day = Number(t.date.slice(8, 10));
    totalsByDay[day] = (totalsByDay[day] || 0) + t.amount;
  });
  const monthTotal = monthExpenses.reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <MonthSwitcher label={monthLabel} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />
      <div className="rounded-2xl p-4 mt-3" style={{ background: CARD }}>
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((w, i) => <div key={i} style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: MUTED }}>{w}</div>)}
        </div>
        <div className="flex flex-col gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                if (!day) return <div key={di} />;
                const total = totalsByDay[day] || 0;
                const dateStr = `${monthCursor.y}-${String(monthCursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                return (
                  <button key={di} onClick={() => onDayClick(dateStr)} className="rounded-lg flex flex-col items-center justify-center" style={{ aspectRatio: "1", background: total > 0 ? "#FFF3D6" : "#F7F8F9", border: "none", padding: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{day}</div>
                    {total > 0 && <div className="num" style={{ fontSize: 10, color: RED, fontWeight: 700 }}>{total >= 1000 ? `${Math.round(total / 100) / 10}K` : Math.round(total)}</div>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-4 mt-3 flex items-center justify-between" style={{ background: LIME }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>Total del mes</div>
        <div className="num" style={{ fontWeight: 700, fontSize: 19, color: INK }}>{fmt(monthTotal)}</div>
      </div>
    </div>
  );
}

function DayDetail({ date, transactions, onDelete, onEdit, onAdd }) {
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  return (
    <div>
      <div className="flex flex-col gap-2 mb-4">
        {transactions.map((t) => <TxRow key={t.id} t={t} onDelete={() => onDelete(t.id)} onEdit={() => onEdit(t)} />)}
        {transactions.length === 0 && <EmptyNote text="Sin gastos registrados este día." />}
      </div>
      {transactions.length > 0 && <div className="flex justify-between mb-4" style={{ fontWeight: 700, fontSize: 16, color: INK }}><span>Total</span><span className="num">{fmt(total)}</span></div>}
      <PrimaryBtn onClick={onAdd}>+ Agregar gasto este día</PrimaryBtn>
    </div>
  );
}

// Given the full transaction list, returns the expenses + budget divisor for
// the "modo de vista" currently selected (daily/weekly/biweekly/custom),
// always anchored to today's real calendar date.
function getViewPeriod(transactions, viewMode, customDays) {
  const today = todayISO();
  const expenses = transactions.filter((t) => t.type === "expense");
  if (viewMode === "diaria") {
    return { label: "hoy", items: expenses.filter((t) => t.date === today), divisor: 30 };
  }
  if (viewMode === "semanal") {
    const mon = mondayOf(today), sun = addDays(mon, 6);
    return { label: "esta semana", items: expenses.filter((t) => t.date >= mon && t.date <= sun), divisor: 4.33 };
  }
  if (viewMode === "quincenal") {
    const d = new Date(today + "T00:00:00");
    const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    let start, end;
    if (day <= 15) { start = `${y}-${String(m + 1).padStart(2, "0")}-01`; end = `${y}-${String(m + 1).padStart(2, "0")}-15`; }
    else { const lastDay = new Date(y, m + 1, 0).getDate(); start = `${y}-${String(m + 1).padStart(2, "0")}-16`; end = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`; }
    return { label: "esta quincena", items: expenses.filter((t) => t.date >= start && t.date <= end), divisor: 2 };
  }
  if (viewMode === "personalizado") {
    const n = Math.max(1, Number(customDays) || 7);
    const start = addDays(today, -(n - 1));
    return { label: `últimos ${n} días`, items: expenses.filter((t) => t.date >= start && t.date <= today), divisor: 30 / n };
  }
  return null;
}

/* ---------------------------------------------------------------------- */
/* Registro (log) — day / week / month chronological view                 */
/* ---------------------------------------------------------------------- */

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function mondayOf(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const offset = (d.getDay() + 6) % 7;
  return addDays(dateStr, -offset);
}
function fmtDayLong(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const wd = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"][d.getDay()];
  return `${wd.charAt(0).toUpperCase() + wd.slice(1)} ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}`;
}

function LogScreen({ transactions, onAdd, onDelete, onEdit }) {
  const c = useColors();
  const [view, setView] = useState("day"); // day | week | month
  const [cursor, setCursor] = useState(todayISO());
  const [monthCursor, setMonthCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });

  const expenses = transactions.filter((t) => t.type === "expense");
  const byDate = {};
  expenses.forEach((t) => { (byDate[t.date] = byDate[t.date] || []).push(t); });
  Object.values(byDate).forEach((list) => list.sort((a, b) => (b.time || "").localeCompare(a.time || "")));

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Pill active={view === "day"} onClick={() => setView("day")}>Día</Pill>
        <Pill active={view === "week"} onClick={() => setView("week")}>Semana</Pill>
        <Pill active={view === "month"} onClick={() => setView("month")}>Mes</Pill>
      </div>

      {view === "day" && (
        <DayLogView
          cursor={cursor}
          setCursor={setCursor}
          items={byDate[cursor] || []}
          onAdd={() => onAdd(cursor)}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}

      {view === "week" && (
        <WeekLogView
          cursor={cursor}
          setCursor={setCursor}
          byDate={byDate}
          onAdd={onAdd}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}

      {view === "month" && (
        <MonthLogView
          monthCursor={monthCursor}
          setMonthCursor={setMonthCursor}
          byDate={byDate}
          onAdd={onAdd}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
    </div>
  );
}

function DayLogView({ cursor, setCursor, items, onAdd, onDelete, onEdit }) {
  const c = useColors();
  const total = items.reduce((s, t) => s + t.amount, 0);
  return (
    <div>
      <div className="flex items-center justify-between rounded-full px-2 py-1 mb-3" style={{ background: c.pillBgSoft, backdropFilter: "blur(8px)" }}>
        <button onClick={() => setCursor((d) => addDays(d, -1))} className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: c.pillBg, border: "none" }}><ChevronLeft size={16} color={c.onBg} /></button>
        <div style={{ color: c.onBg, fontWeight: 700, fontSize: 15, textTransform: "capitalize" }}>{fmtDayLong(cursor)}</div>
        <button onClick={() => setCursor((d) => addDays(d, 1))} className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: c.pillBg, border: "none" }}><ChevronRight size={16} color={c.onBg} /></button>
      </div>

      <div className="rounded-2xl p-4 mb-3 flex items-center justify-between" style={{ background: LIME }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>Total del día</div>
        <div className="num" style={{ fontWeight: 700, fontSize: 19, color: INK }}>{fmt(total)}</div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {items.map((t) => <TxRow key={t.id} t={t} onDelete={() => onDelete(t.id)} onEdit={() => onEdit(t)} />)}
        {items.length === 0 && <EmptyNote text="Sin gastos registrados este día." />}
      </div>

      <PrimaryBtn onClick={onAdd}>+ Agregar gasto</PrimaryBtn>
    </div>
  );
}

function WeekLogView({ cursor, setCursor, byDate, onAdd, onDelete, onEdit }) {
  const c = useColors();
  const monday = mondayOf(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const weekTotal = days.reduce((s, d) => s + (byDate[d] || []).reduce((ss, t) => ss + t.amount, 0), 0);
  const sunday = days[6];

  return (
    <div>
      <div className="flex items-center justify-between rounded-full px-2 py-1 mb-3" style={{ background: c.pillBgSoft, backdropFilter: "blur(8px)" }}>
        <button onClick={() => setCursor((d) => addDays(d, -7))} className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: c.pillBg, border: "none" }}><ChevronLeft size={16} color={c.onBg} /></button>
        <div style={{ color: c.onBg, fontWeight: 700, fontSize: 14 }}>{monday.slice(8,10)} — {sunday.slice(8,10)} {MONTHS[Number(sunday.slice(5,7)) - 1]}</div>
        <button onClick={() => setCursor((d) => addDays(d, 7))} className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: c.pillBg, border: "none" }}><ChevronRight size={16} color={c.onBg} /></button>
      </div>

      <div className="rounded-2xl p-4 mb-3 flex items-center justify-between" style={{ background: LIME }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>Total de la semana</div>
        <div className="num" style={{ fontWeight: 700, fontSize: 19, color: INK }}>{fmt(weekTotal)}</div>
      </div>

      <div className="flex flex-col gap-3">
        {days.map((d) => {
          const items = byDate[d] || [];
          const dayTotal = items.reduce((s, t) => s + t.amount, 0);
          return (
            <div key={d} className="rounded-2xl p-3" style={{ background: CARD }}>
              <div className="flex items-center justify-between mb-2">
                <div style={{ fontWeight: 700, fontSize: 14, color: INK, textTransform: "capitalize" }}>{fmtDayLong(d)}</div>
                <div className="flex items-center gap-2">
                  {dayTotal > 0 && <span className="num" style={{ fontWeight: 700, fontSize: 14, color: RED }}>{fmt(dayTotal)}</span>}
                  <button onClick={() => onAdd(d)} className="rounded-full flex items-center justify-center" style={{ width: 22, height: 22, background: "#F2F3F5", border: "none" }}><Plus size={12} color={INK} /></button>
                </div>
              </div>
              {items.length === 0 ? (
                <div style={{ fontSize: 13, color: MUTED }}>Sin gastos.</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {items.map((t) => (
                    <div key={t.id} className="flex items-center justify-between" style={{ fontSize: 14 }}>
                      <span style={{ color: "#5A6472" }}>{t.conceptName} {t.time && `· ${t.time}`}</span>
                      <div className="flex items-center gap-2">
                        <span className="num" style={{ fontWeight: 700, color: INK }}>{fmt(t.amount)}</span>
                        <button onClick={() => onEdit(t)} style={{ background: "none", border: "none", padding: 2 }}><Edit2 size={13} color={MUTED} /></button>
                        <button onClick={() => onDelete(t.id)} style={{ background: "none", border: "none", padding: 2 }}><Trash2 size={13} color={MUTED} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthLogView({ monthCursor, setMonthCursor, byDate, onAdd, onDelete, onEdit }) {
  const c = useColors();
  function shift(delta) {
    setMonthCursor((cur) => { let m = cur.m + delta, y = cur.y; if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; } return { y, m }; });
  }
  const weeks = getMonthGrid(monthCursor.y, monthCursor.m);
  const monthTotal = Object.entries(byDate).filter(([d]) => d.startsWith(`${monthCursor.y}-${String(monthCursor.m + 1).padStart(2, "0")}`)).reduce((s, [, items]) => s + items.reduce((ss, t) => ss + t.amount, 0), 0);

  return (
    <div>
      <MonthSwitcher label={`${MONTHS[monthCursor.m]} ${monthCursor.y}`} onPrev={() => shift(-1)} onNext={() => shift(1)} />

      <div className="rounded-2xl p-4 my-3 flex items-center justify-between" style={{ background: LIME }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>Total del mes</div>
        <div className="num" style={{ fontWeight: 700, fontSize: 19, color: INK }}>{fmt(monthTotal)}</div>
      </div>

      <div className="flex flex-col gap-4">
        {weeks.map((week, wi) => {
          const weekDays = week.filter((d) => d).map((d) => `${monthCursor.y}-${String(monthCursor.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
          const weekHasData = weekDays.some((d) => (byDate[d] || []).length > 0);
          if (weekDays.length === 0) return null;
          return (
            <div key={wi}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.onBgMuted, marginBottom: 6, letterSpacing: 0.5 }}>SEMANA {wi + 1}</div>
              {!weekHasData ? (
                <div className="rounded-xl px-3 py-2" style={{ background: c.emptyBg, fontSize: 13, color: c.onBgMuted }}>Sin gastos esta semana.</div>
              ) : (
                <div className="rounded-2xl p-3" style={{ background: CARD }}>
                  {weekDays.map((d) => {
                    const items = byDate[d] || [];
                    if (items.length === 0) return null;
                    const dayTotal = items.reduce((s, t) => s + t.amount, 0);
                    return (
                      <div key={d} className="mb-2 pb-2" style={{ borderBottom: "1px solid #F1F2F4" }}>
                        <div className="flex items-center justify-between mb-1">
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#3A4453", textTransform: "capitalize" }}>{fmtDayLong(d)}</div>
                          <div className="flex items-center gap-2">
                            <span className="num" style={{ fontWeight: 700, fontSize: 13, color: RED }}>{fmt(dayTotal)}</span>
                            <button onClick={() => onAdd(d)} className="rounded-full flex items-center justify-center" style={{ width: 18, height: 18, background: "#F2F3F5", border: "none" }}><Plus size={10} color={INK} /></button>
                          </div>
                        </div>
                        {items.map((t) => (
                          <div key={t.id} className="flex items-center justify-between" style={{ fontSize: 13, color: "#5A6472", paddingLeft: 4 }}>
                            <span>{t.conceptName} <span style={{ color: MUTED }}>({t.subName}{t.time ? ` · ${t.time}` : ""})</span></span>
                            <div className="flex items-center gap-2">
                              <span className="num" style={{ fontWeight: 600 }}>{fmt(t.amount)}</span>
                              <button onClick={() => onEdit(t)} style={{ background: "none", border: "none", padding: 2 }}><Edit2 size={12} color={MUTED} /></button>
                              <button onClick={() => onDelete(t.id)} style={{ background: "none", border: "none", padding: 2 }}><Trash2 size={12} color={MUTED} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => onAdd(todayISO())} className="w-full rounded-xl mt-4 font-bold" style={{ padding: "13px", background: LIME, color: INK, border: "none" }}>+ Agregar gasto de hoy</button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Statement                                                                */
/* ---------------------------------------------------------------------- */

function StatementScreen({ categories, monthLabel, shiftMonth, monthCursor, monthExpenses, totalIncomeMonth, totalSpentMonth, budgetFor, spentInCategory }) {
  const c = useColors();
  const [collapsed, setCollapsed] = useState({});
  const toggle = (id) => setCollapsed((p) => ({ ...p, [id]: !p[id] }));

  function catName(mainId) { return (categories.find((x) => x.id === mainId) || {}).name || "Sin categoría"; }

  // Group this month's expenses into calendar weeks (Monday–Sunday)
  const weeks = getMonthGrid(monthCursor.y, monthCursor.m);
  const weekGroups = weeks.map((week, wi) => {
    const dayStrs = week.filter((d) => d).map((d) => `${monthCursor.y}-${String(monthCursor.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    const items = monthExpenses.filter((t) => dayStrs.includes(t.date)).sort((a, b) => a.date === b.date ? (a.time || "").localeCompare(b.time || "") : a.date.localeCompare(b.date));
    const total = items.reduce((s, t) => s + t.amount, 0);
    const first = dayStrs[0], last = dayStrs[dayStrs.length - 1];
    return { key: `w${wi}`, index: wi + 1, items, total, first, last };
  }).filter((w) => w.first);

  return (
    <div className="print-area">
      <MonthSwitcher label={monthLabel} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />
      <div className="rounded-2xl p-4 mt-3" style={{ background: CARD }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: INK, marginBottom: 10 }}>ESTADO DE CUENTA — {monthLabel.toUpperCase()}</div>

        {weekGroups.map((w) => {
          const isCollapsed = collapsed[w.key];
          const weekColor = RULE_COLORS[(w.index - 1) % RULE_COLORS.length];
          return (
            <div key={w.key} className="mb-8" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #EEF0F3" }}>
              <div style={{ height: 6, background: weekColor }} />
              <button onClick={() => toggle(w.key)} className="w-full flex items-center justify-between" style={{ background: "#FAFBFC", border: "none", padding: "10px 12px" }}>
                <div className="flex items-center gap-2">
                  <span style={{ background: weekColor, color: INK, fontWeight: 800, fontSize: 13, padding: "3px 10px", borderRadius: 999 }}>SEMANA {w.index}</span>
                  <span style={{ fontWeight: 500, color: MUTED, fontSize: 13 }}>{w.first.slice(8, 10)}–{w.last.slice(8, 10)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="num" style={{ fontWeight: 700, fontSize: 14, color: RED }}>{fmt(w.total)}</span>
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
              </button>
              {!isCollapsed && (
                <div style={{ padding: "10px 12px" }}>
                  {w.items.length === 0 ? (
                    <div style={{ fontSize: 14, color: MUTED, padding: "6px 0" }}>Sin gastos esta semana.</div>
                  ) : (
                    w.items.map((t) => (
                      <div key={t.id} className="flex items-start justify-between" style={{ fontSize: 14, color: "#5A6472", padding: "6px 0", borderBottom: "1px dashed #F1F2F4" }}>
                        <div style={{ flex: 1, paddingRight: 8 }}>
                          <div style={{ fontWeight: 700, color: INK }}>{t.conceptName}</div>
                          <div style={{ color: MUTED, marginTop: 1 }}>
                            {t.date}{t.time ? ` · ${t.time}` : ""} · {catName(t.mainId)} › {t.subName}
                          </div>
                          {t.note && <div style={{ color: MUTED, marginTop: 1, fontStyle: "italic" }}>“{t.note}”</div>}
                        </div>
                        <span className="num" style={{ fontWeight: 700, color: INK, whiteSpace: "nowrap" }}>{fmt(t.amount)}</span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between mt-2" style={{ fontSize: 14, fontWeight: 800, color: INK }}>
                    <span>Total semana {w.index}</span><span className="num">{fmt(w.total)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div style={{ fontWeight: 800, fontSize: 15, color: INK, margin: "16px 0 8px" }}>RESUMEN POR REGLA FINANCIERA</div>
        {categories.map((cat) => {
          const budget = budgetFor(cat);
          const spent = spentInCategory(cat.id);
          const diff = budget - spent;
          const color = statusColor(spent, budget);
          return (
            <div key={cat.id} className="flex justify-between" style={{ fontSize: 14, padding: "4px 0" }}>
              <span style={{ color: "#5A6472" }}>{cat.percent}% {cat.name}</span>
              <span className="num" style={{ fontWeight: 700, color }}>{fmt(spent)} / {fmt(budget)}</span>
            </div>
          );
        })}

        <div className="mt-3 pt-3" style={{ borderTop: "2px solid #EEF0F3" }}>
          <div className="flex justify-between" style={{ fontWeight: 800, fontSize: 16, color: INK }}><span>GASTOS TOTALES</span><span className="num">{fmt(totalSpentMonth)}</span></div>
          <div className="flex justify-between" style={{ fontWeight: 800, fontSize: 16, color: INK }}><span>INGRESOS TOTALES</span><span className="num">{fmt(totalIncomeMonth)}</span></div>
          <div className="flex justify-between mt-1" style={{ fontWeight: 800, fontSize: 17, color: statusColor(totalSpentMonth, totalIncomeMonth) }}><span>BALANCE</span><span className="num">{fmt(totalIncomeMonth - totalSpentMonth)}</span></div>
        </div>
      </div>

      <button onClick={() => window.print()} className="no-print w-full rounded-xl mt-3 flex items-center justify-center gap-2 font-bold" style={{ padding: "13px", background: LIME, color: INK, border: "none" }}>
        <Printer size={16} /> Exportar / Imprimir como PDF
      </button>
      <div className="no-print" style={{ fontSize: 13, color: c.onBgMuted, textAlign: "center", marginTop: 6 }}>
        Se abrirá el diálogo de impresión de tu navegador — elige "Guardar como PDF".
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Categories management                                                    */
/* ---------------------------------------------------------------------- */

function CategoriesScreen({ categories, onOpenCat, spentInCategory, budgetFor }) {
  const c = useColors();
  return (
    <div>
      <div style={{ color: c.onBg, fontWeight: 700, fontSize: 19, margin: "6px 0 12px" }}>Categorías</div>
      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => onOpenCat(cat)} className="rounded-2xl p-4 text-left w-full" style={{ background: CARD, border: "none" }}>
            <div className="flex items-center justify-between">
              <div style={{ fontWeight: 700, fontSize: 16, color: INK }}>{cat.percent}% {cat.name}</div>
              <ChevronRight size={16} color={MUTED} />
            </div>
            <div style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>{cat.subcategories.length} subcategoría{cat.subcategories.length !== 1 && "s"} · Presupuesto {fmt(budgetFor(cat))}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const WEEKDAY_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function conceptScheduleLabel(con) {
  if (!con.isFixed) return "Monto único";
  if (con.periodicity === "mensual") return `Fijo · mensual${con.dueDay ? `, día ${con.dueDay}` : ""}`;
  if (con.periodicity === "quincenal") return `Fijo · quincenal${con.dueDay ? `, días ${con.dueDay} y ${((Number(con.dueDay) + 15 - 1) % 30) + 1}` : ""}`;
  if (con.periodicity === "semanal") return `Fijo · semanal${con.dueWeekday !== undefined && con.dueWeekday !== null ? `, ${WEEKDAY_FULL[con.dueWeekday]}` : ""}`;
  if (con.periodicity === "diaria") return "Fijo · diario";
  return "Fijo";
}

function ConceptScheduleFields({ isFixed, setIsFixed, periodicity, setPeriodicity, dueDay, setDueDay, dueWeekday, setDueWeekday }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button type="button" onClick={() => setIsFixed(false)} className="flex-1 rounded-lg py-2" style={{ background: !isFixed ? LIME : "#F7F8F9", border: "none", fontWeight: 700, fontSize: 13 }}>Monto único</button>
        <button type="button" onClick={() => setIsFixed(true)} className="flex-1 rounded-lg py-2" style={{ background: isFixed ? LIME : "#F7F8F9", border: "none", fontWeight: 700, fontSize: 13 }}>Gasto fijo</button>
      </div>
      {isFixed && (
        <>
          <select value={periodicity} onChange={(e) => setPeriodicity(e.target.value)} className="rounded-lg" style={{ padding: "9px 10px", background: "#fff", border: "1px solid #E7E9EC", fontSize: 14 }}>
            <option value="diaria">Diaria</option><option value="semanal">Semanal</option><option value="quincenal">Quincenal</option><option value="mensual">Mensual</option>
          </select>
          {periodicity === "mensual" && (
            <input value={dueDay} onChange={(e) => setDueDay(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} placeholder="Día del mes en que se paga (1-31)" className="rounded-lg" style={{ padding: "9px 10px", background: "#fff", border: "1px solid #E7E9EC", fontSize: 14 }} />
          )}
          {periodicity === "quincenal" && (
            <input value={dueDay} onChange={(e) => setDueDay(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} placeholder="Primer día de pago (1-15)" className="rounded-lg" style={{ padding: "9px 10px", background: "#fff", border: "1px solid #E7E9EC", fontSize: 14 }} />
          )}
          {periodicity === "semanal" && (
            <div className="flex gap-1">
              {WEEKDAYS.map((w, i) => (
                <button type="button" key={i} onClick={() => setDueWeekday(i)} className="flex-1 rounded-lg py-2" style={{ background: dueWeekday === i ? LIME : "#fff", border: "1px solid #E7E9EC", fontWeight: 700, fontSize: 13 }}>{w}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CategoryManager({ cat, onAddSub, onAddConcept, onEditSub, onEditConcept, onDeleteSub, onDeleteConcept, onQuickRegister }) {
  const [newSubName, setNewSubName] = useState("");
  const [newSubIcon, setNewSubIcon] = useState("wallet");
  const [openSub, setOpenSub] = useState(null);
  const [conName, setConName] = useState("");
  const [conAmount, setConAmount] = useState("");
  const [conFixed, setConFixed] = useState(false);
  const [conPer, setConPer] = useState("mensual");
  const [conDueDay, setConDueDay] = useState("");
  const [conDueWeekday, setConDueWeekday] = useState(0);

  // editing state for renaming an existing subcategory
  const [editSubId, setEditSubId] = useState(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubIcon, setEditSubIcon] = useState("wallet");

  // editing state for an existing concept
  const [editCon, setEditCon] = useState(null); // { subId, conId }
  const [editConName, setEditConName] = useState("");
  const [editConAmount, setEditConAmount] = useState("");
  const [editConFixed, setEditConFixed] = useState(false);
  const [editConPer, setEditConPer] = useState("mensual");
  const [editConDueDay, setEditConDueDay] = useState("");
  const [editConDueWeekday, setEditConDueWeekday] = useState(0);

  function startEditSub(sub) {
    setEditSubId(sub.id); setEditSubName(sub.name); setEditSubIcon(sub.icon || "wallet");
    setOpenSub(null); setEditCon(null);
  }
  function startEditCon(subId, con) {
    setEditCon({ subId, conId: con.id }); setEditConName(con.name); setEditConAmount(String(con.amount));
    setEditConFixed(!!con.isFixed); setEditConPer(con.periodicity || "mensual");
    setEditConDueDay(con.dueDay ? String(con.dueDay) : ""); setEditConDueWeekday(con.dueWeekday ?? 0);
    setEditSubId(null);
  }
  function resetNewConceptForm() {
    setConName(""); setConAmount(""); setConFixed(false); setConPer("mensual"); setConDueDay(""); setConDueWeekday(0); setOpenSub(null);
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: MUTED, marginBottom: 12, lineHeight: 1.4 }}>
        Los conceptos son plantillas de referencia — para que un gasto cuente de verdad,
        dale al botón <b>Registrar</b> junto al concepto (o usa "+ Registrar gasto" desde Inicio).
      </p>
      <div className="flex flex-col gap-3 mb-4">
        {cat.subcategories.map((sub) => {
          const Icon = iconFor(sub.icon);
          const subColor = colorForIcon(sub.icon);
          const isEditingThisSub = editSubId === sub.id;
          return (
            <div key={sub.id} className="rounded-xl" style={{ background: "#F7F8F9", padding: 12 }}>
              {isEditingThisSub ? (
                <div className="flex flex-col gap-2">
                  <input value={editSubName} onChange={(e) => setEditSubName(e.target.value)} className="rounded-lg" style={{ padding: "9px 10px", background: "#fff", border: "1px solid #E7E9EC", fontSize: 15 }} />
                  <div className="flex gap-2 flex-wrap">
                    {ICONS.map(({ key, Icon: I, color }) => (
                      <button key={key} onClick={() => setEditSubIcon(key)} className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: editSubIcon === key ? LIME : color + "22", border: "none" }}><I size={15} color={editSubIcon === key ? INK : color} /></button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditSubId(null)} className="flex-1 rounded-lg py-2" style={{ background: "#fff", border: "none", fontWeight: 600, fontSize: 14 }}>Cancelar</button>
                    <button onClick={() => { if (editSubName.trim()) { onEditSub(sub.id, editSubName.trim(), editSubIcon); setEditSubId(null); } }} className="flex-1 rounded-lg py-2" style={{ background: LIME, border: "none", fontWeight: 700, fontSize: 14 }}>Guardar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: subColor + "22" }}><Icon size={16} color={subColor} /></div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>{sub.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setOpenSub(openSub === sub.id ? null : sub.id); if (openSub !== sub.id) resetNewConceptForm(); }} style={{ background: "none", border: "none", fontSize: 14, color: "#5A6472", fontWeight: 600 }}>{openSub === sub.id ? "Cerrar" : "+ Concepto"}</button>
                    <button onClick={() => startEditSub(sub)} style={{ background: "none", border: "none" }}><Edit2 size={14} color={MUTED} /></button>
                    <button onClick={() => onDeleteSub(sub.id)} style={{ background: "none", border: "none" }}><Trash2 size={14} color={MUTED} /></button>
                  </div>
                </div>
              )}

              {sub.concepts.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {sub.concepts.map((con) => {
                    const isEditingThisCon = editCon && editCon.subId === sub.id && editCon.conId === con.id;
                    if (isEditingThisCon) {
                      return (
                        <div key={con.id} className="flex flex-col gap-2 rounded-lg p-2" style={{ background: "#fff" }}>
                          <input value={editConName} onChange={(e) => setEditConName(e.target.value)} className="rounded-lg" style={{ padding: "8px 9px", background: "#F7F8F9", border: "1px solid #E7E9EC", fontSize: 14 }} />
                          <input value={editConAmount} onChange={(e) => setEditConAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Monto" className="rounded-lg" style={{ padding: "8px 9px", background: "#F7F8F9", border: "1px solid #E7E9EC", fontSize: 14 }} />
                          <ConceptScheduleFields
                            isFixed={editConFixed} setIsFixed={setEditConFixed}
                            periodicity={editConPer} setPeriodicity={setEditConPer}
                            dueDay={editConDueDay} setDueDay={setEditConDueDay}
                            dueWeekday={editConDueWeekday} setDueWeekday={setEditConDueWeekday}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setEditCon(null)} className="flex-1 rounded-lg py-2" style={{ background: "#F7F8F9", border: "none", fontWeight: 600, fontSize: 13 }}>Cancelar</button>
                            <button onClick={() => { if (editConName.trim()) { onEditConcept(sub.id, con.id, editConName.trim(), editConAmount, editConFixed, editConPer, editConDueDay, editConDueWeekday); setEditCon(null); } }} className="flex-1 rounded-lg py-2" style={{ background: LIME, border: "none", fontWeight: 700, fontSize: 13 }}>Guardar</button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={con.id} className="flex justify-between items-center" style={{ fontSize: 14, color: "#5A6472" }}>
                        <span>{con.name} <span style={{ color: MUTED, fontSize: 12 }}>· {conceptScheduleLabel(con)}</span></span>
                        <div className="flex items-center gap-1">
                          <span className="num" style={{ fontWeight: 600 }}>{fmt(con.amount)}</span>
                          <button onClick={() => onQuickRegister(sub, con)} title="Registrar este gasto" style={{ background: LIME, border: "none", borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 800, color: INK }}>Registrar</button>
                          <button onClick={() => startEditCon(sub.id, con)} style={{ background: "none", border: "none" }}><Edit2 size={13} color={MUTED} /></button>
                          <button onClick={() => onDeleteConcept(sub.id, con.id)} style={{ background: "none", border: "none" }}><X size={13} color={MUTED} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {openSub === sub.id && (
                <div className="mt-3 flex flex-col gap-2">
                  <input value={conName} onChange={(e) => setConName(e.target.value)} placeholder="Nombre del concepto (ej. Renta)" className="rounded-lg" style={{ padding: "9px 10px", background: "#fff", border: "1px solid #E7E9EC", fontSize: 14 }} />
                  <input value={conAmount} onChange={(e) => setConAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Monto de referencia" className="rounded-lg" style={{ padding: "9px 10px", background: "#fff", border: "1px solid #E7E9EC", fontSize: 14 }} />
                  <ConceptScheduleFields
                    isFixed={conFixed} setIsFixed={setConFixed}
                    periodicity={conPer} setPeriodicity={setConPer}
                    dueDay={conDueDay} setDueDay={setConDueDay}
                    dueWeekday={conDueWeekday} setDueWeekday={setConDueWeekday}
                  />
                  <button onClick={() => { if (conName.trim()) { onAddConcept(sub.id, conName.trim(), conAmount, conFixed, conPer, conDueDay, conDueWeekday); resetNewConceptForm(); } }} className="rounded-lg py-2" style={{ background: LIME, border: "none", fontWeight: 700, fontSize: 14 }}>Guardar concepto</button>
                </div>
              )}
            </div>
          );
        })}
        {cat.subcategories.length === 0 && <EmptyNote text="Sin subcategorías todavía." />}
      </div>

      <div style={{ fontWeight: 700, fontSize: 15, color: INK, marginBottom: 8 }}>Nueva subcategoría</div>
      <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="Ej. CASA, SUPER, AUTO…" className="w-full rounded-lg mb-2" style={{ padding: "10px 12px", background: "#F4F5F7", border: "1px solid #E7E9EC", fontSize: 15 }} />
      <div className="flex gap-2 flex-wrap mb-3">
        {ICONS.map(({ key, Icon, color }) => (
          <button key={key} onClick={() => setNewSubIcon(key)} className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: newSubIcon === key ? LIME : color + "22", border: "none" }}><Icon size={16} color={newSubIcon === key ? INK : color} /></button>
        ))}
      </div>
      <PrimaryBtn onClick={() => { if (newSubName.trim()) { onAddSub(newSubName.trim(), newSubIcon); setNewSubName(""); } }}>+ Agregar subcategoría</PrimaryBtn>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Add transaction sheet                                                    */
/* ---------------------------------------------------------------------- */

function AddTransactionSheet({ kind, categories, profile, defaultDate, editingTx, template, onClose, onSave, onUpdateIncomeDefault, ensureSubFor }) {
  const isEdit = !!editingTx;
  const [type, setType] = useState(editingTx ? editingTx.type : kind); // expense | income
  const [mainId, setMainId] = useState(editingTx ? editingTx.mainId || "" : template ? template.mainId : categories[0]?.id || "");
  const [subId, setSubId] = useState(editingTx ? editingTx.subId || "" : template ? template.subId : "");
  const [newSubName, setNewSubName] = useState("");
  const [conceptName, setConceptName] = useState(editingTx ? editingTx.conceptName : template ? template.conceptName : "");
  const [amount, setAmount] = useState(editingTx ? String(editingTx.amount) : template ? String(template.amount) : "");
  const [date, setDate] = useState(editingTx ? editingTx.date : defaultDate);
  const [time, setTime] = useState(editingTx ? (editingTx.time || new Date().toTimeString().slice(0, 5)) : () => new Date().toTimeString().slice(0, 5));
  const [note, setNote] = useState(editingTx ? (editingTx.note || "") : "");
  const [incomeKind, setIncomeKind] = useState(editingTx && editingTx.subName === "Ingreso extra" ? "extra" : "principal");
  const [saveDefault, setSaveDefault] = useState(false);

  const mainCat = categories.find((c) => c.id === mainId);
  const subs = mainCat ? mainCat.subcategories : [];
  const currentSub = subs.find((s) => s.id === subId);

  function save() {
    if (!amount || Number(amount) <= 0) return;
    if (type === "expense") {
      if (!mainId) return;
      let finalSubId = subId, finalSubName = currentSub ? currentSub.name : "";
      let newSub = null;
      if (!subId && newSubName.trim()) {
        finalSubName = newSubName.trim();
        newSub = { name: finalSubName, icon: "wallet" };
      }
      const tx = {
        type: "expense", amount: Number(amount), date, time,
        mainId, subId: finalSubId || null, subName: finalSubName || "General",
        conceptName: conceptName.trim() || finalSubName || "Gasto", note, icon: currentSub?.icon || "wallet",
      };
      onSave(tx, newSub, null);
    } else {
      if (saveDefault) onUpdateIncomeDefault(Number(amount), profile.incomePeriodicity);
      const tx = { type: "income", amount: Number(amount), date, time, mainId: null, subId: null, subName: incomeKind === "principal" ? "Ingreso principal" : "Ingreso extra", conceptName: conceptName.trim() || (incomeKind === "principal" ? "Ingreso principal" : "Ingreso extra"), note, icon: "wallet" };
      onSave(tx, null, null);
    }
  }

  return (
    <Sheet title={isEdit ? (type === "expense" ? "Editar gasto" : "Editar ingreso") : (type === "expense" ? "Registrar gasto" : "Registrar ingreso")} onClose={onClose} footer={<PrimaryBtn onClick={save} disabled={!amount || Number(amount) <= 0}>{isEdit ? "Guardar cambios" : "Guardar"}</PrimaryBtn>}>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setType("expense")} className="flex-1 rounded-xl py-2" style={{ background: type === "expense" ? INK : "#F2F3F5", color: type === "expense" ? "#fff" : INK, border: "none", fontWeight: 700, fontSize: 15 }}>Gasto</button>
        <button onClick={() => setType("income")} className="flex-1 rounded-xl py-2" style={{ background: type === "income" ? INK : "#F2F3F5", color: type === "income" ? "#fff" : INK, border: "none", fontWeight: 700, fontSize: 15 }}>Ingreso</button>
      </div>

      <div className="relative mb-3">
        <span style={{ position: "absolute", left: 14, top: 13, color: MUTED }}>$</span>
        <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" inputMode="decimal" className="w-full rounded-xl" style={{ padding: "12px 14px 12px 28px", background: "#F4F5F7", border: "1px solid #E7E9EC", fontSize: 22, fontWeight: 700, color: INK }} />
      </div>

      {type === "expense" ? (
        <>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#5A6472", marginBottom: 6 }}>Categoría principal</div>
          <div className="flex gap-2 flex-wrap mb-3">
            {categories.map((c) => <Pill key={c.id} active={mainId === c.id} onClick={() => { setMainId(c.id); setSubId(""); setNewSubName(""); }} style={{ background: mainId === c.id ? LIME : "#F2F3F5", color: mainId === c.id ? INK : INK }}>{c.name}</Pill>)}
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, color: "#5A6472", marginBottom: 6 }}>Subcategoría</div>
          <div className="flex gap-2 flex-wrap mb-2">
            {subs.map((s) => <Pill key={s.id} active={subId === s.id} onClick={() => setSubId((cur) => cur === s.id ? "" : s.id)} style={{ background: subId === s.id ? LIME : "#F2F3F5", color: INK }}>{s.name}</Pill>)}
          </div>
          {!subId && (
            <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="…o escribe una nueva (ej. Restaurantes)" className="w-full rounded-xl mb-3" style={{ padding: "10px 12px", background: "#F4F5F7", border: "1px solid #E7E9EC", fontSize: 15, color: INK }} />
          )}

          <TextField label="Concepto (ej. Renta, Comida con amigos)" value={conceptName} onChange={(e) => setConceptName(e.target.value)} placeholder="¿En qué gastaste?" />
        </>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            <Pill active={incomeKind === "principal"} onClick={() => setIncomeKind("principal")} style={{ background: incomeKind === "principal" ? LIME : "#F2F3F5", color: INK }}>Ingreso principal</Pill>
            <Pill active={incomeKind === "extra"} onClick={() => setIncomeKind("extra")} style={{ background: incomeKind === "extra" ? LIME : "#F2F3F5", color: INK }}>Ingreso extra</Pill>
          </div>
          <TextField label="Concepto (ej. Quincena, Freelance)" value={conceptName} onChange={(e) => setConceptName(e.target.value)} placeholder="Describe el ingreso" />
          {incomeKind === "principal" && (
            <label className="flex items-center gap-2 mb-3" style={{ fontSize: 14, color: "#5A6472" }}>
              <input type="checkbox" checked={saveDefault} onChange={(e) => setSaveDefault(e.target.checked)} />
              Guardar como mi ingreso predeterminado
            </label>
          )}
        </>
      )}

      <TextField label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <TextField label="Hora" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <TextField label="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota" />
    </Sheet>
  );
}

/* ---------------------------------------------------------------------- */
/* Savings goals                                                            */
/* ---------------------------------------------------------------------- */

function GoalsScreen({ goals, onOpen, onAdd }) {
  const c = useColors();
  return (
    <div>
      <div className="flex items-center justify-between" style={{ margin: "6px 0 12px" }}>
        <div style={{ color: c.onBg, fontWeight: 700, fontSize: 19 }}>Metas de ahorro</div>
        <button onClick={onAdd} className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: LIME, border: "none" }}><Plus size={17} color={INK} /></button>
      </div>
      <div className="flex flex-col gap-3">
        {goals.map((g) => {
          const saved = g.contributions.reduce((s, c) => s + c.amount, 0);
          const pct = Math.min(100, (saved / g.targetAmount) * 100);
          const Icon = iconFor(g.icon);
          return (
            <button key={g.id} onClick={() => onOpen(g)} className="rounded-2xl p-4 text-left w-full" style={{ background: CARD, border: "none" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-full flex items-center justify-center" style={{ width: 30, height: 30, background: "#F2F3F5" }}><Icon size={15} /></div>
                <div style={{ fontWeight: 700, fontSize: 16, color: INK }}>{g.name}</div>
              </div>
              <div className="rounded-full" style={{ height: 8, background: "#EFF1F3" }}>
                <div className="rounded-full" style={{ height: 8, width: `${pct}%`, background: LIME }} />
              </div>
              <div className="flex justify-between mt-2" style={{ fontSize: 14, color: MUTED }}>
                <span className="num">{fmt(saved)} / {fmt(g.targetAmount)}</span>
                <span>{Math.round(pct)}%</span>
              </div>
            </button>
          );
        })}
        {goals.length === 0 && <EmptyNote text="Sin metas todavía. Crea la primera." />}
      </div>
    </div>
  );
}

function GoalDetail({ goal, onCreate, onContribute, onDelete }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialSaved, setInitialSaved] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [contribFreq, setContribFreq] = useState("mensual");
  const [icon, setIcon] = useState("wallet");
  const [contribAmount, setContribAmount] = useState("");
  const [contribNote, setContribNote] = useState("");

  if (!goal) {
    return (
      <div>
        <TextField label="Nombre de la meta" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Vacaciones" />
        <TextField label="Monto objetivo" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" />
        <TextField label="¿Ya tienes algo ahorrado? (opcional)" value={initialSaved} onChange={(e) => setInitialSaved(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" />
        <TextField label="Fecha objetivo (opcional)" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        <div style={{ fontSize: 14, fontWeight: 600, color: "#5A6472", marginBottom: 6 }}>¿Cada cuánto planeas aportar?</div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {["diaria", "semanal", "quincenal", "mensual"].map((f) => (
            <button key={f} onClick={() => setContribFreq(f)} className="rounded-lg py-2 capitalize" style={{ background: contribFreq === f ? LIME : "#F2F3F5", border: "none", fontWeight: 600, fontSize: 12 }}>{f}</button>
          ))}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#5A6472", marginBottom: 6 }}>Ícono</div>
        <div className="flex gap-2 flex-wrap mb-4">
          {ICONS.map(({ key, Icon, color }) => <button key={key} onClick={() => setIcon(key)} className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: icon === key ? LIME : color + "22", border: "none" }}><Icon size={16} color={icon === key ? INK : color} /></button>)}
        </div>
        <PrimaryBtn disabled={!name.trim() || !(Number(targetAmount) > 0)} onClick={() => onCreate({ name: name.trim(), targetAmount: Number(targetAmount), targetDate: targetDate || null, contribFreq, icon, initialSaved: Number(initialSaved) || 0 })}>Crear meta</PrimaryBtn>
      </div>
    );
  }

  const saved = goal.contributions.reduce((s, c) => s + c.amount, 0);
  const remaining = Math.max(0, goal.targetAmount - saved);
  const pct = Math.min(100, (saved / goal.targetAmount) * 100);

  let pace = null;
  if (goal.targetDate) {
    const start = new Date(goal.createdAt), end = new Date(goal.targetDate), now = new Date();
    const totalDays = Math.max(1, (end - start) / 86400000);
    const elapsed = Math.min(totalDays, Math.max(0, (now - start) / 86400000));
    const expectedPct = elapsed / totalDays;
    const actualPct = saved / goal.targetAmount;
    if (actualPct >= expectedPct + 0.03) pace = { label: "ADELANTADO", color: GREEN };
    else if (actualPct <= expectedPct - 0.03) pace = { label: "RETRASADO", color: RED };
    else pace = { label: "EN TIEMPO", color: YELLOW };
  }

  const daysRemaining = goal.targetDate ? Math.max(1, Math.ceil((new Date(goal.targetDate) - new Date()) / 86400000)) : null;
  const per = daysRemaining ? periodicAmounts(remaining, daysRemaining) : null;

  return (
    <div>
      <div className="rounded-full mb-2" style={{ height: 10, background: "#EFF1F3" }}>
        <div className="rounded-full" style={{ height: 10, width: `${pct}%`, background: LIME }} />
      </div>
      <div className="flex justify-between mb-1"><span className="num" style={{ fontWeight: 700 }}>{fmt(saved)} / {fmt(goal.targetAmount)}</span><span style={{ fontWeight: 700 }}>{Math.round(pct)}%</span></div>
      <div style={{ fontSize: 14, color: MUTED, marginBottom: 12 }}>Faltan {fmt(remaining)}</div>

      {goal.targetDate && (
        <div className="rounded-xl p-3 mb-3" style={{ background: "#F7F8F9" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Meta: {goal.targetDate}</span>
            {pace && <span style={{ fontSize: 13, fontWeight: 800, color: pace.color }}>{pace.label}</span>}
          </div>
          {per && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#5A6472", marginBottom: 8 }}>Debes ahorrar:</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "mensual", label: "Mensual", val: per.mensual },
                  { key: "quincenal", label: "Quincenal", val: per.quincenal },
                  { key: "semanal", label: "Semanal", val: per.semanal },
                  { key: "diaria", label: "Diario", val: per.diario },
                ].map((p) => (
                  <div key={p.key} className="rounded-lg p-2" style={{ background: goal.contribFreq === p.key ? LIME : "#fff", border: goal.contribFreq === p.key ? "none" : "1px solid #EEF0F3" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: goal.contribFreq === p.key ? "#3A3A00" : MUTED }}>{p.label}</div>
                    <div className="num" style={{ fontSize: 15, fontWeight: 800, color: INK }}>{fmt(p.val)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ fontWeight: 700, fontSize: 15, color: INK, marginBottom: 8 }}>Agregar aportación</div>
      <div className="flex gap-2 mb-2">
        <input value={contribAmount} onChange={(e) => setContribAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Monto" className="flex-1 rounded-lg" style={{ padding: "10px 12px", background: "#F4F5F7", border: "1px solid #E7E9EC", fontSize: 15 }} />
        <button onClick={() => { if (Number(contribAmount) > 0) { onContribute(goal.id, contribAmount, contribNote); setContribAmount(""); setContribNote(""); } }} className="rounded-lg px-4" style={{ background: LIME, border: "none", fontWeight: 700, fontSize: 15 }}>Agregar</button>
      </div>
      <input value={contribNote} onChange={(e) => setContribNote(e.target.value)} placeholder="Nota (opcional)" className="w-full rounded-lg mb-4" style={{ padding: "10px 12px", background: "#F4F5F7", border: "1px solid #E7E9EC", fontSize: 15 }} />

      <div style={{ fontWeight: 700, fontSize: 15, color: INK, marginBottom: 8 }}>Historial</div>
      <div className="flex flex-col gap-1 mb-4">
        {[...goal.contributions].reverse().map((c) => (
          <div key={c.id} className="flex justify-between" style={{ fontSize: 14, color: "#5A6472" }}>
            <span>{c.date} {c.note && `· ${c.note}`}</span><span className="num" style={{ fontWeight: 700 }}>{fmt(c.amount)}</span>
          </div>
        ))}
        {goal.contributions.length === 0 && <div style={{ fontSize: 14, color: MUTED }}>Sin aportaciones aún.</div>}
      </div>

      <button onClick={() => onDelete(goal.id)} className="w-full rounded-xl py-2" style={{ background: "#FDEAEA", color: RED, border: "none", fontWeight: 700, fontSize: 15 }}>Eliminar meta</button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Profile                                                                  */
/* ---------------------------------------------------------------------- */

/* ---------------------------------------------------------------------- */
/* Modo de vista — daily/weekly/biweekly/monthly/custom budget snapshot     */
/* ---------------------------------------------------------------------- */

function ViewModeEditor({ profile, setProfile, onClose }) {
  const [mode, setMode] = useState(profile.viewMode || "mensual");
  const [days, setDays] = useState(profile.viewModeCustomDays || 7);

  const OPTIONS = [
    { key: "diaria", label: "Diario", desc: "Cuánto llevas gastado hoy vs. tu presupuesto de un día." },
    { key: "semanal", label: "Semanal", desc: "Cuánto llevas gastado esta semana (lunes a domingo)." },
    { key: "quincenal", label: "Quincenal", desc: "Cuánto llevas gastado en la quincena actual." },
    { key: "mensual", label: "Mensual", desc: "El mes completo, como hasta ahora." },
    { key: "personalizado", label: "Personalizado", desc: "Tú eliges cada cuántos días quieres revisarlo." },
  ];

  return (
    <div>
      <p style={{ fontSize: 15, color: "#5A6472", marginBottom: 14 }}>
        Esto cambia cómo se ven tus tarjetas de reglas financieras en Inicio —
        útil si tu ingreso es mensual pero prefieres controlar el gasto semana a semana.
      </p>
      <div className="flex flex-col gap-2 mb-4">
        {OPTIONS.map((o) => (
          <button key={o.key} onClick={() => setMode(o.key)} className="rounded-xl px-4 py-3 text-left" style={{ background: mode === o.key ? LIME : "#F4F5F7", border: "none" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>{o.label}</div>
            <div style={{ fontSize: 13, color: mode === o.key ? "#3A3A00" : MUTED }}>{o.desc}</div>
          </button>
        ))}
      </div>
      {mode === "personalizado" && (
        <TextField label="Revisar cada cuántos días" value={days} onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ""))} placeholder="7" />
      )}
      <PrimaryBtn onClick={() => { setProfile((p) => ({ ...p, viewMode: mode, viewModeCustomDays: Number(days) || 7 })); onClose(); }}>
        Guardar modo de vista
      </PrimaryBtn>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Reglas financieras — switch preset or build a custom one                */
/* ---------------------------------------------------------------------- */

function RulesScreen({ categories, onApply }) {
  const c = useColors();
  const currentSummary = categories.map((cat) => `${cat.name} ${cat.percent}%`).join(" · ");
  const [preset, setPreset] = useState("50/30/20");
  const [customCats, setCustomCats] = useState([{ id: uid(), name: "", percent: "" }]);
  const [showWarning, setShowWarning] = useState(false);
  const customSum = customCats.reduce((s, cc) => s + (Number(cc.percent) || 0), 0);

  function apply() {
    let ruleCats;
    if (preset === "personalizada") {
      ruleCats = customCats.filter((cc) => cc.name.trim()).map((cc) => ({ name: cc.name.trim().toUpperCase(), percent: Number(cc.percent) || 0 }));
    } else {
      ruleCats = RULE_PRESETS[preset];
    }
    onApply(ruleCats, preset);
    setShowWarning(false);
  }

  return (
    <div>
      <div style={{ color: c.onBg, fontWeight: 700, fontSize: 17, margin: "6px 0 4px" }}>Reglas financieras</div>
      <div style={{ color: c.onBgMuted, fontSize: 14, marginBottom: 14 }}>Regla actual: {currentSummary || "sin definir"}</div>

      <div className="flex flex-col gap-2 mb-4">
        {Object.entries(RULE_PRESETS).map(([key, cats]) => (
          <button key={key} onClick={() => setPreset(key)} className="rounded-xl px-4 py-3 text-left" style={{ background: preset === key ? LIME : CARD, border: "none" }}>
            <div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>Regla {key}</div>
            <div style={{ fontSize: 13, color: preset === key ? "#3A3A00" : MUTED }}>{cats.map((cc) => `${cc.name} ${cc.percent}%`).join(" · ")}</div>
          </button>
        ))}
        <button onClick={() => setPreset("personalizada")} className="rounded-xl px-4 py-3 text-left" style={{ background: preset === "personalizada" ? LIME : CARD, border: "none" }}>
          <div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>Personalizada</div>
          <div style={{ fontSize: 13, color: preset === "personalizada" ? "#3A3A00" : MUTED }}>Define tus propias categorías y porcentajes</div>
        </button>
      </div>

      {preset === "personalizada" && (
        <div className="flex flex-col gap-2 mb-4">
          {customCats.map((cc) => (
            <div key={cc.id} className="flex gap-2">
              <input value={cc.name} onChange={(e) => setCustomCats((prev) => prev.map((x) => x.id === cc.id ? { ...x, name: e.target.value } : x))} placeholder="Nombre" className="flex-1 rounded-lg" style={{ padding: "10px 12px", background: CARD, border: "1px solid #E7E9EC", fontSize: 15 }} />
              <input value={cc.percent} onChange={(e) => setCustomCats((prev) => prev.map((x) => x.id === cc.id ? { ...x, percent: e.target.value.replace(/[^0-9]/g, "") } : x))} placeholder="%" className="rounded-lg" style={{ width: 70, padding: "10px 12px", background: CARD, border: "1px solid #E7E9EC", fontSize: 15 }} />
            </div>
          ))}
          <button onClick={() => setCustomCats((prev) => [...prev, { id: uid(), name: "", percent: "" }])} style={{ color: c.onBg, background: "none", border: "none", fontSize: 15, fontWeight: 600, textAlign: "left" }}>+ Agregar categoría</button>
          <div style={{ fontSize: 13, color: customSum === 100 ? GREEN : YELLOW }}>Suma actual: {customSum}% {customSum !== 100 && "(debe ser 100%)"}</div>
        </div>
      )}

      {!showWarning ? (
        <PrimaryBtn disabled={preset === "personalizada" && customSum !== 100} onClick={() => setShowWarning(true)}>Aplicar esta regla</PrimaryBtn>
      ) : (
        <div className="rounded-2xl p-4" style={{ background: "#FFF6E0" }}>
          <div style={{ fontSize: 14, color: "#7A5A00", marginBottom: 10 }}>
            Esto va a reorganizar tus categorías. Las subcategorías cuyo nombre coincida con la nueva regla se conservan; el resto quedará vacío para que las vuelvas a agregar. ¿Confirmas?
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowWarning(false)} className="flex-1 rounded-xl py-2" style={{ background: "#F2F3F5", fontWeight: 600, fontSize: 14, border: "none" }}>Cancelar</button>
            <button onClick={apply} className="flex-1 rounded-xl py-2" style={{ background: LIME, fontWeight: 700, fontSize: 14, border: "none" }}>Sí, aplicar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileScreen({ profile, setProfile, saveNote, theme, setTheme }) {
  const c = useColors();
  return (
    <div>
      <div style={{ color: c.onBg, fontWeight: 700, fontSize: 19, margin: "6px 0 12px" }}>Perfil y configuración</div>

      <div style={{ fontSize: 14, fontWeight: 700, color: c.onBgMuted, margin: "0 0 8px" }}>APARIENCIA</div>
      <div className="rounded-2xl p-2 flex gap-2 mb-4" style={{ background: CARD }}>
        <button onClick={() => setTheme("dark")} className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1" style={{ background: theme === "dark" ? INK : "#F4F5F7", border: "none" }}>
          <div className="rounded-full" style={{ width: 18, height: 18, background: "linear-gradient(135deg,#2E3F58,#131B29)" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: theme === "dark" ? "#fff" : INK }}>Oscuro</span>
        </button>
        <button onClick={() => setTheme("light")} className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1" style={{ background: theme === "light" ? LIME : "#F4F5F7", border: "none" }}>
          <div className="rounded-full" style={{ width: 18, height: 18, background: "linear-gradient(135deg,#EEF1F6,#DCE1E9)", border: "1px solid #D8DCE3" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Claro</span>
        </button>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: c.onBgMuted, margin: "0 0 8px" }}>DATOS</div>
      <div className="rounded-2xl p-4" style={{ background: CARD }}>
        <TextField label="Nombre" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
        <TextField label="Ingreso principal (monto)" value={profile.incomeAmount} onChange={(e) => setProfile((p) => ({ ...p, incomeAmount: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 }))} />
        <div style={{ fontSize: 14, fontWeight: 600, color: "#5A6472", marginBottom: 6 }}>Periodicidad</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {["diaria", "semanal", "quincenal", "mensual"].map((p) => (
            <button key={p} onClick={() => setProfile((pr) => ({ ...pr, incomePeriodicity: p }))} className="rounded-lg py-2 capitalize" style={{ background: profile.incomePeriodicity === p ? LIME : "#F2F3F5", border: "none", fontWeight: 600, fontSize: 14 }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 13, color: c.onBgMuted, textAlign: "center", marginTop: 12 }}>
        {saveNote || "Tus datos se guardan automáticamente y solo tú puedes verlos: cada persona que use la app con su propia cuenta tiene su propio espacio, separado del de los demás."}
      </div>
    </div>
  );
}
