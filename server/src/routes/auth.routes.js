import { Router } from "express";

import { login, register } from "../controllers/auth.controller.js";

const router = Router();

router.get("/ping", (_req, res) => {
  res.json({ status: "ok" });
});

router.post("/register", register);
router.post("/login", login);

export default router;

