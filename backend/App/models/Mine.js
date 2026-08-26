import mongoose from "mongoose";

const mineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    mineCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    mineralType: {
      type: String,
      enum: ["SILICA_SAND", "QUARTZ", "STONE_CRUSHING", "COAL", "IRON_ORE", "ASBESTOS", "SLATE", "GRANITE", "OTHER"],
      default: "STONE_CRUSHING",
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
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    workerCount: {
      type: Number,
      default: 0,
    },
    safetyOfficer: {
      name: String,
      phone: String,
      email: String,
    },
    dustControlMeasures: {
      wetDrilling: { type: Boolean, default: false },
      waterSpraying: { type: Boolean, default: false },
      ventilationSystem: { type: Boolean, default: false },
      ppeProvision: { type: Boolean, default: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Mine = mongoose.model("Mine", mineSchema);

export default Mine;
