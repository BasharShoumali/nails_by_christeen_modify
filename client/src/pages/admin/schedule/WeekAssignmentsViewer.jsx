import { useEffect, useState } from "react";
import styles from "./SchedulePage.module.css";
import Popup from "../../../components/popup/Popup"; // ✅ confirm popup

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function WeekAssignmentsViewer() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const loadAssignments = async () => {
    try {
      const res = await fetch(`${API}/api/admin/week-assignments`);
      if (!res.ok) throw new Error("Failed to load week assignments");
      const data = await res.json();
      setAssignments(data.data || data);
    } catch (err) {
      console.error("❌ loadAssignments error:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  // ✅ Helper to trim date strings
  const formatDate = (date) => (date ? date.slice(0, 10) : "—");

  // ✅ Delete handler
  const handleDelete = (id) => {
    showPopup(
      "Confirm Delete",
      "Are you sure you want to delete this week assignment?",
      "info",
      async () => {
        try {
          const res = await fetch(`${API}/api/admin/week-assignments/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete week assignment");
          await loadAssignments();
          showPopup(
            "Success",
            "🗑️ Week assignment deleted successfully!",
            "success"
          );
        } catch (err) {
          console.error("❌ handleDelete error:", err);
          showPopup("Error", "Failed to delete week assignment", "error");
        }
      }
    );
  };

  return (
    <section className={styles.card}>
      <h2 style={{ color: "var(--brand-bg)" }}>📖 Assigned Week Plans</h2>
      <p className={styles.helper}>
        Below are the week plans currently assigned to specific date ranges.
      </p>

      {loading ? (
        <p>Loading week assignments...</p>
      ) : !assignments.length ? (
        <p style={{ textAlign: "center", opacity: 0.8 }}>
          No assigned week plans found.
        </p>
      ) : (
        <div className={styles.scrollTableWrapper}>
          <table className={styles.weekTable}>
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Week Plan Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td className={styles.dateCell}>{formatDate(a.date_from)}</td>
                  <td className={styles.dateCell}>{formatDate(a.date_to)}</td>
                  <td style={{ color: "var(--brand-accent)", fontWeight: 600 }}>
                    {a.week_name || a.name || "—"}
                  </td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(a.id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
