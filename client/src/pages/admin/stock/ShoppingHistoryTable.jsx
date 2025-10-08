import { useEffect, useState } from "react";
import styles from "./StockPage.module.css";
import ShoppingModal from "./ShoppingModal.jsx";

export default function ShoppingHistoryTable({ API }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewItems, setViewItems] = useState(null);
  const [search, setSearch] = useState("");
  const [previewImg, setPreviewImg] = useState(null);

  // 🧾 Fetch shopping history
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/finance/shopping`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const cleaned = Array.isArray(data)
        ? data.filter((r) => r && typeof r === "object")
        : [];
      setHistory(cleaned);
    } catch (err) {
      console.error("❌ Failed to fetch shopping history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleModalClose = (refresh = false) => {
    setShowModal(false);
    if (refresh) fetchHistory();
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const [dateOnly] = value.split("T");
    const [y, m, d] = dateOnly.split("-");
    return `${d}/${m}/${y}`;
  };

  const filteredHistory = history.filter((row) => {
    if (!row || typeof row !== "object") return false;
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const formattedDate = formatDate(
      row?.purchased_at || row?.created_at || ""
    ).toLowerCase();
    return (
      row?.shop_name?.toLowerCase().includes(term) ||
      formattedDate.includes(term)
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((row, idx) => (
                <tr key={row?.id || `row-${idx}`}>
                  <td>
                    {formatDate(row?.purchased_at || row?.created_at || "")}
                  </td>
                  <td>{row?.shop_name || "—"}</td>
                  <td>{Number(row?.total_cost || 0).toFixed(2)} ₪</td>
                  <td>
                    <button
                      className={styles.viewBtn}
                      onClick={() => setViewItems(row)}
                    >
                      👁 View Items
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🧾 Add Shopping Modal */}
      {showModal && <ShoppingModal API={API} onClose={handleModalClose} />}

      {/* 👁 View Items Popup */}
      {viewItems && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h2>
              🛒 {viewItems?.shop_name || "Unknown Shop"} —{" "}
              {formatDate(
                viewItems?.purchased_at || viewItems?.created_at || ""
              )}
            </h2>
            <p>
              <strong>Total:</strong>{" "}
              {Number(viewItems?.total_cost || 0).toFixed(2)} ₪
            </p>

            <div className={styles.itemsGrid}>
              {Array.isArray(viewItems?.items) && viewItems.items.length > 0 ? (
                viewItems.items.map((it, i) => {
                  if (!it) return null;
                  const productName = it?.name || `Product #${it?.product_id}`;
                  const imgSrc =
                    it?.image_url ||
                    "https://via.placeholder.com/80?text=No+Img";

                  return (
                    <div key={i} className={styles.itemCard}>
                      <img
                        src={imgSrc}
                        alt={productName}
                        className={styles.itemImg}
                        onClick={() => setPreviewImg(imgSrc)}
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml;charset=UTF-8," +
                            encodeURIComponent(
                              `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
                                <rect width='100%' height='100%' fill='#ddd'/>
                                <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
                                font-size='10' fill='#555'>No Img</text>
                              </svg>`
                            );
                        }}
                      />
                      <div className={styles.itemInfo}>
                        <h4>{productName}</h4>
                        <p>Qty: {it?.quantity ?? 0}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No items recorded</p>
              )}
            </div>

            <div className={styles.popupActions}>
              <button
                onClick={() => setViewItems(null)}
                className={styles.cancelBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ Full-size Image Preview */}
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
