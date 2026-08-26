import mongoose from "mongoose";

const callSessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
    },
    status: {
      type: String,
      enum: ["INITIATED", "RINGING", "IN_PROGRESS", "COMPLETED", "MISSED", "REJECTED"],
      default: "INITIATED",
      index: true,
    },
    startedAt: Date,
    endedAt: Date,
    durationSeconds: {
      type: Number,
      default: 0,
    },
    clinicalSummaryNotes: String,
  },
  { timestamps: true }
);

const CallSession = mongoose.model("CallSession", callSessionSchema);

export default CallSession;
