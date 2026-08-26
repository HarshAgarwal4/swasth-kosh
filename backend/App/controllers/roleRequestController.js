import crypto from "crypto";
import RoleRequest from "../models/RoleRequest.js";
import ApprovalForm from "../models/ApprovalForm.js";
import UserModel from "../models/user.js";
import { sendMail } from "../../services/mail.js";
import { uploadFileToCloud } from "../../services/upload.js";

// Default standard seed forms if admin hasn't created one
const DEFAULT_FORM_FIELDS = {
  DOCTOR: [
    { name: "registrationNumber", label: "Medical Council Registration No. (MCI / NMC)", type: "text", isRequired: true },
    { name: "stateMedicalCouncil", label: "State Medical Council", type: "text", isRequired: true },
    { name: "specialization", label: "Specialization (e.g. Pulmonology, General Medicine)", type: "text", isRequired: true },
    { name: "hospitalAffiliation", label: "Current Hospital / Clinic Affiliation", type: "text", isRequired: true },
    { name: "yearsOfExperience", label: "Years of Clinical Practice", type: "number", isRequired: true },
    { name: "degreeCertificate", label: "Medical Degree / License Certificate (Upload PDF/Image)", type: "file", isRequired: false },
    { name: "declaration", label: "I certify that all medical credentials are valid and genuine", type: "checkbox", isRequired: true },
  ],
  MEDICAL_OFFICER: [
    { name: "governmentEmployeeId", label: "Government / District Health ID", type: "text", isRequired: true },
    { name: "districtPosting", label: "Designated District / Block Posting", type: "text", isRequired: true },
    { name: "department", label: "Department / Chest Clinic Name", type: "text", isRequired: true },
    { name: "idProof", label: "Official ID Proof / Appointment Letter (Upload)", type: "file", isRequired: false },
  ],
  SCREENING_WORKER: [
    { name: "assignedMiningZone", label: "Assigned Mining Quarry / Industrial Cluster", type: "text", isRequired: true },
    { name: "ngoOrAgency", label: "Field Agency / NGO / Mine Operator", type: "text", isRequired: true },
    { name: "trainingCertificate", label: "Occupational Health Screening Training Record", type: "file", isRequired: false },
  ],
  REFERRAL_CENTER: [
    { name: "facilityName", label: "Hospital / Healthcare Facility Name", type: "text", isRequired: true },
    { name: "nodalOfficerName", label: "Nodal Officer / Incharge Name", type: "text", isRequired: true },
    { name: "silicosisBoardRegistered", label: "Has State Certified Silicosis Board?", type: "select", options: ["YES", "NO", "IN_PROCESS"], isRequired: true },
  ],
};

/**
 * 1. Initiate Role Change Request & Send Secure Email
 */
