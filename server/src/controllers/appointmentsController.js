import { pool } from "../pool/db.js";

/** Get all appointments */
export async function getAppointments(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM appointments ORDER BY work_date DESC, slot ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
}

/** Get a single appointment by ID */
export async function getAppointment(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM appointments WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Appointment not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching appointment:", err);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
}

/** Add a new appointment */
export async function addAppointment(req, res) {
  try {
    const {
      user_id,
      work_date,
      slot,
      status = "open",
      notes = null,
      amount_paid = null,
      inspo_img = null,
      location = null,
    } = req.body;

    // basic validation
    if (!user_id || !work_date || !slot) {
      return res.status(400).json({
        error: "user_id, work_date, and slot are required fields",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO appointments 
        (user_id, work_date, slot, status, notes, amount_paid, inspo_img, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        work_date,
        slot,
        status,
        notes,
        amount_paid,
        inspo_img,
        location,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM appointments WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error adding appointment:", err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        error: "That time slot is already booked for the selected date.",
      });
    } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
      res.status(400).json({ error: "Invalid user_id (user not found)" });
    } else {
      res.status(500).json({ error: "Failed to create appointment" });
    }
  }
}

/** Delete appointment */
export async function deleteAppointment(req, res) {
  try {
    const [result] = await pool.query("DELETE FROM appointments WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
}
