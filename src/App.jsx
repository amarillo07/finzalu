import React, { useState, useEffect, useMemo } from "react";
import { Home, PieChart as PieIcon, Calendar as CalendarIcon, Plus, Menu, Search, List as ListIcon } from "lucide-react";
import { storage } from "./storage";
import { buildTheme, DEFAULT_ACCENT } from "./theme";
import { ThemeContext, Sheet, Confirm, Toast, TxRow, EmptyNote, IconBtn, T } from "./ui";
import {
  STORAGE_KEY, MONTHS, uid, nice, monthlyEquivalent, todayISO, ym, generateRecurringDates, fmtDayLong,
} from "./utils";
import AddTransactionSheet from "./AddTransaction";
import { HomeScreen, StatsScreen, CalendarScreen, DayDetail, LogScreen, StatementScreen } from "./screens-main";
import {
  CategoriesScreen, GoalsScreen, GoalDetail, RulesScreen, ProfileScreen, ViewModeEditor, MenuList, Onboarding,
} from "./screens-manage";

// Old saves stored theme as "dark"/"light"; categories had no `items` yet.
function migrateAppearance(raw) {
  if (raw && typeof raw === "object") return { mode: raw.mode === "light" ? "light" : "dark", accent: raw.accent || DEFAULT_ACCENT };
  return { mode: raw === "light" ? "light" : "dark", accent: DEFAULT_ACCENT };
}
function migrateCategories(cats) {
  return (cats || []).map((r) => ({ ...r, subcategories: (r.subcategories || []).map((s) => ({ ...s, items: s.items || [] })) }));
}

