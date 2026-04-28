import { Router } from "express";
import { runNotificationCheck } from "../jobs/notificationJob.js";

const router = Router();

function verifyJobSecret(req, res, next) {
  const configuredSecret = process.env.JOB_SECRET;
  if (!configuredSecret) {
    return res.status(503).json({ message: "JOB_SECRET sozlanmagan." });
  }

  const providedSecret = req.headers["x-job-secret"];
  if (providedSecret !== configuredSecret) {
    return res.status(401).json({ message: "Job secret noto'g'ri." });
  }

  return next();
}

router.post("/notifications/daily", verifyJobSecret, async (_req, res) => {
  const result = await runNotificationCheck();
  res.json({ status: "ok", ...result });
});

export default router;
