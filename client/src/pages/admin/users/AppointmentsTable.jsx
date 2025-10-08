import { useState } from "react";
import styles from "./UsersPage.module.css";
import CloseUserAppointmentModal from "./CloseUserAppointmentModal";
import CancelUserAppointmentModal from "./CancelUserAppointmentModal";

export default function AppointmentsTable({
  appointments = [],
  loading = false,
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
                <th>Date</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Inspo Image</th>
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
                appointments.map((a) => {
                  // ✅ ensure clean image URL
                  const imgSrc =
                    a.inspo_img && a.inspo_img.startsWith("http")
                      ? a.inspo_img
                      : a.inspo_img
                      ? `${
                          import.meta.env.VITE_API_BASE ||
                          "http://localhost:4000"
                        }/${a.inspo_img.replace(/^\/?/, "")}`
                      : null;

                  return (
                    <tr key={a.id}>
                      {/* 🗓 Date + Time */}
                      <td>
                        {formatDate(a.work_date)}{" "}
                        {a.slot && (
                          <span className={styles.slot}>{a.slot}</span>
                        )}
                      </td>

                      {/* 🧾 Status */}
                      <td className={styles[a.status]}>
                        <span className={styles.statusText}>{a.status}</span>
                        {a.status === "closed" && (
                          <span className={styles.amountBox}>
                            ₪{Number(a.amount_paid || 0).toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* 📝 Notes */}
                      <td className={styles.notesCell}>
                        {a.notes?.trim() ? a.notes : "—"}
                      </td>

                      {/* 🖼️ Inspo Image */}
                      <td className={styles.imageCell}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt="Inspo"
                            className={styles.inspoImg}
                            onError={(e) => {
                              e.currentTarget.src =
                                "data:image/svg+xml;charset=UTF-8," +
                                encodeURIComponent(
                                  `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'>
                                  <rect width='100%' height='100%' fill='#ddd'/>
                                  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
                                  font-size='10' fill='#555'>No Img</text>
                                  </svg>`
                                );
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* ⚙️ Actions */}
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
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ Close Modal */}
      {modalType === "close" && selectedAppointment && (
        <CloseUserAppointmentModal
          appointment={selectedAppointment}
          onClose={closeModal}
          onConfirm={handleConfirmClose}
        />
      )}

      {/* 🚫 Cancel Modal */}
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
