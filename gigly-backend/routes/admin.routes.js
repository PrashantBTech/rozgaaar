const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User.model");
const Job = require("../models/Job.model");
const Application = require("../models/Application.model");
const { Review, Notification } = require("../models/Review.model");

const adminGuard = [protect, authorize("admin")];

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only platform management
 */

// ── GET /api/v1/admin/dashboard – Platform stats ──────────────────────────────
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Platform-wide stats for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated platform statistics
 */
router.get(
  "/dashboard",
  ...adminGuard,
  asyncHandler(async (req, res) => {
    const [
      totalUsers, workers, businesses,
      totalJobs, openJobs, completedJobs,
      totalApplications, completedApplications,
      pendingVerifications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "worker" }),
      User.countDocuments({ role: "business" }),
      Job.countDocuments(),
      Job.countDocuments({ status: "open" }),
      Job.countDocuments({ status: "completed" }),
      Application.countDocuments(),
      Application.countDocuments({ status: "completed" }),
      User.countDocuments({ idDocument: { $exists: true, $ne: null }, isIdVerified: false }),
    ]);

    // Revenue (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const revenueAgg = await Application.aggregate([
      { $match: { isPaid: true, completedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$totalPaid" } } },
    ]);

    // Jobs by category
    const jobsByCategory = await Job.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, workers, businesses },
        jobs: { total: totalJobs, open: openJobs, completed: completedJobs },
        applications: { total: totalApplications, completed: completedApplications },
        revenue30d: revenueAgg[0]?.total || 0,
        pendingVerifications,
        jobsByCategory,
      },
    });
  })
);

// ── GET /api/v1/admin/users – List all users with filters ────────────────────
router.get(
  "/users",
  ...adminGuard,
  asyncHandler(async (req, res) => {
    const { role, isBanned, isIdVerified, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === "true";
    if (isIdVerified !== undefined) filter.isIdVerified = isIdVerified === "true";
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort("-createdAt").skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: parseInt(page), data: users });
  })
);

// ── PATCH /api/v1/admin/users/:id/ban – Ban/unban user ───────────────────────
router.patch(
  "/users/:id/ban",
  ...adminGuard,
  asyncHandler(async (req, res) => {
    const { isBanned, banReason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned, banReason: isBanned ? banReason : undefined },
      { new: true }
    );
    res.json({ success: true, data: user });
  })
);

// ── PATCH /api/v1/admin/users/:id/verify-id – Approve ID verification ────────
/**
 * @swagger
 * /admin/users/{id}/verify-id:
 *   patch:
 *     summary: Admin approves/rejects ID verification for a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved: { type: boolean }
 *     responses:
 *       200:
 *         description: Verification status updated
 */
router.patch(
  "/users/:id/verify-id",
  ...adminGuard,
  asyncHandler(async (req, res) => {
    const { approved } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isIdVerified: approved },
      { new: true }
    );

    // Notify user
    await Notification.create({
      recipient: user._id,
      type: "system",
      title: approved ? "✅ ID Verified!" : "❌ ID Verification Failed",
      body: approved
        ? "Your identity has been verified. You now get a verified badge!"
        : "Your ID could not be verified. Please re-upload a clearer document.",
    });

    res.json({ success: true, data: user });
  })
);

// ── GET /api/v1/admin/pending-verifications ───────────────────────────────────
router.get(
  "/pending-verifications",
  ...adminGuard,
  asyncHandler(async (req, res) => {
    const users = await User.find({
      idDocument: { $exists: true, $ne: null },
      isIdVerified: false,
    }).select("name email role avatar idDocument createdAt");
    res.json({ success: true, count: users.length, data: users });
  })
);

// ── PATCH /api/v1/admin/jobs/:id/feature – Feature/unfeature a job ────────────
router.patch(
  "/jobs/:id/feature",
  ...adminGuard,
  asyncHandler(async (req, res) => {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isFeatured: req.body.isFeatured },
      { new: true }
    );
    res.json({ success: true, data: job });
  })
);

// ── DELETE /api/v1/admin/jobs/:id – Hard delete a job ────────────────────────
router.delete(
  "/jobs/:id",
  ...adminGuard,
  asyncHandler(async (req, res) => {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Job deleted by admin" });
  })
);

module.exports = router;
