import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
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

// === 🖼 Serve uploaded inspo images ===
// This matches your controller: /upload/inspo/...
app.use("/upload", express.static(path.join(process.cwd(), "upload")));

// === Route Mounting ===

// 🔐 Auth
app.use("/api", authRouter);

// 👥 Users
app.use("/api/users", usersRoutes);

// 🗓 Scheduling & Appointments
app.use("/api/admin", adminScheduleRoutes);
app.use("/api/admin/appointments", appointmentsRoutes);

// 📊 Reports & Finance
app.use("/api/admin/reports", reportsRoute);
app.use("/api/admin/finance", financeRoutes);

// 🛍 Products & Categories
app.use("/api/admin/products", productsRoutes);
app.use("/api/admin/categories", categoriesRoutes);

// === Health Check ===
app.get("/", (req, res) => res.send("✅ API running successfully"));

// === Start Server ===
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
