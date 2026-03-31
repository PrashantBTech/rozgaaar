const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { Message } = require("../models/Review.model");
const Application = require("../models/Application.model");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Per-application chat history
 */

/**
 * @swagger
 * /messages/{applicationId}:
 *   get:
 *     summary: Get full message history for an application chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ordered message list
 *       403:
 *         description: Not part of this application
 */
router.get(
  "/:applicationId",
  protect,
  asyncHandler(async (req, res, next) => {
    const { applicationId } = req.params;

    // Verify the requesting user is part of this application
    const application = await Application.findById(applicationId);
    if (!application) return next(new ErrorResponse("Application not found", 404));

    const isWorker   = application.worker.toString()   === req.user.id;
    const isBusiness = application.business.toString() === req.user.id;
    if (!isWorker && !isBusiness && req.user.role !== "admin") {
      return next(new ErrorResponse("Not authorized to view this chat", 403));
    }

    const messages = await Message.find({ application: applicationId })
      .populate("sender", "name avatar role")
      .sort("createdAt")   // oldest first
      .limit(200);         // cap at 200 for perf; add pagination later if needed

    res.json({ success: true, count: messages.length, data: messages });
  })
);

/**
 * @swagger
 * /messages/{applicationId}:
 *   delete:
 *     summary: Clear chat history (admin only)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:applicationId",
  protect,
  asyncHandler(async (req, res, next) => {
    if (req.user.role !== "admin") return next(new ErrorResponse("Admin only", 403));
    await Message.deleteMany({ application: req.params.applicationId });
    res.json({ success: true, message: "Chat history cleared" });
  })
);

module.exports = router;