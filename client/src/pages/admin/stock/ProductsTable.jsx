import { useEffect, useState } from "react";
import ProductModal from "./ProductModal.jsx";
import styles from "./StockPage.module.css";

export default function ProductsTable({ API }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirm, setConfirm] = useState(null); // { action, product, value? }
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [previewImg, setPreviewImg] = useState(null); // 🖼️ image preview

  /** 🧭 Fetch all products */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/products`);
      if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /** ✏️ Edit */
  const handleEdit = (p) => {
    setSelectedProduct(p);
    setShowModal(true);
  };

  /** 🗑️ Delete */
  const handleDeleteClick = (product) =>
    setConfirm({ action: "delete", product });

  const confirmDelete = async () => {
    if (!confirm?.product) return;
    try {
      const res = await fetch(
        `${API}/api/admin/products/${confirm.product.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      setProducts((prev) => prev.filter((p) => p.id !== confirm.product.id));
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Failed to delete product.");
    } finally {
      setConfirm(null);
    }
  };

  /** 🔓 Open New */
  const handleOpenNewClick = (product) => {
    if (product.quantity <= 0) {
      alert("⚠️ Cannot open — this item is out of stock!");
      return;
    }
    setConfirm({ action: "open", product });
  };

  const confirmOpenNew = async () => {
    if (!confirm?.product) return;
    try {
      const res = await fetch(
        `${API}/api/admin/products/${confirm.product.id}/open`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to mark as opened");
      const data = await res.json();
      setProducts((prev) =>
        prev.map((p) =>
          p.id === confirm.product.id
            ? { ...p, quantity: data.newQuantity, last_opened_date: data.date }
            : p
        )
      );
    } catch (err) {
      console.error("❌ Open new error:", err);
      alert("Failed to update product status.");
    } finally {
      setConfirm(null);
    }
  };

  /** ➕ Add Quantity */
  const handleAddQtyClick = (product) =>
    setConfirm({ action: "add", product, value: "" });

  const confirmAddQty = async () => {
    const amount = Number(confirm?.value);
    if (!confirm?.product || !amount || amount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    try {
      const res = await fetch(
        `${API}/api/admin/products/${confirm.product.id}/add-quantity`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        }
      );
      if (!res.ok) throw new Error("Failed to add quantity");
      const data = await res.json();
      setProducts((prev) =>
        prev.map((p) =>
          p.id === confirm.product.id
            ? { ...p, quantity: p.quantity + data.added }
            : p
        )
      );
    } catch (err) {
      console.error("❌ Add qty error:", err);
      alert("Failed to add quantity.");
    } finally {
      setConfirm(null);
    }
  };

  /** 🔎 Filters */
  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((p) => (showLowStock ? p.quantity <= 1 : true));

  return (
    <section className={styles.tableSection}>
      {/* === Header === */}
      <div className={styles.tableHeader}>
        <h2>📦 Products</h2>

        <div className={styles.headerActions}>
          {/* 🔍 Search */}
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button
                className={styles.clearBtn}
                onClick={() => setSearch("")}
                title="Clear search"
              >
                ✖
              </button>
            )}
          </div>

          {/* ⚠️ Low Stock */}
          <button
            className={`${styles.lowStockBtn} ${
              showLowStock ? styles.active : ""
            }`}
            onClick={() => setShowLowStock((prev) => !prev)}
          >
            {showLowStock ? "📋 Show All" : "⚠️ Low Stock"}
          </button>

          {/* ➕ Add New */}
          <button
            className={styles.addBtn}
            onClick={() => {
              setSelectedProduct(null);
              setShowModal(true);
            }}
          >
            ➕ Add Product
          </button>
        </div>
      </div>

      {/* === Table === */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <p>Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p className={styles.noData}>No products found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Color</th>
                <th>Qty</th>
                <th>Barcode</th>
                <th>Last Opened</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className={p.quantity <= 1 ? styles.lowStockRow : ""}
                >
                  <td>
                    {p.main_image ? (
                      <img
                        src={`${API}/${p.main_image}`}
                        alt={p.name}
                        className={styles.productImg}
                        onClick={() => setPreviewImg(`${API}/${p.main_image}`)} // 🖼️ click to preview
                      />
                    ) : (
                      <span className={styles.noImg}>No Image</span>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category_name}</td>
                  <td>{p.brand || "-"}</td>
                  <td>{p.color || "-"}</td>
                  <td>{p.quantity}</td>
                  <td>{p.barcode}</td>
                  <td>
                    {p.last_opened_date
                      ? new Date(p.last_opened_date).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )
                      : "-"}
                  </td>
                  <td>
                    <button
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      title="Edit"
                      onClick={() => handleEdit(p)}
                    >
                      🔧
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.openBtn}`}
                      title="Open new item"
                      onClick={() => handleOpenNewClick(p)}
                    >
                      ➖
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.addQtyBtn}`}
                      title="Add stock"
                      onClick={() => handleAddQtyClick(p)}
                    >
                      ➕
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      title="Delete"
                      onClick={() => handleDeleteClick(p)}
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

      {/* === Product Modal === */}
      {showModal && (
        <ProductModal
          API={API}
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          onSaved={fetchProducts}
        />
      )}

      {/* === Confirmation Popup === */}
      {confirm && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h2>⚠️ Confirm Action</h2>

            {confirm.action === "add" ? (
              <>
                <p>
                  How many did you buy for <b>{confirm.product.name}</b>?
                </p>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={confirm.value || ""}
                  onChange={(e) =>
                    setConfirm({ ...confirm, value: e.target.value })
                  }
                  className={styles.popupInput}
                />
              </>
            ) : (
              <p>
                {confirm.action === "delete"
                  ? `Delete "${confirm.product.name}"?`
                  : `Open a new item for "${confirm.product.name}"?`}
              </p>
            )}

            <div className={styles.popupActions}>
              <button
                onClick={
                  confirm.action === "delete"
                    ? confirmDelete
                    : confirm.action === "add"
                    ? confirmAddQty
                    : confirmOpenNew
                }
                className={styles.confirmBtn}
              >
                Confirm
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

      {/* === 🖼️ Full-size Image Preview === */}
      {previewImg && (
        <div
          className={styles.previewOverlay}
          onClick={() => setPreviewImg(null)}
        >
          <div className={styles.previewBox}>
            <img
              src={previewImg}
              alt="Preview"
              className={styles.previewImg}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </section>
  );
}
