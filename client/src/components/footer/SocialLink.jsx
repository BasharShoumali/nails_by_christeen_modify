import styles from "./Footer.module.css";

export default function SocialLink({ href, icon, label, external = false }) {
  const props = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  return (
    <a href={href} className={styles.link} {...props}>
      <span className={styles.icon}>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
