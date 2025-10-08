import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./UserAppointmentModal.module.css";
import InspoModal from "./InspoModal.jsx";

const RAW_API = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api/admin`;

// ✅ Local-safe date (no timezone shift)
const formatLocalDate = (date) => {
  if (!(date instanceof Date)) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function AddAppointmentModal({ user, onClose, onConfirm }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showInspoModal, setShowInspoModal] = useState(false);
  const [tempSlotData, setTempSlotData] = useState(null);
  const overlayRef = useRef(null);

  // 🧩 Close modal when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target === overlayRef.current) onClose();
    };
    const ref = overlayRef.current;
    ref.addEventListener("mousedown", handleClick);
    return () => ref.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // 🧩 Fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setError("");
      try {
        const dateStr = formatLocalDate(selectedDate);
        const res = await fetch(`${API}/schedule/slots?date=${dateStr}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load slots");
        setSlots(data.slots || []);
      } catch (err) {
        console.error("❌ Failed to load slots:", err);
        setError("Failed to load slots for this date");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDate]);

  // 🧩 Handle when InspoModal confirms appointment (no second POST)
  const handleAppointmentCreated = () => {
    setShowInspoModal(false);
    onConfirm(); // just refresh appointments
  };

  return (
    <>
      <div className={styles.popupOverlay} ref={overlayRef}>
        <div className={styles.popupCard}>
          <h2>➕ New Appointment</h2>

          {/* === Date Picker === */}
          <DatePicker
            selected={selectedDate}
            onChange={(d) => {
              setSelectedSlot(null);
              setSelectedDate(d);
            }}
            dateFormat="yyyy-MM-dd"
            className={styles.popupInput}
          />

          {/* === Slots Table === */}
          {loading ? (
            <p>Loading slots...</p>
          ) : error ? (
            <p style={{ color: "var(--brand-accent)" }}>{error}</p>
          ) : slots.length === 0 ? (
            <p>No slots found for this date.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.slotTable}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Booked By</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((s) => (
                    <tr
                      key={s.slot}
                      onClick={() => s.available && setSelectedSlot(s.slot)}
                      className={`${styles.slotRow} ${
                        s.available ? styles.available : styles.taken
                      } ${s.slot === selectedSlot ? styles.selected : ""}`}
                    >
                      <td className={styles.slotTime}>{s.slot}</td>
                      <td className={styles.slotStatus}>
                        {s.available ? "Available" : "Taken"}
                      </td>
                      <td className={styles.slotUser}>
                        {s.available ? (
                          <button
                            className={styles.bookBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSlot(s.slot);
                              setTempSlotData({ slot: s.slot });
                              setShowInspoModal(true);
                            }}
                          >
                            Book
                          </button>
                        ) : (
                          s.username || "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* === Actions === */}
          <div className={styles.popupActions}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* === Inspo Modal === */}
      {showInspoModal && tempSlotData && (
        <InspoModal
          user={user}
          slot={tempSlotData.slot}
          date={formatLocalDate(selectedDate)}
          onClose={() => setShowInspoModal(false)}
          onConfirm={handleAppointmentCreated} // ✅ one-way confirm
        />
      )}
    </>
  );
}
