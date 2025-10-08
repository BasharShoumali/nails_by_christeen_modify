import { useEffect, useState } from "react";
import CategoryModal from "./CategoryModal.jsx";
import styles from "./StockPage.module.css";

export default function CategoriesTable({ API }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null); // { action: 'delete', category }

  // ✅ Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/categories`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("❌ Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Filter categories
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Add/Edit Handlers
  const handleAdd = () => {
    setSelected(null);
    setShowModal(true);
  };

  const handleEdit = (c) => {
    setSelected(c);
    setShowModal(true);
  };

  // ✅ Delete confirmation
  const handleDeleteClick = (category) => {
    setConfirm({ action: "delete", category });
  };

  const confirmDelete = async () => {
    if (!confirm?.category) return;
    try {
      const res = await fetch(
        `${API}/api/admin/categories/${confirm.category.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      fetchCategories();
    } catch (err) {
      console.error("❌ Error deleting category:", err);
    } finally {
      setConfirm(null);
    }
  };

  return (
    <section className={styles.tableSection}>
      <div className={styles.tableHeader}>
        <h2>📂 Categories</h2>

        <div className={styles.headerActions}>
          {/* 🔍 Search */}
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="🔍 Search categories..."
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

          <button className={styles.addBtn} onClick={handleAdd}>
            ➕ Add Category
          </button>
        </div>
      </div>

      {/* === Table === */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p className={styles.noData}>No categories found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(c)}
                    >
                      🔧
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteClick(c)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* === Modal === */}
      {showModal && (
        <CategoryModal
          API={API}
          category={selected}
          onClose={() => setShowModal(false)}
          onSaved={fetchCategories}
        />
      )}

      {/* === Confirmation Popup === */}
      {confirm && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h2>⚠️ Confirm Deletion</h2>
            <p>
              Are you sure you want to delete <b>{confirm.category.name}</b>?
            </p>
            <div className={styles.popupActions}>
              <button onClick={confirmDelete} className={styles.confirmBtn}>
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirm(null)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
