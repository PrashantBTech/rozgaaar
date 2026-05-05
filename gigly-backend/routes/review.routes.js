// ── review.routes.js ──────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { Review } = require("../models/Review.model");
const Application = require("../models/Application.model");
const User = require("../models/User.model");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Mutual post-gig reviews (worker ↔ business)
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Submit a review after a completed gig
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [applicationId, rating]
 *             properties:
 *               applicationId: { type: string }
 *               rating:        { type: number, minimum: 1, maximum: 5 }
 *               comment:       { type: string }
 *               tags:          { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Review created and rating updated
 *       400:
 *         description: Already reviewed or gig not completed
 */
router.post(
  "/",
  protect,
  asyncHandler(async (req, res, next) => {
    const { applicationId, rating, comment, tags } = req.body;

    const application = await Application.findById(applicationId)
      .populate("job", "title");
    if (!application) return next(new ErrorResponse("Application not found", 404));
    if (application.status !== "completed") {
      return next(new ErrorResponse("Can only review completed gigs", 400));
    }

    const isWorker   = application.worker.toString()   === req.user.id;
    const isBusiness = application.business.toString() === req.user.id;
    if (!isWorker && !isBusiness) return next(new ErrorResponse("Not part of this gig", 403));

    // Prevent double review
    if (isWorker   && application.workerReviewed)   return next(new ErrorResponse("Already reviewed", 400));
    if (isBusiness && application.businessReviewed) return next(new ErrorResponse("Already reviewed", 400));

    const reviewerRole = isWorker ? "worker" : "business";
    const revieweeId   = isWorker ? application.business : application.worker;

    const review = await Review.create({
      application: applicationId,
      job: application.job._id,
      reviewer: req.user.id,
      reviewee: revieweeId,
      reviewerRole,
      rating,
      comment,
      tags,
    });

    // Mark reviewed flag
    if (isWorker) application.workerReviewed = true;
    else          application.businessReviewed = true;
    await application.save();

    // Recalculate reviewee average rating
    const stats = await Review.aggregate([
      { $match: { reviewee: revieweeId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
      await User.findByIdAndUpdate(revieweeId, {
        averageRating: Math.round(stats[0].avg * 10) / 10,
        totalReviews: stats[0].count,
      });
    }

    res.status(201).json({ success: true, data: review });
  })
);

/**
 * @swagger
 * /reviews/user/{userId}:
 *   get:
 *     summary: Get all reviews for a user
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of reviews with reviewer info
 */
router.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ reviewee: req.params.userId, isPublic: true })
      .populate("reviewer", "name avatar role")
      .populate("job", "title")
      .sort("-createdAt");
    res.json({ success: true, count: reviews.length, data: reviews });
  })
);

module.exports = router;
