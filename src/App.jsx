import React, { useState, useEffect, useRef } from "react";
import { Calendar, TrendingUp, Award, Plus, Trash2, ChevronLeft, ChevronRight, Dumbbell, Flame, AlertTriangle, Activity } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const ACCENT = "#BEFF00";
const ACCENT_DIM = "rgba(190,255,0,0.15)";
const SURFACE = "#111111";
const SURFACE2 = "#1a1a1a";
const SURFACE3 = "#222222";
const BORDER = "#2a2a2a";
const TEXT1 = "#ffffff";
const TEXT2 = "#888888";
const TEXT3 = "#555555";
const WARNING = "#ff6b6b";

const STORAGE_KEY = "ironlog_workouts_v2";

const CATEGORIES = {
  strength: { label: "Strength", icon: "💪", color: "#BEFF00" },
  cardio: { label: "Cardio", icon: "🔥", color: "#ff6b6b" },
  mobility: { label: "Mobility", icon: "🧘", color: "#4a9eff" }
};

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
  logo: { width: 48, height: 48, background: ACCENT, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", flexShrink: 0, position: "relative" },
  title: { fontSize: 22, fontWeight: 700, letterSpacing: -0.5, margin: 0 },
  subtitle: { fontSize: 11, color: TEXT2, letterSpacing: 2, textTransform: "uppercase", margin: 0 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 24 },
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
  numInput: { width: 70, background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 8px", color: TEXT1, fontSize: 13, fontFamily: "inherit", outline: "none", textAlign: "center" },
  select: { background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: TEXT1, fontSize: 13, fontFamily: "inherit", outline: "none" },
  addBtn: { background: ACCENT, border: "none", borderRadius: 8, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", color: "#000", fontWeight: 700, transition: "opacity 0.15s", flexShrink: 0 },
  entryRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: SURFACE2, borderRadius: 8, marginBottom: 6 },
  entryName: { fontSize: 13, fontWeight: 500 },
  entryLoad: { fontSize: 11, color: ACCENT, marginLeft: 10, fontWeight: 600 },
  deleteBtn: { background: "transparent", border: "none", cursor: "pointer", color: TEXT3, padding: 4, display: "flex", transition: "color 0.15s" },
  emptyState: { textAlign: "center", padding: "40px 0", color: TEXT3, fontSize: 12 },
  dateLabel: { fontSize: 12, color: TEXT2, marginBottom: 12, letterSpacing: 0.5 },
  chartTitle: { fontSize: 14, fontWeight: 600, marginBottom: 2 },
  chartSub: { fontSize: 10, color: TEXT2, marginBottom: 16, letterSpacing: 0.5 },
  footer: { textAlign: "center", fontSize: 10, color: TEXT3, marginTop: 32, letterSpacing: 1 },
  slider: { width: "100%", height: 32, WebkitAppearance: "none", appearance: "none", background: SURFACE2, borderRadius: 8, outline: "none", border: `1px solid ${BORDER}` },
  sliderLabel: { display: "flex", justifyContent: "space-between", fontSize: 10, color: TEXT2, marginTop: 4 },
  categoryBadge: (cat) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 9, fontWeight: 600, background: `${CATEGORIES[cat]?.color}22`, color: CATEGORIES[cat]?.color, marginLeft: 8 }),
  warningCard: { background: `${WARNING}11`, border: `1px solid ${WARNING}44`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 },
  warningText: { fontSize: 12, color: WARNING, lineHeight: 1.5 },
  infoRow: { display: "flex", justifyContent: "space-between", fontSize: 11, color: TEXT2, marginBottom: 8 },
  infoValue: { color: TEXT1, fontWeight: 600 },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, fontFamily: "inherit" }}>
      <div style={{ color: TEXT2, marginBottom: 4 }}>{label}</div>
      <div style={{ color: ACCENT, fontWeight: 700 }}>Load: {payload[0].value}</div>
      {payload[1] && <div style={{ color: "#4a9eff", fontWeight: 600, fontSize: 10, marginTop: 2 }}>7-day avg: {payload[1].value}</div>}
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
  const [timeInput, setTimeInput] = useState("");
  const [rpeInput, setRpeInput] = useState(5);
  const [categoryInput, setCategoryInput] = useState("strength");
  const [notesInput, setNotesInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    saveWorkoutsToStorage(workouts);
  }, [workouts]);

  const addEntry = () => {
    const name = exerciseInput.trim();
    const time = parseInt(timeInput, 10);
    const rpe = parseInt(rpeInput, 10);
    if (!name || !time || time <= 0 || !rpe) return;
    const load = time * rpe;
    const current = workouts[selectedDate] || [];
    setWorkouts({ 
      ...workouts, 
      [selectedDate]: [...current, { 
        id: Date.now(), 
        name, 
        time, 
        rpe, 
        load,
        category: categoryInput,
        notes: notesInput.trim()
      }] 
    });
    setExerciseInput("");
    setTimeInput("");
    setRpeInput(5);
    setNotesInput("");
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

  // Calculate daily loads
  const dailyLoads = {};
  Object.entries(workouts).forEach(([date, entries]) => {
    dailyLoads[date] = entries.reduce((sum, e) => sum + e.load, 0);
  });

  // Get last 30 days data
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const load = dailyLoads[key] || 0;
    last30Days.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, load, fullDate: key });
  });

  // Add 7-day rolling average
  last30Days.forEach((day, idx) => {
    const start = Math.max(0, idx - 6);
    const slice = last30Days.slice(start, idx + 1);
    const avg = slice.reduce((sum, d) => sum + d.load, 0) / slice.length;
    day.avg7 = Math.round(avg);
  });

  // Calculate Acute (7-day) and Chronic (28-day) loads
  const getAcuteLoad = () => {
    const last7 = last30Days.slice(-7);
    return last7.reduce((sum, d) => sum + d.load, 0);
  };

  const getChronicLoad = () => {
    const last28 = last30Days.slice(-28);
    const avg = last28.reduce((sum, d) => sum + d.load, 0) / 28;
    return Math.round(avg * 7); // Weekly equivalent
  };

  const acuteLoad = getAcuteLoad();
  const chronicLoad = getChronicLoad();
  const acuteChronicRatio = chronicLoad > 0 ? (acuteLoad / chronicLoad).toFixed(2) : 0;
  const isHighRisk = acuteChronicRatio >= 1.5;

  // Stats
  const allEntries = Object.entries(workouts).flatMap(([date, entries]) => entries.map((e) => ({ ...e, date })));
  const totalLoad = allEntries.reduce((sum, e) => sum + e.load, 0);
  const totalDays = Object.keys(workouts).length;
  const avgLoadPerDay = totalDays > 0 ? Math.round(totalLoad / totalDays) : 0;

  // Streak calculation
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (workouts[key] && workouts[key].length > 0) streak++;
    else break;
  }

  // Category breakdown
  const categoryTotals = { strength: 0, cardio: 0, mobility: 0 };
  allEntries.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.load;
  });

  const formatSelectedDate = (dateStr) => {
    const [y, m, d] = dateStr.split("-");
    const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${dayNames[dt.getDay()]}, ${monthNames[dt.getMonth()]} ${dt.getDate()}`;
  };

  const todayKey = getTodayKey();

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <Dumbbell size={24} strokeWidth={3} />
          </div>
          <div>
            <h1 style={styles.title}>IRON LOG</h1>
            <p style={styles.subtitle}>Training Load Tracker</p>
          </div>
        </header>

        {isHighRisk && (
          <div style={styles.warningCard}>
            <AlertTriangle size={24} color={WARNING} />
            <div style={styles.warningText}>
              <strong>⚠️ High injury risk detected!</strong><br />
              Your Acute/Chronic ratio is {acuteChronicRatio} (target: 0.8-1.3). Consider reducing volume this week.
            </div>
          </div>
        )}

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ color: ACCENT, marginBottom: 6 }}><Flame size={14} /></div>
            <div style={styles.statValue}>{totalLoad}</div>
            <div style={styles.statLabel}>TOTAL LOAD</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ color: ACCENT, marginBottom: 6 }}><Calendar size={14} /></div>
            <div style={styles.statValue}>{totalDays}</div>
            <div style={styles.statLabel}>DAYS TRAINED</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ color: ACCENT, marginBottom: 6 }}><Activity size={14} /></div>
            <div style={styles.statValue}>{avgLoadPerDay}</div>
            <div style={styles.statLabel}>AVG LOAD/DAY</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ color: isHighRisk ? WARNING : ACCENT, marginBottom: 6 }}><TrendingUp size={14} /></div>
            <div style={{ ...styles.statValue, color: isHighRisk ? WARNING : TEXT1 }}>{acuteChronicRatio}</div>
            <div style={styles.statLabel}>A:C RATIO</div>
          </div>
        </div>

        <div style={styles.tabBar}>
          <button onClick={() => setView("calendar")} style={styles.tab(view === "calendar")}><Calendar size={14} /> Calendar</button>
          <button onClick={() => setView("graph")} style={styles.tab(view === "graph")}><TrendingUp size={14} /> Load</button>
          <button onClick={() => setView("breakdown")} style={styles.tab(view === "breakdown")}><Award size={14} /> Stats</button>
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
                <input 
                  ref={inputRef} 
                  type="text" 
                  value={exerciseInput} 
                  onChange={(e) => setExerciseInput(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && document.getElementById("timeInput").focus()} 
                  placeholder="Exercise name" 
                  style={styles.textInput} 
                />
              </div>

              <div style={styles.inputRow}>
                <select 
                  value={categoryInput} 
                  onChange={(e) => setCategoryInput(e.target.value)} 
                  style={{ ...styles.select, flex: 1 }}
                >
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
                <input 
                  id="timeInput"
                  type="number" 
                  value={timeInput} 
                  onChange={(e) => setTimeInput(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && addEntry()} 
                  placeholder="Min" 
                  min="1" 
                  style={styles.numInput} 
                />
                <button onClick={addEntry} style={styles.addBtn}><Plus size={18} /></button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: TEXT2 }}>Intensity (RPE)</span>
                  <span style={{ fontSize: 13, color: ACCENT, fontWeight: 700 }}>{rpeInput}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={rpeInput} 
                  onChange={(e) => setRpeInput(e.target.value)} 
                  style={styles.slider}
                />
                <div style={styles.sliderLabel}>
                  <span>Easy</span>
                  <span>Moderate</span>
                  <span>Max</span>
                </div>
              </div>

              <input 
                type="text" 
                value={notesInput} 
                onChange={(e) => setNotesInput(e.target.value)} 
                placeholder="Notes (optional)" 
                style={{ ...styles.textInput, marginBottom: 16 }}
              />

              {(workouts[selectedDate] || []).length === 0 ? (
                <div style={styles.emptyState}>No entries yet — start tracking</div>
              ) : (
                <>
                  <div style={{ ...styles.infoRow, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${BORDER}` }}>
                    <span>Total Load Today</span>
                    <span style={styles.infoValue}>{dailyLoads[selectedDate] || 0}</span>
                  </div>
                  {(workouts[selectedDate] || []).map((entry) => (
                    <div key={entry.id} style={styles.entryRow}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span style={styles.entryName}>{entry.name}</span>
                          <span style={styles.categoryBadge(entry.category)}>
                            {CATEGORIES[entry.category]?.icon}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: TEXT3, marginTop: 4 }}>
                          {entry.time}min × RPE {entry.rpe} = Load {entry.load}
                          {entry.notes && ` • ${entry.notes}`}
                        </div>
                      </div>
                      <button onClick={() => deleteEntry(selectedDate, entry.id)} style={styles.deleteBtn}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}

        {view === "graph" && (
          <>
            <div style={styles.card}>
              <div style={styles.chartTitle}>Training Load Trend</div>
              <div style={styles.chartSub}>Last 30 days • Daily load with 7-day rolling average</div>
              {allEntries.length === 0 ? (
                <div style={styles.emptyState}>No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={last30Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9, fill: TEXT3 }} 
                      interval={4} 
                      axisLine={{ stroke: BORDER }} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tick={{ fontSize: 9, fill: TEXT3 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="load" 
                      stroke={ACCENT} 
                      strokeWidth={2} 
                      dot={{ fill: ACCENT, r: 3 }} 
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avg7" 
                      stroke="#4a9eff" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={styles.card}>
              <div style={styles.chartTitle}>Acute vs Chronic Workload</div>
              <div style={styles.chartSub}>Injury risk management</div>
              <div style={styles.infoRow}>
                <span>Acute Load (7-day total)</span>
                <span style={styles.infoValue}>{acuteLoad}</span>
              </div>
              <div style={styles.infoRow}>
                <span>Chronic Load (28-day avg × 7)</span>
                <span style={styles.infoValue}>{chronicLoad}</span>
              </div>
              <div style={{ ...styles.infoRow, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                <span>A:C Ratio</span>
                <span style={{ ...styles.infoValue, color: isHighRisk ? WARNING : ACCENT, fontSize: 18 }}>
                  {acuteChronicRatio}
                </span>
              </div>
              <div style={{ fontSize: 10, color: TEXT3, marginTop: 12, lineHeight: 1.6 }}>
                • 0.8-1.3: Safe zone (optimal training)<br />
                • 1.5+: High injury risk (reduce volume)<br />
                • &lt;0.8: Possible detraining
              </div>
            </div>
          </>
        )}

        {view === "breakdown" && (
          <>
            <div style={styles.card}>
              <div style={styles.chartTitle}>Category Breakdown</div>
              <div style={styles.chartSub}>Total load by training type</div>
              {Object.entries(CATEGORIES).map(([key, cat]) => {
                const total = categoryTotals[key] || 0;
                const maxLoad = Math.max(...Object.values(categoryTotals));
                const pct = maxLoad > 0 ? Math.round((total / maxLoad) * 100) : 0;
                return (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {cat.icon} {cat.label}
                      </span>
                      <span style={{ fontSize: 13, color: cat.color, fontWeight: 700 }}>{total}</span>
                    </div>
                    <div style={{ height: 6, background: SURFACE3, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ 
                        height: "100%", 
                        width: `${pct}%`, 
                        background: cat.color, 
                        borderRadius: 4,
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.card}>
              <div style={styles.chartTitle}>Training Summary</div>
              <div style={styles.chartSub}>All-time statistics</div>
              <div style={styles.infoRow}>
                <span>Total Sessions</span>
                <span style={styles.infoValue}>{allEntries.length}</span>
              </div>
              <div style={styles.infoRow}>
                <span>Training Days</span>
                <span style={styles.infoValue}>{totalDays}</span>
              </div>
              <div style={styles.infoRow}>
                <span>Current Streak</span>
                <span style={styles.infoValue}>{streak} days</span>
              </div>
              <div style={styles.infoRow}>
                <span>Total Load</span>
                <span style={styles.infoValue}>{totalLoad}</span>
              </div>
              <div style={styles.infoRow}>
                <span>Avg Load/Day</span>
                <span style={styles.infoValue}>{avgLoadPerDay}</span>
              </div>
            </div>
          </>
        )}

        <div style={styles.footer}>DATA SAVED ON THIS DEVICE</div>
      </div>
    </div>
  );
}
