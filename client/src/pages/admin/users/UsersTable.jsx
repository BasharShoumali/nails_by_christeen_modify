import { useState, useMemo } from "react";
import styles from "./UsersPage.module.css";

export default function UsersTable({
  users,
  selectedUser,
  onSelectUser,
  onAddUser,
}) {
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [search, setSearch] = useState("");

  // ===== Sorting =====
  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const sortArrow = (key) =>
    sortConfig.key !== key ? "⇅" : sortConfig.direction === "asc" ? "▲" : "▼";

  // ===== Filtering + Sorting =====
  const filteredAndSorted = useMemo(() => {
    const query = search.toLowerCase().trim();
    const filtered = users.filter(
      (u) =>
        u.username?.toLowerCase().includes(query) ||
        u.phone_raw?.toLowerCase().includes(query) ||
        String(u.id).includes(query)
    );

    return filtered.sort((a, b) => {
      const { key, direction } = sortConfig;
      const order = direction === "asc" ? 1 : -1;
      if (a[key] < b[key]) return -1 * order;
      if (a[key] > b[key]) return 1 * order;
      return 0;
    });
  }, [users, search, sortConfig]);

  return (
    <div className={styles.tableWrapper}>
      {/* ==== Header Row ==== */}
      <div className={styles.headerRow}>
        <h2>All Users</h2>

        {/* Centered Search Input */}
        <div className={styles.centerGroup}>
          <input
            type="text"
            placeholder="🔍 Search by ID, username, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Add User Button (right aligned) */}
        <div className={styles.rightGroup}>
          <button className={styles.addBtn} onClick={onAddUser}>
            ➕ Add User
          </button>
        </div>
      </div>

      {/* ==== Users Table ==== */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
              User ID {sortArrow("id")}
            </th>
            <th
              onClick={() => handleSort("username")}
              style={{ cursor: "pointer" }}
            >
              Username {sortArrow("username")}
            </th>
            <th>Phone</th>
            <th
              onClick={() => handleSort("created_at")}
              style={{ cursor: "pointer" }}
            >
              Joined {sortArrow("created_at")}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSorted.length === 0 ? (
            <tr>
              <td colSpan="4" className={styles.noData}>
                No users found.
              </td>
            </tr>
          ) : (
            filteredAndSorted.map((u) => (
              <tr
                key={u.id}
                onClick={() => onSelectUser(u)}
                className={selectedUser?.id === u.id ? styles.activeRow : ""}
              >
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.phone_raw || "-"}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