export async function initiateRoleRequest(req, res) {
  try {
    const { requestedRole } = req.body;
    const userId = req.user._id;

    if (!requestedRole || requestedRole === "WORKER") {
      return res.status(400).json({ success: false, message: "Invalid role requested" });
    }

    // Check if form exists for role, or create default form
    let form = await ApprovalForm.findOne({ role: requestedRole, isActive: true });
    if (!form) {
      const defaultFields = DEFAULT_FORM_FIELDS[requestedRole] || [
        { name: "qualification", label: "Professional Qualification", type: "text", isRequired: true },
        { name: "organization", label: "Organization / Workplace", type: "text", isRequired: true },
        { name: "idDocument", label: "Identity Document (Upload)", type: "file", isRequired: false },
      ];
      form = await ApprovalForm.create({
        role: requestedRole,
        title: `${requestedRole.replace("_", " ")} Credential Verification Form`,
        description: `Please provide verified credentials for ${requestedRole} access on SwasthaKosh.`,
        fields: defaultFields,
      });
    }

    // Generate secure token (valid for 48 hours)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const roleReq = await RoleRequest.create({
      userId,
      currentRole: req.user.role || "WORKER",
      requestedRole,
      status: "PENDING_FORM",
      applicationToken: token,
      tokenExpiresAt: expiresAt,
      formId: form._id,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const secureLink = `${frontendUrl}/role-application/${token}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">SwasthaKosh Role Application</h2>
        <p style="color: #334155; font-size: 14px;">Hello <strong>${req.user.name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          You have submitted a request to elevate your account role to <strong>${requestedRole.replace("_", " ")}</strong>.
          To ensure platform compliance, please complete the required credential verification form using the secure link below:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${secureLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 10px; display: inline-block;">
            Complete Verification Form →
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px;">This secure link is valid for 48 hours. If you did not make this request, you can safely ignore this email.</p>
      </div>
    `;

    await sendMail(req.user.email, `Complete your ${requestedRole} Verification - SwasthaKosh`, emailHtml);

    return res.status(201).json({
      success: true,
      message: `Role request initiated. A secure verification link has been sent to ${req.user.email}.`,
      data: {
        requestId: roleReq._id,
        applicationToken: token,
        secureLink,
      },
    });
  } catch (error) {
    console.error("initiateRoleRequest error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 2. Get Application Form by Secure Token (Accessible by applicant)
 */
export async function getApplicationByToken(req, res) {
  try {
    const { token } = req.params;
    const roleReq = await RoleRequest.findOne({ applicationToken: token })
      .populate("userId", "name email phone role")
      .populate("formId");

    if (!roleReq) {
      return res.status(404).json({ success: false, message: "Invalid or expired application link" });
    }

    if (new Date() > roleReq.tokenExpiresAt) {
      return res.status(410).json({ success: false, message: "This application link has expired. Please initiate a new request." });
    }

    return res.json({
      success: true,
      data: {
        requestId: roleReq._id,
        user: roleReq.userId,
        currentRole: roleReq.currentRole,
        requestedRole: roleReq.requestedRole,
        status: roleReq.status,
        form: roleReq.formId,
        submittedFormData: roleReq.submittedFormData,
        attachments: roleReq.attachments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 3. Submit Form Data & Document Attachments by Secure Token
 */
export async function submitApplicationForm(req, res) {
  try {
    const { token } = req.params;
    const roleReq = await RoleRequest.findOne({ applicationToken: token });

    if (!roleReq) {
      return res.status(404).json({ success: false, message: "Invalid application token" });
    }

    let formData = {};
    if (req.body.formData) {
      try {
        formData = typeof req.body.formData === "string" ? JSON.parse(req.body.formData) : req.body.formData;
      } catch (e) {
        formData = req.body.formData;
      }
    } else {
      formData = { ...req.body };
    }

    const attachments = [...(roleReq.attachments || [])];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadRes = await uploadFileToCloud(file.buffer, file.originalname, { folder: "SwasthaKosh/RoleCredentials" });
          attachments.push({
            fileName: file.originalname,
            fileUrl: uploadRes.secure_url,
            fileType: file.mimetype,
          });
        } catch (uploadErr) {
          console.warn("Attachment upload warning:", uploadErr.message);
        }
      }
    }

    roleReq.submittedFormData = formData;
    roleReq.attachments = attachments;
    roleReq.status = "PENDING_REVIEW";
    await roleReq.save();

    return res.json({
      success: true,
      message: "Application submitted successfully. Our medical admin panel will review your credentials shortly.",
      data: roleReq,
    });
  } catch (error) {
    console.error("submitApplicationForm error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 4. Admin List All Role Requests
 */
export async function adminListRoleRequests(req, res) {
  try {
    const { status, role } = req.query;
    const query = {};
    if (status) query.status = status;
    if (role) query.requestedRole = role;

    const requests = await RoleRequest.find(query)
      .populate("userId", "name email phone role organization district state")
      .populate("formId")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 5. Admin Review & Approve / Reject Role Request
 */
export async function adminReviewRoleRequest(req, res) {
  try {
    const { id } = req.params;
    const { action, adminReviewNotes, overrideRole } = req.body; // action: 'APPROVE', 'REJECT', 'MODIFY'

    const roleReq = await RoleRequest.findById(id).populate("userId");
    if (!roleReq) {
      return res.status(404).json({ success: false, message: "Role request not found" });
    }

    const applicant = await UserModel.findById(roleReq.userId._id || roleReq.userId);
    if (!applicant) {
      return res.status(404).json({ success: false, message: "Applicant user account not found" });
    }

    roleReq.adminReviewNotes = adminReviewNotes || "";
    roleReq.reviewedBy = req.user._id;
    roleReq.reviewedAt = new Date();

    if (action === "APPROVE") {
      const assignedRole = overrideRole || roleReq.requestedRole;
      roleReq.status = "APPROVED";
      applicant.role = assignedRole;

      // Also copy submitted credentials onto user model
      if (roleReq.submittedFormData) {
        if (roleReq.submittedFormData.registrationNumber) applicant.registrationNumber = roleReq.submittedFormData.registrationNumber;
        if (roleReq.submittedFormData.qualification) applicant.qualification = roleReq.submittedFormData.qualification;
        if (roleReq.submittedFormData.organization) applicant.organization = roleReq.submittedFormData.organization;
      }

      await applicant.save();
      await roleReq.save();

      // Dispatch approval email
      const approveHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #10b981; border-radius: 16px; background: #f0fdf4;">
          <h2 style="color: #047857;">Role Application Approved! 🎉</h2>
          <p style="color: #1e293b; font-size: 14px;">Hello <strong>${applicant.name}</strong>,</p>
          <p style="color: #334155; font-size: 14px;">
            Your credentials have been verified by the SwasthaKosh Medical Administration. Your account role has now been upgraded to <strong>${assignedRole}</strong>.
          </p>
          <p style="color: #047857; font-size: 13px;">${adminReviewNotes ? `Admin Note: "${adminReviewNotes}"` : ""}</p>
          <p style="color: #475569; font-size: 13px;">You can now access your professional portal, patient queues, and private consultation rooms.</p>
        </div>
      `;
      await sendMail(applicant.email, `Role Approved: Welcome to SwasthaKosh as ${assignedRole}`, approveHtml);

      return res.json({
        success: true,
        message: `Role request approved. User role updated to ${assignedRole}.`,
        data: roleReq,
      });
    } else if (action === "REJECT") {
      roleReq.status = "REJECTED";
      await roleReq.save();

      const rejectHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #ef4444; border-radius: 16px; background: #fef2f2;">
          <h2 style="color: #b91c1c;">Role Application Status: Not Approved</h2>
          <p style="color: #1e293b; font-size: 14px;">Hello <strong>${applicant.name}</strong>,</p>
          <p style="color: #334155; font-size: 14px;">
            Your request for role <strong>${roleReq.requestedRole}</strong> could not be approved at this time.
          </p>
          <p style="color: #b91c1c; font-size: 13px;">Reason: <strong>${adminReviewNotes || "Credentials could not be verified with regulatory council."}</strong></p>
          <p style="color: #475569; font-size: 13px;">You may submit updated documentation or contact medical support.</p>
        </div>
      `;
      await sendMail(applicant.email, `Update on your SwasthaKosh Role Application`, rejectHtml);

      return res.json({
        success: true,
        message: "Role request rejected.",
        data: roleReq,
      });
    }

    return res.status(400).json({ success: false, message: "Invalid action. Must be APPROVE or REJECT." });
  } catch (error) {
    console.error("adminReviewRoleRequest error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