export default function FinanzasMX() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [appearance, setAppearance] = useState({ mode: "dark", accent: DEFAULT_ACCENT });

  const [screen, setScreen] = useState("home");
  const [monthCursor, setMonthCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [ruleFilter, setRuleFilter] = useState("todas");
  const [addOpen, setAddOpen] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dayDetail, setDayDetail] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [goalDetail, setGoalDetail] = useState(null);
  const [prefillDate, setPrefillDate] = useState(null);
  const [saveNote, setSaveNote] = useState("");
  const [editingTx, setEditingTx] = useState(null);
  const [viewModeOpen, setViewModeOpen] = useState(false);
  const [toast, setToast] = useState("");

  /* ---- load / save ---- */
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(STORAGE_KEY);
        if (res && res.value) {
          const data = JSON.parse(res.value);
          setProfile(data.profile || null);
          setCategories(migrateCategories(data.categories));
          setTransactions(data.transactions || []);
          setGoals(data.goals || []);
          setAppearance(migrateAppearance(data.appearance || data.theme));
        }
      } catch (e) { /* first use */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try {
        await storage.set(STORAGE_KEY, JSON.stringify({ profile, categories, transactions, goals, appearance, theme: appearance.mode }));
        setSaveNote("Cambios guardados en este teléfono.");
        setTimeout(() => setSaveNote(""), 1600);
      } catch (e) { setSaveNote("No se pudo guardar. Revisa que tu teléfono tenga espacio."); }
    }, 400);
    return () => clearTimeout(t);
  }, [profile, categories, transactions, goals, appearance, loaded]);

  const theme = useMemo(() => buildTheme(appearance.accent, appearance.mode), [appearance]);

  // Keep the browser chrome (status bar, overscroll) in the same color
  useEffect(() => {
    document.documentElement.style.setProperty("--app-bg", theme.bg);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme.bg);
  }, [theme]);

  function flash(msg) { setToast(msg); setTimeout(() => setToast((cur) => (cur === msg ? "" : cur)), 1800); }

  /* ---- derived ---- */
  const monthKey = `${monthCursor.y}-${String(monthCursor.m + 1).padStart(2, "0")}`;
  const monthLabel = `${MONTHS[monthCursor.m]} ${monthCursor.y}`;
  const expectedIncome = profile ? monthlyEquivalent(profile.incomeAmount, profile.incomePeriodicity) : 0;

  const monthExpenses = useMemo(() => transactions.filter((t) => t.type === "expense" && ym(t.date) === monthKey), [transactions, monthKey]);
  const monthIncomes = useMemo(() => transactions.filter((t) => t.type === "income" && ym(t.date) === monthKey), [transactions, monthKey]);
  const totalSpentMonth = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const totalIncomeMonth = monthIncomes.reduce((s, t) => s + t.amount, 0);

  // Money split between the rules: expected salary (or what really came in,
  // if more) plus every extra income.
  const principalIncomeMonth = monthIncomes.filter((t) => t.subName !== "Ingreso extra").reduce((s, t) => s + t.amount, 0);
  const extraIncomeMonth = monthIncomes.filter((t) => t.subName === "Ingreso extra").reduce((s, t) => s + t.amount, 0);
  const budgetBase = Math.max(expectedIncome, principalIncomeMonth) + extraIncomeMonth;

  const spentInCategory = (id) => monthExpenses.filter((t) => t.mainId === id).reduce((s, t) => s + t.amount, 0);
  const budgetFor = (cat) => (budgetBase * cat.percent) / 100;
  const ruleInfo = (id) => {
    const i = categories.findIndex((c) => c.id === id);
    return i < 0 ? { name: "Sin regla", color: "var(--muted)" } : { name: nice(categories[i].name), color: theme.series[i % theme.series.length] };
  };

  function shiftMonth(delta) {
    let m = monthCursor.m + delta, y = monthCursor.y;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    setMonthCursor({ y, m });
  }
  function go(s) { setScreen(s); window.scrollTo({ top: 0, behavior: "smooth" }); }

  /* ---- category tree: Regla › Categoría › Subcategoría ---- */
  const mapRule = (mainId, fn) => setCategories((prev) => prev.map((r) => (r.id === mainId ? fn(r) : r)));
  const mapCat = (mainId, subId, fn) => mapRule(mainId, (r) => ({ ...r, subcategories: r.subcategories.map((s) => (s.id === subId ? fn(s) : s)) }));

  function createCategory(mainId, cat) { mapRule(mainId, (r) => ({ ...r, subcategories: [...r.subcategories, { ...cat, items: [] }] })); }
  function editCategory(mainId, subId, name, icon) {
    mapCat(mainId, subId, (s) => ({ ...s, name, icon }));
    setTransactions((prev) => prev.map((t) => (t.subId === subId ? { ...t, subName: name, icon } : t)));
  }
  function deleteCategory(mainId, subId) { mapRule(mainId, (r) => ({ ...r, subcategories: r.subcategories.filter((s) => s.id !== subId) })); }
  function createItem(mainId, subId, item) { mapCat(mainId, subId, (s) => ({ ...s, items: [...(s.items || []), item] })); }
  function editItem(mainId, subId, itemId, name) {
    mapCat(mainId, subId, (s) => ({ ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, name } : i)) }));
    setTransactions((prev) => prev.map((t) => (t.itemId === itemId ? { ...t, itemName: name } : t)));
  }
  function deleteItem(mainId, subId, itemId) { mapCat(mainId, subId, (s) => ({ ...s, items: s.items.filter((i) => i.id !== itemId) })); }

  function applyRule(newRuleCats, ruleName) {
    setCategories((prev) => newRuleCats.map((rc) => {
      const existing = prev.find((c) => c.name.trim().toLowerCase() === rc.name.trim().toLowerCase());
      return { id: existing ? existing.id : uid("rc"), name: rc.name, percent: rc.percent, subcategories: existing ? existing.subcategories : [] };
    }));
    setProfile((p) => ({ ...p, ruleName }));
    flash("Regla actualizada");
  }

  /* ---- transactions ---- */
  function addTransactionWithRecurrence(tx) {
    if (!tx.isRecurring) { setTransactions((prev) => [{ id: uid("tx"), ...tx }, ...prev]); return; }
    const groupId = uid("rec");
    const batch = generateRecurringDates(tx.date, tx.recurrenceType, tx.intervalDays).map((d) => ({ id: uid("tx"), ...tx, date: d, recurringGroupId: groupId, autoGenerated: d !== tx.date }));
    setTransactions((prev) => [...batch, ...prev]);
  }
  const cancelFutureRecurrences = (groupId, from) => setTransactions((prev) => prev.filter((t) => !(t.recurringGroupId === groupId && t.date > from)));
  const editTransaction = (id, tx) => setTransactions((prev) => prev.map((t) => (t.id === id ? { ...tx, id } : t)));
  const deleteTransaction = (id) => setTransactions((prev) => prev.filter((t) => t.id !== id));

  const openTx = (t) => { setEditingTx(t); setAddOpen(t.type); };
  const openAdd = (kind, date = null) => { setEditingTx(null); setPrefillDate(date); setAddOpen(kind); };
  const closeAdd = () => { setAddOpen(null); setPrefillDate(null); setEditingTx(null); };

  /* ---- render ---- */
  const rootStyle = { ...theme.vars, minHeight: "100vh" };

  if (!loaded) {
    return (
      <ThemeContext.Provider value={theme}>
        <div className="app" style={rootStyle}><div className="bg-layer" /></div>
      </ThemeContext.Provider>
    );
  }

  if (!profile) {
    return (
      <ThemeContext.Provider value={theme}>
        <div className="app" style={rootStyle}>
          <div className="bg-layer" />
          <Onboarding appearance={appearance} setAppearance={setAppearance} onDone={(p, cats) => { setProfile(p); setCategories(migrateCategories(cats)); }} />
        </div>
      </ThemeContext.Provider>
    );
  }

  const searchResults = searchQ.trim()
    ? transactions.filter((t) => [t.conceptName, t.note, t.subName, t.itemName].filter(Boolean).join(" ").toLowerCase().includes(searchQ.trim().toLowerCase())).slice(0, 40)
    : [];

  return (
    <ThemeContext.Provider value={theme}>
      <div className="app" style={rootStyle}>
        <div className="bg-layer" />
        <div className="w-full flex justify-center" style={{ position: "relative", zIndex: 1 }}>
          <div className="w-full flex flex-col" style={{ maxWidth: 480, minHeight: "100vh" }}>

            {/* Top bar */}
            <header className="no-print flex items-center gap-3" style={{ padding: "calc(env(safe-area-inset-top) + 16px) 20px 14px" }}>
              <IconBtn onClick={() => setMoreOpen(true)} label="Menú"><Menu size={19} /></IconBtn>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: T.small, color: "var(--muted)" }}>Hola,</div>
                <div className="truncate" style={{ fontSize: T.title, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{profile.name}</div>
              </div>
              <IconBtn onClick={() => setSearchOpen(true)} label="Buscar"><Search size={18} /></IconBtn>
            </header>

            <main key={screen} className="screen-in flex-1" style={{ padding: "0 20px 130px" }}>
              {screen === "home" && (
                <HomeScreen
                  profile={profile} categories={categories} monthLabel={monthLabel} shiftMonth={shiftMonth}
                  budgetBase={budgetBase} expectedIncome={expectedIncome} receivedIncome={totalIncomeMonth}
                  totalSpentMonth={totalSpentMonth} spentInCategory={spentInCategory} budgetFor={budgetFor}
                  monthExpenses={monthExpenses} monthIncomes={monthIncomes} transactions={transactions}
                  onOpenTx={openTx} onAddExpense={() => openAdd("expense")} onAddIncome={() => openAdd("income")}
                  ruleInfo={ruleInfo} onSeeAll={() => go("log")}
                />
              )}
              {screen === "stats" && (
                <StatsScreen categories={categories} ruleFilter={ruleFilter} setRuleFilter={setRuleFilter} monthLabel={monthLabel} shiftMonth={shiftMonth} monthExpenses={monthExpenses} transactions={transactions} monthCursor={monthCursor} spentInCategory={spentInCategory} budgetFor={budgetFor} ruleInfo={ruleInfo} />
              )}
              {screen === "calendar" && (
                <CalendarScreen monthCursor={monthCursor} shiftMonth={shiftMonth} monthLabel={monthLabel} monthExpenses={monthExpenses} onDayClick={setDayDetail} />
              )}
              {screen === "statement" && (
                <StatementScreen categories={categories} monthLabel={monthLabel} shiftMonth={shiftMonth} monthCursor={monthCursor} monthExpenses={monthExpenses} totalIncomeMonth={totalIncomeMonth} totalSpentMonth={totalSpentMonth} budgetFor={budgetFor} spentInCategory={spentInCategory} ruleInfo={ruleInfo} />
              )}
              {screen === "log" && <LogScreen transactions={transactions} onAdd={(d) => openAdd("expense", d)} onOpenTx={openTx} ruleInfo={ruleInfo} />}
              {screen === "categories" && (
                <CategoriesScreen
                  categories={categories} monthExpenses={monthExpenses} spentInCategory={spentInCategory} budgetFor={budgetFor} ruleInfo={ruleInfo}
                  onCreateCategory={createCategory} onEditCategory={editCategory}
                  onDeleteCategory={(mainId, subId) => setConfirmDel({ type: "cat", mainId, subId })}
                  onCreateItem={createItem} onEditItem={editItem}
                  onDeleteItem={(mainId, subId, itemId) => setConfirmDel({ type: "item", mainId, subId, itemId })}
                />
              )}
              {screen === "goals" && <GoalsScreen goals={goals} onOpen={setGoalDetail} onAdd={() => setGoalDetail("new")} />}
              {screen === "rules" && <RulesScreen categories={categories} onApply={applyRule} />}
              {screen === "profile" && <ProfileScreen profile={profile} setProfile={setProfile} saveNote={saveNote} appearance={appearance} setAppearance={setAppearance} />}
            </main>

            {/* Bottom nav — floating glass bar */}
            <nav className="no-print fixed left-0 right-0 flex justify-center" style={{ bottom: "calc(env(safe-area-inset-bottom) + 16px)", zIndex: 30, pointerEvents: "none" }}>
              <div className="flex items-center gap-1" style={{ pointerEvents: "auto", padding: 6, borderRadius: 999, background: "var(--nav)", WebkitBackdropFilter: "blur(28px) saturate(190%)", backdropFilter: "blur(28px) saturate(190%)", border: "1px solid var(--glass-border)", boxShadow: "inset 0 1px 0 var(--glass-hi), 0 16px 40px -16px var(--shadow)" }}>
                <NavBtn icon={Home} label="Inicio" active={screen === "home"} onClick={() => go("home")} />
                <NavBtn icon={PieIcon} label="Estadísticas" active={screen === "stats"} onClick={() => go("stats")} />
                <button onClick={() => openAdd("expense")} aria-label="Registrar gasto" className="press flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 999, background: "var(--accent)", color: "var(--on-accent)", border: "none", margin: "0 4px", boxShadow: "0 10px 22px -10px var(--accent)" }}>
                  <Plus size={26} strokeWidth={2.4} />
                </button>
                <NavBtn icon={CalendarIcon} label="Calendario" active={screen === "calendar"} onClick={() => go("calendar")} />
                <NavBtn icon={ListIcon} label="Registro" active={screen === "log"} onClick={() => go("log")} />
              </div>
            </nav>

            <Toast text={toast} />

            {/* ---- Overlays ---- */}
            {moreOpen && (
              <Sheet title="Menú" onClose={() => setMoreOpen(false)}>
                <MenuList onNavigate={(s) => { go(s); setMoreOpen(false); }} onViewMode={() => { setMoreOpen(false); setViewModeOpen(true); }} />
              </Sheet>
            )}

            {viewModeOpen && (
              <Sheet title="Periodo de Inicio" onClose={() => setViewModeOpen(false)}>
                <ViewModeEditor profile={profile} setProfile={setProfile} onClose={() => setViewModeOpen(false)} />
              </Sheet>
            )}

            {searchOpen && (
              <Sheet title="Buscar" onClose={() => { setSearchOpen(false); setSearchQ(""); }}>
                <input className="field" placeholder="Busca por descripción, categoría o nota" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} autoFocus />
                <div style={{ marginTop: 6 }}>
                  {searchResults.map((t) => (
                    <TxRow key={t.id} t={t} onClick={() => { setSearchOpen(false); setSearchQ(""); openTx(t); }} ruleName={t.mainId ? ruleInfo(t.mainId).name : null} ruleColor={t.mainId ? ruleInfo(t.mainId).color : null} />
                  ))}
                  {searchQ.trim() && searchResults.length === 0 && <EmptyNote text={`Nada coincide con "${searchQ.trim()}".`} />}
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
                ruleColor={(id) => ruleInfo(id).color}
                remainingFor={(r) => budgetFor(r) - spentInCategory(r.id)}
                onClose={closeAdd}
                onCreateCategory={createCategory}
                onCreateItem={createItem}
                onSave={(tx) => {
                  if (editingTx) editTransaction(editingTx.id, tx); else addTransactionWithRecurrence(tx);
                  // Jump to the month of what was just saved so it's visible right away
                  const [y, m] = tx.date.split("-").map(Number);
                  setMonthCursor({ y, m: m - 1 });
                  flash(editingTx ? "Cambios guardados" : tx.type === "income" ? "Ingreso guardado" : "Gasto guardado");
                  closeAdd();
                }}
                onDelete={(id) => { setConfirmDel({ type: "tx", id }); closeAdd(); }}
                onCancelFutureRecurrences={(groupId, fromDate) => { setConfirmDel({ type: "recurring-future", groupId, fromDate }); closeAdd(); }}
                onUpdateIncomeDefault={(amount, periodicity) => setProfile((p) => ({ ...p, incomeAmount: amount, incomePeriodicity: periodicity }))}
              />
            )}

            {dayDetail && (
              <Sheet title={fmtDayLong(dayDetail)} onClose={() => setDayDetail(null)}>
                <DayDetail
                  transactions={transactions.filter((t) => t.date === dayDetail && t.type === "expense")}
                  onOpenTx={(t) => { setDayDetail(null); openTx(t); }}
                  onAdd={() => { const d = dayDetail; setDayDetail(null); openAdd("expense", d); }}
                  ruleInfo={ruleInfo}
                />
              </Sheet>
            )}

            {goalDetail && (
              <Sheet title={goalDetail === "new" ? "Nueva meta" : goalDetail.name} onClose={() => setGoalDetail(null)}>
                <GoalDetail
                  goal={goalDetail === "new" ? null : goals.find((g) => g.id === goalDetail.id)}
                  onCreate={(g) => {
                    const { initialSaved, ...fields } = g;
                    const contributions = initialSaved > 0 ? [{ id: uid("c"), amount: initialSaved, date: todayISO(), note: "Ahorro inicial" }] : [];
                    setGoals((prev) => [...prev, { ...fields, id: uid("goal"), createdAt: todayISO(), contributions }]);
                    setGoalDetail(null);
                    flash("Meta creada");
                  }}
                  onContribute={(goalId, amount, note) => {
                    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, contributions: [...g.contributions, { id: uid("c"), amount: Number(amount), date: todayISO(), note }] } : g)));
                    flash("Aportación guardada");
                  }}
                  onDelete={(goalId) => { setConfirmDel({ type: "goal", id: goalId }); setGoalDetail(null); }}
                />
              </Sheet>
            )}

            {confirmDel && (
              <Confirm
                text={
                  confirmDel.type === "recurring-future" ? "Se van a borrar los siguientes pagos de esta serie. Los que ya pasaron se quedan."
                    : confirmDel.type === "cat" ? "¿Eliminar esta categoría y sus subcategorías? Los gastos ya registrados se conservan."
                    : confirmDel.type === "item" ? "¿Eliminar esta subcategoría? Los gastos ya registrados se conservan."
                    : "¿Seguro que quieres eliminarlo? No se puede deshacer."
                }
                confirmLabel={confirmDel.type === "recurring-future" ? "Borrar siguientes" : "Eliminar"}
                onCancel={() => setConfirmDel(null)}
                onConfirm={() => {
                  const c = confirmDel;
                  if (c.type === "tx") deleteTransaction(c.id);
                  if (c.type === "cat") deleteCategory(c.mainId, c.subId);
                  if (c.type === "item") deleteItem(c.mainId, c.subId, c.itemId);
                  if (c.type === "recurring-future") cancelFutureRecurrences(c.groupId, c.fromDate);
                  if (c.type === "goal") setGoals((prev) => prev.filter((g) => g.id !== c.id));
                  setConfirmDel(null);
                  flash("Eliminado");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} aria-label={label} aria-current={active ? "page" : undefined} className="press flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 999, border: "none", background: active ? "var(--accent-soft)" : "transparent", color: active ? "var(--accent-ink)" : "var(--muted)" }}>
      <Icon size={21} strokeWidth={active ? 2.4 : 2} />
    </button>
  );
}
