const mongoose = require("mongoose");

// ── Review Model ──────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewerRole: { type: String, enum: ["worker", "business"], required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    tags: [{ type: String }], // e.g. ["punctual", "hardworking", "reliable"]
    comment: { type: String, maxlength: 500 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ application: 1, reviewer: 1 }, { unique: true });

// ── Notification Model ────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "new_application", "application_accepted", "application_rejected",
        "application_shortlisted",
        "job_completed", "payment_received", "new_job_nearby",
        "review_received", "check_in_reminder", "job_cancelled", "system"
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed }, // extra payload (jobId, etc.)
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// ── Chat Message Model ────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, maxlength: 1000 },
    attachment: { type: String }, // Cloudinary URL
    attachmentType: { type: String, enum: ["image", "document"] },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);
messageSchema.index({ application: 1, createdAt: 1 });

module.exports = {
  Review: mongoose.model("Review", reviewSchema),
  Notification: mongoose.model("Notification", notificationSchema),
  Message: mongoose.model("Message", messageSchema),
};
