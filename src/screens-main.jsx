import React, { useState } from "react";
import { TrendingDown, TrendingUp, ChevronLeft, ChevronRight, ChevronDown, Printer, Plus } from "lucide-react";
import {
  Panel, SectionHeader, Chip, PrimaryBtn, AnimatedNumber, ProgressBar, EmptyNote, MonthSwitcher,
  CatIcon, TxRow, IconBtn, T,
} from "./ui";
import {
  fmt, fmt0, fmtShort, nice, MONTHS, WEEKDAYS, ym, todayISO, addDays, mondayOf, fmtDayLong,
  getMonthGrid, getViewPeriod, budgetStatus,
} from "./utils";

/* ---------------------------------------------------------------------- */
/* Inicio                                                                   */
/* ---------------------------------------------------------------------- */

export function HomeScreen({
  profile, categories, monthLabel, shiftMonth, budgetBase, expectedIncome, receivedIncome,
  totalSpentMonth, spentInCategory, budgetFor, monthExpenses, monthIncomes, transactions,
  onOpenTx, onAddExpense, onAddIncome, ruleInfo, onSeeAll,
}) {
  const viewMode = profile.viewMode || "mensual";
  const period = viewMode !== "mensual" ? getViewPeriod(transactions, viewMode, profile.viewModeCustomDays || 7) : null;

  const heroBudget = period ? budgetBase / period.divisor : budgetBase;
  const heroSpent = period ? period.items.reduce((s, t) => s + t.amount, 0) : totalSpentMonth;
  const remaining = heroBudget - heroSpent;
  const over = remaining < 0;
  const recent = [...monthExpenses, ...monthIncomes]
    .sort((a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || "")))
    .slice(0, 6);

  return (
    <div>
      <MonthSwitcher label={monthLabel} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />

      {/* Hero: the one bold element on the screen */}
      <div
        style={{
          marginTop: 14, borderRadius: 32, padding: "22px 22px 18px", color: "var(--on-accent)",
          background: "linear-gradient(150deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 52%), var(--accent)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 22px 40px -22px var(--accent)",
        }}
      >
        <div style={{ fontSize: T.body, fontWeight: 500, color: "var(--on-accent-muted)" }}>
          {over ? "Te pasaste" : "Te queda"} {period ? period.label : "este mes"}
        </div>
        <AnimatedNumber value={Math.abs(remaining)} style={{ fontSize: T.hero, fontWeight: 700, lineHeight: 1.1, display: "block", margin: "4px 0 14px" }} />
        <ProgressBar value={heroSpent} max={heroBudget} color="var(--on-accent)" track="var(--on-accent-track)" height={6} />
        <div className="num" style={{ fontSize: T.small, color: "var(--on-accent-muted)", marginTop: 8 }}>
          Gastado {fmt0(heroSpent)} de {fmt0(heroBudget)}
        </div>

        {!period && (
          <div className="flex" style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--on-accent-track)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.cap, color: "var(--on-accent-muted)" }}>Recibido</div>
              <AnimatedNumber value={receivedIncome} format={fmt0} style={{ fontSize: T.body, fontWeight: 650 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.cap, color: "var(--on-accent-muted)" }}>Ingreso esperado</div>
              <span className="num" style={{ fontSize: T.body, fontWeight: 650 }}>{fmt0(expectedIncome)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2" style={{ marginTop: 12 }}>
        <button onClick={onAddExpense} className="glass press flex-1 flex items-center justify-center gap-2" style={{ padding: "14px 0", fontWeight: 650, fontSize: T.small, borderRadius: 22 }}>
          <TrendingDown size={17} color="var(--bad)" /> Registrar gasto
        </button>
        <button onClick={onAddIncome} className="glass press flex-1 flex items-center justify-center gap-2" style={{ padding: "14px 0", fontWeight: 650, fontSize: T.small, borderRadius: 22 }}>
          <TrendingUp size={17} color="var(--good)" /> Registrar ingreso
        </button>
      </div>

      <SectionHeader title="Tus reglas" hint={period ? `Presupuesto de ${period.label}` : "Presupuesto de este mes"} />
      <Panel pad="4px 16px">
        {categories.map((cat) => {
          const spent = period ? period.items.filter((t) => t.mainId === cat.id).reduce((s, t) => s + t.amount, 0) : spentInCategory(cat.id);
          const budget = period ? budgetFor(cat) / period.divisor : budgetFor(cat);
          const diff = budget - spent;
          const st = budgetStatus(spent, budget);
          return (
            <div key={cat.id} className="hairline" style={{ padding: "16px 0" }}>
              <div className="flex items-start justify-between gap-3">
                <div style={{ minWidth: 0 }}>
                  <div className="flex items-center gap-2" style={{ fontSize: T.body, fontWeight: 650 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 5, background: ruleInfo(cat.id).color }} />
                    {nice(cat.name)}
                    <span style={{ fontWeight: 500, color: "var(--muted)", fontSize: T.small }}>{cat.percent}%</span>
                  </div>
                  <div className="num" style={{ fontSize: T.cap, color: "var(--muted)", marginTop: 3, marginLeft: 17 }}>Gastado {fmt0(spent)} de {fmt0(budget)}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: T.cap, color: st.color, fontWeight: 600 }}>{diff >= 0 ? "Disponible" : "Te pasaste"}</div>
                  <AnimatedNumber value={Math.abs(diff)} format={fmt0} style={{ fontSize: T.body, fontWeight: 650, color: st.color }} />
                </div>
              </div>
              <div style={{ marginTop: 10 }}><ProgressBar value={spent} max={budget} color={st.color} height={7} /></div>
            </div>
          );
        })}
        {categories.length === 0 && <EmptyNote text="Aún no tienes una regla configurada." />}
      </Panel>

      <SectionHeader title="Movimientos recientes" action={recent.length ? "Ver todo" : null} onAction={onSeeAll} />
      <Panel pad="2px 12px">
        {recent.map((t) => (
          <TxRow key={t.id} t={t} onClick={() => onOpenTx(t)} ruleName={t.mainId ? ruleInfo(t.mainId).name : null} ruleColor={t.mainId ? ruleInfo(t.mainId).color : null} />
        ))}
        {recent.length === 0 && <EmptyNote text="Todavía no hay movimientos este mes." action="Registrar el primero" onAction={onAddExpense} />}
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Estadísticas — every chart answers one plain question                   */
/* ---------------------------------------------------------------------- */

