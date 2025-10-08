// src/pages/admin/users/components/UserDetails.jsx
import styles from "./UsersPage.module.css";
import StatusChart from "./StatusChart.jsx";
import AppointmentsTable from "./AppointmentsTable.jsx";

export default function UserDetails({
  user,
  totalAmount,
  statusData,
  appointments,
  loading,
  onClose,
  onCancel,
  onAddAppointment,
}) {
  return (
    <section className={styles.userDetails}>
      {/* === Header with total + Add button === */}
      <div className={styles.userHeader}>
        <h2>📅 Appointments for {user.username}</h2>

        <div className={styles.headerActions}>
          <button className={styles.addBtn} onClick={onAddAppointment}>
            ➕ Add Appointment
          </button>
          <span className={styles.totalPaid}>
            💵 Total Paid: ₪{totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* === Chart + Table === */}
      <div className={styles.summaryGrid}>
        <StatusChart
          data={statusData}
          user={user}
          appointments={appointments}
        />

        <AppointmentsTable
          appointments={appointments}
          loading={loading}
          onClose={onClose}
          onCancel={onCancel}
        />
      </div>
    </section>
  );
}
