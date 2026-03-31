// ── upload.routes.js ──────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const { uploadDocument, uploadJobMedia, cloudinary } = require("../config/cloudinary");
const User = require("../models/User.model");

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload endpoints (Cloudinary)
 */

/**
 * @swagger
 * /uploads/id-document:
 *   post:
 *     summary: Upload government ID for verification
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded, pending admin verification
 */
router.post(
  "/id-document",
  protect,
  uploadDocument.single("document"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ErrorResponse("No file uploaded", 400);
    await User.findByIdAndUpdate(req.user.id, {
      idDocument: req.file.path,
      isIdVerified: false, // reset to pending
    });
    res.json({
      success: true,
      message: "ID document uploaded. Pending admin verification.",
      url: req.file.path,
    });
  })
);

/**
 * @swagger
 * /uploads/job-media:
 *   post:
 *     summary: Upload images for a job listing (max 4)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Uploaded image URLs
 */
router.post(
  "/job-media",
  protect,
  uploadJobMedia.array("images", 4),
  asyncHandler(async (req, res) => {
    if (!req.files?.length) throw new ErrorResponse("No files uploaded", 400);
    const urls = req.files.map((f) => f.path);
    res.json({ success: true, urls });
  })
);

/**
 * @swagger
 * /uploads/delete:
 *   delete:
 *     summary: Delete a Cloudinary asset by public_id
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/delete",
  protect,
  asyncHandler(async (req, res) => {
    const { publicId } = req.body;
    if (!publicId) throw new ErrorResponse("publicId is required", 400);
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: "Asset deleted" });
  })
);

module.exports = router;


// ═══════════════════════════════════════════════════════════
// notification.routes.js  (inline export)
// ═══════════════════════════════════════════════════════════
const notifRouter = express.Router();
const { Notification } = require("../models/Review.model");
const asyncHandler2 = require("../middleware/asyncHandler");
const { protect: p2 } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Notification list
 */
notifRouter.get(
  "/",
  p2,
  asyncHandler2(async (req, res) => {
    const filter = { recipient: req.user.id };
    if (req.query.unreadOnly === "true") filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort("-createdAt")
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.json({ success: true, unreadCount, data: notifications });
  })
);

notifRouter.patch(
  "/:id/read",
  p2,
  asyncHandler2(async (req, res) => {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  })
);

notifRouter.patch(
  "/read-all",
  p2,
  asyncHandler2(async (req, res) => {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  })
);

module.exports.notifRouter = notifRouter;
