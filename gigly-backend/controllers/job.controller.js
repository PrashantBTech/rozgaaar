const Job = require("../models/Job.model");
const User = require("../models/User.model");
const Application = require("../models/Application.model");
const { Notification } = require("../models/Review.model");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// ── @GET /api/v1/jobs — List jobs with geospatial filter ────────────────────
exports.getJobs = asyncHandler(async (req, res) => {
  const {
    q, city,
    lat, lng, radius = 10, // km
    category, status = "open",
    minPay, maxPay, date,
    isUrgent, skills,
    page = 1, limit = 20,
    sort = "-isUrgent,-createdAt",
  } = req.query;

  const query = { status };

  // ── Text Search ──────────────────────────────────────────────────────────
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { skills: { $regex: q, $options: "i" } }
    ];
  }

  // ── City Filter ──────────────────────────────────────────────────────────
  if (city) {
    query["location.city"] = { $regex: city, $options: "i" };
  }

  // ── Geospatial: near me ──────────────────────────────────────────────────
  if (lat && lng) {
    query["location.coordinates"] = {
      $near: {
        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radius) * 1000, // meters
      },
    };
  }

  if (category) query.category = category;
  if (isUrgent === "true") query.isUrgent = true;
  if (minPay || maxPay) {
    query.payPerHour = {};
    if (minPay) query.payPerHour.$gte = parseFloat(minPay);
    if (maxPay) query.payPerHour.$lte = parseFloat(maxPay);
  }
  if (date) {
    const d = new Date(date);
    query.date = {
      $gte: new Date(d.setHours(0, 0, 0, 0)),
      $lte: new Date(d.setHours(23, 59, 59, 999)),
    };
  }
  if (skills) {
    query.skills = { $in: skills.split(",") };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate("postedBy", "name avatar businessName averageRating isIdVerified")
      .sort(sort.replace(/,/g, " "))
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Job.countDocuments(query),
  ]);

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: jobs,
  });
});

// ── @GET /api/v1/jobs/:id ─────────────────────────────────────────────────────
exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("postedBy", "name avatar businessName averageRating isIdVerified location");

  if (!job) return next(new ErrorResponse("Job not found", 404));
  res.json({ success: true, data: job });
});

// ── @POST /api/v1/jobs ────────────────────────────────────────────────────────
exports.createJob = asyncHandler(async (req, res) => {
  req.body.postedBy = req.user.id;
  const job = await Job.create(req.body);

  // Real-time: notify nearby workers via socket
  const io = req.app.get("io");
  if (io && job.location?.coordinates) {
    // Notify workers within radius who are online
    const nearbyWorkers = await User.find({
      role: "worker",
      isActive: true,
      isOnline: true,
      "location.coordinates": {
        $near: {
          $geometry: { type: "Point", coordinates: job.location.coordinates },
          $maxDistance: 10000, // 10 km
        },
      },
    }).select("socketId");

    nearbyWorkers.forEach((w) => {
      if (w.socketId) {
        io.to(w.socketId).emit("new_job_nearby", {
          jobId: job._id,
          title: job.title,
          payPerHour: job.payPerHour,
          location: job.location.address,
          isUrgent: job.isUrgent,
        });
      }
    });

    // Save notifications in DB
    await Notification.insertMany(
      nearbyWorkers.map((w) => ({
        recipient: w._id,
        type: "new_job_nearby",
        title: `New gig: ${job.title}`,
        body: `₹${job.payPerHour}/hr • ${job.location.address}`,
        data: { jobId: job._id },
      }))
    );
  }

  res.status(201).json({ success: true, data: job });
});

// ── @PUT /api/v1/jobs/:id ─────────────────────────────────────────────────────
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (!job) return next(new ErrorResponse("Job not found", 404));
  if (job.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized", 403));
  }
  if (["completed", "cancelled"].includes(job.status)) {
    return next(new ErrorResponse("Cannot edit a completed or cancelled job", 400));
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: job });
});

// ── @DELETE /api/v1/jobs/:id ──────────────────────────────────────────────────
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new ErrorResponse("Job not found", 404));
  if (job.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized", 403));
  }
  // Remove orphan applications when a gig post is deleted.
  await Application.deleteMany({ job: req.params.id });
  await job.deleteOne();
  res.json({ success: true, message: "Job deleted" });
});

// ── @GET /api/v1/jobs/my — Business: my posted jobs ──────────────────────────
exports.getMyPostedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user.id })
    .sort("-createdAt")
    .populate("hiredWorkers", "name avatar averageRating");
  res.json({ success: true, count: jobs.length, data: jobs });
});

// ── @PATCH /api/v1/jobs/:id/status ───────────────────────────────────────────
exports.updateJobStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const job = await Job.findById(req.params.id);
  if (!job) return next(new ErrorResponse("Job not found", 404));
  if (job.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized", 403));
  }
  job.status = status;
  await job.save();
  res.json({ success: true, data: job });
});
