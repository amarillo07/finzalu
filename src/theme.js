// Theme engine: turns ONE accent color + light/dark mode into a full set of
// CSS variables. Every text color is checked against the surface it sits on
// and nudged darker/lighter until it meets WCAG contrast, so whatever color
// the user picks, numbers and labels stay readable.

export const DEFAULT_ACCENT = "#7253d9";

export const ACCENT_PRESETS = [
  { name: "Jacaranda", hex: "#7253d9" },
  { name: "Talavera", hex: "#2457c5" },
  { name: "Agave", hex: "#2e8c7e" },
  { name: "Nopal", hex: "#4f8a2e" },
  { name: "Cempasúchil", hex: "#f29a1f" },
  { name: "Rosa mexicano", hex: "#e4007c" },
  { name: "Chile", hex: "#c8312b" },
  { name: "Obsidiana", hex: "#3a3f4b" },
];

/* ---------- color math ---------- */

export function normHex(input) {
  if (!input) return null;
  let h = String(input).trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(h)) h = h.split("").map((c) => c + c).join("");
  return /^[0-9a-f]{6}$/.test(h) ? "#" + h : null;
}

function hexToRgb(hex) {
  const h = normHex(hex) || "#000000";
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

function rgbToHex([r, g, b]) {
  const c = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}

export function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}

export function alpha(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Black-ish or white text, whichever reads better on `bg`.
export function readableOn(bg) {
  return contrast("#ffffff", bg) >= contrast("#16141d", bg) ? "#ffffff" : "#16141d";
}

// Push `fg` toward black or white until it reaches `ratio` against `bg`.
export function ensureContrast(fg, bg, ratio) {
  if (contrast(fg, bg) >= ratio) return fg;
  const target = luminance(bg) > 0.35 ? "#000000" : "#ffffff";
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const c = mix(fg, target, t);
    if (contrast(c, bg) >= ratio) return c;
  }
  return target;
}

export function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

export function hslToHex(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

/* ---------- categorical colors for rules / charts (validated set) ---------- */

const SERIES = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#6250d6"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#9085e9"],
};

/* ---------- build the whole theme ---------- */

export function buildTheme(accentInput, mode) {
  const accent = normHex(accentInput) || DEFAULT_ACCENT;
  const dark = mode === "dark";
  const [h, s] = hexToHsl(accent);
  const sat = Math.min(s, 0.6);

  const bg = dark ? hslToHex(h, sat * 0.35, 0.085) : hslToHex(h, sat * 0.45, 0.935);
  const blobB = hslToHex((h + 48) % 360, 0.75, dark ? 0.45 : 0.68);

  // What a glass panel effectively looks like (worst case: over a color blob)
  const glassBase = mix(bg, accent, 0.22);
  const glassEff = dark ? mix(glassBase, "#ffffff", 0.08) : mix(glassBase, "#ffffff", 0.66);
  const sheetEff = dark ? "#1d1b25" : "#f7f6fb";

  const text = dark ? "#f4f3f8" : "#17151f";
  const muted = ensureContrast(dark ? hslToHex(h, 0.12, 0.74) : hslToHex(h, 0.12, 0.38), glassEff, 4.6);
  const onAccent = readableOn(accent);
  const accentInk = ensureContrast(accent, glassEff, 4.5);
  const accentLine = ensureContrast(accent, glassEff, 3);

  const good = ensureContrast(dark ? "#4ade80" : "#15803d", glassEff, 4.5);
  const warn = ensureContrast(dark ? "#fbbf24" : "#a85a06", glassEff, 4.5);
  const bad = ensureContrast(dark ? "#fb7185" : "#c8292d", glassEff, 4.5);

  const series = (dark ? SERIES.dark : SERIES.light).map((c) => ensureContrast(c, glassEff, 3));

  const vars = {
    "--bg": bg,
    "--blob-a": alpha(accent, dark ? 0.42 : 0.38),
    "--blob-a2": alpha(accent, dark ? 0.22 : 0.2),
    "--blob-b": alpha(blobB, dark ? 0.26 : 0.34),
    "--text": text,
    "--muted": muted,
    "--faint": dark ? "rgba(255,255,255,0.09)" : "rgba(23,21,31,0.08)",
    "--track": dark ? "rgba(255,255,255,0.10)" : "rgba(23,21,31,0.08)",
    "--glass": dark ? "rgba(255,255,255,0.075)" : "rgba(255,255,255,0.62)",
    "--glass-strong": dark ? "rgba(29,27,37,0.9)" : "rgba(248,247,252,0.9)",
    "--glass-border": dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.75)",
    "--glass-hi": dark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.95)",
    "--sheen": dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.55)",
    "--shadow": dark ? "rgba(0,0,0,0.55)" : alpha(mix(accent, "#000000", 0.5), 0.28),
    "--field": dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
    "--field-border": dark ? "rgba(255,255,255,0.12)" : "rgba(23,21,31,0.10)",
    "--chip": dark ? "rgba(255,255,255,0.08)" : "rgba(23,21,31,0.06)",
    "--accent": accent,
    "--on-accent": onAccent,
    "--on-accent-muted": alpha(onAccent, 0.88),
    "--on-accent-track": alpha(onAccent, 0.22),
    "--accent-ink": accentInk,
    "--accent-line": accentLine,
    "--accent-soft": alpha(accent, dark ? 0.24 : 0.16),
    "--good": good,
    "--warn": warn,
    "--bad": bad,
    "--good-soft": alpha(good, 0.14),
    "--warn-soft": alpha(warn, 0.14),
    "--bad-soft": alpha(bad, 0.14),
    "--on-bad": readableOn(bad),
    "--nav": dark ? "rgba(24,22,32,0.62)" : "rgba(255,255,255,0.58)",
    "--scrim": dark ? "rgba(5,4,10,0.55)" : "rgba(30,26,45,0.28)",
    colorScheme: dark ? "dark" : "light",
  };

  return {
    mode: dark ? "dark" : "light",
    accent,
    bg,
    vars,
    series,
    surface: glassEff,
    sheetSurface: sheetEff,
    // Icons sit on a 14% tint of their own color — keep them ≥3:1 there.
    iconInk: (c) => ensureContrast(c, glassEff, 3),
  };
}
