import { pool } from "../pool/db.js";
import path from "path";
import fs from "fs";

// 🧩 Helper: ensure uploads folder exists
const ensureUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log("📂 Created missing folder:", dirPath);
  }
};

export async function getProducts(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name,
             (SELECT file_path FROM product_images WHERE product_id = p.id LIMIT 1) AS main_image
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ORDER BY p.updated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

export async function addProduct(req, res) {
  try {
    const { name, category_id, barcode, quantity, brand, color } = req.body;

    if (!name || !category_id)
      return res
        .status(400)
        .json({ error: "Missing required fields (name, category_id)" });

    const qty = Number(quantity ?? 0);
    const catId = Number(category_id);

    const [result] = await pool.query(
      `INSERT INTO products (name, category_id, barcode, quantity, brand, color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, catId, barcode || null, qty, brand || null, color || null]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("❌ Error adding product:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "A product with this barcode already exists.",
      });
    }

    res.status(500).json({ error: "Failed to add product" });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, category_id, barcode, quantity, brand, color } = req.body;

    await pool.query(
      `UPDATE products
       SET name=?, category_id=?, barcode=?, quantity=?, brand=?, color=?
       WHERE id=?`,
      [name, category_id, barcode, quantity, brand, color, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM products WHERE id=?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
}

export async function addProductImage(req, res) {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      console.error("❌ No file found in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadDir = path.resolve("uploads/products");
    ensureUploadDir(uploadDir);

    // Save relative path for DB storage
    const relativePath = path.join("uploads", "products", file.filename);
    console.log("📸 Image saved:", relativePath);

    await pool.query(
      `INSERT INTO product_images (product_id, file_path) VALUES (?, ?)`,
      [id, relativePath]
    );

    res.json({ success: true, file_path: relativePath });
  } catch (err) {
    console.error("❌ Image upload error:", err);
    res.status(500).json({ error: err.message || "Failed to upload image" });
  }
}
export async function markProductOpened(req, res) {
  try {
    const { id } = req.params;

    // 🧠 Reduce quantity by 1 (but not below 0)
    const [rows] = await pool.query(
      `SELECT quantity FROM products WHERE id = ?`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    const currentQty = rows[0].quantity ?? 0;
    if (currentQty <= 0) {
      return res
        .status(400)
        .json({ error: "Cannot open new — stock is already 0" });
    }

    // 🧩 Update both last_opened_date and quantity atomically
    await pool.query(
      `UPDATE products
       SET last_opened_date = CURDATE(),
           quantity = quantity - 1
       WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Product opened successfully",
      newQuantity: currentQty - 1,
      date: new Date().toISOString().split("T")[0],
    });
  } catch (err) {
    console.error("❌ Error updating last_opened_date:", err);
    res.status(500).json({ error: "Failed to mark product as opened" });
  }
}
export async function addProductQuantity(req, res) {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const qtyToAdd = Number(amount);

    if (!qtyToAdd || qtyToAdd <= 0)
      return res.status(400).json({ error: "Invalid amount" });

    // 🧩 Update quantity
    const [result] = await pool.query(
      `UPDATE products SET quantity = quantity + ? WHERE id = ?`,
      [qtyToAdd, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Product not found" });

    res.json({ success: true, added: qtyToAdd });
  } catch (err) {
    console.error("❌ Error adding quantity:", err);
    res.status(500).json({ error: "Failed to add quantity" });
  }
}
