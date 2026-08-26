import express from "express";
import { chatWithAi, askRagKnowledge, getAiHealth } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", chatWithAi);
router.post("/rag", askRagKnowledge);
router.get("/health", getAiHealth);

export default router;
