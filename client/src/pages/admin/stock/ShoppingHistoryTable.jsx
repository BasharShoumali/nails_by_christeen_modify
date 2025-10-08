import { useEffect, useState } from "react";
import styles from "./StockPage.module.css";
import ShoppingModal from "./ShoppingModal.jsx";

export default function ShoppingHistoryTable({ API }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // 🧾 Fetch shopping history
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/shopping`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("❌ Failed to fetch shopping history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 🧩 After closing modal → refresh data
  const handleModalClose = (refresh = false) => {
    setShowModal(false);
    if (refresh) fetchHistory();
  };

  // 🔍 Filter rows by shop name or date
  const filteredHistory = history.filter((row) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      row.shop_name.toLowerCase().includes(term) ||
      new Date(row.purchased_at || row.created_at)
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
        .toLowerCase()
        .includes(term)
    );
  });

  return (
    <section className={styles.tableSection}>
      <div className={styles.tableHeader}>
        <h2>🛍 Shopping History</h2>

        <div className={styles.headerActions}>
          {/* 🔍 Search bar */}
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="🔍 Search shopping..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ✖
              </button>
            )}
          </div>

          {/* ➕ Add Shopping */}
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            ➕ Add Shopping
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <p>Loading...</p>
        ) : filteredHistory.length === 0 ? (
          <p className={styles.noData}>No shopping records found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Shop</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((row) => (
                <tr key={row.id}>
                  <td>
                    {new Date(
                      row.purchased_at || row.created_at
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </td>
                  <td>{row.shop_name}</td>
                  <td>{Number(row.total_cost || 0).toFixed(2)} ₪</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <ShoppingModal API={API} onClose={handleModalClose} />}
    </section>
  );
}
