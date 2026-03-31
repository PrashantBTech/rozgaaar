// ── job.routes.js ─────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const {
  getJobs, getJob, createJob, updateJob,
  deleteJob, getMyPostedJobs, updateJobStatus,
} = require("../controllers/job.controller");
const { protect, authorize } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Gig job listings
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all open jobs (with optional geospatial filter)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema: { type: number }
 *         description: User latitude
 *       - in: query
 *         name: lng
 *         schema: { type: number }
 *         description: User longitude
 *       - in: query
 *         name: radius
 *         schema: { type: number, default: 10 }
 *         description: Search radius in km
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: isUrgent
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Paginated list of jobs
 */
router.get("/", getJobs);
router.get("/my", protect, authorize("business", "admin"), getMyPostedJobs);
router.get("/:id", getJob);
router.post("/", protect, authorize("business", "admin"), createJob);
router.put("/:id", protect, authorize("business", "admin"), updateJob);
router.patch("/:id/status", protect, authorize("business", "admin"), updateJobStatus);
router.delete("/:id", protect, deleteJob);

module.exports = router;
