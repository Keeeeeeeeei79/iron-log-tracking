import React, { useState, useEffect, useRef } from "react";
import { Calendar, TrendingUp, Award, Plus, Trash2, ChevronLeft, ChevronRight, Dumbbell, Flame, Zap, Target } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const ACCENT = "#BEFF00";
const ACCENT_DIM = "rgba(190,255,0,0.15)";
const SURFACE = "#111111";
const SURFACE2 = "#1a1a1a";
const SURFACE3 = "#222222";
const BORDER = "#2a2a2a";
const TEXT1 = "#ffffff";
const TEXT2 = "#888888";
const TEXT3 = "#555555";

const STORAGE_KEY = "ironlog_workouts";

function loadWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveWorkoutsToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Save failed:", e);
  }
}

const styles = {
  app: { minHeight: "100vh", minHeight: "100dvh", background: "#0a0a0a", color: TEXT1, fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace" },
  container: { maxWidth: 720, margin: "0 auto", padding: "20px 16px", paddingBottom: 40 },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32 },
  logo: { width: 40, height: 40, background: ACCENT, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", flexShrink: 0 },
  title: { fontSize: 22, fontWeight: 700, letterSpacing: -0.5, margin: 0 },
  subtitle: { fontSize: 11, color: TEXT2, letterSpacing: 2, textTransform: "uppercase", margin: 0 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 },
  statCard: { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 10px", textAlign: "center" },
  statValue: { fontSize: 24, fontWeight: 700, color: TEXT1, lineHeight: 1 },
  statLabel: { fontSize: 8, color: TEXT2, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 6 },
  tabBar: { display: "flex", gap: 4, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: (active) => ({ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, fontFamily: "inherit", letterSpacing: 0.5, transition: "all 0.2s", background: active ? ACCENT : "transparent", color: active ? "#000" : TEXT2 }),
  card: { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 16 },
  monthNav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  navBtn: { background: SURFACE3, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8, cursor: "pointer", color: TEXT2, display: "flex", alignItems: "center" },
  monthLabel: { fontSize: 14, fontWeight: 600, letterSpacing: 0.5 },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 },
  dayHeader: (i) => ({ textAlign: "center", fontSize: 10, padding: "4px 0", color: i === 0 ? "#ff4444" : i === 6 ? "#4488ff" : TEXT3, letterSpacing: 1 }),
  dayCell: (hasWorkout, isSelected, isToday) => ({ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 8, border: isSelected ? `2px solid ${ACCENT}` : `1px solid ${hasWorkout ? "rgba(190,255,0,0.3)" : "transparent"}`, background: hasWorkout ? ACCENT_DIM : "transparent", cursor: "pointer", fontSize: 13, fontWeight: isToday ? 700 : 400, color: hasWorkout ? ACCENT : isToday ? TEXT1 : TEXT2, fontFamily: "inherit", transition: "all 0.15s", position: "relative", WebkitTapHighlightColor: "transparent" }),
  dot: { width: 3, height: 3, borderRadius: "50%", background: ACCENT, position: "absolute", bottom: 4 },
  inputRow: { display: "flex", gap: 8, marginBottom: 16 },
  textInput: { flex: 1, minWidth: 0, background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: TEXT1, fontSize: 13, fontFamily: "inherit", outline: "none" },
  numInput: { width: 64, background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 8px", color: TEXT1, fontSize: 13, fontFamily: "inherit", outline: "none", textAlign: "center" },
  addBtn: { background: ACCENT, border: "none", borderRadius: 8, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", color: "#000", fontWeight: 700, transition: "opacity 0.15s", flexShrink: 0 },
  entryRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: SURFACE2, borderRadius: 8, marginBottom: 6 },
  entryName: { fontSize: 13, fontWeight: 500 },
  entrySets: { fontSize: 11, color: ACCENT, marginLeft: 10, fontWeight: 600 },
  deleteBtn: { background: "transparent", border: "none", cursor: "pointer", color: TEXT3, padding: 4, display: "flex", transition: "color 0.15s" },
  emptyState: { textAlign: "center", padding: "40px 0", color: TEXT3, fontSize: 12 },
  rankRow: { marginBottom: 12 },
  rankHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  rankNum: { fontSize: 10, color: TEXT3, width: 24 },
  rankName: { fontSize: 13, fontWeight: 500 },
  rankSets: { fontSize: 12, color: ACCENT, fontWeight: 600 },
  rankBar: { height: 4, background: SURFACE3, borderRadius: 4, overflow: "hidden" },
  rankFill: (pct) => ({ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${ACCENT}, rgba(190,255,0,0.4))`, borderRadius: 4, transition: "width 0.5s ease" }),
  dateLabel: { fontSize: 12, color: TEXT2, marginBottom: 12, letterSpacing: 0.5 },
  chartTitle: { fontSize: 14, fontWeight: 600, marginBottom: 2 },
  chartSub: { fontSize: 10, color: TEXT2, marginBottom: 16, letterSpacing: 0.5 },
  footer: { textAlign: "center", fontSize: 10, color: TEXT3, marginTop: 32, letterSpacing: 1 },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, fontFamily: "inherit" }}>
      <div style={{ color: TEXT2, marginBottom: 2 }}>{label}</div>
      <div style={{ color: ACCENT, fontWeight: 700 }}>{payload[0].value} sets</div>
    </div>
  );
};

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function App() {
  const [workouts, setWorkouts] = useState(loadWorkouts);
  const [view, setView] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(getTodayKey);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [exerciseInput, setExerciseInput] = useState("");
  const [setsInput, setSetsInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    saveWorkoutsToStorage(workouts);
  }, [workouts]);

  const addEntry = () => {
    const name = exerciseInput.trim();
    const sets = parseInt(setsInput, 10);
    if (!name || !sets || sets <= 0) return;
    const current = workouts[selectedDate] || [];
    setWorkouts({ ...workouts, [selectedDate]: [...current, { id: Date.now(), name, sets }] });
    setExerciseInput("");
    setSetsInput("");
    inputRef.current?.focus();
  };

  const deleteEntry = (date, id) => {
    const filtered = (workouts[date] || []).filter((e) => e.id !== id);
    const next = { ...workouts };
    if (filtered.length === 0) delete next[date];
    else next[date] = filtered;
    setWorkouts(next);
  };

  const daysInMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate();
  const firstDay = new Date(calendarMonth.year, calendarMonth.month, 1).getDay();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  const changeMonth = (d) => {
    let m = calendarMonth.month + d, y = calendarMonth.year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalendarMonth({ year: y, month: m });
  };

  const getDateKey = (day) => `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const allEntries = Object.entries(workouts).flatMap(([date, entries]) => entries.map((e) => ({ ...e, date })));
  const totalSets = allEntries.reduce((sum, e) => sum + e.sets, 0);
  const totalDays = Object.keys(workouts).length;
  const uniqueExercises = [...new Set(allEntries.map((e) => e.name))].length;

  const byExercise = {};
  allEntries.forEach((e) => { byExercise[e.name] = (byExercise[e.name] || 0) + e.sets; });
  const exerciseRanking = Object.entries(byExercise).map(([name, sets]) => ({ name, sets })).sort((a, b) => b.sets - a.sets);

  const last30Days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const t = (workouts[key] || []).reduce((s, e) => s + e.sets, 0);
    last30Days.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, sets: t });
  }

  const calcStreak = () => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (workouts[key] && workouts[key].length > 0) { streak++; d.setDate(d.getDate() - 1); }
      else {
        if (streak === 0) {
          d.setDate(d.getDate() - 1);
          const k2 = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          if (!workouts[k2] || workouts[k2].length === 0) break;
          continue;
        }
        break;
      }
    }
    return streak;
  };
  const streak = calcStreak();

  const formatSelectedDate = (ds) => {
    const [y, m, d] = ds.split("-");
    const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${dayNames[dt.getDay()]}, ${monthNames[dt.getMonth()]} ${dt.getDate()}`;
  };

  const statIcons = [
    <Zap size={14} key="zap" />, <Target size={14} key="target" />, <Dumbbell size={14} key="db" />, <Flame size={14} key="flame" />
  ];
  const statData = [
    { value: totalSets, label: "TOTAL SETS" },
    { value: totalDays, label: "DAYS" },
    { value: uniqueExercises, label: "EXERCISES" },
    { value: streak, label: "STREAK" },
  ];

  const todayKey = getTodayKey();

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}><Dumbbell size={20} /></div>
          <div>
            <h1 style={styles.title}>IRON LOG</h1>
            <p style={styles.subtitle}>Track your grind</p>
          </div>
        </header>

        <div style={styles.statsGrid}>
          {statData.map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ color: ACCENT, marginBottom: 6 }}>{statIcons[i]}</div>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.tabBar}>
          <button onClick={() => setView("calendar")} style={styles.tab(view === "calendar")}><Calendar size={14} /> Calendar</button>
          <button onClick={() => setView("graph")} style={styles.tab(view === "graph")}><TrendingUp size={14} /> Graph</button>
          <button onClick={() => setView("ranking")} style={styles.tab(view === "ranking")}><Award size={14} /> Totals</button>
        </div>

        {view === "calendar" && (
          <>
            <div style={styles.card}>
              <div style={styles.monthNav}>
                <button onClick={() => changeMonth(-1)} style={styles.navBtn}><ChevronLeft size={16} /></button>
                <span style={styles.monthLabel}>{months[calendarMonth.month]} {calendarMonth.year}</span>
                <button onClick={() => changeMonth(1)} style={styles.navBtn}><ChevronRight size={16} /></button>
              </div>
              <div style={styles.calGrid}>
                {days.map((d, i) => <div key={d} style={styles.dayHeader(i)}>{d}</div>)}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const key = getDateKey(day);
                  const hw = workouts[key] && workouts[key].length > 0;
                  const sel = selectedDate === key;
                  return (
                    <button key={day} onClick={() => setSelectedDate(key)} style={styles.dayCell(hw, sel, key === todayKey)}>
                      {day}
                      {hw && <div style={styles.dot} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.dateLabel}>{formatSelectedDate(selectedDate)}</div>
              <div style={styles.inputRow}>
                <input ref={inputRef} type="text" value={exerciseInput} onChange={(e) => setExerciseInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEntry()} placeholder="Exercise" style={styles.textInput} />
                <input type="number" value={setsInput} onChange={(e) => setSetsInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEntry()} placeholder="Sets" min="1" style={styles.numInput} />
                <button onClick={addEntry} style={styles.addBtn}><Plus size={18} /></button>
              </div>
              {(workouts[selectedDate] || []).length === 0 ? (
                <div style={styles.emptyState}>No entries yet — start logging</div>
              ) : (
                (workouts[selectedDate] || []).map((entry) => (
                  <div key={entry.id} style={styles.entryRow}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={styles.entryName}>{entry.name}</span>
                      <span style={styles.entrySets}>{entry.sets}s</span>
                    </div>
                    <button onClick={() => deleteEntry(selectedDate, entry.id)} style={styles.deleteBtn}><Trash2 size={14} /></button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {view === "graph" && (
          <div style={styles.card}>
            <div style={styles.chartTitle}>Last 30 days</div>
            <div style={styles.chartSub}>Daily total sets</div>
            {allEntries.length === 0 ? (
              <div style={styles.emptyState}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={last30Days}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: TEXT3 }} interval={4} axisLine={{ stroke: BORDER }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: TEXT3 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(190,255,0,0.05)" }} />
                  <Bar dataKey="sets" fill={ACCENT} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {view === "ranking" && (
          <div style={styles.card}>
            <div style={styles.chartTitle}>Exercise totals</div>
            <div style={styles.chartSub}>All-time sets by exercise</div>
            {exerciseRanking.length === 0 ? (
              <div style={styles.emptyState}>No data yet</div>
            ) : (
              exerciseRanking.map((ex, idx) => {
                const maxSets = exerciseRanking[0].sets;
                const pct = Math.round((ex.sets / maxSets) * 100);
                return (
                  <div key={ex.name} style={styles.rankRow}>
                    <div style={styles.rankHeader}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={styles.rankNum}>#{idx + 1}</span>
                        <span style={styles.rankName}>{ex.name}</span>
                      </div>
                      <span style={styles.rankSets}>{ex.sets}</span>
                    </div>
                    <div style={styles.rankBar}>
                      <div style={styles.rankFill(pct)} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div style={styles.footer}>DATA SAVED ON THIS DEVICE</div>
      </div>
    </div>
  );
}
