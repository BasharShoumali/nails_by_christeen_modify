import express from "express";
import {
  getUsers,
  getUser,
  addUser,
  deleteUser,
} from "../controllers/usersController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", addUser);
router.delete("/:id", deleteUser);

export default router;
