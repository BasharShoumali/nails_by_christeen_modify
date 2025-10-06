import { pool } from "../pool/db.js";

/** Get all products (joined with category name) */
export async function getProducts(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

/** Get single product by ID */
export async function getProduct(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Product not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}

/** Add new product */
export async function addProduct(req, res) {
  try {
    const {
      name,
      category_id,
      barcode,
      quantity = 0,
      brand = null,
      last_opened_date = null,
      color = null,
    } = req.body;

    if (!name || !category_id || !barcode)
      return res
        .status(400)
        .json({ error: "name, category_id, and barcode are required" });

    const [result] = await pool.query(
      `INSERT INTO products
       (name, category_id, barcode, quantity, brand, last_opened_date, color)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id, barcode, quantity, brand, last_opened_date, color]
    );

    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error adding product:", err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Barcode already exists" });
    } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
      res.status(400).json({ error: "Invalid category_id" });
    } else {
      res.status(500).json({ error: "Failed to create product" });
    }
  }
}

/** Delete a product */
export async function deleteProduct(req, res) {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
}
