import styles from "./Footer.module.css";

export default function FooterLogo({ src, alt }) {
  return (
    <section className={`${styles.section} ${styles.logo}`}>
      <img src={src} alt={alt} className={styles.logoImg} />
    </section>
  );
}
