import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { aiRateLimit } from "../middleware/rateLimit.js";
import { chatWithAi, generateRoadmap } from "../controllers/ai.controller.js";

const router = Router();

router.post("/chat", verifyToken, aiRateLimit, chatWithAi);
router.post("/roadmap", verifyToken, aiRateLimit, generateRoadmap);

export default router;

