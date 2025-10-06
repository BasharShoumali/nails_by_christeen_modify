import { pool } from "../pool/db.js";

/** Get all date overrides */
export async function getDateOverrides(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM date_overrides ORDER BY work_date DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching date overrides:", err);
    res.status(500).json({ error: "Failed to fetch date overrides" });
  }
}

/** Get single date override by work_date (YYYY-MM-DD) */
export async function getDateOverride(req, res) {
  try {
    const work_date = req.params.date;
    const [rows] = await pool.query(
      "SELECT * FROM date_overrides WHERE work_date = ?",
      [work_date]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Date override not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching date override:", err);
    res.status(500).json({ error: "Failed to fetch date override" });
  }
}

/** Add or update a date override */
export async function upsertDateOverride(req, res) {
  try {
    const {
      work_date,
      is_open = 1,
      override_schedule_id = null,
      notes = null,
    } = req.body;

    if (!work_date) {
      return res.status(400).json({ error: "work_date is required" });
    }

    // Try to insert or update existing row
    const [result] = await pool.query(
      `INSERT INTO date_overrides (work_date, is_open, override_schedule_id, notes)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         is_open = VALUES(is_open),
         override_schedule_id = VALUES(override_schedule_id),
         notes = VALUES(notes),
         updated_at = CURRENT_TIMESTAMP`,
      [work_date, is_open, override_schedule_id, notes]
    );

    const [rows] = await pool.query(
      "SELECT * FROM date_overrides WHERE work_date = ?",
      [work_date]
    );

    res.status(result.affectedRows > 1 ? 200 : 201).json(rows[0]);
  } catch (err) {
    console.error("Error saving date override:", err);
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      res.status(400).json({ error: "Invalid override_schedule_id" });
    } else {
      res.status(500).json({ error: "Failed to save date override" });
    }
  }
}

/** Delete a date override */
export async function deleteDateOverride(req, res) {
  try {
    const work_date = req.params.date;
    const [result] = await pool.query(
      "DELETE FROM date_overrides WHERE work_date = ?",
      [work_date]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Date override not found" });

    res.json({ message: "Date override deleted successfully" });
  } catch (err) {
    console.error("Error deleting date override:", err);
    res.status(500).json({ error: "Failed to delete date override" });
  }
}
