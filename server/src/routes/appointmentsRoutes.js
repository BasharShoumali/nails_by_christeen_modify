import express from "express";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  closeAppointment,
  cancelAppointment,
} from "../controllers/appointmentsController.js";

const router = express.Router();

router.get("/", getAppointments);
router.post("/", createAppointment);
router.patch("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

router.patch("/:id/close", closeAppointment);
router.patch("/:id/cancel", cancelAppointment);

export default router;
