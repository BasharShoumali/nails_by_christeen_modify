import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./pool/db.js";

import authRouter from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import schedulesRoutes from "./routes/schedules.js";
import scheduleSlotsRoutes from "./routes/scheduleSlots.js";
import scheduleAssignmentsRoutes from "./routes/scheduleAssignments.js";
import dateOverridesRoutes from "./routes/dateOverrides.js";
import dateSlotOverridesRoutes from "./routes/dateSlotOverrides.js";
import appointmentsRoutes from "./routes/appointments.js";
import categoriesRoutes from "./routes/categories.js";
import productsRoutes from "./routes/products.js";
import passwordResetTokensRoutes from "./routes/passwordResetTokens.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRouter);
app.use("/api/users", usersRoutes);
app.use("/api/schedules", schedulesRoutes);
app.use("/api/schedule-slots", scheduleSlotsRoutes);
app.use("/api/schedule-assignments", scheduleAssignmentsRoutes);
app.use("/api/date-overrides", dateOverridesRoutes);
app.use("/api/date-slot-overrides", dateSlotOverridesRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/password-reset-tokens", passwordResetTokensRoutes);

app.get("/", (req, res) => res.send("✅ API running"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
