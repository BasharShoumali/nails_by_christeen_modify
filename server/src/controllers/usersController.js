import { pool } from "../pool/db.js";
import bcrypt from "bcrypt";

/** ========================
 *  GET ALL USERS
 *  ======================== */
export async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, username, phone_raw, userRole, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

/** ========================
 *  GET USER BY ID
 *  ======================== */
export async function getUser(req, res) {
  try {
    const userId = req.params.id;
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, username, phone_raw, userRole, created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

/** ========================
 *  ADD USER (SIGNUP)
 *  ======================== */
export async function addUser(req, res) {
  try {
    const {
      first_name,
      last_name,
      username,
      date_of_birth = null,
      phone_raw = null,
      userRole = "user",
      password,
    } = req.body;

    // --- Validation ---
    if (!first_name || !last_name || !username || !password) {
      return res.status(400).json({
        error:
          "Missing required fields: first_name, last_name, username, password",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // --- Check duplicates ---
    const [existing] = await pool.query(
      `SELECT id FROM users 
       WHERE username = ? 
          OR phone_e164 = REGEXP_REPLACE(?, '[^0-9+]', '')`,
      [username, phone_raw]
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "Username or phone number already exists" });
    }

    // --- Hash password ---
    const password_hash = await bcrypt.hash(password, 10);

    // --- Insert new user ---
    const [result] = await pool.query(
      `INSERT INTO users
       (first_name, last_name, username, date_of_birth, phone_raw, userRole, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        username,
        date_of_birth,
        phone_raw,
        userRole,
        password_hash,
      ]
    );

    // --- Return the new user (public info only) ---
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, username, phone_e164, userRole, created_at
       FROM users
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ Error adding user:", err);
    if (err.code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({ error: "Username or phone number already exists" });
    } else {
      res.status(500).json({ error: "Failed to create user" });
    }
  }
}

/** ========================
 *  DELETE USER
 *  ======================== */
export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

/** ========================
 *  GET USER APPOINTMENTS
 *  ======================== */
export async function getUserAppointments(req, res) {
  try {
    console.log("we got it");
    const userId = req.params.id;
    const [rows] = await pool.query(
      `
      SELECT
        a.id,
        a.user_id,
        a.status,
        a.notes,
        a.amount_paid,
        a.slot,
        a.inspo_img,
        DATE_FORMAT(a.work_date, '%Y-%m-%d') AS work_date,  -- 👈
        DATE_FORMAT(a.created_at, '%Y-%m-%d') AS created_at -- 👈
      FROM appointments a
      WHERE a.user_id = ?
      ORDER BY a.work_date DESC, a.slot ASC
      `,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching user's appointments:", err);
    res.status(500).json({ error: "Failed to fetch user's appointments" });
  }
}
