import AuditLog from "../App/models/AuditLog.js";

export async function logAudit({
  userId,
  userRole,
  action,
  resourceType,
  resourceId,
  metadata = {},
  req,
}) {
  try {
    const ipAddress = req
      ? req.headers["x-forwarded-for"] || req.socket?.remoteAddress || ""
      : "";
    const userAgent = req ? req.headers["user-agent"] || "" : "";

    await AuditLog.create({
      userId: userId || req?.user?._id,
      userRole: userRole || req?.user?.role,
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : undefined,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error.message);
  }
}
