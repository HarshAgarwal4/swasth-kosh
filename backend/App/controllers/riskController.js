import RiskAssessment from "../models/RiskAssessment.js";
import Worker from "../models/Worker.js";
import { computeComprehensiveRisk } from "../../services/riskService.js";

export async function analyzeRiskDirect(req, res) {
  try {
    const { worker, exposure, symptoms, spirometry, audio } = req.body;
    const result = await computeComprehensiveRisk({ worker, exposure, symptoms, spirometry, audio });
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getWorkerRiskHistory(req, res) {
  try {
    const { workerId } = req.params;
    const assessments = await RiskAssessment.find({ workerId })
      .populate("screeningId", "screeningCode createdAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: assessments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
