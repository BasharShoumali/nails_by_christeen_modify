import styles from "./Login.module.css";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";

export default function LoginCard() {
  return (
    <div className={styles.authCard}>
      <LoginHeader />
      <LoginForm />
      <p className={styles.linkRow}>
        Don’t have an account?{" "}
        <a href="/signup" className={styles.link}>
          Sign up
        </a>
      </p>
    </div>
  );
}
