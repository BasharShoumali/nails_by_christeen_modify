import { useState } from "react";
import styles from "./Login.module.css";

export default function LoginForm() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // ✅ Save user in localStorage
      localStorage.setItem("loggedUser", JSON.stringify(data.user));

      // ✅ Trigger auth change for navbar
      window.dispatchEvent(
        new CustomEvent("auth:changed", { detail: data.user })
      );

      window.location.href = "/"; // redirect
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label>
        Username or Phone
        <input
          type="text"
          name="identifier"
          placeholder="Username or +972..."
          value={form.identifier}
          onChange={handleChange}
          required
          autoComplete="username"
        />
      </label>

      <label>
        Password
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.loginBtn} disabled={loading}>
        {loading ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
