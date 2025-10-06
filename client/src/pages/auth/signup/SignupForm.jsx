import { useState } from "react";
import Popup from "../../../components/popup/Popup"; // ✅ use your new popup
import styles from "./Signup.module.css";

export default function SignupForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    date_of_birth: "",
    phone_raw: "",
    password: "",
    confirm_password: "",
  });

  const [popup, setPopup] = useState({
    visible: false,
    message: "",
    type: "info", // "success" | "error" | "info"
  });

  // === Handle form field change ===
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // === Handle submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPopup({ visible: false, message: "", type: "info" });

    const {
      first_name,
      last_name,
      username,
      phone_raw,
      password,
      confirm_password,
    } = form;

    if (!first_name || !last_name || !username || !phone_raw || !password) {
      return setPopup({
        visible: true,
        message: "Please fill out all required fields.",
        type: "error",
      });
    }

    if (password !== confirm_password) {
      return setPopup({
        visible: true,
        message: "Passwords do not match.",
        type: "error",
      });
    }

    try {
      const res = await fetch("http://localhost:4000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      setPopup({
        visible: true,
        message: "Account created successfully! Redirecting...",
        type: "success",
      });

      setTimeout(() => (window.location.href = "/login"), 1500);
    } catch (err) {
      setPopup({
        visible: true,
        message: err.message,
        type: "error",
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* === Row: First + Last Name === */}
        <div className={styles.row}>
          <label>
            First Name
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First name"
              required
              autoComplete="given-name"
            />
          </label>

          <label>
            Last Name
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last name"
              required
              autoComplete="family-name"
            />
          </label>
        </div>

        {/* === Username === */}
        <label>
          Username
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Choose a username"
            required
            autoComplete="username"
          />
        </label>

        {/* === Date of Birth === */}
        <label>
          Date of Birth
          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            autoComplete="bday"
          />
        </label>

        {/* === Phone === */}
        <label>
          Phone Number
          <input
            type="tel"
            name="phone_raw"
            value={form.phone_raw}
            onChange={handleChange}
            placeholder="+972524143584"
            required
            autoComplete="tel"
          />
        </label>

        {/* === Password + Confirm === */}
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            autoComplete="new-password"
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
          />
        </label>

        {/* === Submit === */}
        <button type="submit" className={styles.loginBtn}>
          Sign Up
        </button>
      </form>

      {/* === Popup === */}
      {popup.visible && (
        <Popup
          title={
            popup.type === "success"
              ? "Success!"
              : popup.type === "error"
              ? "Error"
              : "Notice"
          }
          message={popup.message}
          type={popup.type}
          onClose={() =>
            setPopup({ visible: false, message: "", type: "info" })
          }
        />
      )}
    </>
  );
}
