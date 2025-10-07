import express from "express";
import {
  getUsers,
  getUser,
  addUser,
  deleteUser,
  getUserAppointments,
} from "../controllers/usersController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", addUser);
router.delete("/:id", deleteUser);

// 🆕 NEW: user appointment history
router.get("/:id/appointments", getUserAppointments);

export default router;
