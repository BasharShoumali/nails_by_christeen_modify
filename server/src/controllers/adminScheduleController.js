import { pool } from "../pool/db.js";

/* ============================================================
   🕑  DAY TEMPLATES (Schedules)
   ============================================================ */
export async function getSchedules(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM schedules ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ getSchedules error:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
}

export async function addSchedule(req, res) {
  try {
    const { name, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Name required" });

    const [result] = await pool.query(
      "INSERT INTO schedules (name, notes) VALUES (?, ?)",
      [name.trim(), notes || null]
    );

    const [rows] = await pool.query("SELECT * FROM schedules WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ addSchedule error:", err);
    res.status(500).json({ error: "Failed to create schedule" });
  }
}

export async function deleteSchedule(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM schedules WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Schedule not found" });
    res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    console.error("❌ deleteSchedule error:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
}

/* ============================================================
   ⏰  SCHEDULE SLOTS
   ============================================================ */
export async function getScheduleSlots(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, start_time FROM schedule_slots WHERE schedule_id = ? ORDER BY start_time",
      [req.params.scheduleId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ getScheduleSlots error:", err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
}

export async function addSlot(req, res) {
  try {
    const { schedule_id, start_time } = req.body;
    if (!schedule_id || !start_time)
      return res
        .status(400)
        .json({ error: "schedule_id and start_time required" });

    await pool.query(
      "INSERT IGNORE INTO schedule_slots (schedule_id, start_time) VALUES (?, ?)",
      [schedule_id, start_time]
    );

    res.status(201).json({ message: "Slot added successfully" });
  } catch (err) {
    console.error("❌ addSlot error:", err);
    res.status(500).json({ error: "Failed to add slot" });
  }
}

export async function deleteSlot(req, res) {
  try {
    const { scheduleId, slotId } = req.params;
    const [result] = await pool.query(
      "DELETE FROM schedule_slots WHERE schedule_id = ? AND id = ?",
      [scheduleId, slotId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Slot not found" });

    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    console.error("❌ deleteSlot error:", err);
    res.status(500).json({ error: "Failed to delete slot" });
  }
}

/* ============================================================
   📆  WEEK ASSIGNMENTS (Show assigned week templates)
   ============================================================ */
export async function getWeekAssignments(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        wa.id,
        wa.week_id,
        wt.name AS week_name,
        wa.date_from,
        wa.date_to
      FROM week_assignments wa
      JOIN week_templates wt ON wt.id = wa.week_id
      ORDER BY wa.date_from DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ getWeekAssignments error:", err);
    res.status(500).json({ error: "Failed to fetch week assignments" });
  }
}

export async function saveWeekAssignment(req, res) {
  try {
    const { schedule_id, weekday, effective_from, effective_to, notes } =
      req.body;

    if (!schedule_id || weekday == null || !effective_from)
      return res.status(400).json({ error: "Missing required fields" });

    await pool.query(
      `
      INSERT INTO schedule_assignments
        (schedule_id, weekday, effective_from, effective_to, notes)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        schedule_id,
        weekday,
        effective_from,
        effective_to || null,
        notes || null,
      ]
    );

    res.status(201).json({ message: "Assignment saved successfully" });
  } catch (err) {
    console.error("❌ saveWeekAssignment error:", err);
    res.status(500).json({ error: "Failed to save assignment" });
  }
}

export async function deleteWeekAssignment(req, res) {
  const { id } = req.params;
  const [result] = await pool.query(
    "DELETE FROM week_assignments WHERE id = ?",
    [id]
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ error: "Assignment not found" });
  res.json({ message: "Assignment deleted successfully" });
}

/* ============================================================
   📆  DATE OVERRIDES
   ============================================================ */
export async function getOverrides(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, s.name AS override_schedule_name
      FROM date_overrides d
      LEFT JOIN schedules s ON d.override_schedule_id = s.id
      ORDER BY work_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ getOverrides error:", err);
    res.status(500).json({ error: "Failed to fetch overrides" });
  }
}

export async function saveOverride(req, res) {
  try {
    const { work_date, is_open = 1, override_schedule_id, notes } = req.body;
    if (!work_date)
      return res.status(400).json({ error: "work_date required" });

    await pool.query(
      `
      INSERT INTO date_overrides (work_date, is_open, override_schedule_id, notes)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        is_open = VALUES(is_open),
        override_schedule_id = VALUES(override_schedule_id),
        notes = VALUES(notes)
    `,
      [work_date, is_open, override_schedule_id || null, notes || null]
    );

    res.status(201).json({ message: "Override saved successfully" });
  } catch (err) {
    console.error("❌ saveOverride error:", err);
    res.status(500).json({ error: "Failed to save override" });
  }
}

export async function deleteOverride(req, res) {
  try {
    const { date } = req.params;
    if (!date) return res.status(400).json({ error: "Missing date parameter" });

    const [result] = await pool.query(
      "DELETE FROM date_overrides WHERE work_date = ?",
      [date]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Override not found" });

    res.json({ message: "Override deleted successfully" });
  } catch (err) {
    console.error("❌ deleteOverride error:", err);
    res.status(500).json({ error: "Failed to delete override" });
  }
}
/* ============================================================
   🗓️  WEEK TEMPLATES (Reusable 7-day week plans)
   ============================================================ */

// 🧩 Safe JSON parser for week days
function safeParseDays(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return typeof value === "string"
      ? value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }
}

// 🧩 Normalize days input before inserting/updating
function normalizeDays(days) {
  if (Array.isArray(days)) return days;
  if (typeof days === "string") {
    return days
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// ✅ FIXED getWeekTemplates (handles comma-separated or JSON)
export async function getWeekTemplates(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, days, created_at FROM week_templates ORDER BY created_at DESC"
    );

    const parsed = rows.map((r) => {
      let days = [];
      try {
        const parsedDays = JSON.parse(r.days);
        days = Array.isArray(parsedDays)
          ? parsedDays
          : String(r.days || "")
              .split(",")
              .map((s) => s.trim());
      } catch {
        days = String(r.days || "")
          .split(",")
          .map((s) => s.trim());
      }
      return { ...r, days };
    });

    res.json(parsed);
  } catch (err) {
    console.error("❌ getWeekTemplates error:", err);
    res.status(500).json({ error: "Failed to fetch week templates" });
  }
}

export async function getWeekTemplateById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT id, name, days, created_at FROM week_templates WHERE id = ?",
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ error: "Template not found" });

    const template = rows[0];
    res.json({ ...template, days: safeParseDays(template.days) });
  } catch (err) {
    console.error("❌ getWeekTemplateById error:", err);
    res.status(500).json({ error: "Failed to fetch week template" });
  }
}

export async function addWeekTemplate(req, res) {
  try {
    let { name, days } = req.body;
    if (!name?.trim())
      return res.status(400).json({ error: "Template name required" });

    const normalizedDays = normalizeDays(days);
    if (normalizedDays.length !== 7)
      return res
        .status(400)
        .json({ error: "Days array must include exactly 7 entries" });

    const [result] = await pool.query(
      "INSERT INTO week_templates (name, days) VALUES (?, ?)",
      [name.trim(), JSON.stringify(normalizedDays)]
    );

    const [rows] = await pool.query(
      "SELECT id, name, days FROM week_templates WHERE id = ?",
      [result.insertId]
    );

    const newTemplate = rows[0];
    res.status(201).json({
      ...newTemplate,
      days: safeParseDays(newTemplate.days),
    });
  } catch (err) {
    console.error("❌ addWeekTemplate error:", err);
    res.status(500).json({ error: "Failed to create week template" });
  }
}

export async function updateWeekTemplate(req, res) {
  try {
    const { id } = req.params;
    let { name, days } = req.body;

    if (!id) return res.status(400).json({ error: "Missing ID" });
    if (!name?.trim())
      return res.status(400).json({ error: "Template name required" });

    const normalizedDays = normalizeDays(days);
    if (normalizedDays.length !== 7)
      return res
        .status(400)
        .json({ error: "Days array must include exactly 7 entries" });

    const [result] = await pool.query(
      "UPDATE week_templates SET name = ?, days = ? WHERE id = ?",
      [name.trim(), JSON.stringify(normalizedDays), id]
    );

    if (!result.affectedRows)
      return res.status(404).json({ error: "Week template not found" });

    res.json({ message: "Week template updated successfully" });
  } catch (err) {
    console.error("❌ updateWeekTemplate error:", err);
    res.status(500).json({ error: "Failed to update week template" });
  }
}

export async function assignWeekTemplate(req, res) {
  try {
    const { weekId, dateFrom, dateTo } = req.body;
    if (!weekId || !dateFrom)
      return res
        .status(400)
        .json({ error: "weekId and dateFrom are required" });

    await pool.query(
      "INSERT INTO week_assignments (week_id, date_from, date_to) VALUES (?, ?, ?)",
      [weekId, dateFrom, dateTo || null]
    );

    res.status(201).json({ message: "Week plan assigned successfully" });
  } catch (err) {
    console.error("❌ assignWeekTemplate error:", err);
    res.status(500).json({ error: "Failed to assign week template" });
  }
}

/* ============================================================
   ❌ DELETE WEEK TEMPLATE
   ============================================================ */
export async function deleteWeekTemplate(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      "DELETE FROM week_templates WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Week template not found" });

    res.json({ message: "Week template deleted successfully" });
  } catch (err) {
    console.error("❌ deleteWeekTemplate error:", err);
    res.status(500).json({ error: "Failed to delete week template" });
  }
}
