import {
  Home, Zap, Droplet, Wifi, Flame, Wrench, Lightbulb, Sofa, Bed, Bath, Thermometer,
  Paintbrush, Building2, Key, ShoppingCart, ShoppingBasket, Utensils, Beef, Fish, Egg,
  Drumstick, Soup, Salad, Sandwich, IceCreamCone, Cake, Candy, Popcorn, Milk, Wheat,
  ChefHat, CookingPot, Croissant, Wine, CupSoda, Coffee, Pizza, Car, Bus, Fuel, Bike,
  Train, Plane, Ship, Anchor, Stethoscope, HeartPulse, Pill, Heart, Baby, Dumbbell,
  Scissors, Film, Music, Gamepad2, Tv, Camera, Palmtree, Tent, Sparkles, Gift,
  ShoppingBag, Shirt, Smartphone, Watch, Glasses, Backpack, Luggage, Umbrella, Wallet,
  Landmark, Banknote, CreditCard, Briefcase, GraduationCap, Book, Users, Dog, Cat,
  TreePine, Leaf, Flower2, Recycle, MapPin, PiggyBank,
} from "lucide-react";

export const STORAGE_KEY = "finanzas_mx_state_v1";

export const RULE_PRESETS = {
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

export const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
export const WEEKDAYS = ["L","M","M","J","V","S","D"];

// Icons grouped so the picker can show them in sensible sections.
export const ICON_GROUPS = [
  { name: "Casa", items: [
    ["home", Home, "#F2A65A"], ["zap", Zap, "#E8B02E"], ["water", Droplet, "#3EA8DB"], ["wifi", Wifi, "#5B8DEF"],
    ["flame", Flame, "#FF7A4D"], ["tool", Wrench, "#7D8597"], ["lightbulb", Lightbulb, "#E8B02E"], ["sofa", Sofa, "#C98A5E"],
    ["bed", Bed, "#9B87D6"], ["bath", Bath, "#3EA8DB"], ["thermometer", Thermometer, "#F0605D"], ["paintbrush", Paintbrush, "#E86FA6"],
    ["building", Building2, "#6F86AD"], ["key", Key, "#D4A22F"],
  ]},
  { name: "Comida", items: [
    ["cart", ShoppingCart, "#3FA472"], ["basket", ShoppingBasket, "#E99A4F"], ["food", Utensils, "#FF7A4D"], ["beef", Beef, "#E05555"],
    ["fish", Fish, "#3EA8DB"], ["egg", Egg, "#E2B84A"], ["drumstick", Drumstick, "#D98A50"], ["soup", Soup, "#EE8A52"],
    ["salad", Salad, "#4FB25E"], ["sandwich", Sandwich, "#DFA048"], ["icecream", IceCreamCone, "#E98DB6"], ["cake", Cake, "#E86FA6"],
    ["candy", Candy, "#F2609A"], ["popcorn", Popcorn, "#E8B02E"], ["milk", Milk, "#7FB0DB"], ["wheat", Wheat, "#C9A443"],
    ["chef", ChefHat, "#6B7280"], ["pot", CookingPot, "#DA6754"], ["croissant", Croissant, "#D99A50"], ["wine", Wine, "#9B4D6B"],
    ["soda", CupSoda, "#F06A6A"], ["coffee", Coffee, "#8A5A3B"], ["pizza", Pizza, "#EE8A52"],
  ]},
  { name: "Transporte", items: [
    ["car", Car, "#5B8DEF"], ["bus", Bus, "#4E9CCB"], ["fuel", Fuel, "#E99A4F"], ["bike", Bike, "#3FA472"],
    ["train", Train, "#6F86AD"], ["plane", Plane, "#5B8DEF"], ["ship", Ship, "#3EA8DB"], ["anchor", Anchor, "#557596"],
  ]},
  { name: "Salud", items: [
    ["health", Stethoscope, "#E0567F"], ["medical", HeartPulse, "#F0605D"], ["pill", Pill, "#47B08C"], ["heart", Heart, "#F2609A"],
    ["baby", Baby, "#E98DB6"], ["gym", Dumbbell, "#6B7280"], ["haircut", Scissors, "#9B87D6"],
  ]},
  { name: "Ocio", items: [
    ["film", Film, "#9563D1"], ["music", Music, "#CC57A0"], ["games", Gamepad2, "#6B7FE0"], ["tv", Tv, "#6B7280"],
    ["camera", Camera, "#E99A4F"], ["vacation", Palmtree, "#3FA472"], ["tent", Tent, "#D98A50"], ["sparkles", Sparkles, "#E8B02E"],
    ["gift", Gift, "#E0567F"],
  ]},
  { name: "Personal", items: [
    ["bag", ShoppingBag, "#3AA897"], ["clothes", Shirt, "#4E9CCB"], ["phone", Smartphone, "#6B7280"], ["watch", Watch, "#7D8597"],
    ["glasses", Glasses, "#6B7280"], ["backpack", Backpack, "#D98A50"], ["luggage", Luggage, "#6F86AD"], ["umbrella", Umbrella, "#5B8DEF"],
  ]},
  { name: "Dinero y trabajo", items: [
    ["wallet", Wallet, "#3FA472"], ["bank", Landmark, "#4F7F60"], ["cash", Banknote, "#3FA472"], ["card", CreditCard, "#5B8DEF"],
    ["piggy", PiggyBank, "#E86FA6"], ["work", Briefcase, "#6F86AD"], ["school", GraduationCap, "#5B8DEF"], ["book", Book, "#D98A50"],
    ["family", Users, "#E99A4F"],
  ]},
  { name: "Otros", items: [
    ["pet", Dog, "#D98A50"], ["cat", Cat, "#7D8597"], ["tree", TreePine, "#3FA472"], ["leaf", Leaf, "#4FB25E"],
    ["flower", Flower2, "#E86FA6"], ["recycle", Recycle, "#3FA472"], ["map", MapPin, "#E05555"],
  ]},
];

export const ICONS = ICON_GROUPS.flatMap((g) => g.items.map(([key, Icon, color]) => ({ key, Icon, color })));
const FALLBACK_ICON = ICONS.find((i) => i.key === "wallet");
export const iconFor = (key) => (ICONS.find((i) => i.key === key) || FALLBACK_ICON).Icon;
export const colorForIcon = (key) => (ICONS.find((i) => i.key === key) || FALLBACK_ICON).color;

export function uid(p = "id") { return p + "_" + Math.random().toString(36).slice(2, 10); }

// "NECESIDADES" -> "Necesidades"
export function nice(name) {
  if (!name) return "";
  const s = String(name).trim();
  if (s !== s.toUpperCase()) return s;
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export function monthlyEquivalent(amount, periodicity) {
  const a = Number(amount) || 0;
  switch (periodicity) {
    case "diaria": return a * 30;
    case "semanal": return a * 4.33;
    case "quincenal": return a * 2;
    default: return a;
  }
}

export function periodicAmounts(monthlyRemaining, daysRemaining) {
  const d = Math.max(daysRemaining, 1);
  const months = d / 30;
  return {
    mensual: monthlyRemaining / Math.max(months, 1 / 30),
    quincenal: monthlyRemaining / Math.max(months, 1 / 30) / 2,
    semanal: monthlyRemaining / (d / 7),
    diario: monthlyRemaining / d,
  };
}

export function fmt(n) {
  const v = Number(n) || 0;
  return (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
// Whole pesos, for compact places
export function fmt0(n) {
  const v = Math.round(Number(n) || 0);
  return (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString("es-MX");
}
// $12.3 mil / $1.2 M
export function fmtShort(n) {
  const v = Math.abs(Number(n) || 0);
  const sign = n < 0 ? "-" : "";
  if (v >= 1e6) return `${sign}$${(v / 1e6).toFixed(1).replace(/\.0$/, "")} M`;
  if (v >= 1e3) return `${sign}$${(v / 1e3).toFixed(1).replace(/\.0$/, "")} mil`;
  return `${sign}$${Math.round(v)}`;
}

export function formatAmountInput(raw) {
  if (!raw) return "";
  const [intPart, ...rest] = String(raw).split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return rest.length ? `${withCommas}.${rest.join("")}` : withCommas;
}
export function cleanAmountInput(str) { return str.replace(/,/g, "").replace(/[^0-9.]/g, ""); }

// Local date (NOT UTC) — toISOString() would jump to "tomorrow" after 6pm in México.
export function localISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function todayISO() { return localISO(new Date()); }
export function ym(dateStr) { return dateStr.slice(0, 7); }

export function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return localISO(d);
}
export function addMonthsClamped(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return localISO(target);
}
export function mondayOf(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return addDays(dateStr, -((d.getDay() + 6) % 7));
}
const WD = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
export function fmtDayLong(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const wd = WD[d.getDay()];
  return `${wd.charAt(0).toUpperCase() + wd.slice(1)} ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}`;
}
// "Hoy", "Ayer", "12 oct"
export function fmtDayShort(dateStr) {
  const t = todayISO();
  if (dateStr === t) return "Hoy";
  if (dateStr === addDays(t, -1)) return "Ayer";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3).toLowerCase()}`;
}

export function getMonthGrid(year, monthIdx) {
  const first = new Date(year, monthIdx, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function generateRecurringDates(startDate, recurrenceType, intervalDays) {
  const dates = [startDate];
  if (recurrenceType === "diaria") for (let i = 1; i <= 90; i++) dates.push(addDays(startDate, i));
  else if (recurrenceType === "semanal") for (let i = 1; i <= 104; i++) dates.push(addDays(startDate, i * 7));
  else if (recurrenceType === "quincenal") for (let i = 1; i <= 48; i++) dates.push(addDays(startDate, i * 15));
  else if (recurrenceType === "mensual") for (let i = 1; i <= 24; i++) dates.push(addMonthsClamped(startDate, i));
  else if (recurrenceType === "personalizado") {
    const n = Math.max(1, Number(intervalDays) || 30);
    const count = Math.min(150, Math.floor(730 / n));
    for (let i = 1; i <= count; i++) dates.push(addDays(startDate, i * n));
  }
  return dates;
}

export function getViewPeriod(transactions, viewMode, customDays) {
  const today = todayISO();
  const expenses = transactions.filter((t) => t.type === "expense");
  if (viewMode === "diaria") return { label: "hoy", items: expenses.filter((t) => t.date === today), divisor: 30 };
  if (viewMode === "semanal") {
    const mon = mondayOf(today), sun = addDays(mon, 6);
    return { label: "esta semana", items: expenses.filter((t) => t.date >= mon && t.date <= sun), divisor: 4.33 };
  }
  if (viewMode === "quincenal") {
    const d = new Date(today + "T00:00:00");
    const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    const mm = String(m + 1).padStart(2, "0");
    const lastDay = new Date(y, m + 1, 0).getDate();
    const start = day <= 15 ? `${y}-${mm}-01` : `${y}-${mm}-16`;
    const end = day <= 15 ? `${y}-${mm}-15` : `${y}-${mm}-${String(lastDay).padStart(2, "0")}`;
    return { label: "esta quincena", items: expenses.filter((t) => t.date >= start && t.date <= end), divisor: 2 };
  }
  if (viewMode === "personalizado") {
    const n = Math.max(1, Number(customDays) || 7);
    const start = addDays(today, -(n - 1));
    return { label: `los últimos ${n} días`, items: expenses.filter((t) => t.date >= start && t.date <= today), divisor: 30 / n };
  }
  return null;
}

// Status of a budget, always with words (never color alone)
export function budgetStatus(spent, budget) {
  if (budget <= 0) return { tone: "muted", color: "var(--muted)" };
  const pct = spent / budget;
  if (pct > 1) return { tone: "bad", color: "var(--bad)" };
  if (pct >= 0.9) return { tone: "warn", color: "var(--warn)" };
  return { tone: "good", color: "var(--good)" };
}

// Human path for a transaction: "Casa › Luz"
export function txPath(t) {
  return [t.subName, t.itemName].filter(Boolean).join(" › ");
}
