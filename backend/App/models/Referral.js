import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referralCode: {
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
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
      required: true,
      index: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthcareFacility",
      required: true,
      index: true,
    },
    urgency: {
      type: String,
      enum: ["ROUTINE", "URGENT", "EMERGENCY"],
      default: "URGENT",
      index: true,
    },
    provisionalReason: {
      type: String,
      required: true,
    },
    recommendedInvestigations: [
      {
        type: String,
        enum: ["CHEST_XRAY_PA", "HRCT_CHEST", "PFT_FULL", "SPUTUM_AFB", "BRONCHOSCOPY", "PULMONOLOGY_CONSULTATION"],
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "APPOINTMENT_FIXED", "VISITED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    appointmentDate: Date,
    digitalSlipUrl: String,
    facilityNotes: String,
    confirmedDiagnosis: String,
    silicosisBoardCertificateNo: String,
  },
  { timestamps: true }
);

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
