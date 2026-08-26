import Worker from "../models/Worker.js";
import Mine from "../models/Mine.js";
import Screening from "../models/Screening.js";
import { logAudit } from "../../middlewares/auditMiddleware.js";

// Helper to generate unique worker code
function generateWorkerCode() {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `WRK-${year}-${rand}`;
}

export async function createWorker(req, res) {
  try {
    const {
      name,
      age,
      gender,
      phone,
      nationalId,
      location,
      mineId,
      jobRole,
      yearsOfExposure,
      dailyExposureHours,
      ppeUsage,
      ppeType,
      smokingHistory,
      medicalHistory,
    } = req.body;

    if (!name || !age || !gender || !mineId) {
      return res.status(400).json({ success: false, message: "Name, age, gender, and mine assignment are required" });
    }

    const workerCode = req.body.workerCode || generateWorkerCode();

    const worker = await Worker.create({
      userId: req.user?._id,
      workerCode,
      name,
      age: Number(age),
      gender,
      phone,
      nationalId,
      location: location || { district: req.user?.district || "Jaipur", state: req.user?.state || "Rajasthan" },
      mineId,
      jobRole: jobRole || "DRILLER",
      yearsOfExposure: Number(yearsOfExposure) || 0,
      dailyExposureHours: Number(dailyExposureHours) || 8,
      ppeUsage: ppeUsage || "SOMETIMES",
      ppeType: ppeType || "CLOTH_CLOTHES",
      smokingHistory: smokingHistory || { status: "NON_SMOKER" },
      medicalHistory: medicalHistory || {},
      registeredBy: req.user?._id,
    });

    // Update worker count in Mine
    await Mine.findByIdAndUpdate(mineId, { $inc: { workerCount: 1 } });

    await logAudit({
      userId: req.user?._id,
      action: "WORKER_REGISTERED",
      resourceType: "Worker",
      resourceId: worker._id,
      metadata: { workerCode, mineId },
      req,
    });

    return res.status(201).json({ success: true, data: worker });
  } catch (error) {
    console.error("createWorker error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllWorkers(req, res) {
  try {
    const { mineId, district, riskLevel, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (mineId) filter.mineId = mineId;
    if (district) filter["location.district"] = new RegExp(district, "i");
    if (riskLevel) filter.currentRiskLevel = riskLevel;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { workerCode: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    }

    // Role filtering: Workers can only see their own profile
    if (req.user?.role === "WORKER") {
      filter.$or = [{ userId: req.user._id }, { phone: req.user.phone }];
    }

    const workers = await Worker.find(filter)
      .populate("mineId", "name organization location mineralType")
      .populate("assignedDoctor", "name qualification email")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Worker.countDocuments(filter);

    return res.json({
      success: true,
      data: workers,
      meta: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    console.error("getAllWorkers error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getWorkerById(req, res) {
  try {
    const { id } = req.params;
    const worker = await Worker.findById(id)
      .populate("mineId")
      .populate("assignedDoctor", "name email phone qualification")
      .populate("latestScreeningId");

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    return res.json({ success: true, data: worker });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateWorker(req, res) {
  try {
    const { id } = req.params;
    const updated = await Worker.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getWorkerHistory(req, res) {
  try {
    const { id } = req.params;
    const screenings = await Screening.find({ workerId: id })
      .populate("riskAssessmentId")
      .populate("spirometryId")
      .populate("respiratoryAudioId")
      .populate("screenerId", "name role")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: screenings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
