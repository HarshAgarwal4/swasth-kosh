import Referral from "../models/Referral.js";
import Worker from "../models/Worker.js";
import Screening from "../models/Screening.js";
import Notification from "../models/Notification.js";
import { emitNotificationToUser } from "../../services/socketService.js";
import { logAudit } from "../../middlewares/auditMiddleware.js";

function generateReferralCode() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `REF-${new Date().getFullYear()}-${rand}`;
}

export async function createReferral(req, res) {
  try {
    const { workerId, screeningId, facilityId, urgency, provisionalReason, recommendedInvestigations, appointmentDate } = req.body;

    if (!workerId || !facilityId || !provisionalReason) {
      return res.status(400).json({ success: false, message: "workerId, facilityId, and provisionalReason are required" });
    }

    const referralCode = generateReferralCode();
    const referral = await Referral.create({
      referralCode,
      workerId,
      screeningId,
      referredBy: req.user._id,
      facilityId,
      urgency: urgency || "URGENT",
      provisionalReason,
      recommendedInvestigations: recommendedInvestigations || ["CHEST_XRAY_PA", "PULMONOLOGY_CONSULTATION"],
      appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
    });

    // Update worker's referral status
    await Worker.findByIdAndUpdate(workerId, {
      referralStatus: "REFERRED",
    });

    // Notify worker if linked to a user account
    const worker = await Worker.findById(workerId);
    if (worker?.userId) {
      const notif = await Notification.create({
        recipientId: worker.userId,
        title: "🏥 Medical Referral Issued",
        message: `A digital referral slip (${referralCode}) has been created for your clinical examination.`,
        type: "REFERRAL_CREATED",
        data: { referralId: referral._id.toString(), workerId: worker._id.toString() },
      });
      emitNotificationToUser(worker.userId.toString(), notif);
    }

    await logAudit({
      userId: req.user._id,
      action: "REFERRAL_CREATED",
      resourceType: "Referral",
      resourceId: referral._id,
      metadata: { urgency, referralCode },
      req,
    });

    const populated = await Referral.findById(referral._id)
      .populate("workerId")
      .populate("facilityId")
      .populate("referredBy", "name role qualification");

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllReferrals(req, res) {
  try {
    const { workerId, facilityId, status, urgency } = req.query;
    const filter = {};

    if (workerId) filter.workerId = workerId;
    if (facilityId) filter.facilityId = facilityId;
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;

    const referrals = await Referral.find(filter)
      .populate("workerId", "name workerCode age gender location currentRiskLevel phone")
      .populate("facilityId", "name address contactPhone")
      .populate("referredBy", "name role qualification")
      .populate("screeningId", "screeningCode createdAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: referrals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getReferralById(req, res) {
  try {
    const { id } = req.params;
    const referral = await Referral.findById(id)
      .populate("workerId")
      .populate("facilityId")
      .populate("referredBy", "name role qualification email phone")
      .populate("screeningId");

    if (!referral) return res.status(404).json({ success: false, message: "Referral not found" });

    return res.json({ success: true, data: referral });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateReferralStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, appointmentDate, facilityNotes, confirmedDiagnosis, silicosisBoardCertificateNo } = req.body;

    const referral = await Referral.findByIdAndUpdate(
      id,
      {
        status,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        facilityNotes,
        confirmedDiagnosis,
        silicosisBoardCertificateNo,
      },
      { new: true }
    );

    if (!referral) return res.status(404).json({ success: false, message: "Referral not found" });

    if (status === "COMPLETED") {
      await Worker.findByIdAndUpdate(referral.workerId, { referralStatus: "COMPLETED" });
    }

    return res.json({ success: true, data: referral });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
