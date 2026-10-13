import React, { useState } from "react";
import {
  ChevronRight, ChevronLeft, Plus, Pencil, Trash2, Home, List as ListIcon, Sliders, SlidersHorizontal,
  Wallet, PiggyBank, FileText, PieChart, Calendar, Settings, Palette, Moon, Sun,
} from "lucide-react";
import {
  Panel, SectionHeader, Chip, Field, PrimaryBtn, GhostBtn, ProgressBar, EmptyNote, CatIcon, IconPicker,
  ColorPicker, T,
} from "./ui";
import {
  fmt, fmt0, nice, uid, todayISO, periodicAmounts, RULE_PRESETS, formatAmountInput, cleanAmountInput,
  budgetStatus,
} from "./utils";

function ScreenTitle({ children, hint }) {
  return (
    <div style={{ margin: "4px 4px 16px" }}>
      <h1 style={{ fontSize: T.h1, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>{children}</h1>
      {hint && <div style={{ fontSize: T.small, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  );
}

function SmallIconBtn({ onClick, label, children, danger }) {
  return (
    <button onClick={onClick} aria-label={label} className="press flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 999, background: "transparent", border: "none", color: danger ? "var(--bad)" : "var(--muted)", flexShrink: 0 }}>
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Categorías — Regla › Categoría › Subcategoría                          */
/* ---------------------------------------------------------------------- */

export function CategoriesScreen({ categories, monthExpenses, spentInCategory, budgetFor, ruleInfo, onCreateCategory, onEditCategory, onDeleteCategory, onCreateItem, onEditItem, onDeleteItem }) {
  const [openRule, setOpenRule] = useState(() => categories[0]?.id || null);
  return (
    <div>
      <ScreenTitle hint="Cada regla tiene categorías (como Casa) y cada categoría sus subcategorías (como Luz o Agua).">Categorías</ScreenTitle>
      <div className="flex flex-col gap-3">
        {categories.map((rule) => (
          <RuleBlock
            key={rule.id} rule={rule} color={ruleInfo(rule.id).color} monthExpenses={monthExpenses}
            spent={spentInCategory(rule.id)} budget={budgetFor(rule)}
            open={openRule === rule.id} onToggle={() => setOpenRule(openRule === rule.id ? null : rule.id)}
            onCreateCategory={onCreateCategory} onEditCategory={onEditCategory} onDeleteCategory={onDeleteCategory}
            onCreateItem={onCreateItem} onEditItem={onEditItem} onDeleteItem={onDeleteItem}
          />
        ))}
      </div>
    </div>
  );
}

function RuleBlock({ rule, color, monthExpenses, spent, budget, open, onToggle, onCreateCategory, onEditCategory, onDeleteCategory, onCreateItem, onEditItem, onDeleteItem }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("home");
  const [openCat, setOpenCat] = useState(null);
  const st = budgetStatus(spent, budget);

  return (
    <Panel pad={0} style={{ overflow: "hidden" }}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 text-left" style={{ background: "none", border: "none", padding: "16px 16px" }} aria-expanded={open}>
        <span style={{ width: 6, alignSelf: "stretch", borderRadius: 3, background: color }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: T.title, fontWeight: 650 }}>{nice(rule.name)} <span style={{ fontSize: T.small, color: "var(--muted)", fontWeight: 500 }}>{rule.percent}%</span></div>
          <div className="num" style={{ fontSize: T.small, color: "var(--muted)", marginTop: 2 }}>
            {rule.subcategories.length} {rule.subcategories.length === 1 ? "categoría" : "categorías"}, <span style={{ color: st.color, fontWeight: 600 }}>{fmt0(spent)}</span> de {fmt0(budget)} este mes
          </div>
        </div>
        <ChevronRight size={20} className={"chev" + (open ? " open" : "")} color="var(--muted)" />
      </button>

      {open && (
        <div className="expand" style={{ padding: "0 14px 14px" }}>
          {rule.subcategories.length === 0 && !adding && <EmptyNote text={`Aún no hay categorías en ${nice(rule.name)}.`} />}
          <div style={{ borderRadius: 20, background: "var(--field)", border: rule.subcategories.length ? "1px solid var(--field-border)" : "none" }}>
            {rule.subcategories.map((cat) => (
              <CategoryRow
                key={cat.id} rule={rule} cat={cat} color={color} monthExpenses={monthExpenses}
                open={openCat === cat.id} onToggle={() => setOpenCat(openCat === cat.id ? null : cat.id)}
                onEdit={(n, i) => onEditCategory(rule.id, cat.id, n, i)} onDelete={() => onDeleteCategory(rule.id, cat.id)}
                onCreateItem={(n) => onCreateItem(rule.id, cat.id, { id: uid("item"), name: n })}
                onEditItem={(itemId, n) => onEditItem(rule.id, cat.id, itemId, n)}
                onDeleteItem={(itemId) => onDeleteItem(rule.id, cat.id, itemId)}
              />
            ))}
          </div>

          {adding ? (
            <div className="expand" style={{ marginTop: 10, padding: 14, borderRadius: 20, background: "var(--field)", border: "1px solid var(--field-border)" }}>
              <Field label={`Nueva categoría en ${nice(rule.name)}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Casa, Súper, Auto" autoFocus />
              <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "0 0 8px 4px" }}>Ícono</div>
              <IconPicker value={icon} onChange={setIcon} />
              <div className="flex gap-2" style={{ marginTop: 12 }}>
                <GhostBtn onClick={() => { setAdding(false); setName(""); }}>Cancelar</GhostBtn>
                <PrimaryBtn disabled={!name.trim()} onClick={() => { onCreateCategory(rule.id, { id: uid("sub"), name: name.trim(), icon }); setName(""); setAdding(false); }}>Crear</PrimaryBtn>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="press w-full flex items-center justify-center gap-2" style={{ marginTop: 10, padding: "12px 0", borderRadius: 18, border: "1.5px dashed var(--field-border)", background: "transparent", color: "var(--accent-ink)", fontWeight: 650, fontSize: T.small }}>
              <Plus size={16} /> Nueva categoría
            </button>
          )}
        </div>
      )}
    </Panel>
  );
}

function CategoryRow({ rule, cat, color, monthExpenses, open, onToggle, onEdit, onDelete, onCreateItem, onEditItem, onDeleteItem }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [icon, setIcon] = useState(cat.icon || "wallet");
  const [newItem, setNewItem] = useState("");
  const [editItemId, setEditItemId] = useState(null);
  const [editItemName, setEditItemName] = useState("");
  const items = cat.items || [];
  const txs = monthExpenses.filter((t) => t.mainId === rule.id && t.subId === cat.id);
  const total = txs.reduce((s, t) => s + t.amount, 0);
  const itemTotal = (id) => txs.filter((t) => t.itemId === id).reduce((s, t) => s + t.amount, 0);

  if (editing) {
    return (
      <div className="hairline expand" style={{ padding: 14 }}>
        <Field label="Nombre de la categoría" value={name} onChange={(e) => setName(e.target.value)} />
        <IconPicker value={icon} onChange={setIcon} />
        <div className="flex gap-2" style={{ marginTop: 12 }}>
          <GhostBtn onClick={() => setEditing(false)}>Cancelar</GhostBtn>
          <PrimaryBtn disabled={!name.trim()} onClick={() => { onEdit(name.trim(), icon); setEditing(false); }}>Guardar</PrimaryBtn>
        </div>
        <button onClick={onDelete} className="press w-full flex items-center justify-center gap-2" style={{ marginTop: 8, background: "none", border: "none", color: "var(--bad)", fontWeight: 600, fontSize: T.small, padding: 8 }}><Trash2 size={15} /> Eliminar categoría</button>
      </div>
    );
  }

  return (
    <div className="hairline">
      <div className="flex items-center" style={{ padding: "8px 4px 8px 10px" }}>
        <button onClick={onToggle} className="flex items-center gap-3 text-left" style={{ flex: 1, minWidth: 0, background: "none", border: "none", padding: "4px 0" }} aria-expanded={open}>
          <ChevronRight size={16} className={"chev" + (open ? " open" : "")} color="var(--muted)" style={{ flexShrink: 0 }} />
          <CatIcon icon={cat.icon} size={38} />
          <div style={{ minWidth: 0 }}>
            <div className="truncate" style={{ fontWeight: 650, fontSize: T.body }}>{cat.name}</div>
            <div style={{ fontSize: T.cap, color: "var(--muted)", marginTop: 1 }}>{items.length ? `${items.length} ${items.length === 1 ? "subcategoría" : "subcategorías"}` : "Sin subcategorías"}</div>
          </div>
        </button>
        {total > 0 && <span className="num" style={{ fontWeight: 650, fontSize: T.small, marginRight: 2 }}>{fmt0(total)}</span>}
        <SmallIconBtn onClick={() => setEditing(true)} label={`Editar ${cat.name}`}><Pencil size={16} /></SmallIconBtn>
      </div>

      {open && (
        <div className="expand" style={{ margin: "0 12px 12px 30px", paddingLeft: 16, borderLeft: `2px solid ${color}` }}>
          {items.map((it) => (
            editItemId === it.id ? (
              <div key={it.id} className="flex gap-2 items-center" style={{ padding: "6px 0" }}>
                <input className="field" value={editItemName} onChange={(e) => setEditItemName(e.target.value)} autoFocus style={{ padding: "9px 12px" }} />
                <SmallIconBtn label="Eliminar subcategoría" danger onClick={() => { setEditItemId(null); onDeleteItem(it.id); }}><Trash2 size={16} /></SmallIconBtn>
                <button className="press" onClick={() => { if (editItemName.trim()) onEditItem(it.id, editItemName.trim()); setEditItemId(null); }} style={{ padding: "9px 14px", borderRadius: 14, border: "none", background: "var(--accent)", color: "var(--on-accent)", fontWeight: 650, fontSize: T.small }}>Listo</button>
              </div>
            ) : (
              <div key={it.id} className="flex items-center justify-between" style={{ padding: "4px 0" }}>
                <span style={{ fontSize: T.body }}>{it.name}</span>
                <span className="flex items-center">
                  {itemTotal(it.id) > 0 && <span className="num" style={{ fontSize: T.small, color: "var(--muted)", marginRight: 2 }}>{fmt0(itemTotal(it.id))}</span>}
                  <SmallIconBtn label={`Editar ${it.name}`} onClick={() => { setEditItemId(it.id); setEditItemName(it.name); }}><Pencil size={15} /></SmallIconBtn>
                </span>
              </div>
            )
          ))}
          <div className="flex gap-2" style={{ marginTop: 6 }}>
            <input className="field" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newItem.trim()) { onCreateItem(newItem.trim()); setNewItem(""); } }} placeholder={`Nueva subcategoría de ${cat.name}`} style={{ padding: "10px 12px", fontSize: T.small }} />
            <button className="press" disabled={!newItem.trim()} onClick={() => { onCreateItem(newItem.trim()); setNewItem(""); }} aria-label="Agregar subcategoría" style={{ width: 44, flexShrink: 0, borderRadius: 14, border: "none", background: newItem.trim() ? "var(--accent)" : "var(--chip)", color: newItem.trim() ? "var(--on-accent)" : "var(--muted)" }}><Plus size={18} style={{ margin: "0 auto" }} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Metas de ahorro                                                          */
/* ---------------------------------------------------------------------- */

export function GoalsScreen({ goals, onOpen, onAdd }) {
  return (
    <div>
      <div className="flex items-start justify-between">
        <ScreenTitle hint="Aparta dinero para algo concreto y ve cuánto te falta.">Metas de ahorro</ScreenTitle>
        <button onClick={onAdd} aria-label="Nueva meta" className="press flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 999, background: "var(--accent)", color: "var(--on-accent)", border: "none", flexShrink: 0 }}><Plus size={20} /></button>
      </div>
      <div className="flex flex-col gap-3">
        {goals.map((g) => {
          const saved = g.contributions.reduce((s, c) => s + c.amount, 0);
          const pct = Math.min(100, (saved / g.targetAmount) * 100);
          return (
            <button key={g.id} onClick={() => onOpen(g)} className="glass press-soft text-left w-full" style={{ padding: 16, transition: "transform .18s" }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                <CatIcon icon={g.icon} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate" style={{ fontWeight: 650, fontSize: T.body }}>{g.name}</div>
                  <div className="num" style={{ fontSize: T.small, color: "var(--muted)" }}>{fmt0(saved)} de {fmt0(g.targetAmount)}</div>
                </div>
                <span className="num" style={{ fontWeight: 700, fontSize: T.title }}>{Math.round(pct)}%</span>
              </div>
              <ProgressBar value={saved} max={g.targetAmount} color="var(--accent-line)" height={8} />
            </button>
          );
        })}
        {goals.length === 0 && <Panel><EmptyNote text="Todavía no tienes metas." action="Crear mi primera meta" onAction={onAdd} /></Panel>}
      </div>
    </div>
  );
}

export function GoalDetail({ goal, onCreate, onContribute, onDelete }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialSaved, setInitialSaved] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [contribFreq, setContribFreq] = useState("mensual");
  const [icon, setIcon] = useState("piggy");
  const [contribAmount, setContribAmount] = useState("");
  const [contribNote, setContribNote] = useState("");

  if (!goal) {
    return (
      <div>
        <Field label="¿Para qué ahorras?" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Vacaciones" />
        <Field label="¿Cuánto necesitas?" inputMode="decimal" value={formatAmountInput(targetAmount)} onChange={(e) => setTargetAmount(cleanAmountInput(e.target.value))} placeholder="$0" />
        <Field label="¿Ya tienes algo ahorrado? (opcional)" inputMode="decimal" value={formatAmountInput(initialSaved)} onChange={(e) => setInitialSaved(cleanAmountInput(e.target.value))} placeholder="$0" />
        <Field label="¿Para cuándo? (opcional)" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "0 0 8px 4px" }}>¿Cada cuánto vas a aportar?</div>
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
          {["diaria", "semanal", "quincenal", "mensual"].map((f) => <Chip key={f} active={contribFreq === f} onClick={() => setContribFreq(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</Chip>)}
        </div>
        <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "0 0 8px 4px" }}>Ícono</div>
        <IconPicker value={icon} onChange={setIcon} />
        <div style={{ marginTop: 16 }}>
          <PrimaryBtn disabled={!name.trim() || !(Number(targetAmount) > 0)} onClick={() => onCreate({ name: name.trim(), targetAmount: Number(targetAmount), targetDate: targetDate || null, contribFreq, icon, initialSaved: Number(initialSaved) || 0 })}>Crear meta</PrimaryBtn>
        </div>
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
    const expected = Math.min(totalDays, Math.max(0, (now - start) / 86400000)) / totalDays;
    const actual = saved / goal.targetAmount;
    pace = actual >= expected + 0.03 ? { label: "Vas adelantado", color: "var(--good)" } : actual <= expected - 0.03 ? { label: "Vas atrasado", color: "var(--bad)" } : { label: "Vas a tiempo", color: "var(--warn)" };
  }
  const daysRemaining = goal.targetDate ? Math.max(1, Math.ceil((new Date(goal.targetDate) - new Date()) / 86400000)) : null;
  const per = daysRemaining ? periodicAmounts(remaining, daysRemaining) : null;

  return (
    <div>
      <div className="flex items-end justify-between" style={{ marginBottom: 10 }}>
        <div>
          <div className="num" style={{ fontSize: T.h1, fontWeight: 700 }}>{fmt0(saved)}</div>
          <div className="num" style={{ fontSize: T.small, color: "var(--muted)" }}>de {fmt0(goal.targetAmount)}, faltan {fmt0(remaining)}</div>
        </div>
        <div className="num" style={{ fontSize: T.title, fontWeight: 700 }}>{Math.round(pct)}%</div>
      </div>
      <ProgressBar value={saved} max={goal.targetAmount} color="var(--accent-line)" height={10} />

      {goal.targetDate && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 20, background: "var(--field)", border: "1px solid var(--field-border)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: T.small, fontWeight: 600 }}>Meta para el {goal.targetDate}</span>
            {pace && <span style={{ fontSize: T.small, fontWeight: 650, color: pace.color }}>{pace.label}</span>}
          </div>
          {per && (
            <>
              <div style={{ fontSize: T.small, color: "var(--muted)", marginBottom: 8 }}>Para llegar necesitas ahorrar:</div>
              <div className="grid grid-cols-2 gap-2">
                {[["mensual", "Al mes", per.mensual], ["quincenal", "A la quincena", per.quincenal], ["semanal", "A la semana", per.semanal], ["diaria", "Al día", per.diario]].map(([k, l, v]) => (
                  <div key={k} style={{ padding: 10, borderRadius: 14, background: goal.contribFreq === k ? "var(--accent-soft)" : "var(--chip)", border: goal.contribFreq === k ? "1.5px solid var(--accent-line)" : "1.5px solid transparent" }}>
                    <div style={{ fontSize: T.cap, color: "var(--muted)", fontWeight: 600 }}>{l}</div>
                    <div className="num" style={{ fontSize: T.body, fontWeight: 700 }}>{fmt(v)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ fontWeight: 650, margin: "20px 4px 8px" }}>Agregar aportación</div>
      <div className="flex gap-2">
        <input className="field num" inputMode="decimal" value={formatAmountInput(contribAmount)} onChange={(e) => setContribAmount(cleanAmountInput(e.target.value))} placeholder="$0" />
        <button className="press" onClick={() => { if (Number(contribAmount) > 0) { onContribute(goal.id, contribAmount, contribNote); setContribAmount(""); setContribNote(""); } }} style={{ padding: "0 18px", borderRadius: 16, border: "none", background: Number(contribAmount) > 0 ? "var(--accent)" : "var(--chip)", color: Number(contribAmount) > 0 ? "var(--on-accent)" : "var(--muted)", fontWeight: 650 }}>Agregar</button>
      </div>
      <input className="field" value={contribNote} onChange={(e) => setContribNote(e.target.value)} placeholder="Nota (opcional)" style={{ marginTop: 8 }} />

      <div style={{ fontWeight: 650, margin: "20px 4px 4px" }}>Historial</div>
      {goal.contributions.length === 0 && <div style={{ fontSize: T.small, color: "var(--muted)", padding: "4px" }}>Sin aportaciones aún.</div>}
      {[...goal.contributions].reverse().map((c) => (
        <div key={c.id} className="hairline flex justify-between" style={{ fontSize: T.small, padding: "10px 4px" }}>
          <span><span style={{ color: "var(--muted)" }}>{c.date}</span>{c.note ? `  ${c.note}` : ""}</span>
          <span className="num" style={{ fontWeight: 650 }}>{fmt(c.amount)}</span>
        </div>
      ))}
      <div style={{ marginTop: 18 }}><GhostBtn danger onClick={() => onDelete(goal.id)}>Eliminar meta</GhostBtn></div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Reglas financieras                                                       */
/* ---------------------------------------------------------------------- */

function RuleOption({ active, onClick, title, desc }) {
  return (
    <button onClick={onClick} className="press text-left w-full" style={{ padding: "14px 16px", borderRadius: 20, border: active ? "2px solid var(--accent-line)" : "1px solid var(--field-border)", background: active ? "var(--accent-soft)" : "var(--field)" }}>
      <div style={{ fontWeight: 650, fontSize: T.body }}>{title}</div>
      <div style={{ fontSize: T.small, color: "var(--muted)", marginTop: 2 }}>{desc}</div>
    </button>
  );
}

function CustomRuleEditor({ customCats, setCustomCats }) {
  const sum = customCats.reduce((s, c) => s + (Number(c.percent) || 0), 0);
  return (
    <div className="expand flex flex-col gap-2" style={{ marginTop: 10 }}>
      {customCats.map((c) => (
        <div key={c.id} className="flex gap-2">
          <input className="field" value={c.name} onChange={(e) => setCustomCats((p) => p.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))} placeholder="Nombre" />
          <input className="field num" inputMode="numeric" value={c.percent} onChange={(e) => setCustomCats((p) => p.map((x) => x.id === c.id ? { ...x, percent: e.target.value.replace(/[^0-9]/g, "") } : x))} placeholder="%" style={{ width: 76, textAlign: "center" }} />
        </div>
      ))}
      <button onClick={() => setCustomCats((p) => [...p, { id: uid(), name: "", percent: "" }])} className="press text-left" style={{ background: "none", border: "none", color: "var(--accent-ink)", fontWeight: 600, fontSize: T.small, padding: "6px 4px" }}>+ Agregar parte</button>
      <div className="num" style={{ fontSize: T.small, fontWeight: 600, color: sum === 100 ? "var(--good)" : "var(--warn)" }}>Suma: {sum}%{sum !== 100 ? " (debe ser 100%)" : ""}</div>
    </div>
  );
}

export function RulesScreen({ categories, onApply }) {
  const [preset, setPreset] = useState("50/30/20");
  const [customCats, setCustomCats] = useState([{ id: uid(), name: "", percent: "" }]);
  const [confirming, setConfirming] = useState(false);
  const sum = customCats.reduce((s, c) => s + (Number(c.percent) || 0), 0);
  const current = categories.map((c) => `${nice(c.name)} ${c.percent}%`).join(", ");

  function apply() {
    const ruleCats = preset === "personalizada"
      ? customCats.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim().toUpperCase(), percent: Number(c.percent) || 0 }))
      : RULE_PRESETS[preset];
    onApply(ruleCats, preset);
    setConfirming(false);
  }

  return (
    <div>
      <ScreenTitle hint={`Tu regla actual: ${current || "sin definir"}.`}>Reglas financieras</ScreenTitle>
      <div className="flex flex-col gap-2">
        {Object.entries(RULE_PRESETS).map(([key, cats]) => (
          <RuleOption key={key} active={preset === key} onClick={() => setPreset(key)} title={`Regla ${key}`} desc={cats.map((c) => `${nice(c.name)} ${c.percent}%`).join(", ")} />
        ))}
        <RuleOption active={preset === "personalizada"} onClick={() => setPreset("personalizada")} title="Personalizada" desc="Tú defines las partes y sus porcentajes" />
      </div>
      {preset === "personalizada" && <CustomRuleEditor customCats={customCats} setCustomCats={setCustomCats} />}
      <div style={{ marginTop: 18 }}>
        {!confirming ? (
          <PrimaryBtn disabled={preset === "personalizada" && sum !== 100} onClick={() => setConfirming(true)}>Usar esta regla</PrimaryBtn>
        ) : (
          <Panel className="pop">
            <div style={{ fontSize: T.small, lineHeight: 1.5, marginBottom: 12 }}>Se van a reorganizar tus reglas. Las categorías de una regla con el mismo nombre se conservan; las demás quedarán vacías. ¿Continuar?</div>
            <div className="flex gap-2"><GhostBtn onClick={() => setConfirming(false)}>Cancelar</GhostBtn><PrimaryBtn onClick={apply}>Sí, cambiar</PrimaryBtn></div>
          </Panel>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Perfil y apariencia                                                      */
/* ---------------------------------------------------------------------- */

export function AppearanceEditor({ appearance, setAppearance }) {
  return (
    <div>
      <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "0 0 8px 4px" }}>Modo</div>
      <div className="flex p-1" style={{ background: "var(--chip)", borderRadius: 999, marginBottom: 20 }}>
        {[["light", "Claro", Sun], ["dark", "Oscuro", Moon]].map(([k, l, I]) => (
          <button key={k} onClick={() => setAppearance((a) => ({ ...a, mode: k }))} className="press flex-1 flex items-center justify-center gap-2" style={{ padding: "10px 0", borderRadius: 999, border: "none", fontWeight: 650, fontSize: T.small, background: appearance.mode === k ? "var(--glass-strong)" : "transparent", color: appearance.mode === k ? "var(--text)" : "var(--muted)", boxShadow: appearance.mode === k ? "0 4px 14px -8px var(--shadow)" : "none" }}>
            <I size={15} /> {l}
          </button>
        ))}
      </div>
      <ColorPicker value={appearance.accent} onChange={(hex) => setAppearance((a) => ({ ...a, accent: hex }))} />
    </div>
  );
}

export function ProfileScreen({ profile, setProfile, saveNote, appearance, setAppearance }) {
  return (
    <div>
      <ScreenTitle>Perfil y apariencia</ScreenTitle>
      <SectionHeader title="Color de la app" hint="Se aplica al instante en toda la app" />
      <Panel pad={18}><AppearanceEditor appearance={appearance} setAppearance={setAppearance} /></Panel>

      <SectionHeader title="Tus datos" />
      <Panel pad={18}>
        <Field label="Nombre" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
        <Field label="Ingreso esperado" inputMode="decimal" value={formatAmountInput(String(profile.incomeAmount))} onChange={(e) => setProfile((p) => ({ ...p, incomeAmount: Number(cleanAmountInput(e.target.value)) || 0 }))} hint="Lo que sueles recibir. Se usa para repartir tu presupuesto." />
        <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "0 0 8px 4px" }}>¿Cada cuánto lo recibes?</div>
        <div className="flex gap-2 flex-wrap">
          {["diaria", "semanal", "quincenal", "mensual"].map((p) => <Chip key={p} active={profile.incomePeriodicity === p} onClick={() => setProfile((pr) => ({ ...pr, incomePeriodicity: p }))}>{p.charAt(0).toUpperCase() + p.slice(1)}</Chip>)}
        </div>
      </Panel>
      <div style={{ fontSize: T.cap, color: "var(--muted)", textAlign: "center", margin: "16px 12px 0", lineHeight: 1.5 }}>
        {saveNote || "Tus datos se guardan solos y solo viven en este teléfono."}
      </div>
    </div>
  );
}

export function ViewModeEditor({ profile, setProfile, onClose }) {
  const [mode, setMode] = useState(profile.viewMode || "mensual");
  const [days, setDays] = useState(profile.viewModeCustomDays || 7);
  const OPTIONS = [
    ["diaria", "Diario", "Cuánto llevas hoy contra tu presupuesto de un día."],
    ["semanal", "Semanal", "Esta semana, de lunes a domingo."],
    ["quincenal", "Quincenal", "La quincena actual."],
    ["mensual", "Mensual", "El mes completo."],
    ["personalizado", "Personalizado", "Tú eliges cuántos días."],
  ];
  return (
    <div>
      <p style={{ fontSize: T.small, color: "var(--muted)", margin: "0 4px 14px", lineHeight: 1.5 }}>Cambia el periodo que ves en Inicio. Útil si cobras al mes pero quieres controlarte por semana.</p>
      <div className="flex flex-col gap-2" style={{ marginBottom: 16 }}>
        {OPTIONS.map(([k, l, d]) => <RuleOption key={k} active={mode === k} onClick={() => setMode(k)} title={l} desc={d} />)}
      </div>
      {mode === "personalizado" && <Field label="¿Cada cuántos días?" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ""))} placeholder="7" />}
      <PrimaryBtn onClick={() => { setProfile((p) => ({ ...p, viewMode: mode, viewModeCustomDays: Number(days) || 7 })); onClose(); }}>Guardar</PrimaryBtn>
    </div>
  );
}

export function MenuList({ onNavigate, onViewMode }) {
  const groups = [
    [["home", "Inicio", Home], ["log", "Registro de gastos", ListIcon], ["calendar", "Calendario", Calendar], ["stats", "Estadísticas", PieChart], ["statement", "Estado de cuenta", FileText]],
    [["categories", "Categorías", Wallet], ["goals", "Metas de ahorro", PiggyBank], ["rules", "Reglas financieras", Sliders], ["viewmode", "Periodo de Inicio", SlidersHorizontal]],
    [["profile", "Perfil, color y apariencia", Palette]],
  ];
  return (
    <div className="flex flex-col gap-3">
      {groups.map((g, gi) => (
        <div key={gi} style={{ borderRadius: 22, background: "var(--field)", border: "1px solid var(--field-border)", overflow: "hidden" }}>
          {g.map(([key, label, Icon]) => (
            <button key={label} onClick={() => key === "viewmode" ? onViewMode() : onNavigate(key)} className="hairline w-full flex items-center gap-3 text-left" style={{ background: "none", border: "none", padding: "14px 16px", fontSize: T.body, fontWeight: 600 }}>
              <span className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 11, background: "var(--accent-soft)", color: "var(--accent-ink)" }}><Icon size={17} /></span>
              <span style={{ flex: 1 }}>{label}</span>
              <ChevronRight size={17} color="var(--muted)" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Bienvenida                                                               */
/* ---------------------------------------------------------------------- */

export function Onboarding({ onDone, appearance, setAppearance }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [periodicity, setPeriodicity] = useState("mensual");
  const [rulePreset, setRulePreset] = useState("50/30/20");
  const [customCats, setCustomCats] = useState([{ id: uid(), name: "", percent: "" }]);
  const customSum = customCats.reduce((s, c) => s + (Number(c.percent) || 0), 0);
  const steps = 4;

  function finish() {
    const ruleCats = rulePreset === "personalizada"
      ? customCats.filter((c) => c.name.trim()).map((c) => ({ id: uid("rc"), name: c.name.trim().toUpperCase(), percent: Number(c.percent) || 0 }))
      : RULE_PRESETS[rulePreset].map((c) => ({ ...c, id: uid("rc_" + c.id) }));
    onDone(
      { name: name.trim() || "Tú", incomeAmount: Number(amount) || 0, incomePeriodicity: periodicity, ruleName: rulePreset, viewMode: "mensual" },
      ruleCats.map((rc) => ({ id: rc.id, name: rc.name, percent: rc.percent, subcategories: [] })),
    );
  }

  const canNext = [name.trim().length > 0, Number(amount) > 0, rulePreset !== "personalizada" || customSum === 100, true][step];
  const titles = ["¿Cómo te llamas?", "¿Cuánto ganas?", "¿Cómo quieres repartirlo?", "Elige el color de tu app"];
  const hints = ["Así te saludaremos cada vez que abras la app.", "Con esto calculamos cuánto te toca gastar en cada parte.", "Tu regla reparte el ingreso en partes con un porcentaje cada una.", "Puedes cambiarlo cuando quieras en Perfil."];

  return (
    <div className="w-full flex justify-center" style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <div className="w-full flex flex-col" style={{ maxWidth: 480, padding: "48px 20px 32px" }}>
        <div className="flex gap-1" style={{ marginBottom: 28 }}>
          {Array.from({ length: steps }, (_, i) => <span key={i} className="bar-fill" style={{ height: 5, flex: 1, borderRadius: 3, background: i <= step ? "var(--accent-line)" : "var(--track)" }} />)}
        </div>
        <div key={step} className="screen-in">
          <h1 style={{ fontSize: T.h1 + 4, fontWeight: 700, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{titles[step]}</h1>
          <p style={{ color: "var(--muted)", fontSize: T.body, margin: "8px 0 24px", lineHeight: 1.5 }}>{hints[step]}</p>

          {step === 0 && <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoFocus style={{ fontSize: T.title, padding: 16 }} />}

          {step === 1 && (
            <>
              <div className="flex items-baseline gap-2 glass" style={{ padding: "14px 18px", borderRadius: 22 }}>
                <span style={{ fontSize: T.h1, color: "var(--muted)" }}>$</span>
                <input value={formatAmountInput(amount)} onChange={(e) => setAmount(cleanAmountInput(e.target.value))} placeholder="0" inputMode="decimal" autoFocus className="num" style={{ fontSize: T.h1 + 4, fontWeight: 700, background: "none", border: "none", outline: "none", width: "100%", color: "var(--text)" }} />
              </div>
              <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "18px 0 8px 4px" }}>¿Cada cuánto lo recibes?</div>
              <div className="flex gap-2 flex-wrap">
                {["diaria", "semanal", "quincenal", "mensual"].map((p) => <Chip key={p} active={periodicity === p} onClick={() => setPeriodicity(p)}>{p.charAt(0).toUpperCase() + p.slice(1)}</Chip>)}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col gap-2">
                {Object.entries(RULE_PRESETS).map(([key, cats]) => <RuleOption key={key} active={rulePreset === key} onClick={() => setRulePreset(key)} title={`Regla ${key}`} desc={cats.map((c) => `${nice(c.name)} ${c.percent}%`).join(", ")} />)}
                <RuleOption active={rulePreset === "personalizada"} onClick={() => setRulePreset("personalizada")} title="Personalizada" desc="Tú defines las partes y sus porcentajes" />
              </div>
              {rulePreset === "personalizada" && <CustomRuleEditor customCats={customCats} setCustomCats={setCustomCats} />}
            </>
          )}

          {step === 3 && <Panel pad={18}><AppearanceEditor appearance={appearance} setAppearance={setAppearance} /></Panel>}
        </div>

        <div className="flex gap-2" style={{ marginTop: 28 }}>
          {step > 0 && <button onClick={() => setStep(step - 1)} aria-label="Atrás" className="glass press flex items-center justify-center" style={{ width: 54, borderRadius: 999, flexShrink: 0 }}><ChevronLeft size={20} /></button>}
          <PrimaryBtn disabled={!canNext} onClick={() => (step < steps - 1 ? setStep(step + 1) : finish())}>{step < steps - 1 ? "Continuar" : "Empezar"}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
