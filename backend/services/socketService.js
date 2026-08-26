import { Server } from "socket.io";
import { getUser } from "./Auth.js";
import UserModel from "../App/models/user.js";
import { handlePresenceSocket } from "../sockets/presenceSocket.js";
import { handleChatSocket } from "../sockets/chatSocket.js";
import { handleCallSocket } from "../sockets/callSocket.js";

let ioInstance = null;

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
  });

  // Socket Authentication middleware
  io.use(async (socket, next) => {
    try {
      let token = null;
      if (socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      } else if (socket.handshake.headers?.cookie) {
        const cookies = socket.handshake.headers.cookie.split(";");
        for (const cookie of cookies) {
          const [key, val] = cookie.trim().split("=");
          if (key === "UID") {
            token = decodeURIComponent(val);
            break;
          }
        }
      }

      if (token) {
        const decoded = getUser(token);
        if (decoded?.id) {
          const user = await UserModel.findById(decoded.id).select("-password");
          if (user) {
            socket.user = user;
            socket.userId = user._id.toString();
          }
        }
      }
      next();
    } catch (err) {
      console.warn("Socket auth warning:", err.message);
      next();
    }
  });

  io.on("connection", (socket) => {
    handlePresenceSocket(io, socket);
    handleChatSocket(io, socket);
    handleCallSocket(io, socket);
  });

  ioInstance = io;
  return io;
}

export function getIO() {
  return ioInstance;
}

export function emitNotificationToUser(userId, notification) {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit("notification:new", notification);
  }
}

export function broadcastHighRiskAlert(screeningData) {
  if (ioInstance) {
    ioInstance.emit("screening:high-risk-alert", screeningData);
  }
}
