import express from "express";
import { getReports } from "../controllers/reportsController.js";

const router = express.Router();

// ✅ This handles GET /api/admin/reports?from=YYYY-MM&to=YYYY-MM
router.get("/", getReports);

export default router;
