import express from "express";
import {
  // --- Day Templates ---
  getSchedules,
  addSchedule,
  deleteSchedule,

  // --- Schedule Slots ---
  getScheduleSlots,
  addSlot,
  deleteSlot,

  // --- Weekly Templates ---
  getWeekTemplates,
  getWeekTemplateById,
  addWeekTemplate,
  updateWeekTemplate,
  assignWeekTemplate,
  deleteWeekTemplate,
  // --- Weekly Assignments ---
  getWeekAssignments,
  saveWeekAssignment,
  deleteWeekAssignment,

  // --- Overrides ---
  getOverrides,
  saveOverride,
  deleteOverride,
} from "../controllers/adminScheduleController.js";

const router = express.Router();

/* ============================================================
   📅 DAY TEMPLATES (Single-day schedule definitions)
   ============================================================ */
router.get("/schedules", getSchedules);
router.post("/schedules", addSchedule);
router.delete("/schedules/:id", deleteSchedule);

/* ============================================================
   ⏰ SCHEDULE SLOTS (Individual time slots inside a day template)
   ============================================================ */
router.get("/schedule-slots/:scheduleId", getScheduleSlots);
router.post("/schedule-slots", addSlot);
router.delete("/schedule-slots/:scheduleId/:slotId", deleteSlot);

/* ============================================================
   🗓️ WEEK TEMPLATES (Reusable 7-day week plans)
   ============================================================ */
router.get("/week-templates", getWeekTemplates);
router.get("/week-templates/:id", getWeekTemplateById);
router.post("/week-templates", addWeekTemplate);
router.put("/week-templates/:id", updateWeekTemplate);
router.delete("/week-templates/:id", deleteWeekTemplate);

/* ============================================================
   📆 WEEK ASSIGNMENTS (Assign week template → calendar date range)
   ============================================================ */
router.get("/week-assignments", getWeekAssignments);
router.post("/week-assignments", assignWeekTemplate); // assign new week plan
router.delete("/week-assignments/:id", deleteWeekAssignment);

/* ============================================================
   🔁 OVERRIDES (Specific date overrides)
   ============================================================ */
router.get("/overrides", getOverrides);
router.post("/overrides", saveOverride);
router.delete("/overrides/:date", deleteOverride);

export default router;
