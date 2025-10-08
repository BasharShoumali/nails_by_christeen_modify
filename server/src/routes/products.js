import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  addProductImage,
  markProductOpened,
  addProductQuantity,
} from "../controllers/productsController.js";

const router = express.Router();

// === Ensure upload folder always exists ===
const uploadsPath = path.resolve("uploads/products");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 Created:", uploadsPath);
}

// === Multer setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, unique);
  },
});
const upload = multer({ storage });

// === Routes ===
router.get("/", getProducts);
router.post("/", addProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/images", upload.single("image"), addProductImage);
router.post("/:id/open", markProductOpened);
router.post("/:id/add-quantity", addProductQuantity);

export default router;
