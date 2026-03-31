const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { Message } = require("../models/Review.model");
const logger = require("../utils/logger");

const connectedUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  // ── Auth middleware for socket ──────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name role avatar");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    connectedUsers.set(userId, socket.id);

    // Mark user online
    await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });
    logger.info(`🟢 ${socket.user.name} connected [${socket.id}]`);

    // Broadcast presence
    socket.broadcast.emit("user_online", { userId });

    // ── Join personal room ────────────────────────────────────────────────────
    socket.join(userId);

    // ── Join application-based chat room ──────────────────────────────────────
    socket.on("join_chat", (applicationId) => {
      socket.join(`chat:${applicationId}`);
      logger.info(`💬 ${socket.user.name} joined chat:${applicationId}`);
    });

    // ── Send message ──────────────────────────────────────────────────────────
    socket.on("send_message", async (data) => {
      try {
        const { applicationId, receiverId, text, attachment, attachmentType } = data;

        const message = await Message.create({
          application: applicationId,
          sender: userId,
          receiver: receiverId,
          text,
          attachment,
          attachmentType,
        });

        const populated = await Message.findById(message._id)
          .populate("sender", "name avatar role");

        // Emit to chat room
        io.to(`chat:${applicationId}`).emit("new_message", populated);

        // Also emit to receiver's personal room if not in chat
        io.to(receiverId).emit("message_notification", {
          applicationId,
          sender: { id: userId, name: socket.user.name, avatar: socket.user.avatar },
          text,
        });
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
        logger.error(`Socket send_message error: ${err.message}`);
      }
    });

    // ── Mark messages as read ─────────────────────────────────────────────────
    socket.on("messages_read", async ({ applicationId }) => {
      await Message.updateMany(
        { application: applicationId, receiver: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      socket.to(`chat:${applicationId}`).emit("messages_read_ack", { applicationId, readBy: userId });
    });

    // ── Worker location update (for business tracking) ────────────────────────
    socket.on("update_location", async ({ lat, lng }) => {
      if (socket.user.role !== "worker") return;
      await User.findByIdAndUpdate(userId, {
        "location.coordinates": [lng, lat],
      });
      // Emit to any listening business rooms
      socket.broadcast.emit("worker_location_update", {
        workerId: userId,
        coordinates: [lng, lat],
      });
    });

    // ── Typing indicator ──────────────────────────────────────────────────────
    socket.on("typing", ({ applicationId }) => {
      socket.to(`chat:${applicationId}`).emit("user_typing", {
        userId,
        name: socket.user.name,
      });
    });
    socket.on("stop_typing", ({ applicationId }) => {
      socket.to(`chat:${applicationId}`).emit("user_stop_typing", { userId });
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      connectedUsers.delete(userId);
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: null,
      });
      socket.broadcast.emit("user_offline", { userId });
      logger.info(`🔴 ${socket.user.name} disconnected`);
    });
  });
};

module.exports = { initSocket, connectedUsers };
