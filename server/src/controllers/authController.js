import { pool } from "../pool/db.js";
import bcrypt from "bcrypt";

/** POST /api/login
 * Login with username OR phone_raw
 */
export async function login(req, res) {
  try {
    const { identifier, password } = req.body; // username or phone number

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "Username/phone and password required" });
    }

    // Find user by username OR phone
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, username, phone_e164, password_hash, userRole
       FROM users
       WHERE username = ?
          OR phone_e164 = REGEXP_REPLACE(?, '[^0-9+]', '')`,
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Remove password before sending back
    delete user.password_hash;

    // Optional: save session or JWT (for now just return user)
    res.json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    console.error("❌ Error in login:", err);
    res.status(500).json({ error: "Server error during login" });
  }
}
