import CallSession from "../App/models/CallSession.js";
import { setInRedis, deleteFromRedis, getFromRedis } from "../services/Redis.js";

export function handleCallSocket(io, socket) {
  // 1. Join Video Call Room
  socket.on("call:join-room", async ({ roomId, role, userName, workerId, screeningId }) => {
    socket.join(`call:${roomId}`);
    socket.roomId = roomId;

    try {
      await setInRedis(`call_room:${roomId}:${socket.id}`, {
        userId: socket.userId,
        userName: userName || "User",
        role: role || "PATIENT",
        joinedAt: new Date().toISOString(),
      }, 7200);
    } catch (e) {}

    // Notify other peers in this room
    socket.to(`call:${roomId}`).emit("call:user-joined", {
      socketId: socket.id,
      userId: socket.userId,
      userName,
      role,
    });

    // Send list of peers currently in room
    const clients = Array.from(io.sockets.adapter.rooms.get(`call:${roomId}`) || []).filter(
      (id) => id !== socket.id
    );
    socket.emit("call:existing-users", { users: clients });
  });

  // 2. WebRTC Signaling: Offer
  socket.on("call:offer", ({ targetSocketId, offer, callerInfo }) => {
    io.to(targetSocketId).emit("call:offer", {
      fromSocketId: socket.id,
      offer,
      callerInfo,
    });
  });

  // 3. WebRTC Signaling: Answer
  socket.on("call:answer", ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit("call:answer", {
      fromSocketId: socket.id,
      answer,
    });
  });

  // 4. WebRTC Signaling: ICE Candidate
  socket.on("call:ice-candidate", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("call:ice-candidate", {
      fromSocketId: socket.id,
      candidate,
    });
  });

  // 5. Media Control Toggles (Microphone, Camera, Screen Share)
  socket.on("call:toggle-audio", ({ roomId, isMuted }) => {
    socket.to(`call:${roomId}`).emit("call:user-audio-toggle", {
      socketId: socket.id,
      userId: socket.userId,
      isMuted,
    });
  });

  socket.on("call:toggle-video", ({ roomId, isVideoOff }) => {
    socket.to(`call:${roomId}`).emit("call:user-video-toggle", {
      socketId: socket.id,
      userId: socket.userId,
      isVideoOff,
    });
  });

  socket.on("call:screen-share-status", ({ roomId, isSharing }) => {
    socket.to(`call:${roomId}`).emit("call:user-screen-share", {
      socketId: socket.id,
      userId: socket.userId,
      isSharing,
    });
  });

  // 6. Direct Call Initiation Alert (Doctor calling Worker)
  socket.on("call:initiate-direct", ({ targetUserId, roomId, callerName, role }) => {
    io.to(`user:${targetUserId}`).emit("call:incoming-ring", {
      roomId,
      callerName,
      callerId: socket.userId,
      role,
    });
  });

  // 7. Call End & Clean up
  const endCallInRoom = async (roomId) => {
    socket.to(`call:${roomId}`).emit("call:ended", {
      reason: "User left or terminated call",
      bySocketId: socket.id,
    });
    try {
      await deleteFromRedis(`call_room:${roomId}:${socket.id}`);
      await CallSession.findOneAndUpdate(
        { roomId, status: { $in: ["INITIATED", "RINGING", "IN_PROGRESS"] } },
        {
          status: "COMPLETED",
          endedAt: new Date(),
        }
      );
    } catch (e) {}
  };

  socket.on("call:end", ({ roomId }) => {
    if (roomId) {
      endCallInRoom(roomId);
      socket.leave(`call:${roomId}`);
    }
  });

  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room.startsWith("call:")) {
        const roomId = room.replace("call:", "");
        endCallInRoom(roomId);
      }
    }
  });
}
