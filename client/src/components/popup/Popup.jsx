import { useEffect, useState } from "react";
import styles from "./Popup.module.css";

export default function Popup({
  title = "Notice",
  message,
  type = "info", // "success" | "error" | "info"
  onClose,
  onConfirm, // ✅ optional confirm callback
  autoClose = true,
}) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let timer;
    if (
      autoClose &&
      !onConfirm &&
      message &&
      (type === "success" || type === "info")
    ) {
      timer = setTimeout(() => handleClose(), 3000);
    }
    return () => clearTimeout(timer);
  }, [autoClose, message, type, onConfirm]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose?.(), 250);
  };

  const handleConfirm = () => {
    setClosing(true);
    setTimeout(() => {
      onClose?.();
      onConfirm?.();
    }, 250);
  };

  if (!message) return null;

  return (
    <div className={styles.popupOverlay} onClick={handleClose}>
      <div
        className={`${styles.popupCard} ${styles[type]} ${
          closing ? styles.fadeOut : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.popupTitle}>{title}</h3>
        <p className={styles.popupMsg}>{message}</p>

        {onConfirm ? (
          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
          >
            <button className={styles.popupBtn} onClick={handleConfirm}>
              Yes, Delete
            </button>
            <button
              className={styles.popupBtn}
              style={{ background: "#777" }}
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button className={styles.popupBtn} onClick={handleClose}>
            OK
          </button>
        )}
      </div>
    </div>
  );
}
