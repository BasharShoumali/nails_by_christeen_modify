import express from "express";
import {
  getScheduleSlots,
  getScheduleSlot,
  addScheduleSlot,
  deleteScheduleSlot,
} from "../controllers/scheduleSlotsController.js";

const router = express.Router();

router.get("/", getScheduleSlots);
router.get("/:id", getScheduleSlot);
router.post("/", addScheduleSlot);
router.delete("/:id", deleteScheduleSlot);

export default router;
