import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./routes/auth.routes.js";
import grantsRouter from "./routes/grants.routes.js";
import aiRouter from "./routes/ai.routes.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "edufund-ai-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/grants", grantsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/users", userRouter);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`EduFund AI backend listening on port ${PORT}`);
});

