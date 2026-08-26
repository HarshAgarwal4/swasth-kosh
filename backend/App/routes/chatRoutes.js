import express from "express";
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/conversations", getOrCreateConversation);
router.get("/conversations", getUserConversations);
router.get("/conversations/:id/messages", getConversationMessages);

export default router;
