import express from "express";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  closeAppointment,
  cancelAppointment,
  uploadInspo,
  uploadInspoHandler,
  getUserAppointments,
} from "../controllers/appointmentsController.js";
const router = express.Router(); // === Appointments CRUD ===
router.get("/", getAppointments);
router.post("/", createAppointment);
router.patch("/:id", updateAppointment);
router.delete("/:id", deleteAppointment); // === Status updates ===
router.patch("/:id/close", closeAppointment);
router.patch("/:id/cancel", cancelAppointment); // === Inspo upload endpoint ===
//🔥 This matches what your frontend is calling (POST /api/upload/inspo)
router.post("/upload/inspo", uploadInspo, uploadInspoHandler);
router.get("/:userId/appointments", getUserAppointments);

export default router;
