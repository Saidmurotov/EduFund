import { Router } from "express";
import { optionalVerifyToken, verifyToken } from "../middleware/verifyToken.js";
import {
  getAllGrants,
  getGrantById,
  getGrantApplyUrl,
  getMatchedGrantsForUser,
  createGrant,
} from "../controllers/grants.controller.js";

const router = Router();

router.get("/", optionalVerifyToken, getAllGrants);
router.get("/match/:userId", verifyToken, getMatchedGrantsForUser);
router.get("/:id/apply-url", optionalVerifyToken, getGrantApplyUrl);
router.get("/:id", optionalVerifyToken, getGrantById);
router.post("/", verifyToken, createGrant);

export default router;

