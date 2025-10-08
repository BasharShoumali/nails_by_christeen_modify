import { useState } from "react";
import styles from "./StockPage.module.css";

export default function CategoryModal({ API, category, onClose, onSaved }) {
  const [name, setName] = useState(category?.name || "");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = category ? "PATCH" : "POST";
    const url = category
      ? `${API}/api/admin/categories/${category.id}`
      : `${API}/api/admin/categories`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      onSaved();
      onClose();
    } catch (err) {
      console.error("❌ Error saving category:", err);
      setMsg("Error saving category.");
    }
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupCard}>
        <h2>{category ? "✏️ Edit Category" : "➕ Add Category"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.popupInput}
          />
          {msg && <p className={styles.errorMsg}>{msg}</p>}
          <div className={styles.popupActions}>
            <button type="submit" className={styles.confirmBtn}>
              Save
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
