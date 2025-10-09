import { useEffect, useState } from "react";
import styles from "./UserAppointmentsPage.module.css";

const RAW_API = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;

export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImg, setPreviewImg] = useState(null);

  const [confirmPopup, setConfirmPopup] = useState({
    show: false,
    appointmentId: null,
  });

  const loggedUser = JSON.parse(localStorage.getItem("user")) || { id: 1 };

  /** Fetch user appointments */
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API}/users/${loggedUser.id}/appointments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load appointments");
      setAppointments(data || []);
    } catch {
      setError("Failed to load your appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  /** Cancel appointment */
  const confirmCancel = (id) => {
    setConfirmPopup({ show: true, appointmentId: id });
  };

  const handleCancelConfirm = async () => {
    const { appointmentId } = confirmPopup;
    if (!appointmentId) return;
    try {
      // ✅ Use the same working admin route
      const res = await fetch(
        `${API}/admin/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) throw new Error("Cancel failed");
      setConfirmPopup({ show: false, appointmentId: null });
      fetchAppointments();
    } catch {
      setError("Failed to cancel appointment. Try again later.");
      setConfirmPopup({ show: false, appointmentId: null });
    }
  };

  const handleCancelClose = () => {
    setConfirmPopup({ show: false, appointmentId: null });
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-GB") : "-";

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>💅 My Appointments</h1>

      {loading && (
        <p className={styles.loading}>Loading your appointments...</p>
      )}
      {error && <p className={styles.error}>⚠️ {error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <p className={styles.noData}>You have no appointments yet.</p>
      )}

      {!loading && appointments.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Inspo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{formatDate(a.work_date)}</td>
                  <td>{a.slot?.slice(0, 5)}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        a.status === "closed"
                          ? styles.closed
                          : a.status === "canceled"
                          ? styles.canceled
                          : styles.open
                      }`}
                    >
                      {a.status === "closed"
                        ? "✔ Completed"
                        : a.status === "canceled"
                        ? "❌ Canceled"
                        : "💅 Upcoming"}
                    </span>
                  </td>
                  <td>{a.notes || "—"}</td>
                  <td>
                    {a.inspo_img ? (
                      <img
                        src={
                          a.inspo_img.startsWith("http")
                            ? a.inspo_img
                            : `${RAW_API}/${a.inspo_img.replace(/^\/?/, "")}`
                        }
                        alt="Inspo"
                        className={styles.inspoImg}
                        onClick={() =>
                          setPreviewImg(
                            a.inspo_img.startsWith("http")
                              ? a.inspo_img
                              : `${RAW_API}/${a.inspo_img.replace(/^\/?/, "")}`
                          )
                        }
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {a.status === "open" ? (
                      <button
                        onClick={() => confirmCancel(a.id)}
                        className={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🖼️ Preview Popup */}
      {previewImg && (
        <div
          className={styles.previewOverlay}
          onClick={() => setPreviewImg(null)}
        >
          <div className={styles.previewBox}>
            <img
              src={previewImg}
              alt="Preview"
              className={styles.previewImg}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* ✅ Cancel Confirmation Popup */}
      {confirmPopup.show && (
        <div className={styles.modalOverlay} onClick={handleCancelClose}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Cancel Appointment</h3>
            <p>
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.confirmBtn}
                onClick={handleCancelConfirm}
              >
                Yes, Cancel
              </button>
              <button className={styles.cancelBtn} onClick={handleCancelClose}>
                No, Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
