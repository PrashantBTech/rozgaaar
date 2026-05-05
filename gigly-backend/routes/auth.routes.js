// ═══════════════════════════════════════════════════════════
// auth.routes.js
// ═══════════════════════════════════════════════════════════
const express = require("express");
const router = express.Router();
const {
  register, login, refreshToken, verifyEmail,
  forgotPassword, resetPassword, logout, getMe,
  googleAuth
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & user session management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (worker or business)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:       { type: string }
 *               email:      { type: string, format: email }
 *               password:   { type: string, minLength: 8 }
 *               role:       { type: string, enum: [worker, business] }
 *               phone:      { type: string }
 *               businessName: { type: string }
 *     responses:
 *       201:
 *         description: User registered, tokens returned
 *       400:
 *         description: Validation error or duplicate email
 */
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/refresh-token", refreshToken);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;
