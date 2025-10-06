import { pool } from "../pool/db.js";

/** Get all date-slot overrides */
export async function getDateSlotOverrides(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM date_slot_overrides ORDER BY work_date DESC, start_time ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching date-slot overrides:", err);
    res.status(500).json({ error: "Failed to fetch date-slot overrides" });
  }
}

/** Get all overrides for a specific date */
export async function getDateSlotOverridesByDate(req, res) {
  try {
    const work_date = req.params.date;
    const [rows] = await pool.query(
      "SELECT * FROM date_slot_overrides WHERE work_date = ? ORDER BY start_time ASC",
      [work_date]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "No slot overrides for this date" });

    res.json(rows);
  } catch (err) {
    console.error("Error fetching overrides for date:", err);
    res.status(500).json({ error: "Failed to fetch overrides for this date" });
  }
}

/** Add or update (upsert) a slot override */
export async function upsertDateSlotOverride(req, res) {
  try {
    const { work_date, start_time, is_open } = req.body;

    if (!work_date || !start_time || typeof is_open === "undefined") {
      return res
        .status(400)
        .json({ error: "work_date, start_time, and is_open are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO date_slot_overrides (work_date, start_time, is_open)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         is_open = VALUES(is_open)`,
      [work_date, start_time, is_open]
    );

    const [rows] = await pool.query(
      "SELECT * FROM date_slot_overrides WHERE work_date = ? AND start_time = ?",
      [work_date, start_time]
    );

    res.status(result.affectedRows > 1 ? 200 : 201).json(rows[0]);
  } catch (err) {
    console.error("Error saving date-slot override:", err);
    res.status(500).json({ error: "Failed to save date-slot override" });
  }
}

/** Delete a specific slot override */
export async function deleteDateSlotOverride(req, res) {
  try {
    const { date, time } = req.params;

    const [result] = await pool.query(
      "DELETE FROM date_slot_overrides WHERE work_date = ? AND start_time = ?",
      [date, time]
    );

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ error: "Date-slot override not found for given date/time" });

    res.json({ message: "Date-slot override deleted successfully" });
  } catch (err) {
    console.error("Error deleting date-slot override:", err);
    res.status(500).json({ error: "Failed to delete date-slot override" });
  }
}
