import { pool } from "../pool/db.js";

/** Get all schedules */
export async function getSchedules(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM schedules ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
}

/** Get single schedule by ID (with its slots) */
export async function getSchedule(req, res) {
  try {
    const scheduleId = req.params.id;

    const [scheduleRows] = await pool.query(
      "SELECT * FROM schedules WHERE id = ?",
      [scheduleId]
    );

    if (scheduleRows.length === 0)
      return res.status(404).json({ error: "Schedule not found" });

    const [slots] = await pool.query(
      "SELECT id, start_time FROM schedule_slots WHERE schedule_id = ? ORDER BY start_time ASC",
      [scheduleId]
    );

    const schedule = { ...scheduleRows[0], slots };
    res.json(schedule);
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}

/** Add a new schedule */
export async function addSchedule(req, res) {
  try {
    const { name, notes = null } = req.body;
    if (!name || name.trim() === "")
      return res.status(400).json({ error: "Schedule name is required" });

    const [result] = await pool.query(
      "INSERT INTO schedules (name, notes) VALUES (?, ?)",
      [name.trim(), notes]
    );

    const [rows] = await pool.query("SELECT * FROM schedules WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error adding schedule:", err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Schedule name already exists" });
    } else {
      res.status(500).json({ error: "Failed to create schedule" });
    }
  }
}

/** Delete a schedule (auto-cascades slots & assignments) */
export async function deleteSchedule(req, res) {
  try {
    const [result] = await pool.query("DELETE FROM schedules WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Schedule not found" });

    res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    console.error("Error deleting schedule:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
}
