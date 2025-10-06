import styles from "./Popup.module.css";

export default function Popup({
  title = "Notice",
  message,
  type = "info", // "success" | "error" | "info"
  onClose,
}) {
  if (!message) return null;

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div
        className={`${styles.popupCard} ${styles[type]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.popupTitle}>{title}</h3>
        <p className={styles.popupMsg}>{message}</p>
        <button className={styles.popupBtn} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
