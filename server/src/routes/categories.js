// server/routes/categories.js
import express from "express";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoriesController.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", addCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
