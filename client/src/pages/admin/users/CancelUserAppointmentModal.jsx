// src/pages/admin/users/components/CancelUserAppointmentModal.jsx
import { useRef, useEffect } from "react";
import styles from "./UserAppointmentModal.module.css";

export default function CancelUserAppointmentModal({
  onClose,
  onConfirm,
  appointment,
}) {
  const overlayRef = useRef(null);

  // ✅ Allow closing when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target === overlayRef.current) onClose();
    };
    const ref = overlayRef.current;
    ref?.addEventListener("mousedown", handleOutsideClick);
    return () => ref?.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  // ✅ Allow closing with Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className={styles.popupOverlay} ref={overlayRef}>
      <div className={styles.popupCard}>
        <h2>❌ Cancel Appointment</h2>
        <p>
          Client: <strong>{appointment.username}</strong>
        </p>
        <p>Time: {appointment.slot || "—"}</p>

        <p style={{ marginTop: 8 }}>
          Are you sure you want to cancel this appointment?
        </p>

        <div className={styles.popupActions}>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
          >
            Yes, Cancel
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Keep It
          </button>
        </div>
      </div>
    </div>
  );
}
