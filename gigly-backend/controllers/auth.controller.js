const crypto = require("crypto");
const User = require("../models/User.model");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const logger = require("../utils/logger");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helper: send tokens ───────────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();

  // Save refresh token to DB
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      isIdVerified: user.isIdVerified,
    },
  });
};

// ── @POST /api/v1/auth/register ───────────────────────────────────────────────
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone, businessName, businessCategory } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new ErrorResponse("Email already registered", 400));

  const user = await User.create({
    name, email, password, phone,
    role: role === "business" ? "business" : "worker",
    businessName: role === "business" ? businessName : undefined,
    businessCategory: role === "business" ? businessCategory : undefined,
  });

  // Email verification token (6-digit OTP)
  const verifyToken = Math.floor(100000 + Math.random() * 900000).toString();
  user.emailVerificationToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: user.email,
      subject: "Welcome to Rozgaaar – Verify your email",
      html: `<p>Hi ${user.name}!</p><p>Your verification OTP is: <strong>${verifyToken}</strong></p>`,
    });
  } catch (err) {
    logger.error(`Email send failed: ${err.message}`);
  }

  sendTokenResponse(user, 201, res);
});

// ── @POST /api/v1/auth/login ──────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorResponse("Please provide email and password", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// ── @POST /api/v1/auth/refresh-token ─────────────────────────────────────────
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return next(new ErrorResponse("No refresh token provided", 400));

  const jwt = require("jsonwebtoken");
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return next(new ErrorResponse("Invalid or expired refresh token", 401));
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    return next(new ErrorResponse("Refresh token mismatch", 401));
  }

  sendTokenResponse(user, 200, res);
});

// ── @GET /api/v1/auth/verify-email/:token ────────────────────────────────────
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({ emailVerificationToken: hashed });
  if (!user) return next(new ErrorResponse("Invalid or expired token", 400));

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: "Email verified successfully" });
});

// ── @POST /api/v1/auth/forgot-password ───────────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorResponse("No user with that email", 404));

  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: user.email,
      subject: "Rozgaaar – Password Reset",
      html: `<p>Your password reset OTP is: <strong>${resetToken}</strong></p><p>Valid for 10 minutes.</p>`,
    });
    res.json({ success: true, message: "Password reset email sent" });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// ── @PUT /api/v1/auth/reset-password/:token ───────────────────────────────────
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) return next(new ErrorResponse("Invalid or expired reset token", 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// ── @POST /api/v1/auth/logout ─────────────────────────────────────────────────
exports.logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { refreshToken: undefined, isOnline: false });
  res.json({ success: true, message: "Logged out successfully" });
});

// ── @GET /api/v1/auth/me ──────────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
});

// ── @POST /api/v1/auth/google ────────────────────────────────────────────────
exports.googleAuth = asyncHandler(async (req, res, next) => {
  const { idToken, role } = req.body;
  if (!idToken) return next(new ErrorResponse("No token provided", 400));

  let payload;
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`);
    if (!response.ok) throw new Error("Invalid Google token");
    payload = await response.json();
  } catch (err) {
    return next(new ErrorResponse("Invalid Google token", 401));
  }

  const { email, name, picture } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString("hex");
    user = await User.create({
      name,
      email,
      password: randomPassword,
      role: role || "worker",
      avatar: picture,
      isEmailVerified: true,
    });
  } else {
    if (!user.avatar && picture) {
      user.avatar = picture;
      await user.save({ validateBeforeSave: false });
    }
  }

  sendTokenResponse(user, 200, res);
});
