import express from "express";
import {
  addShoppingList,
  getFinance,
  getShoppingList, // ✅ new endpoint to fetch all shopping history
} from "../controllers/financeController.js";

const router = express.Router();

// 🛒 Add a new shopping list
router.post("/shopping", addShoppingList);

// 🛍 Get all shopping history
router.get("/shopping", getShoppingList);

// 📊 Get monthly finance summary
router.get("/finance", getFinance);

export default router;
