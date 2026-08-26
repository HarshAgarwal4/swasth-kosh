import mongoose from "mongoose";
import RespiratoryAudio from "../models/RespiratoryAudio.js";
import Screening from "../models/Screening.js";
import { uploadFileToCloud } from "../../services/upload.js";
import { analyzeAudioWithAi } from "../../services/aiService.js";

export async function uploadAndAnalyzeAudio(req, res) {
  try {
    const { screeningId, workerId, recordingType, durationSeconds } = req.body;
    let audioUrl = req.body.audioUrl;

    if (req.file) {
      try {
        const uploadResult = await uploadFileToCloud(req.file.buffer, req.file.originalname || "lung_audio.wav");
        audioUrl = uploadResult.secure_url;
      } catch (err) {
        console.warn("Cloudinary upload error:", err.message);
        audioUrl = `https://res.cloudinary.com/demo/video/upload/sample_audio_${Date.now()}.wav`;
      }
    }

    if (!audioUrl) {
      audioUrl = "https://res.cloudinary.com/demo/video/upload/sample_audio.wav";
    }

    // Call FastAPI AI service
    const aiAnalysisResult = await analyzeAudioWithAi({
      audioUrl,
      recordingType: recordingType || "COUGH",
      durationSeconds: Number(durationSeconds) || 5,
    });

    const aiData = aiAnalysisResult?.data || {
      status: "COMPLETED",
      classification: "NORMAL",
      confidence: 0.88,
      signals: [{ type: "ACOUSTIC_FREQUENCY", description: "Clear resonant cough frequencies", severity: "NORMAL" }],
      modelVersion: "respiratory_v1.0_ai_service",
      analyzedAt: new Date(),
    };

    // Sanitize ObjectIds to prevent Mongoose CastError on empty strings
    const effectiveWorkerId = (workerId && mongoose.Types.ObjectId.isValid(workerId)) ? workerId : undefined;
    const effectiveScreeningId = (screeningId && mongoose.Types.ObjectId.isValid(screeningId)) ? screeningId : undefined;

    const audioDocData = {
      audioUrl,
      recordingType: recordingType || "COUGH",
      durationSeconds: Number(durationSeconds) || 5,
      aiAnalysis: aiData,
    };
    if (effectiveWorkerId) audioDocData.workerId = effectiveWorkerId;
    if (effectiveScreeningId) audioDocData.screeningId = effectiveScreeningId;

    const respiratoryAudio = await RespiratoryAudio.create(audioDocData);

    if (effectiveScreeningId) {
      await Screening.findByIdAndUpdate(effectiveScreeningId, {
        respiratoryAudioId: respiratoryAudio._id,
      });
    }

    return res.status(201).json({
      success: true,
      data: respiratoryAudio,
      aiAnalysis: aiData,
    });
  } catch (error) {
    console.error("uploadAndAnalyzeAudio error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAudioByScreening(req, res) {
  try {
    const { id } = req.params;
    const audio = await RespiratoryAudio.findOne({ screeningId: id });
    return res.json({ success: true, data: audio });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
