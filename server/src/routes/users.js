import express from "express";
import {
  getUsers,
  getUser,
  addUser,
  deleteUser,
  getUserAppointments,
  updateFirstName,
  updateLastName,
  updateDateOfBirth,
  updatePhone,
  updatePassword,
} from "../controllers/usersController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", addUser);
router.delete("/:id", deleteUser);

// 🧩 Profile update endpoints
router.patch("/:id/first_name", updateFirstName);
router.patch("/:id/last_name", updateLastName);
router.patch("/:id/date_of_birth", updateDateOfBirth);
router.patch("/:id/phone_raw", updatePhone);
router.patch("/:id/password", updatePassword);

// 🧾 Appointments
router.get("/:id/appointments", getUserAppointments);

export default router;
