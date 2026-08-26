import Screening from "../models/Screening.js";
import Worker from "../models/Worker.js";
import Spirometry from "../models/Spirometry.js";
import RespiratoryAudio from "../models/RespiratoryAudio.js";
import RiskAssessment from "../models/RiskAssessment.js";
import Notification from "../models/Notification.js";
import UserModel from "../models/user.js";
import { computeComprehensiveRisk } from "../../services/riskService.js";
import { emitNotificationToUser, broadcastHighRiskAlert } from "../../services/socketService.js";
import { logAudit } from "../../middlewares/auditMiddleware.js";

function generateScreeningCode() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `SCR-${new Date().getFullYear()}-${rand}`;
}

export async function createScreening(req, res) {
  try {
    const {
      workerId,
      mineId,
      exposure,
      symptoms,
      spirometryData,
      audioData,
      xray,
      offlineCreated,
    } = req.body;

    if (!workerId) {
      return res.status(400).json({ success: false, message: "Worker ID is required" });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    const effectiveMineId = mineId || worker.mineId;
    const screeningCode = req.body.screeningCode || generateScreeningCode();

    // 1. Create temporary/initial Screening doc
    const screening = new Screening({
      screeningCode,
      workerId,
      screenerId: req.user?._id || worker.userId || worker._id,
      mineId: effectiveMineId,
      exposure: exposure || {
        dustExposureLevel: "MODERATE",
        yearsOfExposure: worker.yearsOfExposure,
        dailyHours: worker.dailyExposureHours,
        ppeRegularity: worker.ppeUsage,
      },
      symptoms: symptoms || {},
      xray: xray || {},
      offlineCreated: !!offlineCreated,
      syncedAt: offlineCreated ? new Date() : undefined,
    });

    // 2. Save Spirometry if provided
    let spirometryDoc = null;
    if (spirometryData && (spirometryData.fev1 || spirometryData.fev1FvcRatio)) {
      spirometryDoc = await Spirometry.create({
        workerId,
        screeningId: screening._id,
        fev1: Number(spirometryData.fev1) || 2.5,
        fvc: Number(spirometryData.fvc) || 3.2,
        fev1FvcRatio: Number(spirometryData.fev1FvcRatio) || 78,
        pef: Number(spirometryData.pef) || 400,
        fev1PercentPredicted: Number(spirometryData.fev1PercentPredicted) || 82,
        fvcPercentPredicted: Number(spirometryData.fvcPercentPredicted) || 85,
        pattern: spirometryData.pattern || "NORMAL",
        operatorName: spirometryData.operatorName || req.user?.name,
        notes: spirometryData.notes,
      });
      screening.spirometryId = spirometryDoc._id;
    }

    // 3. Save Audio record if provided
    let audioDoc = null;
    if (audioData && audioData.audioUrl) {
      audioDoc = await RespiratoryAudio.create({
        workerId,
        screeningId: screening._id,
        audioUrl: audioData.audioUrl,
        durationSeconds: audioData.durationSeconds || 5,
        recordingType: audioData.recordingType || "COUGH",
        aiAnalysis: audioData.aiAnalysis || {
          status: "COMPLETED",
          classification: "NORMAL",
          confidence: 0.85,
          modelVersion: "v1_audio_placeholder",
        },
      });
      screening.respiratoryAudioId = audioDoc._id;
    }

    // 4. Compute Comprehensive Multi-Factor Risk Assessment
    const riskResult = await computeComprehensiveRisk({
      worker,
      exposure: screening.exposure,
      symptoms: screening.symptoms,
      spirometry: spirometryDoc,
      audio: audioDoc,
    });

    const riskAssessment = await RiskAssessment.create({
      workerId,
      screeningId: screening._id,
      overallRiskLevel: riskResult.overallRiskLevel,
      overallScore: riskResult.overallScore,
      exposureScore: riskResult.exposureScore,
      symptomScore: riskResult.symptomScore,
      spirometryScore: riskResult.spirometryScore,
      audioScore: riskResult.audioScore,
      riskFactors: riskResult.riskFactors,
      screeningSignals: riskResult.screeningSignals,
      recommendation: riskResult.recommendation,
      hindiRecommendation: riskResult.hindiRecommendation,
      requiresClinicalReview: riskResult.requiresClinicalReview,
      disclaimer: riskResult.disclaimer,
      engineVersion: riskResult.engineVersion,
    });

    screening.riskAssessmentId = riskAssessment._id;
    await screening.save();

    // 5. Update Worker Profile latest state
    worker.currentRiskLevel = riskResult.overallRiskLevel;
    worker.latestScreeningDate = new Date();
    worker.latestScreeningId = screening._id;
    if (riskResult.overallRiskLevel === "HIGH" && worker.referralStatus === "NONE") {
      worker.referralStatus = "REFERRAL_REQUESTED";
    }
    await worker.save();

    // 6. Notifications on High / Moderate Risk
    if (riskResult.overallRiskLevel === "HIGH") {
      broadcastHighRiskAlert({
        workerId: worker._id,
        workerName: worker.name,
        screeningId: screening._id,
        riskScore: riskResult.overallScore,
      });

      // Find Doctors / Medical Officers to notify
      const doctors = await UserModel.find({
        role: { $in: ["DOCTOR", "MEDICAL_OFFICER"] },
      }).limit(5);

      for (const doc of doctors) {
        const notif = await Notification.create({
          recipientId: doc._id,
          title: "⚠️ High Risk Screening Alert",
          message: `Worker ${worker.name} (${worker.workerCode}) flagged with HIGH respiratory risk. Clinical review required.`,
          type: "HIGH_RISK_DETECTED",
          data: {
            screeningId: screening._id.toString(),
            workerId: worker._id.toString(),
          },
        });
        emitNotificationToUser(doc._id.toString(), notif);
      }
    }

    await logAudit({
      userId: req.user?._id,
      action: "SCREENING_CREATED",
      resourceType: "Screening",
      resourceId: screening._id,
      metadata: { riskLevel: riskResult.overallRiskLevel, score: riskResult.overallScore },
      req,
    });

    // Populate and return full response
    const populated = await Screening.findById(screening._id)
      .populate("workerId")
      .populate("mineId")
      .populate("spirometryId")
      .populate("respiratoryAudioId")
      .populate("riskAssessmentId");

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("createScreening error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getScreeningById(req, res) {
  try {
    const { id } = req.params;
    const screening = await Screening.findById(id)
      .populate("workerId")
      .populate("mineId")
      .populate("screenerId", "name role organization")
      .populate("spirometryId")
      .populate("respiratoryAudioId")
      .populate("riskAssessmentId")
      .populate("clinicalReview.reviewedBy", "name qualification registrationNumber");

    if (!screening) {
      return res.status(404).json({ success: false, message: "Screening record not found" });
    }

    return res.json({ success: true, data: screening });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllScreenings(req, res) {
  try {
    const { workerId, mineId, riskLevel, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (workerId) filter.workerId = workerId;
    if (mineId) filter.mineId = mineId;
    if (status) filter.status = status;

    const screenings = await Screening.find(filter)
      .populate("workerId", "name workerCode age gender currentRiskLevel jobRole location")
      .populate("mineId", "name organization")
      .populate("riskAssessmentId", "overallRiskLevel overallScore recommendation")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Screening.countDocuments(filter);

    return res.json({
      success: true,
      data: screenings,
      meta: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function addDoctorReview(req, res) {
  try {
    const { id } = req.params;
    const { doctorNotes, provisionalAction, followUpDate } = req.body;

    const screening = await Screening.findById(id);
    if (!screening) {
      return res.status(404).json({ success: false, message: "Screening not found" });
    }

    screening.status = "REVIEWED";
    screening.clinicalReview = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      doctorNotes,
      provisionalAction: provisionalAction || "OBSERVATION",
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    };

    await screening.save();

    await logAudit({
      userId: req.user._id,
      action: "DOCTOR_REVIEWED_SCREENING",
      resourceType: "Screening",
      resourceId: screening._id,
      metadata: { provisionalAction },
      req,
    });

    return res.json({ success: true, data: screening });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function syncOfflineScreenings(req, res) {
  try {
    const { screenings } = req.body;
    if (!Array.isArray(screenings) || screenings.length === 0) {
      return res.status(400).json({ success: false, message: "No screenings provided for sync" });
    }

    const syncedResults = [];
    for (const item of screenings) {
      // Avoid duplicate sync if screeningCode already exists
      if (item.screeningCode) {
        const exists = await Screening.findOne({ screeningCode: item.screeningCode });
        if (exists) {
          syncedResults.push({ screeningCode: item.screeningCode, status: "ALREADY_SYNCED" });
          continue;
        }
      }
      req.body = { ...item, offlineCreated: true };
      // Call create logic
      const worker = await Worker.findById(item.workerId);
      if (worker) {
        const riskResult = await computeComprehensiveRisk({
          worker,
          exposure: item.exposure,
          symptoms: item.symptoms,
          spirometry: item.spirometryData,
          audio: item.audioData,
        });

        const newScreening = await Screening.create({
          screeningCode: item.screeningCode || generateScreeningCode(),
          workerId: item.workerId,
          screenerId: req.user?._id || worker.userId || worker._id,
          mineId: item.mineId || worker.mineId,
          exposure: item.exposure,
          symptoms: item.symptoms,
          offlineCreated: true,
          syncedAt: new Date(),
        });

        const riskAssessment = await RiskAssessment.create({
          workerId: item.workerId,
          screeningId: newScreening._id,
          ...riskResult,
        });

        newScreening.riskAssessmentId = riskAssessment._id;
        await newScreening.save();

        syncedResults.push({ screeningCode: newScreening.screeningCode, status: "SYNCED", id: newScreening._id });
      }
    }

    return res.json({ success: true, syncedCount: syncedResults.length, results: syncedResults });
  } catch (error) {
    console.error("syncOfflineScreenings error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
