import express from "express";
import {
  getDateOverrides,
  getDateOverride,
  upsertDateOverride,
  deleteDateOverride,
} from "../controllers/dateOverridesController.js";

const router = express.Router();

router.get("/", getDateOverrides);
router.get("/:date", getDateOverride);
router.post("/", upsertDateOverride); // upsert (create or update)
router.delete("/:date", deleteDateOverride);

export default router;
