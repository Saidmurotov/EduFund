import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./lib/env.js";

import authRoutes from "./routes/auth.routes.js";
import grantsRoutes from "./routes/grants.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import userRoutes from "./routes/user.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";
import { initNotificationJob } from "./jobs/notificationJob.js";
import "express-async-errors";

const app = express();
const PORT = process.env.PORT || 3001;
const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigin = allowedOrigins.includes("*")
  ? "*"
  : allowedOrigins.length
    ? allowedOrigins
    : "http://localhost:5173";

if (isDirectRun && process.env.VERCEL !== "1") {
  initNotificationJob();
}

// CORS: Produksion muhitda faqat o'zingizning frontend URL-ingizni kiriting
app.use(cors({
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/grants", grantsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Serverda ichki xato yuz berdi." });
});

// Start the server unless we're running in Vercel or in a test environment.
// Previously the app only listened when `isDirectRun` was true, but PM2
// starts the process with `-r dotenv/config` which changes argv and caused
// the server not to bind. Using NODE_ENV !== 'test' is safer and preserves
// test behavior.
if (process.env.VERCEL !== "1" && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`EduFund AI backend listening on port ${PORT}`);
  });
}

export default app;

