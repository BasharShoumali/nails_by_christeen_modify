import styles from "./Signup.module.css";
import SignupHeader from "./SignupHeader";
import SignupForm from "./SignupForm";

export default function SignupCard() {
  return (
    <div className={styles.authCard}>
      <SignupHeader />
      <SignupForm />
      <p className={styles.linkRow}>
        Already have an account?{" "}
        <a href="/login" className={styles.link}>
          Log in
        </a>
      </p>
    </div>
  );
}
