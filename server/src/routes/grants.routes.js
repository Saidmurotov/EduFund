import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  getAllGrants,
  getGrantById,
  getMatchedGrantsForUser,
  createGrant,
} from "../controllers/grants.controller.js";

const router = Router();

router.get("/", verifyToken, getAllGrants);
router.get("/match/:userId", verifyToken, getMatchedGrantsForUser);
router.get("/:id", verifyToken, getGrantById);
router.post("/", verifyToken, createGrant);

export default router;

