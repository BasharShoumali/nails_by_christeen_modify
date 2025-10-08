// src/pages/admin/users/UsersPage.jsx
import { useEffect, useState } from "react";
import styles from "./UsersPage.module.css";
import UsersTable from "./UsersTable.jsx";
import UserDetails from "./UserDetails.jsx";
import AddUserModal from "./AddUserModal.jsx";

// ===== Base URLs =====
const RAW_API = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;
const ADMIN_API = `${API}/admin`; // ✅ for admin-only endpoints

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [statusData, setStatusData] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // ===== Fetch all users =====
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
    }
  };

  // ===== Fetch selected user's appointments =====
  const fetchAppointments = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/${userId}/appointments`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();

      setAppointments(data || []);

      // compute total amount paid
      const total = data
        .filter((a) => a.status === "closed" && a.amount_paid)
        .reduce((sum, a) => sum + Number(a.amount_paid || 0), 0);
      setTotalAmount(total);

      // compute chart data
      const summary = ["closed", "open", "canceled"].map((s) => ({
        name: s,
        value: data.filter((a) => a.status === s).length,
      }));
      setStatusData(summary);
    } catch (err) {
      console.error("❌ Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Select user =====
  const handleSelectUser = (u) => {
    setSelectedUser(u);
    fetchAppointments(u.id);
  };

  // ===== Close appointment =====
  const handleClose = async (id, amount) => {
    try {
      const res = await fetch(`${API}/admin/appointments/${id}/close`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_paid: amount }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("❌ Failed to close:", data.error || res.statusText);
        alert("Failed to close appointment");
        return;
      }

      console.log(
        "✅ Appointment closed:",
        data.message || "Updated successfully"
      );

      // ✅ Refresh the user’s appointments
      await fetchAppointments(selectedUser.id);
    } catch (err) {
      console.error("❌ Error closing appointment:", err);
      alert("Something went wrong closing the appointment");
    }
  };

  // ===== Cancel appointment =====
  const handleCancel = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/appointments/${id}/cancel`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("❌ Failed to cancel:", err.error || res.statusText);
        return;
      }

      await fetchAppointments(selectedUser.id);
    } catch (err) {
      console.error("❌ Error canceling appointment:", err);
    }
  };

  // ===== Add appointment (for the selected user) =====
  const handleAddAppointment = () => {
    console.log("TODO: open Add Appointment modal for user:", selectedUser);
  };

  // ===== Add user =====
  const handleAddUser = async (userData) => {
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(
          "❌ Failed to create user:",
          data.error || res.statusText
        );
        return;
      }

      console.log("✅ User created:", data);
      setShowAddUserModal(false);
      fetchUsers(); // refresh the table
    } catch (err) {
      console.error("❌ Error creating user:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>👥 Users Management</h1>

      {/* ==== USERS TABLE ==== */}
      <UsersTable
        users={users}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        onAddUser={() => setShowAddUserModal(true)} // ✅ open Add User modal
      />

      {/* ==== USER DETAILS (appointments + charts) ==== */}
      {selectedUser && (
        <UserDetails
          user={selectedUser}
          totalAmount={totalAmount}
          statusData={statusData}
          appointments={appointments}
          loading={loading}
          onClose={handleClose}
          onCancel={handleCancel}
          onAddAppointment={handleAddAppointment}
        />
      )}

      {/* ==== ADD USER MODAL ==== */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onConfirm={handleAddUser}
        />
      )}
    </main>
  );
}
