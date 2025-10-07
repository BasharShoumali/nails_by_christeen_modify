import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./AppointmentsPage.module.css";
import CloseAppointmentModal from "./CloseAppointmentModal";
import CancelAppointmentModal from "./CancelAppointmentModal";

const RAW_API = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api/admin`;

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Close modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  // Fetch appointments for a given date
  const fetchAppointments = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const queryDate = date ? date.toISOString().split("T")[0] : "";
      const res = await fetch(`${API}/appointments?date=${queryDate}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();

      const safe = Array.isArray(data) ? data : [];
      setAppointments(safe);

      // Total of closed appointments for the day
      const total = safe
        .filter((a) => a.status === "closed" && a.amount_paid != null)
        .reduce((sum, a) => sum + Number(a.amount_paid || 0), 0);
      setTotalAmount(total);
    } catch (err) {
      console.error("❌ Error fetching appointments:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  // Open Close modal
  const handleClose = (appt) => {
    setSelectedAppointment(appt);
    setShowModal(true);
  };

  // Confirm close appointment with amount
  const confirmClose = async (amount) => {
    try {
      await fetch(`${API}/appointments/${selectedAppointment.id}/close`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_paid: amount }),
      });
      setShowModal(false);
      setSelectedAppointment(null);
      fetchAppointments(selectedDate);
    } catch (err) {
      console.error("❌ Close failed:", err);
    }
  };

  // Open Cancel modal
  const handleCancelClick = (appt) => {
    setAppointmentToCancel(appt);
    setShowCancelModal(true);
  };

  // Confirm cancel
  const confirmCancel = async () => {
    try {
      await fetch(`${API}/appointments/${appointmentToCancel.id}/cancel`, {
        method: "PATCH",
      });
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      fetchAppointments(selectedDate);
    } catch (err) {
      console.error("❌ Cancel failed:", err);
    }
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>📅 All Appointments</h1>

      <div className={styles.controls}>
        <div className={styles.datePickerWrap}>
          <span className={styles.icon}>📅</span>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a date"
            className={styles.datePicker}
            calendarClassName={styles.calendarPopup}
          />
        </div>

        <div className={styles.dateBox}>
          {selectedDate ? selectedDate.toDateString() : "No date selected"}
        </div>
      </div>

      {/* Daily total */}
      <h2 className={styles.total}>
        💵 Total Amount: ₪{totalAmount.toFixed(2)}
      </h2>

      {error && <p className={styles.error}>⚠️ {error}</p>}
      {loading && <p className={styles.loading}>Loading appointments...</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Username</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Inspo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="7" className={styles.noData}>
                No appointments found for this date.
              </td>
            </tr>
          ) : (
            appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.slot}</td>
                <td>{a.username}</td>
                <td>{a.phone_raw || "-"}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      a.status === "open"
                        ? styles.statusOpen
                        : a.status === "closed"
                        ? styles.statusClosed
                        : styles.statusCanceled
                    }`}
                  >
                    {a.status}
                  </span>

                  {a.status === "closed" && a.amount_paid != null && (
                    <div className={styles.paidBox}>
                      Paid: ₪{Number(a.amount_paid).toFixed(2)}
                    </div>
                  )}
                </td>
                <td>{a.notes || "-"}</td>
                <td>
                  {a.inspo_img ? (
                    <img
                      src={a.inspo_img}
                      alt="Inspo"
                      className={styles.inspoImg}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {a.status === "open" ? (
                    <>
                      <button
                        onClick={() => handleClose(a)}
                        className={styles.closeBtn}
                      >
                        Close
                      </button>
                      <button
                        onClick={() => handleCancelClick(a)}
                        className={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <span className={styles.statusDone}>✔ {a.status}</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Close modal */}
      {showModal && (
        <CloseAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setShowModal(false)}
          onConfirm={confirmClose}
        />
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <CancelAppointmentModal
          appointment={appointmentToCancel}
          onClose={() => setShowCancelModal(false)}
          onConfirm={confirmCancel}
        />
      )}
    </main>
  );
}
