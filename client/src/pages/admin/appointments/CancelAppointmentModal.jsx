import styles from "./CloseAppointmentModal.module.css"; // reuse same styles

export default function CancelAppointmentModal({
  onClose,
  onConfirm,
  appointment,
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>❌ Cancel Appointment</h2>
        <p>
          Client: <strong>{appointment.username}</strong>
        </p>
        <p>Time: {appointment.slot}</p>

        <p style={{ marginTop: 8 }}>
          Are you sure you want to cancel this appointment?
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
          >
            Yes, cancel
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Keep it
          </button>
        </div>
      </div>
    </div>
  );
}
