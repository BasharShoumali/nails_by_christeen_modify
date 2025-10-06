import styles from "./Login.module.css";

export default function LoginHeader() {
  return (
    <>
      <h2 className={styles.title}>Welcome Back 💅</h2>
      <p className={styles.subtitle}>Log in to continue</p>
    </>
  );
}
