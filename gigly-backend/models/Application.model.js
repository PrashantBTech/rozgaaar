const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: ["pending", "viewed", "shortlisted", "accepted", "rejected", "withdrawn", "no_show", "completed"],
      default: "pending",
    },

    coverNote: { type: String, maxlength: 500 }, // optional note from worker
    workerDistance: { type: Number }, // km from job location at time of apply

    // ── Timing Tracking ───────────────────────────────────────────────────────
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    actualHours: { type: Number },

    // ── Pay ───────────────────────────────────────────────────────────────────
    agreedPayPerHour: { type: Number },
    totalPaid: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paymentId: { type: String },

    // ── Reviews (mutual) ─────────────────────────────────────────────────────
    workerReviewed: { type: Boolean, default: false },
    businessReviewed: { type: Boolean, default: false },

    // ── Timestamps of status changes ─────────────────────────────────────────
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  { timestamps: true }
);

// ── Ensure one application per worker per job ─────────────────────────────────
applicationSchema.index({ job: 1, worker: 1 }, { unique: true });
applicationSchema.index({ worker: 1, status: 1 });
applicationSchema.index({ business: 1, status: 1 });

module.exports = mongoose.model("Application", applicationSchema);
