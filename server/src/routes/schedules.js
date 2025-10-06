import express from "express";
import {
  getSchedules,
  getSchedule,
  addSchedule,
  deleteSchedule,
} from "../controllers/schedulesController.js";

const router = express.Router();

router.get("/", getSchedules);
router.get("/:id", getSchedule);
router.post("/", addSchedule);
router.delete("/:id", deleteSchedule);

export default router;
