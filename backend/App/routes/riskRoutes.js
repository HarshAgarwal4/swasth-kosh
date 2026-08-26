import express from "express";
import { analyzeRiskDirect, getWorkerRiskHistory } from "../controllers/riskController.js";

const router = express.Router();

router.post("/analyze", analyzeRiskDirect);
router.get("/:workerId", getWorkerRiskHistory);

export default router;
