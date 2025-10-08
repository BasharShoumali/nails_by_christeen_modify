import { pool } from "../pool/db.js";

// 🧾 Add new shopping list + update products + update outcome
export async function addShoppingList(req, res) {
  const { shop_name, total_cost, items } = req.body;

  // 🧩 Validate input
  if (
    !shop_name ||
    !total_cost ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const now = new Date();
  const month_year = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // 🛒 Insert shopping record
    const [result] = await conn.query(
      `INSERT INTO shopping_list (shop_name, total_cost, month_year, created_at)
       VALUES (?, ?, ?, NOW())`,
      [shop_name, total_cost, month_year]
    );

    const shoppingId = result.insertId;

    // 🧩 Store each purchased item (optional, if you want itemized list)
    for (const item of items) {
      if (!item.product_id || !item.quantity) continue;
      await conn.query(
        `INSERT INTO shopping_items (shopping_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [shoppingId, item.product_id, item.quantity]
      );

      // 🔁 Update product quantities
      await conn.query(
        `UPDATE products SET quantity = quantity + ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // 💰 Update or insert month’s outcome
    await conn.query(
      `INSERT INTO monthly_finance (month_year, outcome)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE outcome = outcome + VALUES(outcome)`,
      [month_year, total_cost]
    );

    await conn.commit();
    res.json({ success: true, shoppingId });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Shopping list error:", err);
    res.status(500).json({ error: "Failed to record shopping list" });
  } finally {
    conn.release();
  }
}

// 🛍 Get all shopping history
export async function getShoppingList(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        shop_name,
        total_cost,
        month_year,
        purchased_at AS created_at,
        items
      FROM shopping_list
      ORDER BY purchased_at DESC
    `);

    // 🧩 Convert total_cost from string → number
    const fixedRows = rows.map((r) => ({
      ...r,
      total_cost: parseFloat(r.total_cost),
    }));

    res.json(fixedRows);
  } catch (err) {
    console.error("❌ Error fetching shopping history:", err);
    res.status(500).json({ error: err.message });
  }
}

// 📊 Get all monthly finance data (income/outcome summary)
export async function getFinance(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT month_year, income, outcome
       FROM monthly_finance
       ORDER BY month_year DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching finance data:", err);
    res.status(500).json({ error: "Failed to fetch finance data" });
  }
}
