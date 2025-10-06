import express from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  deleteProduct,
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", addProduct);
router.delete("/:id", deleteProduct);

export default router;
