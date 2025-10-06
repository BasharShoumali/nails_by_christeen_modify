import express from "express";
import {
  getScheduleAssignments,
  getScheduleAssignment,
  addScheduleAssignment,
  deleteScheduleAssignment,
} from "../controllers/scheduleAssignmentsController.js";

const router = express.Router();

router.get("/", getScheduleAssignments);
router.get("/:id", getScheduleAssignment);
router.post("/", addScheduleAssignment);
router.delete("/:id", deleteScheduleAssignment);

export default router;
