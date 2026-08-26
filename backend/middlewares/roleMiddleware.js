export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Authentication required",
      });
    }

    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(", ")}]`,
      });
    }

    next();
  };
}

export function isMedicalOfficerOrDoctor(req, res, next) {
  return requireRoles("DOCTOR", "MEDICAL_OFFICER", "ADMIN", "SUPER_ADMIN")(req, res, next);
}

export function isScreeningStaff(req, res, next) {
  return requireRoles("SCREENING_WORKER", "DOCTOR", "MEDICAL_OFFICER", "ADMIN", "SUPER_ADMIN")(req, res, next);
}

export function isAdmin(req, res, next) {
  return requireRoles("ADMIN", "SUPER_ADMIN")(req, res, next);
}
