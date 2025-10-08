import { pool } from "../pool/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

/* ========================================================================
   📂 Multer setup for inspo uploads → saves to /uploads/inspo
========================================================================= */
const uploadDir = path.join(process.cwd(), "uploads", "inspo");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, unique);
  },
});

export const uploadInspo = multer({ storage }).single("file");

const BASE_URL = (process.env.BASE_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

/* ========================================================================
   📅 GET /api/admin/appointments?date=YYYY-MM-DD
========================================================================= */
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

    const formatted = rows.map((r) => ({
      ...r,
      inspo_img: r.inspo_img
        ? r.inspo_img.startsWith("http")
          ? r.inspo_img
          : `${BASE_URL}/${r.inspo_img.replace(/^\/?/, "")}`
        : null,
    }));

    console.log("🖼️ Appointments inspo images:");
    formatted.forEach((r) =>
      console.log(`  ➤ #${r.id} →`, r.inspo_img || "No image")
    );

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
/* ========================================================================
   ➕ POST /api/admin/appointments
========================================================================= */
export async function createAppointment(req, res) {
  try {
    let { user_id, work_date, slot, notes, inspo_img } = req.body;

    // Normalize date → YYYY-MM-DD
    if (work_date) {
      const d = new Date(work_date);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      work_date = local.toISOString().split("T")[0];
    }

    // ✅ Log incoming data for debug
    console.log("🧩 createAppointment → incoming inspo_img:", inspo_img);

    // ✅ Normalize inspo_img to relative path only (strip base URL if frontend sent it)
    if (inspo_img) {
      inspo_img = inspo_img
        .replace(/^https?:\/\/[^/]+\//, "") // remove domain
        .replace(/^\/?/, ""); // remove leading slash
    }

    if (!user_id || !work_date || !slot) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await pool.query(
      `INSERT INTO appointments (user_id, work_date, slot, notes, inspo_img, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'open', NOW())`,
      [user_id, work_date, slot, notes || null, inspo_img || null]
    );

    const [[created]] = await pool.query(
      `SELECT * FROM appointments WHERE id = ?`,
      [result.insertId]
    );

    // ✅ Return full URL for frontend
    if (created.inspo_img) {
      created.inspo_img = `${BASE_URL}/${created.inspo_img.replace(
        /^\/?/,
        ""
      )}`;
    }

    console.log("✅ Appointment created:", created);
    res.status(201).json(created);
  } catch (err) {
    console.error("❌ Error creating appointment:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "This time slot is already booked. Please choose another slot.",
      });
    }

    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}

/* ========================================================================
   🖼️ POST /api/admin/appointments/upload/inspo
========================================================================= */
export async function uploadInspoHandler(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const filePath = `uploads/inspo/${req.file.filename}`;
    console.log("📸 Uploaded inspo file:", filePath);
    res.json({ filePath });
  } catch (err) {
    console.error("❌ Error uploading inspo image:", err);
    res.status(500).json({ error: "Failed to upload inspo image" });
  }
}

/* ========================================================================
   ✏️ PATCH /api/admin/appointments/:id
========================================================================= */
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
    if (updated.inspo_img) {
      updated.inspo_img = `${BASE_URL}/${updated.inspo_img.replace(
        /^\/?/,
        ""
      )}`;
    }

    res.json({ message: "Updated successfully", appointment: updated });
  } catch (err) {
    console.error("❌ Error updating appointment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/* ========================================================================
   💰 PATCH /api/admin/appointments/:id/close
========================================================================= */
export async function closeAppointment(req, res) {
  try {
    const { id } = req.params;
    const { amount_paid } = req.body;

    if (!id || isNaN(amount_paid)) {
      return res.status(400).json({ error: "Invalid appointment or amount" });
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    const [[appt]] = await conn.query(
      `SELECT work_date FROM appointments WHERE id = ?`,
      [id]
    );
    if (!appt) throw new Error("Appointment not found");

    const workDate = new Date(appt.work_date);
    const monthYear = `${workDate.getFullYear()}-${String(
      workDate.getMonth() + 1
    ).padStart(2, "0")}`;

    await conn.query(
      `UPDATE appointments SET status='closed', amount_paid=?, closed_at=NOW() WHERE id=?`,
      [amount_paid, id]
    );

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

/* ========================================================================
   🚫 PATCH /api/admin/appointments/:id/cancel
========================================================================= */
export async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE appointments SET status='canceled', updated_at=NOW() WHERE id=? AND status='open'`,
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
    if (updated.inspo_img) {
      updated.inspo_img = `${BASE_URL}/${updated.inspo_img.replace(
        /^\/?/,
        ""
      )}`;
    }

    res.json({
      message: "Appointment canceled successfully",
      appointment: updated,
    });
  } catch (err) {
    console.error("❌ Error canceling appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/* ========================================================================
   👤 GET /api/users/:userId/appointments
========================================================================= */
export async function getUserAppointments(req, res) {
  try {
    console.log("helooooooo qqooo\n\n");
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT id, user_id, work_date, slot, status, notes, inspo_img, amount_paid
       FROM appointments WHERE user_id = ? ORDER BY work_date DESC`,
      [userId]
    );
    console.log(
      "🧾 Raw DB rows for user:",
      rows.map((r) => ({ id: r.id, inspo_img: r.inspo_img }))
    );

    const formatted = rows.map((r) => ({
      ...r,
      inspo_img: r.inspo_img
        ? r.inspo_img.startsWith("http")
          ? r.inspo_img
          : `${BASE_URL}/${r.inspo_img.replace(/^\/?/, "")}`
        : null,
    }));

    console.log(
      `📦 Returning ${formatted.length} appointments for user ${userId}`
    );
    res.json(formatted);
  } catch (err) {
    console.error("❌ getUserAppointments error:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
}

/* ========================================================================
   ❌ DELETE /api/admin/appointments/:id
========================================================================= */
export async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM appointments WHERE id = ?`, [
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
