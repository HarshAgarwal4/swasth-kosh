import express from "express";
import {
  getAdminOverview,
  adminListUsers,
  adminChangeUserRole,
  adminListMeetings,
  adminListChats,
  adminListAuditLogs,
} from "../controllers/adminController.js";
import { isLoggedIn } from "../../middlewares/Auth.js";
import { isAdmin } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// Protect all admin routes
router.use(isLoggedIn, isAdmin);

router.get("/overview", getAdminOverview);
router.get("/users", adminListUsers);
router.patch("/users/:id/role", adminChangeUserRole);
router.get("/meetings", adminListMeetings);
router.get("/chats", adminListChats);
router.get("/audit-logs", adminListAuditLogs);

export default router;
