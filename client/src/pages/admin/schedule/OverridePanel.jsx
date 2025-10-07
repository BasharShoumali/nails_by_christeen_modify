import { useState } from "react";
import styles from "./SchedulePage.module.css";
import Popup from "../../../components/popup/Popup"; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function OverridePanel({ schedules, overrides, onChanged }) {
  const [date, setDate] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [reason, setReason] = useState("");

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

  /** === Save new override === */
  const saveOverride = async () => {
    if (!date) return showPopup("Notice", "Pick a date first.", "info");
    try {
      const res = await fetch(`${API}/api/admin/overrides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_date: date,
          override_schedule_id: scheduleId || null,
          is_open: scheduleId ? 1 : 0,
          notes: reason || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save override");
      setDate("");
      setScheduleId("");
      setReason("");
      onChanged();
      showPopup("Success", "✅ Override saved successfully!", "success");
    } catch (err) {
      console.error("❌ saveOverride error:", err);
      showPopup("Error", "Failed to save override", "error");
    }
  };

  /** === Delete override === */
  const handleDelete = (work_date) => {
    showPopup(
      "Confirm Delete",
      `Are you sure you want to delete the override for ${work_date}?`,
      "info",
      async () => {
        closePopup();
        try {
          const res = await fetch(`${API}/api/admin/overrides/${work_date}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete override");
          showPopup("Success", "🗑️ Override deleted successfully!", "success");
          onChanged();
        } catch (err) {
          console.error("❌ handleDelete error:", err);
          showPopup("Error", "Failed to delete override", "error");
        }
      }
    );
  };

  /** === Format dates nicely === */
  const formatDate = (d) => (d ? d.slice(0, 10) : "—");

  return (
    <section className={styles.card}>
      <h2 style={{ color: "var(--brand-bg)" }}>⚡ Overrides</h2>
      <p className={styles.helper}>
        Replace a single day’s plan. For example: make a specific Friday a
        “Holiday”.
      </p>

      {/* Create override form */}
      <div className={styles.row}>
        <DatePicker
          selected={date ? new Date(date) : null}
          onChange={(d) => setDate(d ? d.toISOString().split("T")[0] : "")}
          placeholderText="Pick a date"
          className={styles.input}
          dateFormat="yyyy-MM-dd"
        />
        <select
          className={styles.input}
          value={scheduleId}
          onChange={(e) => setScheduleId(e.target.value)}
        >
          <option value="">— Closed —</option>
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          className={styles.input}
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button className={styles.btn} onClick={saveOverride}>
          💾 Save
        </button>
      </div>

      {/* Table of overrides */}
      <div className={styles.scrollTableWrapper}>
        <table className={styles.weekTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Template</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {overrides.map((o) => (
              <tr key={o.work_date}>
                <td className={styles.dateCell}>{formatDate(o.work_date)}</td>
                <td>{o.override_schedule_name || "—"}</td>
                <td
                  style={{
                    color: o.is_open ? "green" : "var(--brand-accent)",
                    fontWeight: 600,
                  }}
                >
                  {o.is_open ? "Open" : "Closed"}
                </td>
                <td>{o.notes || "—"}</td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(o.work_date)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
            {!overrides.length && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", opacity: 0.7 }}>
                  No overrides yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup component */}
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
