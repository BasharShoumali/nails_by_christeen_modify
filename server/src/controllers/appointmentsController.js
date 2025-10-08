import { pool } from "../pool/db.js";

/**
 * GET /api/admin/appointments?date=YYYY-MM-DD
 * Returns all appointments, optionally filtered by work_date
 */
export async function getAppointments(req, res) {
  try {
    const { date } = req.query;
    let query = `
      SELECT 
        a.id,
        a.user_id,
        u.username,
        u.phone_raw,
        a.work_date,
        a.slot,
        a.status,
        a.notes,
        a.amount_paid,
        a.inspo_img,
        a.created_at
      FROM appointments a
      JOIN users u ON u.id = a.user_id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += " AND a.work_date = ?";
      params.push(date);
    }

    query += " ORDER BY a.slot ASC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /api/admin/appointments
 * Creates a new appointment
 */
export async function createAppointment(req, res) {
  try {
    const { user_id, work_date, slot, notes } = req.body;
    if (!user_id || !work_date || !slot) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await pool.query(
      `INSERT INTO appointments (user_id, work_date, slot, notes)
       VALUES (?, ?, ?, ?)`,
      [user_id, work_date, slot, notes || null]
    );

    const [[created]] = await pool.query(
      `SELECT * FROM appointments WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(created);
  } catch (err) {
    console.error("❌ Error creating appointment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * PATCH /api/admin/appointments/:id
 * Update status or notes
 */
export async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const [result] = await pool.query(
      `UPDATE appointments
       SET status = COALESCE(?, status),
           notes = COALESCE(?, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, notes, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found" });

    const [[updated]] = await pool.query(
      `SELECT * FROM appointments WHERE id = ?`,
      [id]
    );

    res.json({ message: "Updated successfully", appointment: updated });
  } catch (err) {
    console.error("❌ Error updating appointment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * DELETE /api/admin/appointments/:id
 */
export async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM appointments WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting appointment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * PATCH /api/admin/appointments/:id/close
 * Closes an appointment and records the amount paid
 */
// controllers/appointmentsController.js
export async function closeAppointment(req, res) {
  try {
    const { id } = req.params;
    const { amount_paid } = req.body;

    if (!id || isNaN(amount_paid)) {
      return res.status(400).json({ error: "Invalid appointment or amount" });
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1️⃣ Get appointment date
    const [[appt]] = await conn.query(
      `SELECT work_date FROM appointments WHERE id = ?`,
      [id]
    );

    if (!appt) throw new Error("Appointment not found");

    const workDate = new Date(appt.work_date);
    const monthYear = `${workDate.getFullYear()}-${String(
      workDate.getMonth() + 1
    ).padStart(2, "0")}`;

    // 2️⃣ Update appointment
    const [result] = await conn.query(
      `UPDATE appointments
       SET status = 'closed',
           amount_paid = ?,
           closed_at = NOW()
       WHERE id = ?`,
      [amount_paid, id]
    );

    if (result.affectedRows === 0) throw new Error("Appointment not updated");

    // 3️⃣ Insert/update monthly finance by appointment month
    await conn.query(
      `INSERT INTO monthly_finance (month_year, income)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE income = income + VALUES(income)`,
      [monthYear, amount_paid]
    );

    await conn.commit();
    res.json({
      success: true,
      message: `Appointment closed (recorded under ${monthYear})`,
    });
  } catch (err) {
    console.error("❌ Error closing appointment:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to close appointment" });
  }
}

/**
 * PATCH /api/admin/appointments/:id/cancel
 * Cancels an open appointment
 */
export async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE appointments
       SET status='canceled', updated_at=NOW()
       WHERE id=? AND status='open'`,
      [id]
    );

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ error: "Appointment not found or already closed/canceled" });

    const [[updated]] = await pool.query(
      `SELECT * FROM appointments WHERE id = ?`,
      [id]
    );

    res.json({
      message: "Appointment canceled successfully",
      appointment: updated,
    });
  } catch (err) {
    console.error("❌ Error canceling appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
