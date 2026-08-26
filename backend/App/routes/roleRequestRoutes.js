import express from "express";
import {
  initiateRoleRequest,
  getApplicationByToken,
  submitApplicationForm,
  adminListRoleRequests,
  adminReviewRoleRequest,
} from "../controllers/roleRequestController.js";
import { isLoggedIn } from "../../middlewares/Auth.js";
import { isAdmin } from "../../middlewares/roleMiddleware.js";
import { uploadFile } from "../../services/upload.js";

const router = express.Router();

// User initiates role request (authenticated)
router.post("/initiate", isLoggedIn, initiateRoleRequest);

// Public / Token-authenticated routes (via email link)
router.get("/token/:token", getApplicationByToken);
router.post("/token/:token/submit", uploadFile.array("files", 5), submitApplicationForm);

// Admin review routes
router.get("/admin/list", isLoggedIn, isAdmin, adminListRoleRequests);
router.post("/admin/:id/review", isLoggedIn, isAdmin, adminReviewRoleRequest);

export default router;
