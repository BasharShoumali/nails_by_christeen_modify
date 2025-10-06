import { pool } from "../pool/db.js";
import crypto from "crypto";

/** Get all password reset tokens */
export async function getPasswordResetTokens(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM password_reset_tokens ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching password reset tokens:", err);
    res.status(500).json({ error: "Failed to fetch password reset tokens" });
  }
}

/** Get a single token by ID */
export async function getPasswordResetToken(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM password_reset_tokens WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Token not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching token:", err);
    res.status(500).json({ error: "Failed to fetch token" });
  }
}

/** Add a new password reset token (hashing handled here) */
export async function addPasswordResetToken(req, res) {
  try {
    const { user_id, expires_at } = req.body;

    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    // Generate a random token (sent to user)
    const token = crypto.randomBytes(32).toString("hex");
    const token_hash = crypto.createHash("sha256").update(token).digest();

    const expiry = expires_at || new Date(Date.now() + 1000 * 60 * 15); // default 15 min

    const [result] = await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [user_id, token_hash, expiry]
    );

    res.status(201).json({
      id: result.insertId,
      user_id,
      expires_at: expiry,
      token, // send unhashed token only for email use
    });
  } catch (err) {
    console.error("Error creating password reset token:", err);
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      res.status(400).json({ error: "Invalid user_id (user not found)" });
    } else {
      res.status(500).json({ error: "Failed to create password reset token" });
    }
  }
}

/** Delete a password reset token */
export async function deletePasswordResetToken(req, res) {
  try {
    const [result] = await pool.query(
      "DELETE FROM password_reset_tokens WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Token not found" });
    res.json({ message: "Password reset token deleted successfully" });
  } catch (err) {
    console.error("Error deleting password reset token:", err);
    res.status(500).json({ error: "Failed to delete password reset token" });
  }
}
