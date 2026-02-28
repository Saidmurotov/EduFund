import { Router } from "react"; // Wait, it's a backend file, should be express Router
import { Router as ExpressRouter } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { aiRateLimit } from "../middleware/rateLimit.js";
import { generateCalendarPlan } from "../controllers/calendar.controller.js";

const router = ExpressRouter();

router.post("/generate", verifyToken, aiRateLimit, generateCalendarPlan);

export default router;
