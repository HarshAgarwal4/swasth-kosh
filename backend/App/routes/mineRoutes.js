import express from "express";
import {
  createMine,
  getAllMines,
  getMineById,
  updateMine,
} from "../controllers/mineController.js";
import { isAdmin } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", isAdmin, createMine);
router.get("/", getAllMines);
router.get("/:id", getMineById);
router.patch("/:id", isAdmin, updateMine);

export default router;
