import styles from "./Navbar.module.css";

export default function LogoLink({ src, alt, onClick }) {
  return (
    <img
      src={src}
      alt={alt}
      className={styles.logo}
      onClick={onClick}
      style={{ cursor: "pointer" }} // clickable, but not styled as a button
      draggable="false"
    />
  );
}
