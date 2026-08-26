import mongoose from "mongoose";

const healthcareFacilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    facilityType: {
      type: String,
      enum: [
        "DISTRICT_HOSPITAL",
        "PULMONOLOGY_CENTER",
        "COMMUNITY_HEALTH_CENTRE",
        "OCCUPATIONAL_HEALTH_INSTITUTE",
        "PRIMARY_HEALTH_CENTRE",
        "TERTIARY_CARE_HOSPITAL",
      ],
      default: "DISTRICT_HOSPITAL",
    },
    address: {
      line: String,
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
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [75.8577, 26.9124], // e.g., Rajasthan center default
      },
    },
    contactPhone: String,
    contactEmail: String,
    nodalOfficerName: String,
    facilitiesAvailable: {
      hasChestXray: { type: Boolean, default: true },
      hasHRCT: { type: Boolean, default: false },
      hasFullPFTLab: { type: Boolean, default: true },
      hasPulmonologist: { type: Boolean, default: true },
      hasSilicosisBoard: { type: Boolean, default: false },
      hasEmergencyBeds: { type: Boolean, default: true },
    },
    operatingHours: {
      type: String,
      default: "24x7 Emergency / OPD 9AM - 2PM",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

healthcareFacilitySchema.index({ location: "2dsphere" });

const HealthcareFacility = mongoose.model("HealthcareFacility", healthcareFacilitySchema);

export default HealthcareFacility;
