import mongoose from "mongoose";

const roleRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      index: true,
    },
    currentRole: {
      type: String,
      default: "WORKER",
    },
    requestedRole: {
      type: String,
      enum: ["DOCTOR", "MEDICAL_OFFICER", "SCREENING_WORKER", "REFERRAL_CENTER", "ADMIN"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING_FORM", "PENDING_REVIEW", "APPROVED", "REJECTED", "MODIFIED"],
      default: "PENDING_FORM",
      index: true,
    },
    applicationToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tokenExpiresAt: {
      type: Date,
      required: true,
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApprovalForm",
    },
    submittedFormData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    adminReviewNotes: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const RoleRequest = mongoose.model("RoleRequest", roleRequestSchema);

export default RoleRequest;
