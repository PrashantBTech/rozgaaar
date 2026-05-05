// ── application.routes.js ─────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
  updateApplicationStatus,
  getApplicationContact,
  checkIn,
  checkOut,
  withdrawApplication,
  generateVerification,
} = require("../controllers/application.controller");
const { uploadDocument } = require("../config/cloudinary");
const { protect, authorize } = require("../middleware/auth");

const asyncHandler = require("../middleware/asyncHandler");

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job applications – apply, accept, reject, check-in/out
 */

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Worker applies to a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId]
 *             properties:
 *               jobId:      { type: string }
 *               coverNote:  { type: string, maxLength: 500 }
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Already applied / slots full
 */
// Accept optional "resume" file via multipart/form-data
router.post("/", protect, authorize("worker"), uploadDocument.single("resume"), applyToJob);

/**
 * @swagger
 * /applications/my:
 *   get:
 *     summary: Worker – view own applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications with job details
 */
router.get("/my", protect, authorize("worker", "business", "admin"), getMyApplications);

/**
 * @swagger
 * /applications/job/{jobId}:
 *   get:
 *     summary: Business – view all applicants for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Applicant list with worker profiles
 */
router.get("/job/:jobId", protect, authorize("business", "admin"), getApplicationsForJob);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Business – accept / reject / shortlist applicant
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected, shortlisted]
 *     responses:
 *       200:
 *         description: Status updated, worker notified in real-time
 */
router.patch("/:id/status", protect, authorize("business", "admin"), updateApplicationStatus);

/**
 * @swagger
 * /applications/{id}/contact:
 *   get:
 *     summary: Business – reveal worker contact (shortlisted/accepted only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Worker contact details
 *       403:
 *         description: Shortlist/accept the candidate first
 */
router.get("/:id/contact", protect, authorize("business"), getApplicationContact);

router.patch("/:id/checkin",  protect, authorize("worker"), checkIn);
router.patch("/:id/checkout", protect, authorize("worker"), checkOut);
router.patch("/:id/withdraw", protect, authorize("worker"), withdrawApplication);
router.post("/:id/generate-verification", protect, authorize("business", "admin"), generateVerification);

// Contact route — reveals worker phone to business
router.get("/:id/contact", protect, authorize("business"), asyncHandler(async (req, res, next) => {
  const Application = require("../models/Application.model");
  const ErrorResponse = require("../utils/errorResponse");

  const application = await Application.findById(req.params.id)
    .populate("worker", "name phone");

  if (!application)
    return next(new ErrorResponse("Not found", 404));
  if (application.business.toString() !== req.user.id)
    return next(new ErrorResponse("Not authorized", 403));
  if (!["shortlisted", "accepted"].includes(application.status))
    return next(new ErrorResponse("Shortlist this candidate first to view contact", 403));

  res.json({
    success: true,
    data: { name: application.worker.name, phone: application.worker.phone }
  });
}));

module.exports = router;
