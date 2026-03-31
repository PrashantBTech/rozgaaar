const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const asyncHandler = require("./asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// ── Protect: require valid JWT ────────────────────────────────────────────────
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("+isActive +isBanned");

    if (!user) return next(new ErrorResponse("User not found", 401));
    if (!user.isActive) return next(new ErrorResponse("Your account has been deactivated", 401));
    if (user.isBanned) return next(new ErrorResponse(`Account banned: ${user.banReason}`, 403));

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized, token failed", 401));
  }
});

// ── Authorize: restrict to specific roles ─────────────────────────────────────
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// ── Optional Auth: attach user if token present, but don't block ──────────────
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (_) {}
  }
  next();
});
