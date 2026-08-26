import mongoose from "mongoose";

const screeningSchema = new mongoose.Schema(
  {
    screeningCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      index: true,
    },
    screenerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mine",
      required: true,
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED", "REVIEWED", "REFERRED"],
      default: "COMPLETED",
      index: true,
    },
    offlineCreated: {
      type: Boolean,
      default: false,
    },
    syncedAt: {
      type: Date,
    },
    // 1. Occupational Exposure
    exposure: {
      dustExposureLevel: {
        type: String,
        enum: ["LOW", "MODERATE", "HEAVY", "EXTREME"],
        default: "HEAVY",
      },
      yearsOfExposure: Number,
      dailyHours: Number,
      ppeRegularity: String,
      worksInClosedSpace: Boolean,
      hasSandblastingOrDrilling: Boolean,
    },
    // 2. Respiratory Symptoms
    symptoms: {
      coughDurationWeeks: { type: Number, default: 0 },
      coughType: {
        type: String,
        enum: ["NONE", "DRY", "PRODUCTIVE_MUCUS", "HEMOPTYSIS_BLOOD"],
        default: "NONE",
      },
      breathlessnessGrade: {
        type: Number, // 0 = none, 1 = on strenuous exercise, 2 = walking flat, 3 = walking 100m, 4 = at rest
        min: 0,
        max: 4,
        default: 0,
      },
      chestTightnessOrPain: { type: Boolean, default: false },
      wheezingOrWhistling: { type: Boolean, default: false },
      unexplainedFatigue: { type: Boolean, default: false },
      frequentChestInfections: { type: Boolean, default: false },
      unexplainedWeightLoss: { type: Boolean, default: false },
      nightSweats: { type: Boolean, default: false },
      additionalNotes: String,
    },
    // 3. Optional X-ray
    xray: {
      imageUrl: String,
      hasOpacities: Boolean,
      iloCategorySuspected: String,
      uploadedAt: Date,
    },
    // 4. Linked sub-documents
    spirometryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Spirometry",
    },
    respiratoryAudioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RespiratoryAudio",
    },
    riskAssessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskAssessment",
    },
    // 5. Clinical Review Notes
    clinicalReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewedAt: Date,
      doctorNotes: String,
      provisionalAction: {
        type: String,
        enum: ["OBSERVATION", "SCHEDULE_VIDEO_CONSULT", "ISSUE_REFERRAL", "IMMEDIATE_HOSPITALIZATION", "ROUTINE_MONITORING"],
      },
      followUpDate: Date,
    },
  },
  { timestamps: true }
);

const Screening = mongoose.model("Screening", screeningSchema);

export default Screening;
