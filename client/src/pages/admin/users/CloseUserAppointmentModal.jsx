// src/pages/admin/users/components/CloseUserAppointmentModal.jsx
import { useState, useRef, useEffect } from "react";
import styles from "./UserAppointmentModal.module.css";

export default function CloseUserAppointmentModal({
  onClose,
  onConfirm,
  appointment,
}) {
  const [amount, setAmount] = useState("");
  const overlayRef = useRef(null);

  // ✅ Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target === overlayRef.current) onClose();
    };
    const ref = overlayRef.current;
    ref?.addEventListener("mousedown", handleOutsideClick);
    return () => ref?.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  // ✅ Close with ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // ✅ Confirm submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    // ✅ ensure backend receives a number
    onConfirm(Number(value));
  };

  return (
    <div className={styles.popupOverlay} ref={overlayRef}>
      <div className={styles.popupCard}>
        <h2>💰 Close Appointment</h2>

        <p>
          Client: <strong>{appointment.username}</strong>
        </p>
        <p>Time: {appointment.slot || "—"}</p>

        <form onSubmit={handleSubmit}>
          <label>Enter amount paid (₪)</label>
          <input
            type="number"
            className={styles.popupInput}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 150"
            min="0"
            step="0.01"
          />

          <div className={styles.popupActions}>
            <button type="submit" className={styles.confirmBtn}>
              Confirm
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
