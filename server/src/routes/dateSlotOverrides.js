import express from "express";
import {
  getDateSlotOverrides,
  getDateSlotOverridesByDate,
  upsertDateSlotOverride,
  deleteDateSlotOverride,
} from "../controllers/dateSlotOverridesController.js";

const router = express.Router();

router.get("/", getDateSlotOverrides);
router.get("/:date", getDateSlotOverridesByDate);
router.post("/", upsertDateSlotOverride); // insert or update
router.delete("/:date/:time", deleteDateSlotOverride);

export default router;
