import express from "express";
import {
  getFormByRole,
  listAllForms,
  saveForm,
  deleteForm,
} from "../controllers/formController.js";
import { isLoggedIn } from "../../middlewares/Auth.js";
import { isAdmin } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// Role-specific form fetch (public/authenticated)
router.get("/role/:role", getFormByRole);

// Admin form management
router.get("/admin/all", isLoggedIn, isAdmin, listAllForms);
router.post("/admin/save", isLoggedIn, isAdmin, saveForm);
router.delete("/admin/:id", isLoggedIn, isAdmin, deleteForm);

export default router;
