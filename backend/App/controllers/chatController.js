import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export async function getOrCreateConversation(req, res) {
  try {
    const { receiverId, workerId, screeningId } = req.body;
    const currentUserId = req.user._id;

    if (!receiverId && !workerId) {
      return res.status(400).json({ success: false, message: "receiverId or workerId is required" });
    }

    let query = {};
    if (receiverId) {
      query = {
        participants: { $all: [currentUserId, receiverId] },
      };
    } else if (workerId) {
      query = { workerId };
    }

    let conversation = await Conversation.findOne(query)
      .populate("participants", "name email role profile qualification")
      .populate("workerId", "name workerCode currentRiskLevel");

    if (!conversation) {
      const participants = [currentUserId];
      if (receiverId && !participants.includes(receiverId)) {
        participants.push(receiverId);
      }

      conversation = await Conversation.create({
        participants,
        workerId,
        screeningId,
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name email role profile qualification")
        .populate("workerId", "name workerCode currentRiskLevel");
    }

    return res.json({ success: true, data: conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUserConversations(req, res) {
  try {
    const currentUserId = req.user._id;
    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate("participants", "name email role profile qualification organization")
      .populate("workerId", "name workerCode currentRiskLevel")
      .sort({ "lastMessage.sentAt": -1, updatedAt: -1 });

    return res.json({ success: true, data: conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getConversationMessages(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 100 } = req.query;

    const messages = await Message.find({ conversationId: id })
      .populate("senderId", "name role profile")
      .populate("receiverId", "name role profile")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({ success: true, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
