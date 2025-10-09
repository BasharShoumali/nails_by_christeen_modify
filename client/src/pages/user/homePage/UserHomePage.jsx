import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./UserHomePage.module.css";

const RAW_API = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api/admin`;

export default function UserHomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ✅ Replace this later with the actual logged-in user
  const loggedUser = JSON.parse(localStorage.getItem("user")) || { id: 1 };

  /** Fetch available slots */
  const fetchSlots = async (date) => {
    try {
      setLoading(true);
      setError("");
      const dateStr = date.toISOString().split("T")[0];
      const res = await fetch(`${API}/schedule/slots?date=${dateStr}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load slots");
      setSlots(data.slots || []);
    } catch {
      setError("Failed to load slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
    setSelectedSlot(null);
  }, [selectedDate]);

  /** Upload selected image */
  const uploadImage = async () => {
    if (!file) return null;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/appointments/upload/inspo`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Upload failed");
      return data.filePath;
    } catch {
      setError("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  /** Handle booking a slot */
  const handleBook = async () => {
    if (!selectedSlot) return;
    try {
      setUploading(true);
      const imgPath = await uploadImage();
      const res = await fetch(`${API}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: loggedUser.id,
          work_date: selectedDate.toISOString().split("T")[0],
          slot: selectedSlot.slot,
          notes: note || "",
          inspo_img: imgPath,
        }),
      });

      if (!res.ok) throw new Error("Booking failed");
      setSuccessMsg("✅ Appointment booked successfully!");
      setSelectedSlot(null);
      setNote("");
      setFile(null);
      fetchSlots(selectedDate);
    } catch {
      setError("Failed to book appointment");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>💅 Book Your Appointment</h1>
        <p className={styles.subtitle}>
          Pick a date and choose an available time slot below.
        </p>
      </div>

      {/* === Date Picker === */}
      <div className={styles.datePickerWrap}>
        <span className={styles.icon}>📅</span>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          className={styles.datePicker}
          calendarClassName={styles.calendarPopup}
        />
      </div>

      {/* === Slots Grid === */}
      <section className={styles.slotsSection}>
        {loading ? (
          <p className={styles.loading}>Loading available slots...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : slots.length === 0 ? (
          <p className={styles.noSlots}>
            🎉 It’s a holiday — no available spots for this date.
          </p>
        ) : (
          <div className={styles.slotsGrid}>
            {slots.map((slot) => {
              const isMine = slot.user_id === loggedUser.id;
              return (
                <button
                  key={slot.slot}
                  className={`${styles.slotCard} ${
                    isMine
                      ? styles.mySlot
                      : slot.available
                      ? styles.available
                      : styles.taken
                  } ${selectedSlot?.slot === slot.slot ? styles.selected : ""}`}
                  disabled={!slot.available && !isMine}
                  onClick={() => slot.available && setSelectedSlot(slot)}
                >
                  <span className={styles.slotTime}>
                    {slot.slot.replace(/:00$/, "").slice(0, 5)}
                  </span>
                  <span className={styles.slotStatus}>
                    {isMine
                      ? "💅 It’s yours"
                      : slot.available
                      ? "Available"
                      : "Taken"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* === Booking Form === */}
      {selectedSlot && (
        <section className={styles.bookingForm}>
          <h3>
            🕓 Booking for <strong>{selectedSlot.slot}</strong> on{" "}
            {selectedDate.toDateString()}
          </h3>

          <textarea
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={styles.textarea}
          />

          <label className={styles.fileLabel}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selected = e.target.files[0];
                if (selected) setFile(selected);
              }}
            />
            {file ? `📸 ${file.name}` : "📷 Choose Inspo Image (optional)"}
          </label>

          {/* 🖼️ Image Preview */}
          {file && (
            <div className={styles.previewBox}>
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className={styles.previewImg}
              />
            </div>
          )}

          <button
            className={styles.bookBtn}
            onClick={handleBook}
            disabled={uploading}
          >
            {uploading ? "Booking..." : "💅 Book Now"}
          </button>

          {successMsg && <p className={styles.success}>{successMsg}</p>}
        </section>
      )}
    </main>
  );
}
