import CategoriesTable from "./CategoriesTable.jsx";
import ProductsTable from "./ProductsTable.jsx";
import ShoppingHistoryTable from "./ShoppingHistoryTable.jsx";
import styles from "./StockPage.module.css";

export default function StockPage() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>🧾 Stock Management</h1>
      </header>

      {/* === Categories Section === */}
      <section style={{ marginBottom: "32px" }}>
        <CategoriesTable API={API} />
      </section>

      {/* === Products Section === */}
      <section style={{ marginBottom: "32px" }}>
        <ProductsTable API={API} />
      </section>

      {/* === Shopping History Section (with Add button inside) === */}
      <section>
        <ShoppingHistoryTable API={API} />
      </section>
    </div>
  );
}
