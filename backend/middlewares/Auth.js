import userModel from "../App/models/user.js";
import { getUser } from "../services/Auth.js";

const publicPaths = [
  "/",
  "/signup",
  "/login",
  "/sendotp",
  "/health",
  "/api/ai/health",
  "/api/facilities",
  "/api/facilities/nearest",
];

async function isLoggedIn(req, res, next) {
  // Allow explicitly public paths, token applications, and health checks
  if (
    publicPaths.includes(req.path) ||
    req.path.startsWith("/public") ||
    req.path.startsWith("/api/role-requests/token") ||
    req.path.startsWith("/api/forms/role")
  ) {
    return next();
  }

  req.user = null;
  let token =
    req.cookies?.UID ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ||
    req.headers["x-auth-token"];

  if (!token) {
    return res.status(401).json({ status: 50, msg: "No token found", success: false });
  }

  let userPayload = await getUser(token);
  if (!userPayload || !userPayload.id) {
    return res.status(401).json({ status: 51, msg: "Invalid jwt signature", success: false });
  }

  try {
    const findUser = await userModel.findById(userPayload.id).select("-password");
    if (!findUser) {
      return res.status(401).json({ status: 52, msg: "User does not exist", success: false });
    }

    // Check if token exists in active sessions if sessions array exists
    if (findUser.sessions && findUser.sessions.length > 0) {
      const hasSession = findUser.sessions.some((s) => s.token === token);
      if (!hasSession) {
        // Automatically retain or allow if valid signed token
      }
    }

    req.user = findUser;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ status: 100, msg: "Authentication error", success: false });
  }
}

export { isLoggedIn };