import express from "express";
import {
  addShoppingList,
  getShoppingList,
} from "../controllers/financeController.js";

const router = express.Router();

// 🛒 Add new shopping list
router.post("/shopping", addShoppingList);

// 🧾 Get all shopping lists
router.get("/shopping", getShoppingList);

export default router;
