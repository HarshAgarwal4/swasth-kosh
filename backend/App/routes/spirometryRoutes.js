import express from "express";
import {
  saveSpirometry,
  getSpirometryByScreening,
} from "../controllers/spirometryController.js";

const router = express.Router();

router.post("/", saveSpirometry);
router.get("/:screeningId", getSpirometryByScreening);

export default router;
