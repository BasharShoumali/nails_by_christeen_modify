import styles from "./Signup.module.css";
import SignupCard from "./SignupCard";

export default function Signup() {
  return (
    <div className={styles.authWrap}>
      <SignupCard />
    </div>
  );
}
