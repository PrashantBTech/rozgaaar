const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { protect, authorize } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Application = require("../models/Application.model");
const User = require("../models/User.model");

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Stripe-powered payment processing
 */

/**
 * @swagger
 * /payments/create-payment-intent:
 *   post:
 *     summary: Business creates a Stripe payment intent for a gig
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [applicationId]
 *             properties:
 *               applicationId: { type: string }
 *     responses:
 *       200:
 *         description: clientSecret returned for Stripe.js
 */
router.post(
  "/create-payment-intent",
  protect,
  authorize("business"),
  asyncHandler(async (req, res, next) => {
    const application = await Application.findById(req.body.applicationId)
      .populate("worker", "name stripeCustomerId");
    if (!application) return next(new ErrorResponse("Application not found", 404));
    if (application.status !== "completed") {
      return next(new ErrorResponse("Gig must be completed before payment", 400));
    }
    if (application.isPaid) return next(new ErrorResponse("Already paid", 400));

    const amountPaise = Math.round(application.totalPaid * 100); // Stripe uses smallest unit

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountPaise,
      currency: "inr",
      metadata: {
        applicationId: application._id.toString(),
        workerId: application.worker._id.toString(),
        businessId: req.user.id,
      },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  })
);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Stripe webhook – auto-confirm payment on success
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const { applicationId, workerId } = event.data.object.metadata;
      const amountReceived = event.data.object.amount_received / 100;

      await Application.findByIdAndUpdate(applicationId, {
        isPaid: true,
        paymentId: event.data.object.id,
        totalPaid: amountReceived,
      });

      // Credit worker wallet
      await User.findByIdAndUpdate(workerId, {
        $inc: { walletBalance: amountReceived * 0.9 }, // platform takes 10%
      });
    }

    res.json({ received: true });
  })
);

/**
 * @swagger
 * /payments/wallet:
 *   get:
 *     summary: Worker – get wallet balance
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance in INR
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
 *     responses:
 *       200:
 *         description: List of paid gigs
 */
router.get(
  "/history",
  protect,
  asyncHandler(async (req, res) => {
    const filter =
      req.user.role === "worker"
        ? { worker: req.user.id, isPaid: true }
        : { business: req.user.id, isPaid: true };

    const history = await Application.find(filter)
      .populate("job", "title date")
      .populate("worker", "name avatar")
      .populate("business", "name businessName avatar")
      .sort("-completedAt");

    res.json({ success: true, count: history.length, data: history });
  })
);

module.exports = router;
