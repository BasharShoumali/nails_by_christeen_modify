import { pool } from "../pool/db.js";

/** Get all categories */
export async function getCategories(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categories ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}

/** Get single category by ID */
export async function getCategory(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Category not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
}

/** Add new category */
export async function addCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "")
      return res.status(400).json({ error: "Category name is required" });

    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name.trim()]
    );

    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    console.error("Error adding category:", err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Category name already exists" });
    } else {
      res.status(500).json({ error: "Failed to create category" });
    }
  }
}

/** Delete category */
export async function deleteCategory(req, res) {
  try {
    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      res
        .status(400)
        .json({ error: "Cannot delete category — it has linked products." });
    } else {
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
}
