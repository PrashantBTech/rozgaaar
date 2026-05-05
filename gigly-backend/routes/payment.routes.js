const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { protect, authorize } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Application = require("../models/Application.model");
const User = require("../models/User.model");
const Job = require("../models/Job.model");

// Initialize Razorpay
// For safety, fallback to some strings if env is missing so it doesn't crash on load
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Business creates a Razorpay order to post a job
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/create-order",
  protect,
  authorize("business"),
  asyncHandler(async (req, res, next) => {
    const { jobId } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) return next(new ErrorResponse("Job not found", 404));
    if (job.postedBy.toString() !== req.user.id) return next(new ErrorResponse("Not authorized", 403));
    if (job.status !== "draft") return next(new ErrorResponse("Job is already posted or not in draft", 400));

    // Platform Fee 7%
    const totalAmount = job.totalPay * job.slotsRequired;
    const amountWithFee = totalAmount * 1.07;
    const amountPaise = Math.round(amountWithFee * 100);

    const options = {
      amount: amountPaise,
      currency: "INR",
      receipt: `receipt_job_${job._id}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return next(new ErrorResponse("Failed to create Razorpay order", 500));

    res.json({ success: true, data: order });
  })
);

/**
 * @swagger
 * /payments/verify-order:
 *   post:
 *     summary: Verify Razorpay payment and open the job
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/verify-order",
  protect,
  authorize("business"),
  asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, jobId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test_secret")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment verified
      const job = await Job.findById(jobId);
      if (!job) return next(new ErrorResponse("Job not found", 404));

      job.status = "open";
      await job.save();

      // Add money to Business wallet (Escrow). The 7% is platform fee, so we only add totalPay * slotsRequired.
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { walletBalance: job.totalPay * job.slotsRequired }
      });

      // Real-time: notify nearby workers via socket
      const { Notification } = require("../models/Review.model");
      const io = req.app.get("io");
      if (io && job.location?.coordinates) {
        const nearbyWorkers = await User.find({
          role: "worker",
          isActive: true,
          isOnline: true,
          "location.coordinates": {
            $near: {
              $geometry: { type: "Point", coordinates: job.location.coordinates },
              $maxDistance: 10000, // 10 km
            },
          },
        }).select("socketId");

        nearbyWorkers.forEach((w) => {
          if (w.socketId) {
            io.to(w.socketId).emit("new_job_nearby", {
              jobId: job._id,
              title: job.title,
              payPerHour: job.payPerHour,
              location: job.location.address,
              isUrgent: job.isUrgent,
            });
          }
        });

        // Save notifications in DB
        await Notification.insertMany(
          nearbyWorkers.map((w) => ({
            recipient: w._id,
            type: "new_job_nearby",
            title: `New gig: ${job.title}`,
            body: `₹${job.payPerHour}/hr • ${job.location.address}`,
            data: { jobId: job._id },
          }))
        );
      }

      res.json({ success: true, message: "Payment verified, Job is now open" });
    } else {
      return next(new ErrorResponse("Invalid Signature", 400));
    }
  })
);

/**
 * @swagger
 * /payments/withdraw:
 *   post:
 *     summary: Worker withdraws from wallet
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/withdraw",
  protect,
  asyncHandler(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return next(new ErrorResponse("Invalid amount", 400));

    const user = await User.findById(req.user.id);
    if (user.walletBalance < amount) return next(new ErrorResponse("Insufficient wallet balance", 400));

    // Deduct amount
    user.walletBalance -= amount;
    await user.save();

    // 7% fee deduction
    const netAmount = amount * 0.93;

    // TODO: Initiate actual Razorpay Payouts here in production.
    // For test mode, we just log and return success.

    res.json({ 
      success: true, 
      message: `Withdrawal request for ₹${amount} initiated. ₹${netAmount.toFixed(2)} will be credited to your account after 7% platform fee.`,
      walletBalance: user.walletBalance
    });
  })
);

/**
 * @swagger
 * /payments/wallet:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/wallet",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("walletBalance totalEarnings totalSpent");
    res.json({ success: true, data: user });
  })
);

/**
 * @swagger
 * /payments/history:
 *   get:
 *     summary: Get payment history (completed & paid applications)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/history",
  protect,
  asyncHandler(async (req, res) => {
    const filter =
      req.user.role === "worker"
        ? { worker: req.user.id, status: "completed" }
        : { business: req.user.id, status: "completed" };

    const history = await Application.find(filter)
      .populate("job", "title date")
      .populate("worker", "name avatar")
      .populate("business", "name businessName avatar")
      .sort("-completedAt");

    res.json({ success: true, count: history.length, data: history });
  })
);

module.exports = router;
