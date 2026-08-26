import express from "express";
import {
  createScreening,
  getAllScreenings,
  getScreeningById,
  addDoctorReview,
  syncOfflineScreenings,
} from "../controllers/screeningController.js";
import { isMedicalOfficerOrDoctor } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", createScreening);
router.get("/", getAllScreenings);
router.post("/sync-offline", syncOfflineScreenings);
router.get("/:id", getScreeningById);
router.post("/:id/review", isMedicalOfficerOrDoctor, addDoctorReview);

export default router;
