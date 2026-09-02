import userModel from "../App/models/user.js";
import { getUser } from "../services/Auth.js";

const publicPaths = [
  "/",
  "/signup",
  "/login",
  "/sendotp",
  "/health",
  "/api/ai/health",
  "/api/ai/chat",
  "/api/ai/rag",
  "/api/facilities",
  "/api/facilities/nearest",
];

async function isLoggedIn(req, res, next) {
  // Extract token if present in cookie or Authorization header
  let token =
    req.cookies?.UID ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ||
    req.headers["x-auth-token"];

  if (token) {
    try {
      let userPayload = await getUser(token);
      if (userPayload && userPayload.id) {
        const findUser = await userModel.findById(userPayload.id).select("-password");
        if (findUser) {
          req.user = findUser;
        }
      }
    } catch (err) {
      // Ignored for optional public paths
    }
  }

  // Allow explicitly public paths, AI assistant endpoints, token applications, and health checks
  if (
    publicPaths.includes(req.path) ||
    req.path.startsWith("/public") ||
    req.path.startsWith("/api/ai") ||
    req.path.startsWith("/api/role-requests/token") ||
    req.path.startsWith("/api/forms/role")
  ) {
    return next();
  }

  if (!req.user) {
    if (!token) {
      return res.status(401).json({ status: 50, msg: "No token found", success: false });
    }
    return res.status(401).json({ status: 51, msg: "Invalid or expired token", success: false });
  }

  next();
}

export { isLoggedIn };