import express from "express";
import {
  createWorker,
  getAllWorkers,
  getWorkerById,
  updateWorker,
  getWorkerHistory,
} from "../controllers/workerController.js";
import { isScreeningStaff } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", isScreeningStaff, createWorker);
router.get("/", getAllWorkers);
router.get("/:id", getWorkerById);
router.patch("/:id", updateWorker);
router.get("/:id/history", getWorkerHistory);

export default router;
