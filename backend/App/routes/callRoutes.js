import express from "express";
import {
  createCallSession,
  getCallSessionByRoom,
  endCallSession,
} from "../controllers/callController.js";

const router = express.Router();

router.post("/", createCallSession);
router.get("/:roomId", getCallSessionByRoom);
router.post("/:roomId/end", endCallSession);

export default router;
