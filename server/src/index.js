import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./pool/db.js";

// === Routes ===
import authRouter from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import adminScheduleRoutes from "./routes/adminScheduleRoutes.js";
import appointmentsRoutes from "./routes/appointmentsRoutes.js";
import reportsRoute from "./routes/reportsRoutes.js";
import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";
import financeRoutes from "./routes/financeRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// === Static folders for uploaded files ===
app.use("/uploads", express.static("uploads"));

// === Route mounting ===
app.use("/api", authRouter);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminScheduleRoutes);
app.use("/api/admin/appointments", appointmentsRoutes);
app.use("/api/admin", reportsRoute);
app.use("/api/admin", financeRoutes);

// ✅ Stock management endpoints
app.use("/api/admin/products", productsRoutes);
app.use("/api/admin/categories", categoriesRoutes);

// === Test route ===
app.get("/", (req, res) => res.send("✅ API running"));

// === Start server ===
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
