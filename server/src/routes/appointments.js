import express from "express";
import {
  getAppointments,
  getAppointment,
  addAppointment,
  deleteAppointment,
} from "../controllers/appointmentsController.js";

const router = express.Router();

router.get("/", getAppointments);
router.get("/:id", getAppointment);
router.post("/", addAppointment);
router.delete("/:id", deleteAppointment);

export default router;
