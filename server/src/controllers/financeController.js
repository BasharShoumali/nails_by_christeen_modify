import { pool } from "../pool/db.js";

/* 🛒 Add new shopping list + update product quantities + update finance outcome */
export async function addShoppingList(req, res) {
  const { shop_name, total_cost, items } = req.body;

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
    // ✅ Ensure items are stored as valid JSON (not double-stringified)
    const jsonItems =
      typeof items === "string"
        ? items
        : JSON.stringify(items, (key, value) =>
            value === undefined ? null : value
          );

    // 🛒 Insert shopping record
    const [result] = await conn.query(
      `INSERT INTO shopping_list (shop_name, total_cost, month_year, purchased_at, items)
       VALUES (?, ?, ?, NOW(), CAST(? AS JSON))`,
      [shop_name, total_cost, month_year, jsonItems]
    );
    const shoppingId = result.insertId;

    // 🔁 Update each product’s stock
    for (const item of items) {
      if (!item.product_id || !item.quantity) continue;
      await conn.query(
        `UPDATE products SET quantity = quantity + ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // 💰 Update monthly outcome
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
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

/* 🛍 Get all shopping history — with product name + image */
export async function getShoppingList(req, res) {
  try {
    // 1️⃣ Fetch all shopping lists
    const [lists] = await pool.query(`
      SELECT id, shop_name, total_cost, month_year, purchased_at, items
      FROM shopping_list
      ORDER BY purchased_at DESC
    `);

    // 2️⃣ Fetch all products
    const [products] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        (SELECT pi.file_path 
         FROM product_images pi 
         WHERE pi.product_id = p.id 
         ORDER BY pi.uploaded_at ASC LIMIT 1) AS image_url
      FROM products p
    `);

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3️⃣ Build response
    const result = lists.map((list) => {
      let parsedItems = [];
      try {
        if (typeof list.items === "string") {
          // if stored as string → try to parse it
          parsedItems = JSON.parse(list.items);
          // handle double-encoded JSON (string inside string)
          if (typeof parsedItems === "string")
            parsedItems = JSON.parse(parsedItems);
        } else if (Array.isArray(list.items)) {
          parsedItems = list.items;
        } else {
          parsedItems = [];
        }
      } catch {
        parsedItems = [];
      }

      const detailedItems = parsedItems.map((item) => {
        const p = productMap.get(item.product_id) || {};

        // 🧩 Normalize image path
        let imgPath = p.image_url || null;
        if (imgPath) {
          // Normalize slashes and ensure relative path starts with "uploads/"
          imgPath = imgPath.replace(/\\/g, "/"); // handle Windows
          if (!imgPath.startsWith("uploads/")) {
            imgPath = `uploads/${imgPath}`;
          }
        }

        return {
          product_id: item.product_id,
          quantity: item.quantity,
          cost: item.cost || 0,
          name: p.name || `Product #${item.product_id}`,
          image_url: imgPath
            ? `${
                process.env.BASE_URL?.replace(/\/$/, "") ||
                "http://localhost:4000"
              }/${imgPath}`
            : null,
        };
      });

      return {
        id: list.id,
        shop_name: list.shop_name,
        total_cost: list.total_cost,
        month_year: list.month_year,
        purchased_at: list.purchased_at,
        items: detailedItems,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching shopping history:", err);
    res.status(500).json({ error: err.message });
  }
}

/* 📊 Get monthly finance summary */
export async function getFinance(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT month_year, income, outcome
      FROM monthly_finance
      ORDER BY month_year DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching finance data:", err);
    res.status(500).json({ error: "Failed to fetch finance data" });
  }
}
