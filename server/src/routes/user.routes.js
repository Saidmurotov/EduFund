import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getMe } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", verifyToken, getMe);

export default router;

