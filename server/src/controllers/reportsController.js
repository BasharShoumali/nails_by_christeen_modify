import { pool } from "../pool/db.js";

export async function getReports(req, res) {
  try {
    const { from, to } = req.query;

    // Default range → last 12 months
    const fromMonth =
      from ||
      new Date(new Date().setMonth(new Date().getMonth() - 11))
        .toISOString()
        .slice(0, 7);
    const toMonth = to || new Date().toISOString().slice(0, 7);

    // 1️⃣ Appointments by Status
    const [appointments] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(work_date, '%Y-%m') AS month,
        COUNT(*) AS total,
        SUM(status = 'closed') AS closed,
        SUM(status = 'open') AS open,
        SUM(status = 'canceled') AS canceled
      FROM appointments
      WHERE work_date BETWEEN STR_TO_DATE(CONCAT(?, '-01'), '%Y-%m-%d')
                          AND LAST_DAY(STR_TO_DATE(CONCAT(?, '-01'), '%Y-%m-%d'))
      GROUP BY month
      ORDER BY month;
      `,
      [fromMonth, toMonth]
    );

    // 2️⃣ Monthly Revenue
    const [revenue] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(work_date, '%Y-%m') AS month,
        ROUND(SUM(amount_paid), 2) AS total_amount
      FROM appointments
      WHERE status = 'closed'
        AND work_date BETWEEN STR_TO_DATE(CONCAT(?, '-01'), '%Y-%m-%d')
                          AND LAST_DAY(STR_TO_DATE(CONCAT(?, '-01'), '%Y-%m-%d'))
      GROUP BY month
      ORDER BY month;
      `,
      [fromMonth, toMonth]
    );

    // 3️⃣ New Users
    const [users] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS new_users
      FROM users
      WHERE created_at BETWEEN STR_TO_DATE(CONCAT(?, '-01'), '%Y-%m-%d')
                           AND LAST_DAY(STR_TO_DATE(CONCAT(?, '-01'), '%Y-%m-%d'))
      GROUP BY month
      ORDER BY month;
      `,
      [fromMonth, toMonth]
    );

    // 4️⃣ Weekday Distribution
    const [weekdayDistribution] = await pool.query(`
      SELECT 
        DAYNAME(work_date) AS weekday,
        COUNT(*) AS count
      FROM appointments
      WHERE status <> 'canceled'
      GROUP BY weekday
      ORDER BY FIELD(weekday, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    `);

    // ✅ Return everything
    res.json({
      monthly_appointments: appointments,
      monthly_revenue: revenue,
      monthly_users: users,
      weekday_distribution: weekdayDistribution,
    });
  } catch (err) {
    console.error("❌ Error in getReports:", err);
    res.status(500).json({ error: "Failed to load reports" });
  }
}
