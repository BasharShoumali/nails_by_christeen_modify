// server/controllers/categoriesController.js
import { pool } from "../pool/db.js";

/** GET all categories */
export async function getCategories(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name FROM categories ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}

/** ADD category */
export async function addCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Category name required" });

    const [result] = await pool.query(
      `INSERT INTO categories (name) VALUES (?)`,
      [name]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    console.error("❌ Error adding category:", err);
    if (err.code === "ER_DUP_ENTRY")
      res.status(409).json({ error: "Category already exists" });
    else res.status(500).json({ error: "Failed to add category" });
  }
}

/** UPDATE category */
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    await pool.query(`UPDATE categories SET name=? WHERE id=?`, [name, id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error updating category:", err);
    res.status(500).json({ error: "Failed to update category" });
  }
}

/** DELETE category */
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM categories WHERE id=?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting category:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
}
