import mongoose from "mongoose";

const respiratoryAudioSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      sparse: true,
      index: true,
    },
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
      sparse: true,
      index: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: "audio/wav",
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    recordingType: {
      type: String,
      enum: ["COUGH", "TRACHEAL_BREATHING", "CHEST_AUSCULTATION", "FORCED_EXPIRATION"],
      default: "COUGH",
    },
    aiAnalysis: {
      status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "PENDING",
      },
      classification: {
        type: String,
        enum: ["NORMAL", "WHEEZE", "CRACKLE", "STRIDOR", "DIMINISHED_BREATH_SOUNDS", "INCONCLUSIVE"],
        default: "NORMAL",
      },
      confidence: {
        type: Number,
        default: 0.0,
      },
      signals: [
        {
          type: { type: String },
          description: String,
          severity: String,
        },
      ],
      features: {
        mfccSummary: [Number],
        spectralCentroidMean: Number,
        zeroCrossingRate: Number,
      },
      modelVersion: {
        type: String,
        default: "respiratory_v1_placeholder",
      },
      analyzedAt: Date,
    },
  },
  { timestamps: true }
);

const RespiratoryAudio = mongoose.model("RespiratoryAudio", respiratoryAudioSchema);

export default RespiratoryAudio;
