import express from "express";
import {
  listEligibleProfessionals,
  createAppointment,
  listMyAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { isLoggedIn } from "../../middlewares/Auth.js";

const router = express.Router();

// Search & list verified doctors
router.get("/professionals", isLoggedIn, listEligibleProfessionals);

// User booking & appointments
router.post("/", isLoggedIn, createAppointment);
router.get("/", isLoggedIn, listMyAppointments);
router.patch("/:id/status", isLoggedIn, updateAppointmentStatus);

export default router;
