const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.error("❌ MONGO_URI is not set in .env — MongoDB not connected.");
    return;
  }
  const attempt = async () => {
    try {
      const conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 8000,
      });
      logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      logger.error(`❌ MongoDB connection failed: ${error.message}`);
      logger.warn("🔄 Retrying MongoDB connection in 5 seconds...");
      setTimeout(attempt, 5000);
    }
  };
  await attempt();
};

mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️  MongoDB disconnected");
});
mongoose.connection.on("reconnected", () => logger.info("🔁 MongoDB reconnected"));

module.exports = { connectDB };
