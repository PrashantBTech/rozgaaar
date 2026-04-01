const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swaggerConfig");
const cron = require("node-cron");
require("dotenv").config();

const { connectDB } = require("./config/db");
const logger = require("./utils/logger");
const { initSocket } = require("./sockets/socketHandler");
const errorHandler = require("./middleware/errorHandler");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const jobRoutes = require("./routes/job.routes");
const applicationRoutes = require("./routes/application.routes");
const reviewRoutes = require("./routes/review.routes");
const uploadRoutes = require("./routes/upload.routes");
const notificationRoutes = require("./routes/notification.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRoutes    = require("./routes/admin.routes");
const messagesRoutes = require("./routes/messages.routes");
const aiRoutes       = require("./routes/ai.routes");

const app = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
initSocket(io);
app.set("io", io); // make io accessible in controllers

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ── General Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ── API Docs (Swagger) ────────────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Rozgaaar API Docs",
}));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Rozgaaar API is running 🚀",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin",         adminRoutes);
app.use("/api/v1/messages",      messagesRoutes);
app.use("/api/v1/ai",             aiRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Cron Jobs ─────────────────────────────────────────────────────────────────
// Auto-expire jobs older than their end time
cron.schedule("*/5 * * * *", async () => {
  const Job = require("./models/Job.model");
  await Job.updateMany(
    { status: "open", endsAt: { $lt: new Date() } },
    { status: "expired" }
  );
  logger.info("⏰ Cron: Expired old jobs");
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Rozgaaar server running on port ${PORT} [${process.env.NODE_ENV}]`);
  logger.info(`📚 API Docs: http://localhost:${PORT}/api/docs`);
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => mongoose.disconnect());
});