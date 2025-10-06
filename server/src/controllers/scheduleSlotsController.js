import { pool } from "../pool/db.js";

/** Get all schedule slots (with schedule name) */
export async function getScheduleSlots(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT ss.*, s.name AS schedule_name
       FROM schedule_slots ss
       JOIN schedules s ON ss.schedule_id = s.id
       ORDER BY s.name ASC, ss.start_time ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching schedule slots:", err);
    res.status(500).json({ error: "Failed to fetch schedule slots" });
  }
}

/** Get a single slot by ID */
export async function getScheduleSlot(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT ss.*, s.name AS schedule_name
       FROM schedule_slots ss
       JOIN schedules s ON ss.schedule_id = s.id
       WHERE ss.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Schedule slot not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching schedule slot:", err);
    res.status(500).json({ error: "Failed to fetch schedule slot" });
  }
}

/** Add a new schedule slot */
export async function addScheduleSlot(req, res) {
  try {
    const { schedule_id, start_time } = req.body;

    if (!schedule_id || !start_time)
      return res
        .status(400)
        .json({ error: "schedule_id and start_time are required" });

    const [result] = await pool.query(
      "INSERT INTO schedule_slots (schedule_id, start_time) VALUES (?, ?)",
      [schedule_id, start_time]
    );

    const [rows] = await pool.query(
      `SELECT ss.*, s.name AS schedule_name
       FROM schedule_slots ss
       JOIN schedules s ON ss.schedule_id = s.id
       WHERE ss.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error adding schedule slot:", err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        error: "A slot at this time already exists in this schedule",
      });
    } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
      res
        .status(400)
        .json({ error: "Invalid schedule_id (schedule not found)" });
    } else {
      res.status(500).json({ error: "Failed to create schedule slot" });
    }
  }
}

/** Delete a schedule slot */
export async function deleteScheduleSlot(req, res) {
  try {
    const [result] = await pool.query(
      "DELETE FROM schedule_slots WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Schedule slot not found" });

    res.json({ message: "Schedule slot deleted successfully" });
  } catch (err) {
    console.error("Error deleting schedule slot:", err);
    res.status(500).json({ error: "Failed to delete schedule slot" });
  }
}
