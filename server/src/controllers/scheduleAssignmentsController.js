import { pool } from "../pool/db.js";

/** Get all schedule assignments */
export async function getScheduleAssignments(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT sa.*, s.name AS schedule_name
       FROM schedule_assignments sa
       JOIN schedules s ON sa.schedule_id = s.id
       ORDER BY sa.weekday ASC, sa.effective_from ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching schedule assignments:", err);
    res.status(500).json({ error: "Failed to fetch schedule assignments" });
  }
}

/** Get a single assignment by ID */
export async function getScheduleAssignment(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT sa.*, s.name AS schedule_name
       FROM schedule_assignments sa
       JOIN schedules s ON sa.schedule_id = s.id
       WHERE sa.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Schedule assignment not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching schedule assignment:", err);
    res.status(500).json({ error: "Failed to fetch schedule assignment" });
  }
}

/** Add a new schedule assignment */
export async function addScheduleAssignment(req, res) {
  try {
    const {
      schedule_id,
      weekday,
      effective_from,
      effective_to = null,
      notes = null,
    } = req.body;

    // Validation
    if (
      typeof schedule_id === "undefined" ||
      typeof weekday === "undefined" ||
      !effective_from
    ) {
      return res.status(400).json({
        error: "schedule_id, weekday, and effective_from are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO schedule_assignments
       (schedule_id, weekday, effective_from, effective_to, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [schedule_id, weekday, effective_from, effective_to, notes]
    );

    const [rows] = await pool.query(
      `SELECT sa.*, s.name AS schedule_name
       FROM schedule_assignments sa
       JOIN schedules s ON sa.schedule_id = s.id
       WHERE sa.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error adding schedule assignment:", err);
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      res
        .status(400)
        .json({ error: "Invalid schedule_id (schedule not found)" });
    } else if (err.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
      res.status(400).json({ error: "weekday must be between 0 and 6" });
    } else {
      res.status(500).json({ error: "Failed to create schedule assignment" });
    }
  }
}

/** Delete a schedule assignment */
export async function deleteScheduleAssignment(req, res) {
  try {
    const [result] = await pool.query(
      "DELETE FROM schedule_assignments WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Schedule assignment not found" });

    res.json({ message: "Schedule assignment deleted successfully" });
  } catch (err) {
    console.error("Error deleting schedule assignment:", err);
    res.status(500).json({ error: "Failed to delete schedule assignment" });
  }
}
