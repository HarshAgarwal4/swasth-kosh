import mongoose from "mongoose";
import Spirometry from "../models/Spirometry.js";
import Screening from "../models/Screening.js";

export async function saveSpirometry(req, res) {
  try {
    const { workerId, screeningId, fev1, fvc, fev1FvcRatio, pef, operatorName, notes } = req.body;

    if (!fev1 || !fvc) {
      return res.status(400).json({ success: false, message: "fev1 and fvc are required" });
    }

    const calculatedRatio = fev1FvcRatio ? Number(fev1FvcRatio) : Math.round((Number(fev1) / Number(fvc)) * 100 * 10) / 10;
    let pattern = "NORMAL";
    let severity = "NORMAL";

    if (calculatedRatio < 70) {
      pattern = "OBSTRUCTIVE";
      if (fev1 < 1.5) severity = "SEVERE";
      else if (fev1 < 2.2) severity = "MODERATE";
      else severity = "MILD";
    }

    const effectiveWorkerId = (workerId && mongoose.Types.ObjectId.isValid(workerId)) ? workerId : undefined;
    const effectiveScreeningId = (screeningId && mongoose.Types.ObjectId.isValid(screeningId)) ? screeningId : undefined;

    const spiroData = {
      fev1: Number(fev1),
      fvc: Number(fvc),
      fev1FvcRatio: calculatedRatio,
      pef: pef ? Number(pef) : undefined,
      pattern,
      severity,
      operatorName: operatorName || req.user?.name,
      notes,
    };
    if (effectiveWorkerId) spiroData.workerId = effectiveWorkerId;
    if (effectiveScreeningId) spiroData.screeningId = effectiveScreeningId;

    const doc = await Spirometry.create(spiroData);

    if (effectiveScreeningId) {
      await Screening.findByIdAndUpdate(effectiveScreeningId, { spirometryId: doc._id });
    }

    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSpirometryByScreening(req, res) {
  try {
    const { screeningId } = req.params;
    const doc = await Spirometry.findOne({ screeningId });
    return res.json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
