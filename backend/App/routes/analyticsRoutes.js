import express from "express";
import { getDashboardOverview } from "../controllers/analyticsController.js";
import { isLoggedIn } from "../../middlewares/Auth.js";
import { isAdmin } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// Only Admin and Super Admin can access analytics overview
router.use(isLoggedIn, isAdmin);

router.get("/overview", getDashboardOverview);

export default router;
