import { useState, useRef } from "react";
import styles from "./UserAppointmentModal.module.css";

const RAW_API = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;

export default function InspoModal({ slot, date, user, onClose, onConfirm }) {
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false); // ✅ prevent double submission
  const [error, setError] = useState("");
  const overlayRef = useRef(null);

  // 🧩 Close when clicking outside
  const handleClickOutside = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // 🧩 Handle image select + preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // 🧩 Confirm upload + create appointment
  const handleConfirm = async () => {
    // 🚫 Guard against multiple calls
    if (loading || submittedOnce) return;

    setLoading(true);
    setSubmittedOnce(true);
    setError("");

    try {
      let inspoPath = null;

      // 1️⃣ Upload inspo image if selected
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadRes = await fetch(
          `${API}/admin/appointments/upload/inspo`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();

        inspoPath = uploadData.filePath || null;
        console.log("📸 Upload returned:", uploadData);
        console.log("📤 Inspo path sent:", inspoPath);
      }

      // 2️⃣ Create appointment
      const res = await fetch(`${API}/admin/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          work_date: date,
          slot,
          notes,
          inspo_img: inspoPath,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to create appointment");

      console.log("✅ Appointment created successfully");
      onConfirm(data);
    } catch (err) {
      console.error("❌ Failed to create appointment:", err);
      setError(err.message);
      setSubmittedOnce(false); // allow retry if it failed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.popupOverlay}
      ref={overlayRef}
      onClick={handleClickOutside}
    >
      <div className={`${styles.popupCard} ${styles.inspoCard}`}>
        <h2>📸 Add Inspo & Notes</h2>

        <p className={styles.metaText}>
          <strong>Date:</strong> {date} <br />
          <strong>Slot:</strong> {slot}
        </p>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.uploadSection}>
          <div className={styles.uploadBox}>
            <label htmlFor="inspoImg" className={styles.customFileBtn}>
              📁 Choose File
            </label>
            <input
              id="inspoImg"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.hiddenFileInput}
            />
            {image && <p className={styles.fileName}>{image.name}</p>}
          </div>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className={styles.previewImgLarge}
            />
          )}
        </div>

        <textarea
          className={styles.textArea}
          placeholder="Add appointment notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className={styles.popupActions}>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={loading || submittedOnce}
          >
            {loading ? "Saving..." : submittedOnce ? "Saved" : "Confirm"}
          </button>

          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
