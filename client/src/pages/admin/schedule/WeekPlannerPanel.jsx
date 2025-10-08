import { useEffect, useState } from "react";
import styles from "./SchedulePage.module.css";
import Popup from "../../../components/popup/Popup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

/** 🕒 Local date converter — prevents 1-day shift */
function toLocalDateString(date) {
  if (!date) return "";
  const offset = date.getTimezoneOffset(); // e.g. -180 for UTC+3
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

export default function WeekPlanner({ schedules }) {
  const [mode, setMode] = useState("view");
  const [weeks, setWeeks] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [weekName, setWeekName] = useState("");
  const [dayMapping, setDayMapping] = useState(Array(7).fill(""));
  const [assignments, setAssignments] = useState({
    dateFrom: "",
    dateTo: "",
    weekId: "",
  });

  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const showPopup = (title, message, type = "info", onConfirm = null) =>
    setPopup({ show: true, title, message, type, onConfirm });

  const closePopup = () =>
    setPopup({
      show: false,
      title: "",
      message: "",
      type: "info",
      onConfirm: null,
    });

  /** 🧩 Safe parser for days */
  const safeParseDays = (value) => {
    let out = Array.isArray(value) ? value : [];
    if (!out.length && typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        out = Array.isArray(parsed) ? parsed : [];
      } catch {
        out = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    const seven = Array(7).fill("");
    for (let i = 0; i < 7; i++) seven[i] = out[i] ?? "";
    return seven;
  };

  /** === Delete week template === */
  const handleDeleteWeek = (id) => {
    showPopup(
      "Confirm Delete",
      "Are you sure you want to delete this week plan?",
      "info",
      async () => {
        try {
          const res = await fetch(`${API}/api/admin/week-templates/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete week template");
          await loadWeeks();
          showPopup(
            "Success",
            "🗑️ Week template deleted successfully!",
            "success"
          );
        } catch (err) {
          console.error("❌ handleDeleteWeek error:", err);
          showPopup("Error", "Failed to delete week template", "error");
        }
      }
    );
  };

  /** === Load all week templates === */
  const loadWeeks = async () => {
    try {
      const res = await fetch(`${API}/api/admin/week-templates`);
      if (!res.ok) throw new Error("Failed to load week templates");
      const data = await res.json();

      const normalized = data.map((item) => {
        const name = item.name || item.template_name || `Template #${item.id}`;
        let days = [];
        try {
          days = JSON.parse(item.days);
          if (!Array.isArray(days)) {
            days = String(item.days || "")
              .split(",")
              .map((d) => d.trim());
          }
        } catch {
          days = String(item.days || "")
            .split(",")
            .map((d) => d.trim());
        }
        const seven = Array(7)
          .fill("")
          .map((_, i) => days[i] || "");
        return { ...item, name, days: seven };
      });

      setWeeks(normalized);
    } catch (err) {
      console.error("❌ loadWeeks error:", err);
      setWeeks([]);
    }
  };

  useEffect(() => {
    loadWeeks();
  }, []);

  /** === Create new week template === */
  const saveWeekTemplate = async () => {
    if (!weekName.trim())
      return showPopup("Notice", "Enter a week template name.", "info");
    try {
      await fetch(`${API}/api/admin/week-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: weekName.trim(), days: dayMapping }),
      });
      setWeekName("");
      setDayMapping(Array(7).fill(""));
      await loadWeeks();
      setMode("view");
      showPopup("Success", "✅ Week template saved successfully!", "success");
    } catch (err) {
      console.error("❌ saveWeekTemplate error:", err);
      showPopup("Error", "Failed to save week template", "error");
    }
  };

  /** === Load a week for editing === */
  const handleEditSelect = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/week-templates/${id}`);
      if (!res.ok) throw new Error("Failed to fetch template");
      const data = await res.json();
      setSelectedWeekId(id);
      setWeekName(data.name);
      setDayMapping(safeParseDays(data.days));
      setMode("edit");
    } catch (err) {
      console.error("❌ handleEditSelect error:", err);
      showPopup("Error", "Failed to load selected week", "error");
    }
  };

  /** === Save edited week === */
  const updateWeekTemplate = async () => {
    if (!selectedWeekId) return;
    try {
      await fetch(`${API}/api/admin/week-templates/${selectedWeekId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: weekName.trim(), days: dayMapping }),
      });
      await loadWeeks();
      setMode("view");
      showPopup("Success", "✅ Week template updated successfully!", "success");
    } catch (err) {
      console.error("❌ updateWeekTemplate error:", err);
      showPopup("Error", "Failed to update week template", "error");
    }
  };

  /** === Assign a week template to a date range === */
  const saveAssignment = async () => {
    if (!assignments.weekId || !assignments.dateFrom)
      return showPopup(
        "Notice",
        "Please select a week plan and start date.",
        "info"
      );
    try {
      await fetch(`${API}/api/admin/week-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignments),
      });
      setAssignments({ dateFrom: "", dateTo: "", weekId: "" });
      showPopup("Success", "✅ Week assigned successfully!", "success");
    } catch (err) {
      console.error("❌ saveAssignment error:", err);
      showPopup("Error", "Failed to assign week plan", "error");
    }
  };

  /** === UI === */
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 style={{ color: "var(--brand-bg)" }}>📅 Week Planner</h2>
        <button
          className={styles.toggleBtn}
          onClick={() =>
            setMode(
              mode === "view" ? "create" : mode === "create" ? "edit" : "view"
            )
          }
        >
          {mode === "view"
            ? "➕ Create Week Plan"
            : mode === "create"
            ? "✏️ Edit Week Plan"
            : "👁 View Week Plans"}
        </button>
      </div>

      {/* === VIEW MODE === */}
      {mode === "view" && (
        <div className={styles.weekList}>
          {!weeks.length ? (
            <p style={{ color: "var(--brand-bg)", textAlign: "center" }}>
              No week plans yet.
            </p>
          ) : (
            weeks.map((w) => (
              <div key={w.id} className={styles.weekTemplateCard}>
                <h3 className={styles.weekTitle}>📅 {w.name}</h3>

                <table className={styles.weekTable}>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Assigned Day Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKDAYS.map((day, i) => (
                      <tr key={i}>
                        <td>{day}</td>
                        <td style={{ color: "var(--brand-accent)" }}>
                          {w.days?.[i] || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.actionRow}>
                  <button
                    className={styles.btnSmall}
                    onClick={() => handleEditSelect(w.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteWeek(w.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* === CREATE MODE === */}
      {mode === "create" && (
        <div className={styles.weekForm}>
          <h3 style={{ color: "var(--brand-bg)" }}>Create New Week Plan</h3>
          <input
            className={styles.input}
            placeholder="Week template name"
            value={weekName}
            onChange={(e) => setWeekName(e.target.value)}
          />
          <div className={styles.weekGrid}>
            {WEEKDAYS.map((day, i) => (
              <div key={i} className={styles.dayCard}>
                <h4 style={{ color: "var(--brand-accent)" }}>{day}</h4>
                <select
                  className={styles.input}
                  value={dayMapping[i]}
                  onChange={(e) => {
                    const copy = [...dayMapping];
                    copy[i] = e.target.value;
                    setDayMapping(copy);
                  }}
                >
                  <option value="">— Select day plan —</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button className={styles.btn} onClick={saveWeekTemplate}>
            💾 Save Week Template
          </button>
        </div>
      )}

      {/* === EDIT MODE === */}
      {mode === "edit" && (
        <div className={styles.weekForm}>
          <h3 style={{ color: "var(--brand-bg)" }}>Edit Week Plan</h3>
          <input
            className={styles.input}
            placeholder="Week name"
            value={weekName}
            onChange={(e) => setWeekName(e.target.value)}
          />
          <div className={styles.weekGrid}>
            {WEEKDAYS.map((day, i) => (
              <div key={i} className={styles.dayCard}>
                <h4 style={{ color: "var(--brand-accent)" }}>{day}</h4>
                <select
                  className={styles.input}
                  value={dayMapping[i]}
                  onChange={(e) => {
                    const copy = [...dayMapping];
                    copy[i] = e.target.value;
                    setDayMapping(copy);
                  }}
                >
                  <option value="">— Select day plan —</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button className={styles.btn} onClick={updateWeekTemplate}>
            💾 Update Week Template
          </button>
        </div>
      )}

      {/* === ASSIGN WEEK TO DATES === */}
      <div className={styles.card} style={{ marginTop: "2rem" }}>
        <h2 style={{ color: "var(--brand-bg)" }}>📆 Assign Week Plan</h2>
        <p className={styles.helper}>
          Choose a date range and assign a saved week plan.
        </p>
        <div className={styles.row}>
          <DatePicker
            selected={
              assignments.dateFrom ? new Date(assignments.dateFrom) : null
            }
            onChange={(date) =>
              setAssignments((a) => ({
                ...a,
                dateFrom: toLocalDateString(date),
              }))
            }
            placeholderText="From date"
            className={styles.input}
            dateFormat="yyyy-MM-dd"
          />

          <DatePicker
            selected={assignments.dateTo ? new Date(assignments.dateTo) : null}
            onChange={(date) =>
              setAssignments((a) => ({
                ...a,
                dateTo: toLocalDateString(date),
              }))
            }
            placeholderText="To date"
            className={styles.input}
            dateFormat="yyyy-MM-dd"
          />

          <select
            className={styles.input}
            value={assignments.weekId}
            onChange={(e) =>
              setAssignments((a) => ({ ...a, weekId: e.target.value }))
            }
          >
            <option value="">— Select week plan —</option>
            {weeks.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <button className={styles.btn} onClick={saveAssignment}>
          ✅ Assign Week Plan
        </button>
      </div>

      {/* ✅ Popup Component */}
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          type={popup.type}
          onClose={closePopup}
          onConfirm={popup.onConfirm}
        />
      )}
    </section>
  );
}
