import { useState } from "react";
import styles from "./CloseAppointmentModal.module.css";

export default function CloseAppointmentModal({
  onClose,
  onConfirm,
  appointment,
}) {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return alert("Enter a valid amount");
    onConfirm(value);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>💰 Close Appointment</h2>
        <p>
          Client: <strong>{appointment.username}</strong>
        </p>
        <p>Time: {appointment.slot}</p>

        <form onSubmit={handleSubmit}>
          <label>Enter amount paid (₪)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 150"
            min="0"
            step="0.01"
          />
          <div className={styles.actions}>
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
