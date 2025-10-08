import { useEffect, useState } from "react";
import styles from "./SchedulePage.module.css";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function DayTemplateManager({ schedules, onChanged }) {
  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // local popup state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // === Load slots + selected template when editing ===
  useEffect(() => {
    if (mode === "edit" && selectedId) {
      (async () => {
        const [slotsRes, schedulesRes] = await Promise.all([
          fetch(`${API}/api/admin/schedule-slots/${selectedId}`),
          fetch(`${API}/api/admin/schedules`),
        ]);
        const slotsData = await slotsRes.json();
        const schedulesData = await schedulesRes.json();
        setSlots(slotsData);
        const selected = schedulesData.find((s) => s.id == selectedId);
        setSelectedTemplate(selected || null);
      })();
    } else {
      setSlots([]);
      setSelectedTemplate(null);
    }
  }, [selectedId, mode]);

  // === Add new template ===
  const handleAddTemplate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch(`${API}/api/admin/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, notes }),
    });
    setName("");
    setNotes("");
    onChanged();
  };

  // === Add slot ===
  const handleAddSlot = async () => {
    if (!selectedId || !newSlot) return;
    await fetch(`${API}/api/admin/schedule-slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule_id: selectedId, start_time: newSlot }),
    });
    setNewSlot("");
    const res = await fetch(`${API}/api/admin/schedule-slots/${selectedId}`);
    setSlots(await res.json());
  };

  // === Delete slot ===
  const handleDeleteSlot = async (slotId) => {
    await fetch(`${API}/api/admin/schedule-slots/${selectedId}/${slotId}`, {
      method: "DELETE",
    });
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  // === Delete whole template ===
  const handleDeleteTemplate = async () => {
    if (!selectedId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API}/api/admin/schedules/${selectedId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete day template");
      setSelectedId("");
      setSelectedTemplate(null);
      setSlots([]);
      onChanged();
    } catch (err) {
      console.error("❌ handleDeleteTemplate error:", err);
      alert("Failed to delete day template.");
    } finally {
      setIsDeleting(false);
      setConfirmVisible(false);
    }
  };

  // === Date formatter for created_at ===
  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>🧩 Day Templates</h2>
        <button
          className={styles.toggleBtn}
          onClick={() => setMode(mode === "add" ? "edit" : "add")}
        >
          {mode === "add" ? "✏️ Switch to Edit Mode" : "➕ Switch to Add Mode"}
        </button>
      </div>

      <p className={styles.helper}>
        Templates define reusable day types (like “Regular Day” or “Holiday”)
        and hold their available appointment slots.
      </p>

      {mode === "add" ? (
        <>
          {/* === ADD MODE === */}
          <form className={styles.row} onSubmit={handleAddTemplate}>
            <input
              className={styles.input}
              placeholder="Template name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className={styles.input}
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button className={styles.btn}>Add Template</button>
          </form>
        </>
      ) : (
        <>
          {/* === EDIT MODE === */}
          <div className={styles.row}>
            <select
              className={styles.input}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">— Select a template —</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Show Template Info */}
          {selectedTemplate && (
            <div className={styles.templateInfo}>
              <h3>{selectedTemplate.name}</h3>
              <p>
                <strong className={styles.noteLabel}>Note:</strong>{" "}
                {selectedTemplate.notes || "No notes provided."}
              </p>
              <p>
                <strong>Created:</strong> {fmtDate(selectedTemplate.created_at)}
              </p>
              <button
                className={`${styles.btn} ${styles.deleteBtn}`}
                onClick={() => setConfirmVisible(true)}
              >
                🗑 Delete Template
              </button>
            </div>
          )}

          {selectedId && (
            <>
              <div className={styles.row}>
                <input
                  type="time"
                  className={styles.input}
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                />
                <button className={styles.btn} onClick={handleAddSlot}>
                  ➕ Add Slot
                </button>
              </div>

              <table className={`${styles.table} ${styles.slotTable}`}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((s) => (
                    <tr key={s.id}>
                      <td>{s.start_time.slice(0, 5)}</td>
                      <td>
                        <button
                          className={`${styles.btn} ${styles.btnSmall}`}
                          onClick={() => handleDeleteSlot(s.id)}
                        >
                          ✖ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!slots.length && (
                    <tr>
                      <td colSpan={2} style={{ opacity: 0.7 }}>
                        No slots yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </>
      )}

      {/* === Local confirmation popup === */}
      {confirmVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete the day template{" "}
              <strong>{selectedTemplate?.name}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setConfirmVisible(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleDeleteTemplate}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
