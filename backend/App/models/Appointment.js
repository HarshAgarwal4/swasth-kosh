import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentCode: {
      type: String,
      unique: true,
      index: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      index: true,
    },
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    chiefComplaint: {
      type: String,
      required: true,
    },
    rejectionReason: {
      type: String,
    },
    consultationType: {
      type: String,
      enum: ["VIDEO_CALL", "TEXT_CHAT", "HYBRID"],
      default: "VIDEO_CALL",
    },
    roomId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    clinicalNotes: {
      type: String,
    },
    prescriptions: [
      {
        medicine: String,
        dosage: String,
        duration: String,
        instructions: String,
      },
    ],
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

appointmentSchema.pre("save", function () {
  if (!this.appointmentCode) {
    this.appointmentCode = `APT-${Date.now().toString().slice(-6)}`;
  }
  if (!this.roomId && this.status === "ACCEPTED") {
    this.roomId = `telemed-${this._id.toString().slice(-8)}`;
  }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
