import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Repeat, Check } from "lucide-react";
import { fmt, iconFor, colorForIcon, ICON_GROUPS, fmtDayShort, txPath } from "./utils";
import { ACCENT_PRESETS, normHex, hexToHsl, hslToHex, readableOn } from "./theme";

export const ThemeContext = React.createContext(null);
export const useTheme = () => React.useContext(ThemeContext);

/* Type scale: 12 / 14 / 16 / 20 / 28 / 44 */
export const T = { cap: 12, small: 14, body: 16, title: 20, h1: 28, hero: 44 };

export function Panel({ children, className = "", style, pad = 16, ...rest }) {
  return <div className={"glass " + className} style={{ padding: pad, ...style }} {...rest}>{children}</div>;
}

export function SectionHeader({ title, action, onAction, hint }) {
  return (
    <div className="flex items-end justify-between" style={{ margin: "28px 4px 10px" }}>
      <div>
        <h2 style={{ fontSize: T.title, fontWeight: 650, margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
        {hint && <div style={{ fontSize: T.small, color: "var(--muted)", marginTop: 2 }}>{hint}</div>}
      </div>
      {action && (
        <button onClick={onAction} className="press" style={{ background: "none", border: "none", color: "var(--accent-ink)", fontSize: T.small, fontWeight: 600, padding: "6px 2px" }}>{action}</button>
      )}
    </div>
  );
}

export function IconBtn({ children, onClick, label, size = 44, style }) {
  return (
    <button onClick={onClick} aria-label={label} className="glass press flex items-center justify-center" style={{ width: size, height: size, borderRadius: 999, padding: 0, flexShrink: 0, ...style }}>
      {children}
    </button>
  );
}

export function Chip({ children, active, onClick, color, style }) {
  return (
    <button
      onClick={onClick}
      className="press whitespace-nowrap flex items-center gap-2"
      style={{
        padding: "9px 14px", minHeight: 40, fontSize: T.small, fontWeight: 600, borderRadius: 999,
        border: active ? "1px solid transparent" : "1px solid var(--field-border)",
        background: active ? "var(--accent)" : "var(--chip)",
        color: active ? "var(--on-accent)" : "var(--text)",
        ...style,
      }}
    >
      {color && <span style={{ width: 8, height: 8, borderRadius: 4, background: color, boxShadow: active ? "0 0 0 2px var(--on-accent-track)" : "none", flexShrink: 0 }} />}
      {children}
    </button>
  );
}

export function Field({ label, hint, ...props }) {
  return (
    <label className="block" style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px 4px" }}>{label}</div>}
      <input {...props} className="field" />
      {hint && <div style={{ fontSize: T.cap, color: "var(--muted)", margin: "6px 4px 0" }}>{hint}</div>}
    </label>
  );
}

export function PrimaryBtn({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="press w-full"
      style={{
        padding: "15px 18px", borderRadius: 999, border: "none", fontSize: T.body, fontWeight: 650,
        background: disabled ? "var(--chip)" : "var(--accent)", color: disabled ? "var(--muted)" : "var(--on-accent)",
        boxShadow: disabled ? "none" : "0 10px 24px -12px var(--accent)", ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, danger, style }) {
  return (
    <button onClick={onClick} className="press w-full" style={{ padding: "13px 18px", borderRadius: 999, border: "1px solid var(--field-border)", background: danger ? "var(--bad-soft)" : "var(--chip)", color: danger ? "var(--bad)" : "var(--text)", fontSize: T.body, fontWeight: 600, ...style }}>
      {children}
    </button>
  );
}

/* Bottom sheet with a spring slide-up and an animated dismiss */
export function Sheet({ title, onClose, children, footer }) {
  const [closing, setClosing] = useState(false);
  const close = () => { if (closing) return; setClosing(true); setTimeout(onClose, 240); };
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  return (
    <div className="no-print fixed inset-0 flex flex-col justify-end" style={{ zIndex: 50 }}>
      {/* Scrim is a sibling (not a parent) so its fade doesn't break the sheet's backdrop blur */}
      <div className={"scrim absolute inset-0" + (closing ? " closing" : "")} style={{ background: "var(--scrim)", WebkitBackdropFilter: "blur(3px)", backdropFilter: "blur(3px)" }} onClick={close} />
      <div
        role="dialog" aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={"sheet glass-strong flex flex-col mx-auto w-full" + (closing ? " closing" : "")}
        style={{ position: "relative", maxWidth: 480, maxHeight: "90vh", borderRadius: "32px 32px 0 0", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--faint)", margin: "8px auto 0" }} />
        <div className="flex items-center justify-between" style={{ padding: "10px 20px 12px" }}>
          <h3 style={{ fontSize: T.title, fontWeight: 650, margin: 0 }}>{title}</h3>
          <button onClick={close} aria-label="Cerrar" className="press flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 999, background: "var(--chip)", border: "none" }}>
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto no-scrollbar" style={{ flex: 1, padding: "4px 20px 20px" }}>{children}</div>
        {footer && <div style={{ padding: "12px 20px 16px", borderTop: "1px solid var(--faint)" }}>{footer}</div>}
      </div>
    </div>
  );
}

export function Confirm({ text, onCancel, onConfirm, confirmLabel = "Eliminar" }) {
  return (
    <div className="no-print fixed inset-0 flex items-center justify-center" style={{ zIndex: 60, padding: 24 }}>
      <div className="scrim absolute inset-0" style={{ background: "var(--scrim)" }} onClick={onCancel} />
      <div className="glass-strong pop" style={{ position: "relative", width: "100%", maxWidth: 320, borderRadius: 28, padding: 20 }}>
        <div style={{ fontSize: T.body, marginBottom: 18, lineHeight: 1.5 }}>{text}</div>
        <div className="flex gap-2">
          <GhostBtn onClick={onCancel}>Cancelar</GhostBtn>
          <button onClick={onConfirm} className="press w-full" style={{ padding: "13px 18px", borderRadius: 999, border: "none", background: "var(--bad)", color: readableOnVar(), fontWeight: 650, fontSize: T.body }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
// --bad is tuned for text on glass; white on it is the safe pairing in light, dark text in dark mode
function readableOnVar() { return "var(--on-bad, #fff)"; }

export function Toast({ text }) {
  if (!text) return null;
  return (
    <div className="no-print fixed left-0 right-0 flex justify-center pointer-events-none" style={{ bottom: 104, zIndex: 70 }}>
      <div key={text + Date.now()} className="glass-strong pop flex items-center gap-2" style={{ borderRadius: 999, padding: "10px 16px", fontSize: T.small, fontWeight: 600 }}>
        <span className="flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: 10, background: "var(--good-soft)", color: "var(--good)" }}><Check size={13} strokeWidth={3} /></span>
        {text}
      </div>
    </div>
  );
}

/* Number that eases from its previous value to the new one */
export function AnimatedNumber({ value, format = fmt, style, className = "" }) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current, to = value;
    if (reduce || from === to) { setShown(to); fromRef.current = to; return; }
    let raf, start;
    const dur = 650;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * e;
      setShown(v);
      fromRef.current = v;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={"num " + className} style={style}>{format(shown)}</span>;
}

export function ProgressBar({ value, max, color = "var(--accent)", track = "var(--track)", height = 8 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height, borderRadius: height, background: track, overflow: "hidden" }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="bar-fill" style={{ height, width: `${pct}%`, borderRadius: height, background: color }} />
    </div>
  );
}

export function EmptyNote({ text, action, onAction }) {
  return (
    <div style={{ padding: "20px 12px", textAlign: "center", color: "var(--muted)", fontSize: T.small }}>
      {text}
      {action && <div><button onClick={onAction} className="press" style={{ marginTop: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", border: "none", borderRadius: 999, padding: "9px 16px", fontWeight: 600, fontSize: T.small }}>{action}</button></div>}
    </div>
  );
}

export function MonthSwitcher({ label, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between">
      <IconBtn onClick={onPrev} label="Mes anterior" size={40}><ChevronLeft size={18} /></IconBtn>
      <div style={{ fontSize: T.body, fontWeight: 600 }}>{label}</div>
      <IconBtn onClick={onNext} label="Mes siguiente" size={40}><ChevronRight size={18} /></IconBtn>
    </div>
  );
}

export function CatIcon({ icon, size = 40 }) {
  const theme = useTheme();
  const Icon = iconFor(icon);
  const c = colorForIcon(icon);
  const ink = theme ? theme.iconInk(c) : c;
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size, borderRadius: size * 0.36, background: c + "24", flexShrink: 0 }}>
      <Icon size={Math.round(size * 0.48)} color={ink} strokeWidth={2} />
    </div>
  );
}

/* One movement. Whole row is tappable (opens edit) — no tiny icons. */
export function TxRow({ t, onClick, ruleName, ruleColor }) {
  const income = t.type === "income";
  const path = income ? (t.subName || "Ingreso") : txPath(t);
  return (
    <button onClick={onClick} className="hairline press-soft w-full flex items-center gap-3 text-left" style={{ background: "none", border: "none", padding: "12px 4px", transition: "transform .18s" }}>
      <CatIcon icon={income ? "cash" : (t.icon || "wallet")} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-1" style={{ fontSize: T.body, fontWeight: 600, lineHeight: 1.3 }}>
          <span className="truncate">{t.conceptName}</span>
          {t.recurringGroupId && <Repeat size={13} color="var(--muted)" aria-label="Pago periódico" style={{ flexShrink: 0 }} />}
        </div>
        <div className="flex items-center gap-1 truncate" style={{ fontSize: T.small, color: "var(--muted)", marginTop: 3 }}>
          {!income && ruleColor && <span style={{ width: 7, height: 7, borderRadius: 4, background: ruleColor, flexShrink: 0 }} />}
          <span className="truncate">{!income && ruleName ? `${ruleName} › ` : ""}{path}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="num" style={{ fontSize: T.body, fontWeight: 650, color: income ? "var(--good)" : "var(--bad)" }}>{income ? "+" : "−"}{fmt(t.amount)}</div>
        <div style={{ fontSize: T.cap, color: "var(--muted)", marginTop: 3 }}>{fmtDayShort(t.date)}{t.time ? `, ${t.time}` : ""}</div>
      </div>
    </button>
  );
}

/* Icon picker grouped by theme, horizontally compact */
export function IconPicker({ value, onChange }) {
  const theme = useTheme();
  return (
    <div className="no-scrollbar" style={{ maxHeight: 220, overflowY: "auto", paddingRight: 2 }}>
      {ICON_GROUPS.map((g) => (
        <div key={g.name} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: T.cap, color: "var(--muted)", fontWeight: 600, margin: "0 0 6px 2px" }}>{g.name}</div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(42px, 1fr))", gap: 6 }}>
            {g.items.map(([key, Icon, c]) => {
              const on = value === key;
              return (
                <button key={key} type="button" aria-label={key} onClick={() => onChange(key)} className="press flex items-center justify-center" style={{ height: 42, borderRadius: 14, border: on ? "2px solid var(--accent-line)" : "1px solid transparent", background: on ? "var(--accent-soft)" : c + "1f" }}>
                  <Icon size={19} color={theme ? theme.iconInk(c) : c} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Color picker: presets + hue/saturation wheel + lightness + hex          */
/* ---------------------------------------------------------------------- */

export function ColorPicker({ value, onChange }) {
  const wheelRef = useRef(null);
  const [h, s, l] = hexToHsl(value);
  const [hexDraft, setHexDraft] = useState(value);
  const [lightness, setLightness] = useState(Math.round(l * 100));
  useEffect(() => { setHexDraft(value); setLightness(Math.round(hexToHsl(value)[2] * 100)); }, [value]);

  function pick(e) {
    const el = wheelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - (r.left + r.width / 2), dy = p.clientY - (r.top + r.height / 2);
    const radius = r.width / 2;
    let hue = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (hue < 0) hue += 360;
    const sat = Math.min(1, Math.sqrt(dx * dx + dy * dy) / radius);
    onChange(hslToHex(hue, sat, lightness / 100));
  }
  function startDrag(e) {
    e.preventDefault();
    pick(e);
    const move = (ev) => pick(ev);
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const size = 200;
  const rad = (h * Math.PI) / 180;
  const knobX = size / 2 + Math.sin(rad) * s * (size / 2);
  const knobY = size / 2 - Math.cos(rad) * s * (size / 2);

  return (
    <div>
      <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "0 0 8px 4px" }}>Colores sugeridos</div>
      <div className="grid grid-cols-4 gap-2" style={{ marginBottom: 18 }}>
        {ACCENT_PRESETS.map((p) => {
          const on = normHex(value) === p.hex;
          return (
            <button key={p.hex} onClick={() => onChange(p.hex)} className="press flex flex-col items-center gap-1" style={{ background: "none", border: "none", padding: 4 }}>
              <span className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 20, background: p.hex, boxShadow: on ? "0 0 0 3px var(--glass-strong), 0 0 0 5px " + p.hex : "inset 0 0 0 1px rgba(0,0,0,.08)" }}>
                {on && <Check size={18} color={readableOn(p.hex)} strokeWidth={3} />}
              </span>
              <span style={{ fontSize: T.cap, color: "var(--muted)", textAlign: "center", lineHeight: 1.2 }}>{p.name}</span>
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "0 0 10px 4px" }}>O elige en la rueda</div>
      <div className="flex justify-center">
        <div
          ref={wheelRef}
          onPointerDown={startDrag}
          style={{
            width: size, height: size, borderRadius: "50%", position: "relative", touchAction: "none",
            background: `radial-gradient(circle closest-side, hsl(0 0% ${lightness}%) 0%, transparent 100%), conic-gradient(from 0deg, hsl(0 100% ${lightness}%), hsl(60 100% ${lightness}%), hsl(120 100% ${lightness}%), hsl(180 100% ${lightness}%), hsl(240 100% ${lightness}%), hsl(300 100% ${lightness}%), hsl(360 100% ${lightness}%))`,
            boxShadow: "0 10px 30px -14px var(--shadow), inset 0 0 0 1px rgba(255,255,255,.3)",
          }}
          aria-label="Rueda de color"
        >
          <div style={{ position: "absolute", left: knobX - 14, top: knobY - 14, width: 28, height: 28, borderRadius: 14, background: value, border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,.35)", pointerEvents: "none", transition: "left .05s, top .05s" }} />
        </div>
      </div>

      <div style={{ margin: "18px 4px 6px", fontSize: T.small, fontWeight: 600, color: "var(--muted)" }}>Luminosidad</div>
      <input
        type="range" min={22} max={72} value={lightness}
        onChange={(e) => { const v = Number(e.target.value); setLightness(v); onChange(hslToHex(h, s, v / 100)); }}
        className="w-full" style={{ accentColor: value }}
        aria-label="Luminosidad"
      />

      <div className="flex items-center gap-3" style={{ marginTop: 14 }}>
        <span style={{ width: 48, height: 48, borderRadius: 16, background: value, flexShrink: 0, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }} />
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: T.cap, fontWeight: 600, color: "var(--muted)", margin: "0 0 4px 4px" }}>Código hex</div>
          <input
            className="field num" value={hexDraft} maxLength={7} placeholder="#7253D9"
            onChange={(e) => { const v = e.target.value; setHexDraft(v); const n = normHex(v); if (n) onChange(n); }}
            style={{ textTransform: "uppercase" }}
          />
        </label>
      </div>
      <div style={{ fontSize: T.cap, color: "var(--muted)", margin: "10px 4px 0", lineHeight: 1.5 }}>
        No te preocupes por la legibilidad: el texto y los números se ajustan solos para que siempre contrasten con el color que elijas.
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Donut ("gráfica de rueda") — tap a slice or a legend row to focus it    */
/* ---------------------------------------------------------------------- */

export function Donut({ segments, centerLabel = "Total", format = fmt }) {
  const [active, setActive] = useState(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setDrawn(true)); return () => cancelAnimationFrame(id); }, []);
  const total = segments.reduce((s, x) => s + x.value, 0);
  const size = 200, r = 74, sw = 24, C = 2 * Math.PI * r, gap = segments.length > 1 ? 3 : 0;
  let offset = 0;
  const focus = segments.find((s) => s.key === active);

  return (
    <div>
      <div className="flex justify-center" style={{ position: "relative" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Gráfica de rueda del gasto">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={sw} />
          {segments.map((s) => {
            const len = total > 0 ? (s.value / total) * C : 0;
            const dash = Math.max(0, len - gap);
            const el = (
              <circle
                key={s.key}
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={s.color}
                strokeWidth={active === s.key ? sw + 8 : sw}
                strokeDasharray={`${drawn ? dash : 0} ${C}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: "stroke-dasharray .9s cubic-bezier(.2,.8,.2,1), stroke-width .25s, opacity .25s", opacity: active && active !== s.key ? 0.35 : 1, cursor: "pointer" }}
                onClick={() => setActive(active === s.key ? null : s.key)}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="flex flex-col items-center justify-center" style={{ position: "absolute", inset: 0, pointerEvents: "none", textAlign: "center" }}>
          <div style={{ fontSize: T.cap, color: "var(--muted)", fontWeight: 600, maxWidth: 110 }} className="truncate">{focus ? focus.label : centerLabel}</div>
          <div className="num" style={{ fontSize: T.title, fontWeight: 700 }}>{format(focus ? focus.value : total)}</div>
          {focus && total > 0 && <div className="num" style={{ fontSize: T.cap, color: "var(--muted)" }}>{Math.round((focus.value / total) * 100)}% del total</div>}
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        {segments.map((s) => (
          <button key={s.key} onClick={() => setActive(active === s.key ? null : s.key)} className="hairline w-full flex items-center gap-3 text-left" style={{ background: active === s.key ? "var(--chip)" : "none", border: "none", padding: "10px 8px", borderRadius: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: s.color, flexShrink: 0 }} />
            <span className="truncate" style={{ flex: 1, fontSize: T.small, fontWeight: 600 }}>{s.label}</span>
            <span className="num" style={{ fontSize: T.small, color: "var(--muted)", width: 44, textAlign: "right" }}>{total > 0 ? Math.round((s.value / total) * 100) : 0}%</span>
            <span className="num" style={{ fontSize: T.small, fontWeight: 650, minWidth: 74, textAlign: "right" }}>{format(s.value)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
