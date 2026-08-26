import express from "express";
import {
  createReferral,
  getAllReferrals,
  getReferralById,
  updateReferralStatus,
} from "../controllers/referralController.js";
import { isMedicalOfficerOrDoctor } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", isMedicalOfficerOrDoctor, createReferral);
router.get("/", getAllReferrals);
router.get("/:id", getReferralById);
router.patch("/:id/status", updateReferralStatus);

export default router;
