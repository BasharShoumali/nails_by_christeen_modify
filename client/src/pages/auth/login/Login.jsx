import styles from "./Login.module.css";
import LoginCard from "./LoginCard";

export default function Login() {
  return (
    <div className={styles.authWrap}>
      <LoginCard />
    </div>
  );
}
