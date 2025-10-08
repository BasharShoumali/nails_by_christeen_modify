// src/pages/admin/stock/ProductModal.jsx
import { useEffect, useState } from "react";
import styles from "./StockPage.module.css";

export default function ProductModal({ API, product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category_id: product?.category_id || "",
    brand: product?.brand || "",
    color: product?.color || "",
    quantity: product?.quantity || 0,
    barcode: product?.barcode || "",
  });

  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API}/api/admin/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("❌ Failed to load categories:", err);
      }
    };
    loadCategories();
  }, [API]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setImage(file || null);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const method = product ? "PATCH" : "POST";
      const url = product
        ? `${API}/api/admin/products/${product.id}`
        : `${API}/api/admin/products`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error saving product");

      const saved = await res.json();
      const productId = saved?.id || product?.id;

      if (image && productId) {
        const fd = new FormData();
        fd.append("image", image);
        const imgRes = await fetch(
          `${API}/api/admin/products/${productId}/images`,
          { method: "POST", body: fd }
        );
        if (!imgRes.ok) throw new Error("Image upload failed");
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("❌ Error saving product:", err);
      setMsg("Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={`${styles.popupCard} ${styles.productPopup}`}>
        <h2 className={styles.popupTitle}>
          {product ? "✏️ Edit Product" : "➕ Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className={styles.popupForm}>
          <div className={styles.grid2}>
            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.grid3}>
            <input
              name="brand"
              placeholder="Brand"
              value={form.brand}
              onChange={handleChange}
            />
            <input
              name="color"
              placeholder="Color"
              value={form.color}
              onChange={handleChange}
            />
            <input
              name="quantity"
              type="number"
              placeholder="Qty"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>

          <input
            name="barcode"
            placeholder="Barcode"
            value={form.barcode}
            onChange={handleChange}
          />

          {/* Upload image */}
          <div className={styles.uploadBox}>
            <label className={styles.uploadLabel}>
              <span>📸 Upload Product Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.hiddenInput}
              />
            </label>
            {preview && (
              <img src={preview} alt="Preview" className={styles.previewImg} />
            )}
          </div>

          {msg && <p className={styles.errorMsg}>{msg}</p>}

          <div className={styles.popupActions}>
            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
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
