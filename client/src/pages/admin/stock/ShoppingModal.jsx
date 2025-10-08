import { useEffect, useState } from "react";
import styles from "./StockPage.module.css";

export default function ShoppingModal({ API, onClose }) {
  const [shopName, setShopName] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [items, setItems] = useState([
    { product_id: "", name: "", quantity: "" },
  ]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // 🧠 Load all products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API}/api/admin/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      }
    };
    loadProducts();
  }, [API]);

  const addItem = () =>
    setItems([...items, { product_id: "", name: "", quantity: "" }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) =>
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it))
    );

  const handleSelectProduct = (i, p) => {
    updateItem(i, "name", p.name);
    updateItem(i, "product_id", p.id);
    setOpenDropdown(null);
  };

  const handleSubmit = async () => {
    if (
      !shopName ||
      !totalCost ||
      items.some((i) => !i.product_id || !i.quantity)
    ) {
      alert("⚠️ Please fill all fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/shopping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_name: shopName,
          total_cost: Number(totalCost),
          items: items.map((i) => ({
            product_id: Number(i.product_id),
            quantity: Number(i.quantity),
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to save shopping list");

      // ✅ Instead of alert, show confirmation popup
      setShowConfirm(true);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save shopping list");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    onClose();
    window.location.reload(); // 🔁 Refresh after closing popup
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={`${styles.popupCard} ${styles.productPopup}`}>
        <h2 className={styles.popupTitle}>🛒 Add Shopping</h2>

        <input
          type="text"
          placeholder="Shop Name"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          className={styles.popupInput}
        />

        <input
          type="number"
          placeholder="Total Paid"
          value={totalCost}
          onChange={(e) => setTotalCost(e.target.value)}
          className={styles.popupInput}
        />

        <div className={styles.itemsWrapper}>
          {items.map((it, i) => {
            const query = it.name.toLowerCase();
            const suggestions =
              query.length > 0
                ? products.filter((p) => p.name.toLowerCase().includes(query))
                : products.slice(0, 6);

            return (
              <div key={i} className={styles.itemRow}>
                {/* Searchable input */}
                <div className={styles.dropdownWrapper}>
                  <input
                    type="text"
                    placeholder="Search or type item..."
                    value={it.name}
                    onChange={(e) => {
                      updateItem(i, "name", e.target.value);
                      updateItem(i, "product_id", "");
                      setOpenDropdown(i);
                    }}
                    onFocus={() => setOpenDropdown(i)}
                    className={`${styles.popupInput} ${styles.itemName}`}
                    autoComplete="off"
                  />

                  {openDropdown === i && suggestions.length > 0 && (
                    <ul className={styles.dropdownList}>
                      {suggestions.slice(0, 10).map((p) => (
                        <li
                          key={p.id}
                          className={styles.dropdownItem}
                          onClick={() => handleSelectProduct(i, p)}
                        >
                          {p.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={it.quantity}
                  onChange={(e) => updateItem(i, "quantity", e.target.value)}
                  className={`${styles.popupInput} ${styles.itemQty}`}
                />

                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(i)}
                    className={styles.deleteInlineBtn}
                  >
                    ✖
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={addItem} className={styles.addQtyBtn}>
          ➕ Add Another Item
        </button>

        <div className={styles.popupActions}>
          <button
            onClick={handleSubmit}
            className={styles.confirmBtn}
            disabled={loading}
          >
            {loading ? "Saving..." : "✅ Finish"}
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>

      {/* ✅ Success confirmation popup */}
      {showConfirm && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h2>🎉 Success!</h2>
            <p>Your shopping list has been saved successfully.</p>
            <div className={styles.popupActions}>
              <button
                onClick={handleConfirmClose}
                className={styles.confirmBtn}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
