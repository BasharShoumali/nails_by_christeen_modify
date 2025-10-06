import express from "express";
import {
  getPasswordResetTokens,
  getPasswordResetToken,
  addPasswordResetToken,
  deletePasswordResetToken,
} from "../controllers/passwordResetTokensController.js";

const router = express.Router();

router.get("/", getPasswordResetTokens);
router.get("/:id", getPasswordResetToken);
router.post("/", addPasswordResetToken);
router.delete("/:id", deletePasswordResetToken);

export default router;
