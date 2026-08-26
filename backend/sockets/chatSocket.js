import Conversation from "../App/models/Conversation.js";
import Message from "../App/models/Message.js";

export function handleChatSocket(io, socket) {
  // Join specific conversation room
  socket.on("chat:join", ({ conversationId }) => {
    if (conversationId) {
      socket.join(`conv:${conversationId}`);
    }
  });

  socket.on("chat:leave", ({ conversationId }) => {
    if (conversationId) {
      socket.leave(`conv:${conversationId}`);
    }
  });

  // Typing indicators
  socket.on("chat:typing", ({ conversationId, userName }) => {
    socket.to(`conv:${conversationId}`).emit("chat:typing", {
      conversationId,
      userId: socket.userId,
      userName: userName || "Someone",
    });
  });

  socket.on("chat:stopTyping", ({ conversationId }) => {
    socket.to(`conv:${conversationId}`).emit("chat:stopTyping", {
      conversationId,
      userId: socket.userId,
    });
  });

  // Real-time message send
  socket.on("chat:send", async (data, callback) => {
    try {
      const { conversationId, text, receiverId, attachments, messageType } = data;
      const senderId = socket.userId;

      if (!senderId || !conversationId) {
        if (callback) callback({ success: false, error: "Missing sender or conversation ID" });
        return;
      }

      const newMsg = await Message.create({
        conversationId,
        senderId,
        receiverId,
        text,
        attachments: attachments || [],
        messageType: messageType || "TEXT",
        readBy: [{ userId: senderId, readAt: new Date() }],
      });

      const populatedMsg = await Message.findById(newMsg._id)
        .populate("senderId", "name role profile")
        .populate("receiverId", "name role profile");

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text: text || "Sent an attachment",
          senderId,
          sentAt: new Date(),
        },
      });

      // Broadcast to room
      io.to(`conv:${conversationId}`).emit("chat:message", populatedMsg);

      // Direct notification if receiver is not currently in the room
      if (receiverId) {
        io.to(`user:${receiverId}`).emit("chat:incoming", {
          conversationId,
          message: populatedMsg,
        });
      }

      if (callback) callback({ success: true, message: populatedMsg });
    } catch (err) {
      console.error("Socket chat:send error:", err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Read status update
  socket.on("chat:read", async ({ conversationId, messageIds }) => {
    try {
      const userId = socket.userId;
      if (conversationId && userId) {
        await Message.updateMany(
          { conversationId, "readBy.userId": { $ne: userId } },
          { $push: { readBy: { userId, readAt: new Date() } } }
        );
        socket.to(`conv:${conversationId}`).emit("chat:readReceipt", {
          conversationId,
          userId,
          readAt: new Date(),
        });
      }
    } catch (e) {
      console.error("Error updating read status:", e);
    }
  });
}
