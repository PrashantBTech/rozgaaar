// ── user.routes.js ────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User.model");
const ErrorResponse = require("../utils/errorResponse");
const { uploadAvatar } = require("../config/cloudinary");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Worker & business profiles
 */

// ── GET /api/v1/users/:id – Public profile ────────────────────────────────────
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a public user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User profile (public fields only)
 *       404:
 *         description: User not found
 */
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select(
      "name avatar bio role skills education businessName businessCategory " +
        "averageRating totalReviews totalJobsCompleted isIdVerified " +
        "location.city location.address createdAt"
    );
    if (!user) return next(new ErrorResponse("User not found", 404));
    res.json({ success: true, data: user });
  })
);

// ── PUT /api/v1/users/profile – Update own profile ────────────────────────────
/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:         { type: string }
 *               bio:          { type: string }
 *               skills:       { type: array, items: { type: string } }
 *               phone:        { type: string }
 *               businessName: { type: string }
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates: { type: array, items: { type: number } }
 *                   address:     { type: string }
 *                   city:        { type: string }
 *                   pincode:     { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const allowed = [
      "name", "bio", "skills", "education", "phone",
      "businessName", "businessCategory", "location",
      "notificationPrefs", "fcmToken",
    ];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: user });
  })
);

// ── POST /api/v1/users/avatar – Upload profile photo ─────────────────────────
/**
 * @swagger
 * /users/avatar:
 *   post:
 *     summary: Upload / replace profile avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar URL returned
 */
router.post(
  "/avatar",
  protect,
  uploadAvatar.single("avatar"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ErrorResponse("No file uploaded", 400);
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path },
      { new: true }
    );
    res.json({ success: true, avatar: user.avatar });
  })
);

// ── PUT /api/v1/users/change-password ────────────────────────────────────────
router.put(
  "/change-password",
  protect,
  asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      return next(new ErrorResponse("Current password is incorrect", 401));
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  })
);

// ── GET /api/v1/users/workers/nearby – Businesses find available workers ──────
router.get(
  "/workers/nearby",
  protect,
  authorize("business", "admin"),
  asyncHandler(async (req, res) => {
    const { lat, lng, radius = 5, skills } = req.query;
    if (!lat || !lng) throw new ErrorResponse("lat and lng are required", 400);

    const query = {
      role: "worker",
      isActive: true,
      isOnline: true,
      "location.coordinates": {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      },
    };
    if (skills) query.skills = { $in: skills.split(",") };

    const workers = await User.find(query).select(
      "name avatar skills averageRating totalJobsCompleted isIdVerified location.city"
    );
    res.json({ success: true, count: workers.length, data: workers });
  })
);

module.exports = router;
