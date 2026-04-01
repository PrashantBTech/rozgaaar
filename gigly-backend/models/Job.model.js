const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // ── Core Info ─────────────────────────────────────────────────────────────
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    category: {
      type: String,
      required: true,
      enum: [
        "cafe_staff", "kitchen_help", "event_crew", "warehouse_loader",
        "delivery", "retail_assistant", "data_entry", "cleaning",
        "security", "photography", "promoter", "other"
      ],
    },
    skills: [{ type: String }], // preferred skills
    media: [{ type: String }],  // Cloudinary image URLs

    // ── Business / Poster ─────────────────────────────────────────────────────
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ── Timing ───────────────────────────────────────────────────────────────
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "14:00"
    durationHours: { type: Number, required: true, min: 1, max: 12 },

    // ── Pay / Type ──────────────────────────────────────────────────────────
    employmentType: {
      type: String,
      enum: ["part_time", "full_time"],
      default: "part_time",
      required: true,
    },
    payPerHour: { type: Number, required: true, min: 0 },
    totalPay: { type: Number }, // auto-calculated
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank_transfer", "platform_wallet"],
      default: "platform_wallet",
    },

    // ── Slots ────────────────────────────────────────────────────────────────
    slotsRequired: { type: Number, default: 1, min: 1, max: 50 },
    slotsFilled: { type: Number, default: 0 },

    // ── Location ─────────────────────────────────────────────────────────────
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number], // [lng, lat]
      address: { type: String, required: true },
      landmark: { type: String },
      city: { type: String },
      pincode: { type: String },
    },

    // ── Status ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "open", "in_progress", "completed", "cancelled", "expired"],
      default: "open",
    },
    endsAt: { type: Date }, // when the listing expires (auto = date+startTime)

    // ── Requirements ─────────────────────────────────────────────────────────
    requirements: {
      minAge: { type: Number, default: 18 },
      gender: { type: String, enum: ["any", "male", "female"], default: "any" },
      experience: { type: String, enum: ["none", "some", "experienced"], default: "none" },
      ownVehicle: { type: Boolean, default: false },
      ownEquipment: { type: Boolean, default: false },
      requireResume: { type: Boolean, default: false },
    },

    // ── Urgency ──────────────────────────────────────────────────────────────
    isUrgent: { type: Boolean, default: false }, // boosts visibility
    isFeatured: { type: Boolean, default: false },

    // ── Stats ────────────────────────────────────────────────────────────────
    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },

    // ── Hired workers (after accepting applications) ──────────────────────────
    hiredWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
jobSchema.index({ "location.coordinates": "2dsphere" });
jobSchema.index({ status: 1, date: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ isUrgent: -1, createdAt: -1 });

// ── Auto-calculate totalPay ────────────────────────────────────────────────────
jobSchema.pre("save", function (next) {
  this.totalPay = this.payPerHour * this.durationHours;
  if (!this.endsAt) {
    // job listing expires when the shift starts
    this.endsAt = this.date;
  }
  next();
});

module.exports = mongoose.model("Job", jobSchema);
