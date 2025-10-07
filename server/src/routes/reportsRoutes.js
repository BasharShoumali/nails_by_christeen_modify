import express from "express";
import { getReports } from "../controllers/reportsController.js";

const router = express.Router();

// GET /api/admin/reports?from=2025-01&to=2025-12
router.get("/reports", getReports);

export default router;
