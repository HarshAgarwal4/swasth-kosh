import mongoose from "mongoose";

const formFieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "number", "email", "select", "textarea", "file", "checkbox", "date"],
      default: "text",
    },
    options: [String], // for select fields
    isRequired: {
      type: Boolean,
      default: true,
    },
    placeholder: String,
    helpText: String,
    validationRegex: String,
  },
  { _id: true }
);

const approvalFormSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["DOCTOR", "MEDICAL_OFFICER", "SCREENING_WORKER", "REFERRAL_CENTER", "ADMIN"],
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    fields: [formFieldSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
  },
  { timestamps: true }
);

const ApprovalForm = mongoose.model("ApprovalForm", approvalFormSchema);

export default ApprovalForm;
