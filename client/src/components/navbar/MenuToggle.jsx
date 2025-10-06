import styles from "./Navbar.module.css";

export default function MenuToggle({ open, onToggle }) {
  return (
    <button
      className={`${styles.menuToggle} ${open ? styles.open : ""}`}
      onClick={onToggle}
      aria-label="Toggle menu"
    >
      <span />
      <span />
      <span />
    </button>
  );
}
