import mongoose from "mongoose";

const spirometrySchema = new mongoose.Schema(
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
    fev1: {
      type: Number, // Liters
      required: true,
    },
    fvc: {
      type: Number, // Liters
      required: true,
    },
    fev1FvcRatio: {
      type: Number, // FEV1 / FVC ratio percentage (e.g. 75.5)
      required: true,
    },
    pef: {
      type: Number, // Peak Expiratory Flow in L/min
    },
    fev1Predicted: Number,
    fvcPredicted: Number,
    fev1PercentPredicted: Number,
    fvcPercentPredicted: Number,
    pattern: {
      type: String,
      enum: ["NORMAL", "OBSTRUCTIVE", "RESTRICTIVE_SUSPECTED", "MIXED_SUSPECTED", "INCONCLUSIVE"],
      default: "NORMAL",
    },
    severity: {
      type: String,
      enum: ["NORMAL", "MILD", "MODERATE", "SEVERE", "VERY_SEVERE"],
      default: "NORMAL",
    },
    qualityFlags: {
      goodEffort: { type: Boolean, default: true },
      acceptableCurves: { type: Boolean, default: true },
      coughArtifact: { type: Boolean, default: false },
      earlyTermination: { type: Boolean, default: false },
    },
    deviceId: {
      type: String,
      default: "MANUAL_ENTRY",
    },
    operatorName: String,
    notes: String,
  },
  { timestamps: true }
);

const Spirometry = mongoose.model("Spirometry", spirometrySchema);

export default Spirometry;
