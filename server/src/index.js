import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import grantsRoutes from "./routes/grants.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import userRoutes from "./routes/user.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { initNotificationJob } from "./jobs/notificationJob.js";
import "express-async-errors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Start daily check job
initNotificationJob();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/grants", grantsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Serverda ichki xato yuz berdi." });
});

app.listen(PORT, () => {
  console.log(`EduFund AI backend listening on port ${PORT}`);
});