export function StatsScreen({ categories, ruleFilter, setRuleFilter, monthLabel, shiftMonth, monthExpenses, transactions, monthCursor, spentInCategory, budgetFor, ruleInfo }) {
  const [openCat, setOpenCat] = useState(null);
  const rulesShown = ruleFilter === "todas" ? categories : categories.filter((c) => c.id === ruleFilter);
  const expenses = monthExpenses.filter((t) => ruleFilter === "todas" || t.mainId === ruleFilter);
  const total = expenses.reduce((s, t) => s + t.amount, 0);

  // Group by category (Casa, Súper…)
  const byCat = {};
  expenses.forEach((t) => {
    const key = (t.mainId || "") + "|" + (t.subId || t.subName || "none");
    if (!byCat[key]) {
      const rule = categories.find((c) => c.id === t.mainId);
      const sub = rule?.subcategories.find((s) => s.id === t.subId);
      byCat[key] = { key, name: sub?.name || t.subName || "Sin categoría", icon: sub?.icon || t.icon || "wallet", mainId: t.mainId, total: 0, count: 0, items: {} };
    }
    const g = byCat[key];
    g.total += t.amount; g.count += 1;
    const ik = t.itemName || "Sin subcategoría";
    g.items[ik] = (g.items[ik] || 0) + t.amount;
  });
  const catRows = Object.values(byCat).sort((a, b) => b.total - a.total);
  const maxCat = catRows[0]?.total || 1;

  // Last 6 months ending at the selected month
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monthCursor.y, monthCursor.m - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const value = transactions.filter((t) => t.type === "expense" && ym(t.date) === key && (ruleFilter === "todas" || t.mainId === ruleFilter)).reduce((s, t) => s + t.amount, 0);
    return { key, label: MONTHS[d.getMonth()].slice(0, 3), value, current: i === 5 };
  });
  const maxMonth = Math.max(1, ...months.map((m) => m.value));
  const withData = months.filter((m) => m.value > 0);
  const avg = withData.length ? withData.reduce((s, m) => s + m.value, 0) / withData.length : 0;

  // Most repeated concepts
  const concepts = {};
  expenses.forEach((t) => {
    const k = t.conceptName.trim().toLowerCase();
    if (!concepts[k]) concepts[k] = { name: t.conceptName, total: 0, count: 0 };
    concepts[k].total += t.amount; concepts[k].count += 1;
  });
  const topConcepts = Object.values(concepts).sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div>
      <MonthSwitcher label={monthLabel} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />
      <div className="flex gap-2 overflow-x-auto no-scrollbar" style={{ margin: "14px -20px 0", padding: "2px 20px" }}>
        <Chip active={ruleFilter === "todas"} onClick={() => setRuleFilter("todas")}>Todas</Chip>
        {categories.map((c) => <Chip key={c.id} active={ruleFilter === c.id} onClick={() => setRuleFilter(c.id)} color={ruleInfo(c.id).color}>{nice(c.name)}</Chip>)}
      </div>

      <SectionHeader title="¿Cómo vas con tu presupuesto?" hint="Lo gastado frente a lo que te toca por regla" />
      <Panel pad="6px 16px">
        {rulesShown.map((cat) => {
          const spent = spentInCategory(cat.id), budget = budgetFor(cat);
          const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
          const over = spent > budget;
          return (
            <div key={cat.id} className="hairline" style={{ padding: "14px 0" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <span className="flex items-center gap-2" style={{ fontWeight: 650, fontSize: T.body }}>
                  <span style={{ width: 9, height: 9, borderRadius: 5, background: ruleInfo(cat.id).color }} />{nice(cat.name)}
                </span>
                <span className="num" style={{ fontSize: T.small, fontWeight: 650, color: over ? "var(--bad)" : "var(--text)" }}>{pct}% usado</span>
              </div>
              <ProgressBar value={spent} max={budget} color={ruleInfo(cat.id).color} height={10} />
              <div className="num" style={{ fontSize: T.small, color: over ? "var(--bad)" : "var(--muted)", marginTop: 7 }}>
                {over ? `Te pasaste por ${fmt0(spent - budget)} (presupuesto ${fmt0(budget)})` : `Gastaste ${fmt0(spent)} de ${fmt0(budget)}, quedan ${fmt0(budget - spent)}`}
              </div>
            </div>
          );
        })}
      </Panel>

      <SectionHeader title="¿En qué se fue tu dinero?" hint={catRows.length ? `Total ${fmt0(total)}. Toca una categoría para ver el detalle.` : null} />
      <Panel pad="4px 14px">
        {catRows.length === 0 && <EmptyNote text="No hay gastos en este mes con este filtro." />}
        {catRows.map((g) => {
          const open = openCat === g.key;
          const share = total > 0 ? Math.round((g.total / total) * 100) : 0;
          const items = Object.entries(g.items).sort((a, b) => b[1] - a[1]);
          return (
            <div key={g.key} className="hairline">
              <button onClick={() => setOpenCat(open ? null : g.key)} className="press-soft w-full text-left" style={{ background: "none", border: "none", padding: "12px 0", transition: "transform .18s" }} aria-expanded={open}>
                <div className="flex items-center gap-3">
                  <CatIcon icon={g.icon} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" style={{ fontWeight: 650, fontSize: T.body }}>{g.name}</span>
                      <span className="num" style={{ fontWeight: 650, fontSize: T.body }}>{fmt0(g.total)}</span>
                    </div>
                    <div className="flex items-center justify-between" style={{ fontSize: T.cap, color: "var(--muted)", marginTop: 2 }}>
                      <span>{g.mainId ? `${nice(ruleInfo(g.mainId).name)}, ` : ""}{g.count} {g.count === 1 ? "gasto" : "gastos"}</span>
                      <span className="num">{share}% del total</span>
                    </div>
                    <div style={{ marginTop: 8 }}><ProgressBar value={g.total} max={maxCat} color={g.mainId ? ruleInfo(g.mainId).color : "var(--accent-line)"} height={6} /></div>
                  </div>
                </div>
              </button>
              {open && (
                <div className="expand" style={{ margin: "0 0 12px 19px", paddingLeft: 30, borderLeft: "2px solid var(--faint)" }}>
                  {items.map(([name, v]) => (
                    <div key={name} className="flex items-center justify-between" style={{ fontSize: T.small, padding: "6px 0" }}>
                      <span style={{ color: name === "Sin subcategoría" ? "var(--muted)" : "var(--text)" }}>{name}</span>
                      <span className="num" style={{ fontWeight: 600 }}>{fmt0(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </Panel>

      <SectionHeader title="Gasto de los últimos 6 meses" hint={avg > 0 ? `En promedio gastas ${fmt0(avg)} al mes` : null} />
      <Panel pad="18px 14px 14px">
        <div className="flex items-end justify-between gap-2" style={{ height: 170 }}>
          {months.map((m) => {
            const h = m.value > 0 ? Math.max(4, (m.value / maxMonth) * 130) : 2;
            return (
              <div key={m.key} className="flex flex-col items-center justify-end" style={{ flex: 1, height: "100%" }} title={`${m.label}: ${fmt(m.value)}`}>
                <div className="num" style={{ fontSize: T.cap, fontWeight: m.current ? 700 : 500, color: m.current ? "var(--text)" : "var(--muted)", marginBottom: 6, whiteSpace: "nowrap" }}>{m.value > 0 ? "$" + kShort(m.value) : "—"}</div>
                <div className="bar-fill" style={{ width: "70%", maxWidth: 34, height: h, borderRadius: "8px 8px 3px 3px", background: "var(--accent-line)", opacity: m.current ? 1 : 0.4 }} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between gap-2" style={{ marginTop: 8, borderTop: "1px solid var(--faint)", paddingTop: 8 }}>
          {months.map((m) => <div key={m.key} style={{ flex: 1, textAlign: "center", fontSize: T.cap, fontWeight: m.current ? 700 : 500, color: m.current ? "var(--text)" : "var(--muted)" }}>{m.label}</div>)}
        </div>
      </Panel>

      {topConcepts.length > 0 && (
        <>
          <SectionHeader title="Lo que más pagas" hint="Tus 5 gastos más altos del mes" />
          <Panel pad="4px 16px">
            {topConcepts.map((c, i) => (
              <div key={c.name} className="hairline flex items-center justify-between" style={{ padding: "12px 0" }}>
                <div style={{ minWidth: 0 }}>
                  <div className="truncate" style={{ fontWeight: 600, fontSize: T.body }}>{c.name}</div>
                  <div style={{ fontSize: T.cap, color: "var(--muted)", marginTop: 2 }}>{c.count} {c.count === 1 ? "vez" : "veces"}</div>
                </div>
                <span className="num" style={{ fontWeight: 650 }}>{fmt0(c.total)}</span>
              </div>
            ))}
          </Panel>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Calendario                                                              */
/* ---------------------------------------------------------------------- */

function kShort(v) { return v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : Math.round(v); }

export function CalendarScreen({ monthCursor, shiftMonth, monthLabel, monthExpenses, onDayClick }) {
  const weeks = getMonthGrid(monthCursor.y, monthCursor.m);
  const totals = {};
  monthExpenses.forEach((t) => { const d = Number(t.date.slice(8, 10)); totals[d] = (totals[d] || 0) + t.amount; });
  const max = Math.max(1, ...Object.values(totals));
  const monthTotal = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const today = todayISO();

  return (
    <div>
      <MonthSwitcher label={monthLabel} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />
      <Panel style={{ marginTop: 14 }} pad={14}>
        <div className="grid grid-cols-7" style={{ marginBottom: 8 }}>
          {WEEKDAYS.map((w, i) => <div key={i} style={{ textAlign: "center", fontSize: T.cap, fontWeight: 600, color: "var(--muted)" }}>{w}</div>)}
        </div>
        <div className="flex flex-col gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                if (!day) return <div key={di} />;
                const total = totals[day] || 0;
                const dateStr = `${monthCursor.y}-${String(monthCursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = dateStr === today;
                return (
                  <button key={di} onClick={() => onDayClick(dateStr)} className="press flex flex-col items-center justify-center" style={{ aspectRatio: "1", position: "relative", overflow: "hidden", borderRadius: 14, border: isToday ? "2px solid var(--accent-line)" : "1px solid transparent", background: "var(--chip)", padding: 2 }} aria-label={`${day}: ${fmt(total)}`}>
                    {total > 0 && <span style={{ position: "absolute", inset: 0, background: "var(--accent)", opacity: 0.1 + 0.32 * (total / max) }} />}
                    <span style={{ position: "relative", fontSize: T.small, fontWeight: 650 }}>{day}</span>
                    {total > 0 && <span className="num" style={{ position: "relative", fontSize: T.cap, fontWeight: 600, color: "var(--text)" }}>{kShort(total)}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ fontSize: T.cap, color: "var(--muted)", marginTop: 10, textAlign: "center" }}>Entre más intenso el color, más gastaste ese día.</div>
      </Panel>
      <Panel style={{ marginTop: 12 }} className="flex items-center justify-between">
        <span style={{ fontWeight: 600 }}>Total del mes</span>
        <AnimatedNumber value={monthTotal} style={{ fontSize: T.title, fontWeight: 700 }} />
      </Panel>
    </div>
  );
}

export function DayDetail({ transactions, onOpenTx, onAdd, ruleInfo }) {
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  return (
    <div>
      {transactions.length > 0 ? (
        <>
          <div>{transactions.map((t) => <TxRow key={t.id} t={t} onClick={() => onOpenTx(t)} ruleName={ruleInfo(t.mainId).name} ruleColor={ruleInfo(t.mainId).color} />)}</div>
          <div className="flex justify-between" style={{ fontWeight: 650, padding: "14px 4px", borderTop: "1px solid var(--faint)" }}><span>Total del día</span><span className="num">{fmt(total)}</span></div>
        </>
      ) : <EmptyNote text="No registraste gastos este día." />}
      <PrimaryBtn onClick={onAdd}>Agregar gasto en este día</PrimaryBtn>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Registro de gastos — día / semana / mes                                 */
/* ---------------------------------------------------------------------- */

function TotalStrip({ label, value }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: "4px 6px 12px" }}>
      <span style={{ color: "var(--muted)", fontSize: T.small, fontWeight: 600 }}>{label}</span>
      <AnimatedNumber value={value} style={{ fontSize: T.title, fontWeight: 700 }} />
    </div>
  );
}

function DayGroup({ date, items, onOpenTx, onAdd, ruleInfo }) {
  const total = items.reduce((s, t) => s + t.amount, 0);
  return (
    <Panel pad="10px 14px 4px" style={{ marginBottom: 10 }}>
      <div className="flex items-center justify-between" style={{ padding: "2px 4px 4px" }}>
        <div style={{ fontWeight: 650, fontSize: T.small }}>{fmtDayLong(date)}</div>
        <div className="flex items-center gap-2">
          {total > 0 && <span className="num" style={{ fontWeight: 650, fontSize: T.small }}>{fmt0(total)}</span>}
          <button onClick={() => onAdd(date)} aria-label="Agregar gasto en este día" className="press flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 999, background: "var(--chip)", border: "none" }}><Plus size={16} /></button>
        </div>
      </div>
      {items.length === 0
        ? <div style={{ fontSize: T.small, color: "var(--muted)", padding: "4px 4px 10px" }}>Sin gastos</div>
        : items.map((t) => <TxRow key={t.id} t={t} onClick={() => onOpenTx(t)} ruleName={ruleInfo(t.mainId).name} ruleColor={ruleInfo(t.mainId).color} />)}
    </Panel>
  );
}

function Stepper({ label, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
      <IconBtn onClick={onPrev} label="Anterior" size={40}><ChevronLeft size={18} /></IconBtn>
      <div style={{ fontWeight: 600, fontSize: T.body }}>{label}</div>
      <IconBtn onClick={onNext} label="Siguiente" size={40}><ChevronRight size={18} /></IconBtn>
    </div>
  );
}

export function LogScreen({ transactions, onAdd, onOpenTx, ruleInfo }) {
  const [view, setView] = useState("day");
  const [cursor, setCursor] = useState(todayISO());
  const [mc, setMc] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });

  const byDate = {};
  transactions.filter((t) => t.type === "expense").forEach((t) => { (byDate[t.date] = byDate[t.date] || []).push(t); });
  Object.values(byDate).forEach((l) => l.sort((a, b) => (b.time || "").localeCompare(a.time || "")));
  const sum = (dates) => dates.reduce((s, d) => s + (byDate[d] || []).reduce((ss, t) => ss + t.amount, 0), 0);

  let body;
  if (view === "day") {
    const items = byDate[cursor] || [];
    body = (
      <>
        <Stepper label={fmtDayLong(cursor)} onPrev={() => setCursor((d) => addDays(d, -1))} onNext={() => setCursor((d) => addDays(d, 1))} />
        <TotalStrip label="Total del día" value={sum([cursor])} />
        <Panel pad="2px 12px">
          {items.length ? items.map((t) => <TxRow key={t.id} t={t} onClick={() => onOpenTx(t)} ruleName={ruleInfo(t.mainId).name} ruleColor={ruleInfo(t.mainId).color} />) : <EmptyNote text="Sin gastos este día." />}
        </Panel>
        <div style={{ marginTop: 14 }}><PrimaryBtn onClick={() => onAdd(cursor)}>Agregar gasto</PrimaryBtn></div>
      </>
    );
  } else if (view === "week") {
    const mon = mondayOf(cursor);
    const days = Array.from({ length: 7 }, (_, i) => addDays(mon, i));
    const sun = days[6];
    body = (
      <>
        <Stepper label={`${Number(mon.slice(8, 10))} al ${Number(sun.slice(8, 10))} de ${MONTHS[Number(sun.slice(5, 7)) - 1].toLowerCase()}`} onPrev={() => setCursor((d) => addDays(d, -7))} onNext={() => setCursor((d) => addDays(d, 7))} />
        <TotalStrip label="Total de la semana" value={sum(days)} />
        {days.map((d) => <DayGroup key={d} date={d} items={byDate[d] || []} onOpenTx={onOpenTx} onAdd={onAdd} ruleInfo={ruleInfo} />)}
      </>
    );
  } else {
    const prefix = `${mc.y}-${String(mc.m + 1).padStart(2, "0")}`;
    const dates = Object.keys(byDate).filter((d) => d.startsWith(prefix)).sort().reverse();
    const shift = (delta) => setMc((c) => { let m = c.m + delta, y = c.y; if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; } return { y, m }; });
    body = (
      <>
        <Stepper label={`${MONTHS[mc.m]} ${mc.y}`} onPrev={() => shift(-1)} onNext={() => shift(1)} />
        <TotalStrip label="Total del mes" value={sum(dates)} />
        {dates.length ? dates.map((d) => <DayGroup key={d} date={d} items={byDate[d]} onOpenTx={onOpenTx} onAdd={onAdd} ruleInfo={ruleInfo} />) : <Panel><EmptyNote text="Sin gastos en este mes." /></Panel>}
      </>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: T.h1, fontWeight: 700, margin: "4px 4px 14px", letterSpacing: "-0.02em" }}>Registro de gastos</h1>
      <div className="flex p-1" style={{ background: "var(--chip)", borderRadius: 999, marginBottom: 16 }}>
        {[["day", "Día"], ["week", "Semana"], ["month", "Mes"]].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} className="press flex-1" style={{ padding: "9px 0", borderRadius: 999, border: "none", fontWeight: 650, fontSize: T.small, background: view === k ? "var(--glass-strong)" : "transparent", color: view === k ? "var(--text)" : "var(--muted)", boxShadow: view === k ? "0 4px 14px -8px var(--shadow)" : "none" }}>{l}</button>
        ))}
      </div>
      <div key={view} className="screen-in">{body}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Estado de cuenta                                                         */
/* ---------------------------------------------------------------------- */

export function StatementScreen({ categories, monthLabel, shiftMonth, monthCursor, monthExpenses, totalIncomeMonth, totalSpentMonth, budgetFor, spentInCategory, ruleInfo }) {
  const [collapsed, setCollapsed] = useState({});
  const weeks = getMonthGrid(monthCursor.y, monthCursor.m).map((week, wi) => {
    const days = week.filter(Boolean).map((d) => `${monthCursor.y}-${String(monthCursor.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    const items = monthExpenses.filter((t) => days.includes(t.date)).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    return { key: "w" + wi, index: wi + 1, items, total: items.reduce((s, t) => s + t.amount, 0), first: days[0], last: days[days.length - 1] };
  }).filter((w) => w.first);
  const balance = totalIncomeMonth - totalSpentMonth;

  return (
    <div>
      <MonthSwitcher label={monthLabel} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />
      <h1 style={{ fontSize: T.h1, fontWeight: 700, margin: "18px 4px 14px", letterSpacing: "-0.02em" }}>Estado de cuenta</h1>

      <Panel>
        <div className="flex justify-between" style={{ padding: "4px 0" }}><span style={{ color: "var(--muted)" }}>Ingresos</span><span className="num" style={{ fontWeight: 650, color: "var(--good)" }}>{fmt(totalIncomeMonth)}</span></div>
        <div className="flex justify-between" style={{ padding: "4px 0" }}><span style={{ color: "var(--muted)" }}>Gastos</span><span className="num" style={{ fontWeight: 650 }}>{fmt(totalSpentMonth)}</span></div>
        <div className="flex justify-between" style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--faint)" }}>
          <span style={{ fontWeight: 650 }}>Balance</span>
          <span className="num" style={{ fontWeight: 700, fontSize: T.title, color: balance < 0 ? "var(--bad)" : "var(--text)" }}>{fmt(balance)}</span>
        </div>
      </Panel>

      <SectionHeader title="Por regla" />
      <Panel pad="4px 16px">
        {categories.map((cat) => {
          const spent = spentInCategory(cat.id), budget = budgetFor(cat);
          return (
            <div key={cat.id} className="hairline flex justify-between" style={{ padding: "12px 0", fontSize: T.small }}>
              <span className="flex items-center gap-2"><span style={{ width: 8, height: 8, borderRadius: 4, background: ruleInfo(cat.id).color }} />{nice(cat.name)} <span style={{ color: "var(--muted)" }}>{cat.percent}%</span></span>
              <span className="num" style={{ fontWeight: 650, color: budgetStatus(spent, budget).color }}>{fmt0(spent)} <span style={{ color: "var(--muted)", fontWeight: 500 }}>de {fmt0(budget)}</span></span>
            </div>
          );
        })}
      </Panel>

      <SectionHeader title="Detalle por semana" />
      {weeks.map((w) => {
        const isC = collapsed[w.key];
        return (
          <Panel key={w.key} pad="4px 14px" style={{ marginBottom: 10 }}>
            <button onClick={() => setCollapsed((p) => ({ ...p, [w.key]: !p[w.key] }))} className="w-full flex items-center justify-between" style={{ background: "none", border: "none", padding: "12px 2px" }} aria-expanded={!isC}>
              <span style={{ fontWeight: 650 }}>Semana {w.index} <span style={{ fontWeight: 500, color: "var(--muted)", fontSize: T.small }}>del {Number(w.first.slice(8, 10))} al {Number(w.last.slice(8, 10))}</span></span>
              <span className="flex items-center gap-2"><span className="num" style={{ fontWeight: 650 }}>{fmt0(w.total)}</span><ChevronDown size={16} className="chev" style={{ transform: isC ? "rotate(-90deg)" : "none" }} /></span>
            </button>
            {!isC && (
              <div className="expand" style={{ paddingBottom: 8 }}>
                {w.items.length === 0 ? <div style={{ fontSize: T.small, color: "var(--muted)", padding: "0 2px 6px" }}>Sin gastos</div> : w.items.map((t) => (
                  <div key={t.id} className="flex justify-between gap-3" style={{ padding: "8px 2px", borderTop: "1px solid var(--faint)" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: T.small }}>{t.conceptName}</div>
                      <div style={{ fontSize: T.cap, color: "var(--muted)", marginTop: 2 }}>{fmtDayLong(t.date)}, {nice(ruleInfo(t.mainId).name)} › {t.subName}{t.itemName ? ` › ${t.itemName}` : ""}</div>
                      {t.note && <div style={{ fontSize: T.cap, color: "var(--muted)", fontStyle: "italic", marginTop: 2 }}>“{t.note}”</div>}
                    </div>
                    <span className="num" style={{ fontWeight: 650, fontSize: T.small, whiteSpace: "nowrap" }}>{fmt(t.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        );
      })}

      <div className="no-print" style={{ marginTop: 16 }}>
        <PrimaryBtn onClick={() => window.print()}><span className="flex items-center justify-center gap-2"><Printer size={17} /> Guardar como PDF</span></PrimaryBtn>
        <div style={{ fontSize: T.cap, color: "var(--muted)", textAlign: "center", marginTop: 8 }}>Se abre la ventana de impresión; elige "Guardar como PDF".</div>
      </div>
    </div>
  );
}
