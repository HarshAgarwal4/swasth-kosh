import mongoose from "mongoose";

const riskAssessmentSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      index: true,
    },
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
      required: true,
      index: true,
    },
    overallRiskLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH"],
      required: true,
      index: true,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    exposureScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    symptomScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    spirometryScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    audioScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    riskFactors: [
      {
        factor: String,
        category: String,
        severity: String,
      },
    ],
    screeningSignals: [
      {
        signal: String,
        source: String,
        impact: String,
      },
    ],
    recommendation: {
      type: String,
      required: true,
    },
    hindiRecommendation: {
      type: String,
    },
    requiresClinicalReview: {
      type: Boolean,
      default: false,
    },
    disclaimer: {
      type: String,
      default:
        "This is an AI-assisted occupational screening score and decision support signal. It is NOT a medical diagnosis of silicosis or any respiratory disease. Clinical evaluation by a qualified medical officer is required.",
    },
    engineVersion: {
      type: String,
      default: "rule_v1.0_ai_hybrid",
    },
  },
  { timestamps: true }
);

const RiskAssessment = mongoose.model("RiskAssessment", riskAssessmentSchema);

export default RiskAssessment;
