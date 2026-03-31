const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    // ── Identity ────────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true, minlength: 8, select: false },

    // ── Role ────────────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["worker", "business", "admin"],
      default: "worker",
    },

    // ── Profile ─────────────────────────────────────────────────────────────
    avatar: { type: String, default: "" },
    bio: { type: String, maxlength: 300 },
    skills: [{ type: String, trim: true }], // e.g. ["barista", "data entry", "forklift"]

    // ── Business-specific fields ─────────────────────────────────────────────
    businessName: { type: String, trim: true },
    businessCategory: {
      type: String,
      enum: ["cafe", "restaurant", "warehouse", "event", "retail", "office", "other"],
    },
    gstNumber: { type: String, sparse: true },

    // ── Geolocation (GeoJSON) ────────────────────────────────────────────────
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
        index: "2dsphere",
      },
      address: { type: String },
      city: { type: String },
      pincode: { type: String },
    },

    // ── Ratings & Stats ──────────────────────────────────────────────────────
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalJobsCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }, // for workers
    totalSpent: { type: Number, default: 0 },    // for businesses

    // ── Verification ─────────────────────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isIdVerified: { type: Boolean, default: false }, // admin approves
    idDocument: { type: String }, // Cloudinary URL
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },

    // ── Payment ──────────────────────────────────────────────────────────────
    stripeCustomerId: { type: String },
    bankAccountLinked: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },

    // ── Auth Tokens ──────────────────────────────────────────────────────────
    refreshToken: { type: String, select: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpire: { type: Date, select: false },

    // ── Presence ─────────────────────────────────────────────────────────────
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },
    socketId: { type: String },

    // ── Push Notifications ────────────────────────────────────────────────────
    fcmToken: { type: String },
    notificationPrefs: {
      newJob: { type: Boolean, default: true },
      applicationUpdate: { type: Boolean, default: true },
      payment: { type: Boolean, default: true },
      chat: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ "location.coordinates": "2dsphere" });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ skills: 1 });

// ── Hash password before save ─────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare password ──────────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ── Sign access token ─────────────────────────────────────────────────────────
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ── Sign refresh token ────────────────────────────────────────────────────────
userSchema.methods.getRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

// ── Hide sensitive fields in JSON output ──────────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.emailVerificationToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
