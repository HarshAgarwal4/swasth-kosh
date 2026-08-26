import Appointment from "../models/Appointment.js";
import UserModel from "../models/user.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { sendMail } from "../../services/mail.js";

/**
 * 1. Search eligible verified healthcare professionals (Doctors & Medical Officers)
 */
export async function listEligibleProfessionals(req, res) {
  try {
    const { search, district, specialization } = req.query;
    const query = {
      role: { $in: ["DOCTOR", "MEDICAL_OFFICER"] },
    };

    if (district) query.district = new RegExp(district, "i");
    if (specialization) query.qualification = new RegExp(specialization, "i");
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { organization: new RegExp(search, "i") },
        { qualification: new RegExp(search, "i") },
        { district: new RegExp(search, "i") },
      ];
    }

    const professionals = await UserModel.find(query)
      .select("name email phone role organization district state qualification registrationNumber avatar")
      .sort({ name: 1 });

    return res.json({ success: true, data: professionals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 2. User Book / Request Appointment with a Doctor
 */
export async function createAppointment(req, res) {
  try {
    const { doctorId, scheduledAt, chiefComplaint, consultationType, screeningId } = req.body;
    const workerId = req.user._id;

    if (!doctorId || !scheduledAt || !chiefComplaint) {
      return res.status(400).json({ success: false, message: "Doctor, preferred time, and chief complaint are required" });
    }

    const doctor = await UserModel.findById(doctorId);
    if (!doctor || !["DOCTOR", "MEDICAL_OFFICER"].includes(doctor.role)) {
      return res.status(400).json({ success: false, message: "Selected user is not an active verified medical professional" });
    }

    const appointment = await Appointment.create({
      workerId,
      doctorId,
      screeningId: screeningId || undefined,
      scheduledAt: new Date(scheduledAt),
      chiefComplaint,
      consultationType: consultationType || "VIDEO_CALL",
      status: "PENDING",
    });

    // Notify doctor via email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #cbd5e1; border-radius: 14px;">
        <h2 style="color: #4f46e5;">New Telemedicine Consultation Request</h2>
        <p style="color: #1e293b;">Hello <strong>Dr. ${doctor.name}</strong>,</p>
        <p style="color: #475569;">You have received a new consultation request from <strong>${req.user.name}</strong>.</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #334155;">
          <div><strong>Requested Time:</strong> ${new Date(scheduledAt).toLocaleString()}</div>
          <div><strong>Chief Complaint:</strong> ${chiefComplaint}</div>
          <div><strong>Consultation Type:</strong> ${consultationType || "VIDEO_CALL"}</div>
        </div>
        <p style="color: #64748b; font-size: 12px;">Please log into your Doctor Portal on SwasthaKosh to accept or reschedule this appointment.</p>
      </div>
    `;
    await sendMail(doctor.email, "New Patient Telemedicine Request - SwasthaKosh", emailHtml);

    return res.status(201).json({
      success: true,
      message: "Consultation request sent to doctor. You will receive private video call and chat access once accepted.",
      data: appointment,
    });
  } catch (error) {
    console.error("createAppointment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 3. List Appointments for current user (Worker or Doctor)
 */
export async function listMyAppointments(req, res) {
  try {
    const userId = req.user._id;
    const isDoc = ["DOCTOR", "MEDICAL_OFFICER", "ADMIN"].includes(req.user.role);

    const query = isDoc ? { doctorId: userId } : { workerId: userId };

    const appointments = await Appointment.find(query)
      .populate("workerId", "name email phone role organization district state")
      .populate("doctorId", "name email phone role organization qualification district")
      .populate("screeningId")
      .sort({ scheduledAt: -1 });

    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 4. Doctor Accepts, Rejects, or Completes Appointment
 */
export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, rejectionReason, clinicalNotes, prescriptions } = req.body; // ACCEPTED, REJECTED, COMPLETED

    const appointment = await Appointment.findById(id)
      .populate("workerId")
      .populate("doctorId");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (status === "ACCEPTED") {
      appointment.status = "ACCEPTED";
      appointment.roomId = `telemed-${appointment._id.toString().slice(-8)}`;

      // Create or link 1-on-1 private Conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [appointment.workerId._id, appointment.doctorId._id] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [appointment.workerId._id, appointment.doctorId._id],
          workerId: appointment.workerId._id,
          doctorId: appointment.doctorId._id,
        });

        // Add welcome message
        await Message.create({
          conversationId: conversation._id,
          senderId: appointment.doctorId._id,
          text: `Hello ${appointment.workerId.name}, I have accepted your consultation request regarding "${appointment.chiefComplaint}". We can chat here and join the private video call when scheduled.`,
        });
      }

      appointment.conversationId = conversation._id;
      await appointment.save();

      // Send email to worker
      const acceptHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #10b981; border-radius: 14px; background: #f0fdf4;">
          <h2 style="color: #047857;">Consultation Accepted! 🩺</h2>
          <p style="color: #1e293b;">Hello <strong>${appointment.workerId.name}</strong>,</p>
          <p style="color: #334155;"><strong>Dr. ${appointment.doctorId.name}</strong> has accepted your appointment for <strong>${new Date(appointment.scheduledAt).toLocaleString()}</strong>.</p>
          <p style="color: #047857;">Private 1-on-1 Chat and Video Consultation have now been unlocked in your dashboard.</p>
        </div>
      `;
      await sendMail(appointment.workerId.email, "Consultation Confirmed by Doctor - SwasthaKosh", acceptHtml);

      return res.json({ success: true, message: "Appointment accepted and private consultation room unlocked.", data: appointment });
    } else if (status === "REJECTED") {
      appointment.status = "REJECTED";
      appointment.rejectionReason = rejectionReason || "Doctor unavailable at requested time slot.";
      await appointment.save();

      return res.json({ success: true, message: "Appointment rejected.", data: appointment });
    } else if (status === "COMPLETED") {
      appointment.status = "COMPLETED";
      appointment.completedAt = new Date();
      if (clinicalNotes) appointment.clinicalNotes = clinicalNotes;
      if (prescriptions) appointment.prescriptions = prescriptions;
      await appointment.save();

      return res.json({ success: true, message: "Consultation marked as completed with clinical notes.", data: appointment });
    }

    return res.status(400).json({ success: false, message: "Invalid status" });
  } catch (error) {
    console.error("updateAppointmentStatus error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
