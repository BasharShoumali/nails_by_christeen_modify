import { useMemo, useState } from "react";
import styles from "./SchedulePage.module.css";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AssignmentsPanel({
  schedules,
  assignments,
  onChanged,
}) {
  const [weekday, setWeekday] = useState(0);
  const [scheduleId, setScheduleId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [notes, setNotes] = useState("");

  const save = async () => {
    if (!scheduleId || !from) return;
    await fetch(`${API}/api/admin/week`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schedule_id: Number(scheduleId),
        weekday: Number(weekday),
        effective_from: from,
        effective_to: to || null,
        notes: notes || null,
      }),
    });
    setNotes("");
    setTo("");
    onChanged();
  };

  // group assignments by weekday
  const grouped = useMemo(() => {
    const g = {};
    for (const a of assignments) {
      if (!g[a.weekday]) g[a.weekday] = [];
      g[a.weekday].push(a);
    }
    return g;
  }, [assignments]);

  return (
    <section className={styles.card}>
      <h2 className={styles.h2}>📆 Weekly Planner</h2>
      <p className={styles.helper}>
        Organize your <strong>Day Templates</strong> into a weekly layout. For
        example, make Sunday–Thursday regular days and Friday a holiday.
      </p>

      <div className={styles.row}>
        <select
          className={styles.input}
          value={weekday}
          onChange={(e) => setWeekday(e.target.value)}
        >
          {WEEKDAYS.map((w, i) => (
            <option key={i} value={i}>
              {w}
            </option>
          ))}
        </select>

        <select
          className={styles.input}
          value={scheduleId}
          onChange={(e) => setScheduleId(e.target.value)}
        >
          <option value="">— Choose Template —</option>
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <input
          className={styles.input}
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          className={styles.input}
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="(open-ended)"
        />
      </div>

      <input
        className={styles.input}
        style={{ marginTop: ".5rem" }}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
      />

      <div style={{ marginTop: ".5rem" }}>
        <button className={styles.btn} onClick={save}>
          Save Assignment
        </button>
      </div>

      {/* === Modern Week Grid === */}
      <div className={styles.weekModernGrid}>
        {WEEKDAYS.map((day, i) => (
          <div key={i} className={styles.dayCard}>
            <header className={styles.dayHeader}>
              <h3>{day}</h3>
            </header>

            <div className={styles.dayBody}>
              {grouped[i]?.length ? (
                grouped[i].map((a) => (
                  <div key={a.id} className={styles.assignmentCard}>
                    <div className={styles.scheduleName}>{a.schedule_name}</div>
                    <div className={styles.dateRange}>
                      {a.effective_from} → {a.effective_to || "Open-ended"}
                    </div>
                    {a.notes && (
                      <div className={styles.note}>
                        <strong>Note:</strong> {a.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.noAssignment}>
                  <em>No template assigned</em>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
