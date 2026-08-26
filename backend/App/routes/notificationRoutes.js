import express from "express";
import { getUserNotifications, markAsRead } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getUserNotifications);
router.patch("/:id/read", markAsRead);

export default router;
