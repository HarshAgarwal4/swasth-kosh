import mongoose from "mongoose";
import { hashPassword } from "../../services/encryption.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "ADMIN",
        "DOCTOR",
        "MEDICAL_OFFICER",
        "SCREENING_WORKER",
        "WORKER",
        "REFERRAL_CENTER",
      ],
      default: "WORKER",
    },
    phone: {
      type: String,
      trim: true,
    },
    profile: {
      type: String,
      default: "/defaultProfile.png",
    },
    organization: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    assignedMine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mine",
    },
    workerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sessions: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  let r = await hashPassword(this.password);
  this.password = r;
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;