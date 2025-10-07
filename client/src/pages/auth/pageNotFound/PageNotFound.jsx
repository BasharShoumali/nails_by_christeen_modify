import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./PageNotFound.module.css";

export default function PageNotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <main className={styles.container} role="main" aria-labelledby="pnf-title">
      <div className={styles.card}>
        <h1 id="pnf-title">404</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <p className={styles.missingPath}>
          Missing route: <code>{pathname}</code>
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(-1)}
          >
            ⟵ Go Back
          </button>
          <Link to="/" className={styles.homeBtn}>
            Go to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
