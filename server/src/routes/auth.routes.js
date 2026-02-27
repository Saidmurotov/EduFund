import { Router } from "express";

const router = Router();

router.get("/ping", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;

