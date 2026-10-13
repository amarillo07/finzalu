import React, { useState } from "react";
import { Plus, ChevronRight, Trash2, Repeat } from "lucide-react";
import { Sheet, PrimaryBtn, GhostBtn, Field, Chip, CatIcon, IconPicker, T } from "./ui";
import { fmt0, nice, uid, todayISO, addDays, formatAmountInput, cleanAmountInput, generateRecurringDates, fmtDayShort } from "./utils";

const RECURRENCE = [["diaria", "Diaria"], ["semanal", "Semanal"], ["quincenal", "Quincenal"], ["mensual", "Mensual"], ["personalizado", "Cada X días"]];

function Label({ children, hint }) {
  return (
    <div style={{ margin: "20px 4px 10px" }}>
      <div style={{ fontSize: T.body, fontWeight: 650 }}>{children}</div>
      {hint && <div style={{ fontSize: T.small, color: "var(--muted)", marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

/* "Necesidades › Casa › Luz" — always visible so you know where the money goes */
function PathPreview({ rule, ruleColor, cat, item }) {
  const crumb = (content, filled, key) => (
    <span key={key} className="flex items-center gap-1" style={{ padding: "6px 10px", borderRadius: 999, background: filled ? "var(--chip)" : "transparent", border: filled ? "none" : "1px dashed var(--field-border)", color: filled ? "var(--text)" : "var(--muted)", fontSize: T.small, fontWeight: filled ? 600 : 500, whiteSpace: "nowrap" }}>
      {content}
    </span>
  );
  const sep = (k) => <ChevronRight key={k} size={14} color="var(--muted)" style={{ flexShrink: 0 }} />;
  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {crumb(<><span style={{ width: 8, height: 8, borderRadius: 4, background: rule ? ruleColor : "var(--muted)" }} />{rule ? nice(rule.name) : "Regla"}</>, !!rule, "r")}
      {sep("s1")}
      {crumb(cat ? cat.name : "Categoría", !!cat, "c")}
      {sep("s2")}
      {crumb(item ? item.name : "Subcategoría", !!item, "i")}
    </div>
  );
}

export default function AddTransactionSheet({
  kind, categories, profile, defaultDate, editingTx, ruleColor, remainingFor,
  onClose, onSave, onDelete, onCancelFutureRecurrences, onUpdateIncomeDefault,
  onCreateCategory, onCreateItem,
}) {
  const isEdit = !!editingTx;
  const e = editingTx || {};
  const [type, setType] = useState(isEdit ? e.type : kind);
  const [amount, setAmount] = useState(isEdit ? String(e.amount) : "");
  const [mainId, setMainId] = useState(isEdit && e.mainId ? e.mainId : categories[0]?.id || "");
  const [subId, setSubId] = useState(isEdit ? e.subId || "" : "");
  const [itemId, setItemId] = useState(isEdit ? e.itemId || "" : "");
  const [conceptName, setConceptName] = useState(isEdit ? e.conceptName : "");
  const [date, setDate] = useState(isEdit ? e.date : defaultDate);
  const [time, setTime] = useState(isEdit && e.time ? e.time : new Date().toTimeString().slice(0, 5));
  const [note, setNote] = useState(isEdit ? e.note || "" : "");
  const [showMore, setShowMore] = useState(isEdit && !!e.note);
  const [incomeKind, setIncomeKind] = useState(isEdit && e.subName === "Ingreso extra" ? "extra" : "principal");
  const [saveDefault, setSaveDefault] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState("mensual");
  const [intervalDays, setIntervalDays] = useState("30");
  const [dayOfMonth, setDayOfMonth] = useState(() => new Date((isEdit ? e.date : defaultDate) + "T00:00:00").getDate());
  const [weekday, setWeekday] = useState(() => (new Date((isEdit ? e.date : defaultDate) + "T00:00:00").getDay() + 6) % 7);
  const [quincena, setQuincena] = useState([15, 31]);

  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("home");
  const [creatingItem, setCreatingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const rule = categories.find((c) => c.id === mainId);
  const cats = rule ? rule.subcategories : [];
  const cat = cats.find((s) => s.id === subId);
  const items = cat ? cat.items || [] : [];
  const item = items.find((i) => i.id === itemId);

  const recurSpec = { start: date, type: recurrenceType, intervalDays, dayOfMonth, weekday, quincenaDays: quincena };
  const nextCharges = isRecurring && !isEdit
    ? generateRecurringDates(recurSpec).filter((d) => d >= todayISO()).slice(0, 3).map(fmtDayShort)
    : [];

  const valid = Number(amount) > 0 && (type === "income" || !!mainId);

  function chooseRule(id) { setMainId(id); setSubId(""); setItemId(""); setCreatingCat(false); setCreatingItem(false); }
  function chooseCat(id) { setSubId((cur) => (cur === id ? "" : id)); setItemId(""); setCreatingItem(false); }

  function createCat() {
    const name = newCatName.trim();
    if (!name || !mainId) return;
    const id = uid("sub");
    onCreateCategory(mainId, { id, name, icon: newCatIcon });
    setSubId(id); setItemId(""); setCreatingCat(false); setNewCatName("");
  }
  function createItem() {
    const name = newItemName.trim();
    if (!name || !subId) return;
    const id = uid("item");
    onCreateItem(mainId, subId, { id, name });
    setItemId(id); setCreatingItem(false); setNewItemName("");
  }

  function save() {
    if (!valid) return;
    if (type === "expense") {
      const fallback = item?.name || cat?.name || "Gasto";
      onSave({
        type: "expense", amount: Number(amount), date, time, note,
        mainId, subId: subId || null, subName: cat ? cat.name : "Sin categoría",
        itemId: itemId || null, itemName: item ? item.name : null,
        conceptName: conceptName.trim() || fallback, icon: cat?.icon || "wallet",
        isRecurring: !isEdit && isRecurring, recurrenceType: !isEdit && isRecurring ? recurrenceType : null,
        intervalDays: !isEdit && isRecurring && recurrenceType === "personalizado" ? Number(intervalDays) || 30 : null,
        dayOfMonth: !isEdit && isRecurring && recurrenceType === "mensual" ? dayOfMonth : null,
        weekday: !isEdit && isRecurring && recurrenceType === "semanal" ? weekday : null,
        quincenaDays: !isEdit && isRecurring && recurrenceType === "quincenal" ? quincena : null,
        ...(isEdit && e.recurringGroupId ? { recurringGroupId: e.recurringGroupId } : {}),
      });
    } else {
      if (saveDefault) onUpdateIncomeDefault(Number(amount), profile.incomePeriodicity);
      const label = incomeKind === "principal" ? "Ingreso principal" : "Ingreso extra";
      onSave({ type: "income", amount: Number(amount), date, time, note, mainId: null, subId: null, subName: label, conceptName: conceptName.trim() || label, icon: "cash" });
    }
  }

  const title = isEdit ? (type === "expense" ? "Editar gasto" : "Editar ingreso") : (type === "expense" ? "Nuevo gasto" : "Nuevo ingreso");
  const today = todayISO(), yesterday = addDays(today, -1);

  return (
    <Sheet
      title={title}
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2">
          <PrimaryBtn onClick={save} disabled={!valid}>{isEdit ? "Guardar cambios" : type === "expense" ? "Guardar gasto" : "Guardar ingreso"}</PrimaryBtn>
          {isEdit && (
            <button onClick={() => onDelete(e.id)} className="press flex items-center justify-center gap-2" style={{ background: "none", border: "none", color: "var(--bad)", fontWeight: 600, fontSize: T.small, padding: 8 }}>
              <Trash2 size={15} /> Eliminar {type === "expense" ? "gasto" : "ingreso"}
            </button>
          )}
        </div>
      }
    >
      {/* Gasto / Ingreso */}
      <div className="flex p-1" style={{ background: "var(--chip)", borderRadius: 999, marginBottom: 18 }}>
        {[["expense", "Gasto"], ["income", "Ingreso"]].map(([k, l]) => (
          <button key={k} onClick={() => setType(k)} className="press flex-1" style={{ padding: "10px 0", borderRadius: 999, border: "none", fontWeight: 650, fontSize: T.small, background: type === k ? "var(--glass-strong)" : "transparent", boxShadow: type === k ? "0 4px 14px -8px var(--shadow)" : "none", color: type === k ? "var(--text)" : "var(--muted)" }}>{l}</button>
        ))}
      </div>

      {/* Amount */}
      <div className="flex items-baseline justify-center gap-1" style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 500, color: "var(--muted)" }}>$</span>
        <input
          value={formatAmountInput(amount)}
          onChange={(ev) => setAmount(cleanAmountInput(ev.target.value))}
          placeholder="0"
          inputMode="decimal"
          aria-label="Monto"
          autoFocus={!isEdit}
          className="num"
          style={{ fontSize: T.hero, fontWeight: 650, background: "none", border: "none", outline: "none", width: `${Math.max(2, formatAmountInput(amount).length + 1)}ch`, maxWidth: "80%", textAlign: "center", color: "var(--text)" }}
        />
      </div>

      {type === "expense" ? (
        <>
          <PathPreview rule={rule} ruleColor={rule ? ruleColor(rule.id) : null} cat={cat} item={item} />

          <Label hint="Tu regla financiera decide de qué presupuesto se descuenta.">¿De qué regla sale?</Label>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)` }}>
            {categories.map((r) => {
              const on = r.id === mainId;
              const rem = remainingFor(r);
              return (
                <button key={r.id} onClick={() => chooseRule(r.id)} className="press text-left" style={{ padding: "12px 12px", borderRadius: 18, border: on ? "2px solid var(--accent-line)" : "1px solid var(--field-border)", background: on ? "var(--accent-soft)" : "var(--field)" }}>
                  <div className="flex items-center gap-2" style={{ fontSize: T.small, fontWeight: 650 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: ruleColor(r.id), flexShrink: 0 }} />
                    <span className="truncate">{nice(r.name)}</span>
                  </div>
                  <div className="num" style={{ fontSize: T.cap, color: rem < 0 ? "var(--bad)" : "var(--muted)", marginTop: 4 }}>
                    {rem < 0 ? `Excedido ${fmt0(-rem)}` : `Quedan ${fmt0(rem)}`}
                  </div>
                </button>
              );
            })}
          </div>

          {rule && (
            <>
              <Label hint={`Agrupa tus gastos de ${nice(rule.name).toLowerCase()}, por ejemplo Casa, Súper o Auto.`}>Categoría</Label>
              <div className="grid grid-cols-4 gap-2">
                {cats.map((c) => {
                  const on = c.id === subId;
                  return (
                    <button key={c.id} onClick={() => chooseCat(c.id)} className="press flex flex-col items-center gap-2" style={{ padding: "12px 4px 10px", borderRadius: 18, border: on ? "2px solid var(--accent-line)" : "1px solid transparent", background: on ? "var(--accent-soft)" : "var(--chip)" }}>
                      <CatIcon icon={c.icon} size={38} />
                      <span style={{ fontSize: T.cap, fontWeight: 600, lineHeight: 1.2, textAlign: "center", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", wordBreak: "break-word" }}>{c.name}</span>
                    </button>
                  );
                })}
                {!creatingCat && (
                  <button onClick={() => setCreatingCat(true)} className="press flex flex-col items-center justify-center gap-2" style={{ padding: "12px 4px 10px", borderRadius: 18, border: "1.5px dashed var(--field-border)", background: "transparent", color: "var(--accent-ink)", minHeight: 88 }}>
                    <Plus size={20} />
                    <span style={{ fontSize: T.cap, fontWeight: 600 }}>Nueva</span>
                  </button>
                )}
              </div>

              {creatingCat && (
                <div className="expand" style={{ marginTop: 10, padding: 14, borderRadius: 20, background: "var(--field)", border: "1px solid var(--field-border)" }}>
                  <Field label={`Nueva categoría en ${nice(rule.name)}`} value={newCatName} onChange={(ev) => setNewCatName(ev.target.value)} placeholder="Ej. Casa" autoFocus />
                  <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "0 0 8px 4px" }}>Ícono</div>
                  <IconPicker value={newCatIcon} onChange={setNewCatIcon} />
                  <div className="flex gap-2" style={{ marginTop: 12 }}>
                    <GhostBtn onClick={() => { setCreatingCat(false); setNewCatName(""); }}>Cancelar</GhostBtn>
                    <PrimaryBtn onClick={createCat} disabled={!newCatName.trim()}>Crear</PrimaryBtn>
                  </div>
                </div>
              )}

              {cat && (
                <div className="expand" style={{ marginTop: 14, marginLeft: 18, paddingLeft: 14, borderLeft: `3px solid ${ruleColor(rule.id)}` }}>
                  <div style={{ fontSize: T.body, fontWeight: 650 }}>Subcategoría de {cat.name}</div>
                  <div style={{ fontSize: T.small, color: "var(--muted)", margin: "2px 0 10px" }}>Opcional. Por ejemplo Luz, Agua o Mantenimiento.</div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((it) => (
                      <Chip key={it.id} active={it.id === itemId} onClick={() => setItemId((cur) => (cur === it.id ? "" : it.id))}>{it.name}</Chip>
                    ))}
                    {!creatingItem && (
                      <button onClick={() => setCreatingItem(true)} className="press flex items-center gap-1" style={{ padding: "9px 14px", minHeight: 40, borderRadius: 999, border: "1.5px dashed var(--field-border)", background: "transparent", color: "var(--accent-ink)", fontWeight: 600, fontSize: T.small }}>
                        <Plus size={15} /> Nueva
                      </button>
                    )}
                  </div>
                  {creatingItem && (
                    <div className="expand flex gap-2" style={{ marginTop: 10 }}>
                      <input className="field" value={newItemName} onChange={(ev) => setNewItemName(ev.target.value)} onKeyDown={(ev) => ev.key === "Enter" && createItem()} placeholder="Ej. Luz" autoFocus />
                      <button onClick={createItem} disabled={!newItemName.trim()} className="press" style={{ padding: "0 18px", borderRadius: 16, border: "none", background: newItemName.trim() ? "var(--accent)" : "var(--chip)", color: newItemName.trim() ? "var(--on-accent)" : "var(--muted)", fontWeight: 650 }}>Agregar</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div style={{ height: 20 }} />
          <Field label="Descripción (opcional)" value={conceptName} onChange={(ev) => setConceptName(ev.target.value)} placeholder={item ? `Ej. ${item.name} de este mes` : "Ej. Recibo de octubre"} />
        </>
      ) : (
        <>
          <Label>Tipo de ingreso</Label>
          <div className="flex gap-2 flex-wrap">
            <Chip active={incomeKind === "principal"} onClick={() => setIncomeKind("principal")}>Ingreso principal</Chip>
            <Chip active={incomeKind === "extra"} onClick={() => setIncomeKind("extra")}>Ingreso extra</Chip>
          </div>
          <div style={{ fontSize: T.small, color: "var(--muted)", margin: "10px 4px 18px", lineHeight: 1.5 }}>
            {incomeKind === "principal"
              ? "Tu sueldo o pago fijo. Se suma a lo recibido del mes."
              : "Dinero adicional (freelance, bonos, ventas). Aumenta el presupuesto de cada regla."}
          </div>
          <Field label="Descripción (opcional)" value={conceptName} onChange={(ev) => setConceptName(ev.target.value)} placeholder={incomeKind === "principal" ? "Ej. Quincena" : "Ej. Proyecto freelance"} />
          {incomeKind === "principal" && (
            <label className="flex items-center gap-3" style={{ fontSize: T.small, margin: "0 4px 14px" }}>
              <input type="checkbox" checked={saveDefault} onChange={(ev) => setSaveDefault(ev.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--accent)" }} />
              Usar este monto como mi ingreso esperado
            </label>
          )}
        </>
      )}

      {/* Date */}
      <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", margin: "4px 0 8px 4px" }}>{isRecurring && type === "expense" && !isEdit ? "A partir de" : "Fecha"}</div>
      <div className="flex gap-2 items-center" style={{ marginBottom: 14 }}>
        <Chip active={date === today} onClick={() => setDate(today)}>Hoy</Chip>
        <Chip active={date === yesterday} onClick={() => setDate(yesterday)}>Ayer</Chip>
        <input type="date" className="field" value={date} onChange={(ev) => ev.target.value && setDate(ev.target.value)} style={{ flex: 1, minWidth: 0, padding: "9px 10px", fontSize: T.small }} aria-label="Otra fecha" />
      </div>
      <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: T.small, fontWeight: 600, color: "var(--muted)", marginLeft: 4 }}>Hora</span>
        <input type="time" className="field" value={time} onChange={(ev) => setTime(ev.target.value)} style={{ width: 120, padding: "9px 10px", fontSize: T.small }} aria-label="Hora" />
      </div>

      {!showMore ? (
        <button onClick={() => setShowMore(true)} className="press" style={{ background: "none", border: "none", color: "var(--accent-ink)", fontWeight: 600, fontSize: T.small, padding: "4px 4px 12px" }}>+ Agregar nota</button>
      ) : (
        <div className="expand"><Field label="Nota" value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Algo que quieras recordar" /></div>
      )}

      {type === "expense" && !isEdit && (
        <div style={{ padding: 14, borderRadius: 20, background: "var(--field)", border: "1px solid var(--field-border)" }}>
          <label className="flex items-start gap-3" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={isRecurring} onChange={(ev) => setIsRecurring(ev.target.checked)} style={{ width: 20, height: 20, marginTop: 2, accentColor: "var(--accent)" }} />
            <div>
              <div className="flex items-center gap-2" style={{ fontWeight: 650, fontSize: T.body }}><Repeat size={15} /> Se repite</div>
              <div style={{ fontSize: T.small, color: "var(--muted)", marginTop: 2, lineHeight: 1.45 }}>Renta, luz, suscripciones… se registra solo en cada fecha.</div>
            </div>
          </label>
          {isRecurring && (
            <div className="expand" style={{ marginTop: 12 }}>
              <div className="flex gap-2 flex-wrap">
                {RECURRENCE.map(([k, l]) => <Chip key={k} active={recurrenceType === k} onClick={() => setRecurrenceType(k)}>{l}</Chip>)}
              </div>
              {recurrenceType === "personalizado" && (
                <div className="flex items-center gap-2" style={{ marginTop: 12, fontSize: T.small }}>
                  Cada
                  <input className="field num" inputMode="numeric" value={intervalDays} onChange={(ev) => setIntervalDays(ev.target.value.replace(/[^0-9]/g, "").slice(0, 3))} style={{ width: 70, textAlign: "center", padding: "8px" }} />
                  días, empezando en la fecha de abajo
                </div>
              )}

              {recurrenceType === "mensual" && (
                <div className="expand" style={{ marginTop: 14 }}>
                  <div style={{ fontSize: T.small, fontWeight: 650, marginBottom: 8 }}>¿Qué día del mes se cobra?</div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                      const on = dayOfMonth === d;
                      return (
                        <button key={d} type="button" onClick={() => setDayOfMonth(d)} className="press num" aria-pressed={on} style={{ height: 38, borderRadius: 12, border: "none", fontSize: T.small, fontWeight: on ? 700 : 500, background: on ? "var(--accent)" : "var(--chip)", color: on ? "var(--on-accent)" : "var(--text)" }}>{d}</button>
                      );
                    })}
                  </div>
                  {dayOfMonth < new Date(date + "T00:00:00").getDate() && (
                    <div style={{ fontSize: T.cap, color: "var(--muted)", marginTop: 8, lineHeight: 1.45 }}>
                      El día {dayOfMonth} de este mes ya pasó, así que el primer cobro será el próximo mes. Si ya lo pagaste y quieres registrarlo, cambia "A partir de" al día 1.
                    </div>
                  )}
                  {dayOfMonth > 28 && <div style={{ fontSize: T.cap, color: "var(--muted)", marginTop: 8 }}>En los meses que no tienen día {dayOfMonth} se cobra el último día del mes.</div>}
                </div>
              )}

              {recurrenceType === "semanal" && (
                <div className="expand" style={{ marginTop: 14 }}>
                  <div style={{ fontSize: T.small, fontWeight: 650, marginBottom: 8 }}>¿Qué día de la semana se cobra?</div>
                  <div className="grid grid-cols-7 gap-1">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((l, i) => {
                      const on = weekday === i;
                      return <button key={l} type="button" onClick={() => setWeekday(i)} className="press" aria-pressed={on} style={{ height: 40, borderRadius: 12, border: "none", fontSize: T.cap, fontWeight: on ? 700 : 600, background: on ? "var(--accent)" : "var(--chip)", color: on ? "var(--on-accent)" : "var(--text)" }}>{l}</button>;
                    })}
                  </div>
                </div>
              )}

              {recurrenceType === "quincenal" && (
                <div className="expand flex gap-2" style={{ marginTop: 14 }}>
                  <label style={{ flex: 1 }}>
                    <div style={{ fontSize: T.small, fontWeight: 650, marginBottom: 6 }}>Primer cobro</div>
                    <select className="field" value={quincena[0]} onChange={(ev) => setQuincena([Number(ev.target.value), quincena[1]])}>
                      {Array.from({ length: 15 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Día {d}</option>)}
                    </select>
                  </label>
                  <label style={{ flex: 1 }}>
                    <div style={{ fontSize: T.small, fontWeight: 650, marginBottom: 6 }}>Segundo cobro</div>
                    <select className="field" value={quincena[1]} onChange={(ev) => setQuincena([quincena[0], Number(ev.target.value)])}>
                      {Array.from({ length: 15 }, (_, i) => i + 16).map((d) => <option key={d} value={d}>{d === 31 ? "Último día" : `Día ${d}`}</option>)}
                    </select>
                  </label>
                </div>
              )}

              {recurrenceType === "diaria" && <div style={{ fontSize: T.small, color: "var(--muted)", marginTop: 10 }}>Se registra todos los días a partir de la fecha de abajo.</div>}

              {nextCharges.length > 0 && (
                <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 14, background: "var(--accent-soft)" }}>
                  <div style={{ fontSize: T.cap, fontWeight: 600, color: "var(--accent-ink)" }}>Próximos cobros</div>
                  <div className="num" style={{ fontSize: T.small, fontWeight: 650, marginTop: 2 }}>{nextCharges.join(", ")}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isEdit && e.recurringGroupId && (
        <div className="flex items-center justify-between gap-3" style={{ padding: 14, borderRadius: 20, background: "var(--warn-soft)", marginTop: 6 }}>
          <div style={{ fontSize: T.small, lineHeight: 1.45 }}>Este gasto es parte de un pago que se repite.</div>
          <button onClick={() => onCancelFutureRecurrences(e.recurringGroupId, e.date)} className="press whitespace-nowrap" style={{ border: "none", borderRadius: 999, padding: "8px 12px", background: "var(--chip)", color: "var(--warn)", fontWeight: 650, fontSize: T.cap }}>Cancelar los siguientes</button>
        </div>
      )}
    </Sheet>
  );
}
