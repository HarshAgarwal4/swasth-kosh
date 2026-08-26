import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "SCREENING_COMPLETED",
        "HIGH_RISK_DETECTED",
        "REFERRAL_CREATED",
        "REFERRAL_UPDATED",
        "APPOINTMENT_SCHEDULED",
        "VIDEO_CALL_INCOMING",
        "NEW_CHAT_MESSAGE",
        "SYSTEM_ALERT",
      ],
      default: "SYSTEM_ALERT",
    },
    data: {
      screeningId: String,
      workerId: String,
      referralId: String,
      roomId: String,
      conversationId: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
