import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    workerCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 14,
      max: 100,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    nationalId: {
      type: String,
      trim: true,
    },
    location: {
      address: String,
      village: String,
      district: {
        type: String,
        required: true,
        index: true,
      },
      state: {
        type: String,
        required: true,
        index: true,
      },
      pincode: String,
    },
    mineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mine",
      required: true,
      index: true,
    },
    jobRole: {
      type: String,
      required: true,
      enum: [
        "DRILLER",
        "CRUSHER_OPERATOR",
        "LOADER_UNLOADER",
        "CUTTER_POLISHER",
        "TRANSPORT_DRIVER",
        "MAINTENANCE",
        "SUPERVISOR",
        "OTHER_DUST_EXPOSED",
      ],
      default: "DRILLER",
    },
    yearsOfExposure: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    dailyExposureHours: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
      default: 8,
    },
    ppeUsage: {
      type: String,
      enum: ["ALWAYS", "SOMETIMES", "RARELY", "NEVER"],
      default: "SOMETIMES",
    },
    ppeType: {
      type: String,
      enum: ["N95_RESPIRATOR", "SURGICAL_MASK", "CLOTH_CLOTHES", "NONE"],
      default: "CLOTH_CLOTHES",
    },
    smokingHistory: {
      status: {
        type: String,
        enum: ["NON_SMOKER", "EX_SMOKER", "CURRENT_SMOKER", "BIDI_SMOKER"],
        default: "NON_SMOKER",
      },
      packYears: {
        type: Number,
        default: 0,
      },
    },
    medicalHistory: {
      hasTuberculosis: { type: Boolean, default: false },
      tbTreatedYear: Number,
      hasAsthma: { type: Boolean, default: false },
      hasCOPD: { type: Boolean, default: false },
      familyRespiratoryHistory: { type: Boolean, default: false },
      diabetes: { type: Boolean, default: false },
      hypertension: { type: Boolean, default: false },
    },
    currentRiskLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH", "PENDING_ASSESSMENT"],
      default: "PENDING_ASSESSMENT",
      index: true,
    },
    latestScreeningDate: {
      type: Date,
    },
    latestScreeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
    },
    referralStatus: {
      type: String,
      enum: ["NONE", "REFERRAL_REQUESTED", "REFERRED", "CONSULTATION_SCHEDULED", "COMPLETED", "REJECTED"],
      default: "NONE",
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Worker = mongoose.model("Worker", workerSchema);

export default Worker;
