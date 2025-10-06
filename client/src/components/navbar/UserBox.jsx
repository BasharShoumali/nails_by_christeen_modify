import styles from "./Navbar.module.css";

export default function UserBox({ userName, onLogout }) {
  if (!userName) return null;

  return (
    <div className={styles.userBox}>
      <span className={styles.username}>Hi, {userName}</span>
      <button className={styles.logoutBtn} onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}
