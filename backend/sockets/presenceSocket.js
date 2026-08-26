import { setInRedis, deleteFromRedis, getRedisSet, addToRedisSet, removeFromRedisSet } from "../services/Redis.js";

export function handlePresenceSocket(io, socket) {
  const userId = socket.user?._id?.toString() || socket.handshake.query?.userId;

  if (userId) {
    socket.userId = userId;
    socket.join(`user:${userId}`);

    // Update Redis presence
    try {
      addToRedisSet("online_users", userId);
      setInRedis(`presence:${userId}`, {
        status: "online",
        socketId: socket.id,
        role: socket.user?.role || "WORKER",
        lastSeen: new Date().toISOString(),
      }, 3600);
    } catch (e) {
      // Redis optional fallback
    }

    io.emit("presence:update", { userId, status: "online" });

    socket.on("disconnect", async () => {
      try {
        await removeFromRedisSet("online_users", userId);
        await setInRedis(`presence:${userId}`, {
          status: "offline",
          lastSeen: new Date().toISOString(),
        }, 86400);
      } catch (e) {}

      io.emit("presence:update", { userId, status: "offline", lastSeen: new Date().toISOString() });
    });
  }
}
