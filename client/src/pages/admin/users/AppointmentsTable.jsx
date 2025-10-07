// src/pages/admin/users/components/AppointmentsTable.jsx
import { useState } from "react";
import styles from "./UsersPage.module.css";
import CloseUserAppointmentModal from "./CloseUserAppointmentModal";
import CancelUserAppointmentModal from "./CancelUserAppointmentModal";

export default function AppointmentsTable({
  appointments,
  loading,
  onClose,
  onCancel,
}) {
  const [modalType, setModalType] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const openModal = (type, appointment) => {
    setSelectedAppointment(appointment);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedAppointment(null);
  };

  const handleConfirmClose = (amount) => {
    if (!selectedAppointment) return;
    onClose(selectedAppointment.id, amount);
    closeModal();
  };

  const handleConfirmCancel = () => {
    if (!selectedAppointment) return;
    onCancel(selectedAppointment.id);
    closeModal();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    // Remove timezone part if ISO (keep only YYYY-MM-DD)
    return dateString.includes("T")
      ? dateString.split("T")[0]
      : new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <>
      <div className={styles.appointmentsTable}>
        {loading ? (
          <p>Loading appointments...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date Ordered</th>
                <th>Date of Appointment</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.noData}>
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{formatDate(a.created_at)}</td>
                    <td>
                      {formatDate(a.work_date)}{" "}
                      {a.slot && <span>{a.slot}</span>}
                    </td>
                    <td className={styles[a.status]}>{a.status}</td>
                    <td>{a.amount_paid ? `₪${a.amount_paid}` : "-"}</td>
                    <td>
                      {a.status === "open" ? (
                        <>
                          <button
                            onClick={() => openModal("close", a)}
                            className={styles.closeBtn}
                          >
                            Close
                          </button>
                          <button
                            onClick={() => openModal("cancel", a)}
                            className={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* === Modals === */}
      {modalType === "close" && selectedAppointment && (
        <CloseUserAppointmentModal
          appointment={selectedAppointment}
          onClose={closeModal}
          onConfirm={handleConfirmClose}
        />
      )}

      {modalType === "cancel" && selectedAppointment && (
        <CancelUserAppointmentModal
          appointment={selectedAppointment}
          onClose={closeModal}
          onConfirm={handleConfirmCancel}
        />
      )}
    </>
  );
}
