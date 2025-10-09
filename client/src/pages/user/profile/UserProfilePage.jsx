import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./UserProfilePage.module.css";

const RAW_API = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;

function toLocalDateString(date) {
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");

  const loggedUser = JSON.parse(localStorage.getItem("user")) || { id: 1 };

  // 🧭 Load user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/users/${loggedUser.id}`);
        const data = await res.json();
        if (res.ok) setUser(data);
        else setMessage(data.error || "Failed to load profile");
      } catch {
        setMessage("⚠️ Failed to load profile info.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 🧩 Update a specific field via PATCH
  const saveField = async (field, value) => {
    if (!user || updating) return;
    try {
      setUpdating(true);
      setMessage("");
      const res = await fetch(`${API}/users/${user.id}/${field}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // Update local state + storage
      const updated = { ...user, [field]: value };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setMessage("✅ Updated successfully!");
    } catch {
      setMessage("⚠️ Failed to update field.");
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  // 🧩 Password update
  const handlePasswordUpdate = async () => {
    if (!newPwd || !confirmPwd) return;
    if (newPwd !== confirmPwd) {
      setPwdError("❌ Passwords do not match");
      return;
    }
    setPwdError("");
    await saveField("password", newPwd);
    setNewPwd("");
    setConfirmPwd("");
  };

  if (loading) return <p className={styles.loading}>Loading profile...</p>;
  if (!user) return <p className={styles.error}>{message}</p>;

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>👤 My Profile</h1>
      {message && <p className={styles.info}>{message}</p>}

      <div className={styles.card}>
        {/* === First Name === */}
        <div className={styles.row}>
          <label>First Name</label>
          <div className={styles.inlineEdit}>
            <input type="text" defaultValue={user.first_name} id="fname" />
            <button
              type="button"
              disabled={updating}
              onClick={() =>
                saveField(
                  "first_name",
                  document.getElementById("fname").value.trim()
                )
              }
            >
              Save
            </button>
          </div>
        </div>

        {/* === Last Name === */}
        <div className={styles.row}>
          <label>Last Name</label>
          <div className={styles.inlineEdit}>
            <input type="text" defaultValue={user.last_name} id="lname" />
            <button
              type="button"
              disabled={updating}
              onClick={() =>
                saveField(
                  "last_name",
                  document.getElementById("lname").value.trim()
                )
              }
            >
              Save
            </button>
          </div>
        </div>

        {/* === Date of Birth === */}
        <div className={styles.row}>
          <label>Date of Birth</label>
          <div className={styles.inlineEdit}>
            <DatePicker
              selected={
                user.date_of_birth
                  ? new Date(user.date_of_birth + "T00:00")
                  : null
              }
              onChange={(date) =>
                saveField("date_of_birth", toLocalDateString(date))
              }
              dateFormat="yyyy-MM-dd"
              className={styles.dateInput}
              calendarClassName={styles.calendarPopup}
            />
          </div>
        </div>

        {/* === Phone === */}
        <div className={styles.row}>
          <label>Phone Number</label>
          <div className={styles.inlineEdit}>
            <input type="tel" defaultValue={user.phone_raw || ""} id="phone" />
            <button
              type="button"
              disabled={updating}
              onClick={() =>
                saveField(
                  "phone_raw",
                  document.getElementById("phone").value.trim()
                )
              }
            >
              Save
            </button>
          </div>
        </div>

        {/* === Password === */}
        <div className={styles.row}>
          <label>Change Password</label>
          <form
            className={styles.inlineEdit}
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordUpdate();
            }}
          >
            <input
              type="text"
              name="username"
              autoComplete="username"
              style={{ display: "none" }}
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              autoComplete="new-password"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button type="submit" disabled={updating || !newPwd || !confirmPwd}>
              Save
            </button>
          </form>
          {pwdError && <p className={styles.error}>{pwdError}</p>}
        </div>
      </div>
    </main>
  );
}
