import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./pool/db.js";

import authRouter from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import adminScheduleRoutes from "./routes/adminScheduleRoutes.js";
import appointmentsRoutes from "./routes/appointmentsRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRouter);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminScheduleRoutes);
app.use("/api/admin/appointments", appointmentsRoutes);

app.get("/", (req, res) => res.send("✅ API running"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
