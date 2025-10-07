import { useRef, useEffect, useState } from "react";
import styles from "./UsersPage.module.css";

export default function AddUserModal({ onClose, onConfirm }) {
  const overlayRef = useRef();
  const [error, setError] = useState("");

  // ✅ close when clicking outside popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    };
    const ref = overlayRef.current;
    ref.addEventListener("mousedown", handleClickOutside);
    return () => ref.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // ✅ handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const first_name = form.firstName.value.trim();
    const last_name = form.lastName.value.trim();
    const username = form.username.value.trim();
    const date_of_birth = form.dateOfBirth.value;
    const phone_raw = form.phone.value.trim();

    if (!first_name || !last_name || !username || !date_of_birth) {
      setError("All required fields must be filled.");
      return;
    }

    const birthYear = new Date(date_of_birth).getFullYear();
    const password = `${first_name}${birthYear}`; // ✅ auto password

    onConfirm({
      first_name,
      last_name,
      username,
      date_of_birth,
      phone_raw,
      password, // backend will hash it
    });
  };

  return (
    <div className={styles.popupOverlay} ref={overlayRef}>
      <div className={styles.popupCard}>
        <h2>➕ Create New User</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="firstName"
            placeholder="First Name"
            required
            className={styles.popupInput}
          />
          <input
            name="lastName"
            placeholder="Last Name"
            required
            className={styles.popupInput}
          />
          <input
            name="username"
            placeholder="Username"
            required
            className={styles.popupInput}
          />
          <input
            type="date"
            name="dateOfBirth"
            required
            className={styles.popupInput}
          />
          <input
            name="phone"
            placeholder="Phone Number"
            className={styles.popupInput}
          />

          {error && (
            <p style={{ color: "var(--brand-accent)", fontSize: "0.9rem" }}>
              {error}
            </p>
          )}

          <div className={styles.popupActions}>
            <button type="submit" className={styles.confirmBtn}>
              Create User
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
