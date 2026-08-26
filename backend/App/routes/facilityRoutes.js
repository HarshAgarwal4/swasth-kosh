import express from "express";
import {
  createFacility,
  getAllFacilities,
  getNearestFacilities,
} from "../controllers/facilityController.js";
import { isAdmin } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", isAdmin, createFacility);
router.get("/", getAllFacilities);
router.get("/nearest", getNearestFacilities);

export default router;
