import UserModel from "../models/user.js";
import RoleRequest from "../models/RoleRequest.js";
import Appointment from "../models/Appointment.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import AuditLog from "../models/AuditLog.js";
import Screening from "../models/Screening.js";

/**
 * Admin: Get complete platform statistics overview
 */
export async function getAdminOverview(req, res) {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalWorkers,
      pendingRoleRequests,
      totalAppointments,
      activeMeetings,
      totalScreenings,
      totalConversations,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: { $in: ["DOCTOR", "MEDICAL_OFFICER"] } }),
      UserModel.countDocuments({ role: "WORKER" }),
      RoleRequest.countDocuments({ status: { $in: ["PENDING_FORM", "PENDING_REVIEW"] } }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "ACCEPTED" }),
      Screening.countDocuments(),
      Conversation.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalWorkers,
        pendingRoleRequests,
        totalAppointments,
        activeMeetings,
        totalScreenings,
        totalConversations,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: List and filter all users with pagination and search
 */
export async function adminListUsers(req, res) {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role && role !== "ALL") query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { district: new RegExp(search, "i") },
      ];
    }

    const users = await UserModel.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await UserModel.countDocuments(query);

    return res.json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: Direct role assignment or change
 */
export async function adminChangeUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["SUPER_ADMIN", "ADMIN", "DOCTOR", "MEDICAL_OFFICER", "SCREENING_WORKER", "WORKER", "REFERRAL_CENTER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const previousRole = user.role;
    user.role = role;
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: "USER_ROLE_OVERRIDE",
      resourceType: "User",
      resourceId: user._id,
      details: { previousRole, newRole: role, targetUserEmail: user.email },
    });

    return res.json({ success: true, message: `User role changed from ${previousRole} to ${role}`, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: View all Meetings / Consultations
 */
export async function adminListMeetings(req, res) {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== "ALL") query.status = status;

    const meetings = await Appointment.find(query)
      .populate("workerId", "name email phone role district")
      .populate("doctorId", "name email phone role organization")
      .sort({ scheduledAt: -1 });

    return res.json({ success: true, data: meetings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: View all Consultation Chats
 */
export async function adminListChats(req, res) {
  try {
    const conversations = await Conversation.find()
      .populate("participants", "name email role")
      .populate("workerId", "name email")
      .populate("doctorId", "name email")
      .sort({ updatedAt: -1 });

    const chatsWithCounts = await Promise.all(
      conversations.map(async (c) => {
        const messageCount = await Message.countDocuments({ conversationId: c._id });
        return { ...c.toObject(), messageCount };
      })
    );

    return res.json({ success: true, data: chatsWithCounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: View Audit Logs
 */
export async function adminListAuditLogs(req, res) {
  try {
    const logs = await AuditLog.find()
      .populate("userId", "name email role")
      .sort({ timestamp: -1 })
      .limit(100);

    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
