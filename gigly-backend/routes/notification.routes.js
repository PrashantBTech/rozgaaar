const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { Notification } = require("../models/Review.model");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notifications for workers and businesses
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Fetch notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *         description: Filter to unread notifications only
 *     responses:
 *       200:
 *         description: Notification list with unread count
 */
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const filter = { recipient: req.user.id };
    if (req.query.unreadOnly === "true") filter.isRead = false;
    const notifications = await Notification.find(filter).sort("-createdAt").limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.json({ success: true, unreadCount, data: notifications });
  })
);

router.patch(
  "/:id/read",
  protect,
  asyncHandler(async (req, res) => {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  })
);

router.patch(
  "/read-all",
  protect,
  asyncHandler(async (req, res) => {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: "All marked as read" });
  })
);

router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
    res.json({ success: true });
  })
);

module.exports = router;
