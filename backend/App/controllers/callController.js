import CallSession from "../models/CallSession.js";
import { logAudit } from "../../middlewares/auditMiddleware.js";

export async function createCallSession(req, res) {
  try {
    const { receiverId, workerId, screeningId } = req.body;
    const roomId = `telemed-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const session = await CallSession.create({
      roomId,
      callerId: req.user._id,
      receiverId,
      workerId,
      screeningId,
      status: "INITIATED",
      startedAt: new Date(),
    });

    await logAudit({
      userId: req.user._id,
      action: "CALL_INITIATED",
      resourceType: "CallSession",
      resourceId: session._id,
      metadata: { roomId, receiverId },
      req,
    });

    return res.status(201).json({ success: true, data: session, roomId });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCallSessionByRoom(req, res) {
  try {
    const { roomId } = req.params;
    const session = await CallSession.findOne({ roomId })
      .populate("callerId", "name email role profile qualification")
      .populate("receiverId", "name email role profile")
      .populate("workerId")
      .populate("screeningId");

    if (!session) return res.status(404).json({ success: false, message: "Call room not found" });

    return res.json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function endCallSession(req, res) {
  try {
    const { roomId } = req.params;
    const { clinicalSummaryNotes } = req.body;

    const session = await CallSession.findOne({ roomId });
    if (!session) return res.status(404).json({ success: false, message: "Call not found" });

    const endedAt = new Date();
    const durationSeconds = session.startedAt ? Math.round((endedAt - session.startedAt) / 1000) : 0;

    session.status = "COMPLETED";
    session.endedAt = endedAt;
    session.durationSeconds = durationSeconds;
    if (clinicalSummaryNotes) session.clinicalSummaryNotes = clinicalSummaryNotes;

    await session.save();

    await logAudit({
      userId: req.user._id,
      action: "CALL_ENDED",
      resourceType: "CallSession",
      resourceId: session._id,
      metadata: { roomId, durationSeconds },
      req,
    });

    return res.json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
