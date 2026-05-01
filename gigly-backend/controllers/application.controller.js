const Application = require("../models/Application.model");
const Job = require("../models/Job.model");
const User = require("../models/User.model");
const { Notification } = require("../models/Review.model");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

const notifySocket = (io, socketId, event, data) => {
  if (io && socketId) io.to(socketId).emit(event, data);
};

// ── @POST /api/v1/applications — Worker applies to job ───────────────────────
// Accepts JSON or multipart/form-data (with optional "resume" file)
exports.applyToJob = asyncHandler(async (req, res, next) => {
  const { jobId, coverNote } = req.body;

  const job = await Job.findById(jobId).populate("postedBy", "socketId name");
  if (!job) return next(new ErrorResponse("Job not found", 404));
  if (job.status !== "open") return next(new ErrorResponse("This job is no longer accepting applications", 400));
  if (job.slotsFilled >= job.slotsRequired) return next(new ErrorResponse("All slots are filled", 400));

  // If a resume file was uploaded for this application, capture its URL.
  const uploadedResumeUrl = req.file?.path;

  const existing = await Application.findOne({ job: jobId, worker: req.user.id });
  if (existing) return next(new ErrorResponse("You already applied for this job", 400));

  const application = await Application.create({
    job: jobId,
    worker: req.user.id,
    business: job.postedBy._id,
    coverNote,
    resumeUrl: uploadedResumeUrl,
    agreedPayPerHour: job.payPerHour,
  });

  // Update job stats
  await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

  // Notify business in real-time
  const worker = await User.findById(req.user.id).select("name avatar averageRating");
  const io = req.app.get("io");
  notifySocket(io, job.postedBy.socketId, "new_application", {
    applicationId: application._id,
    jobTitle: job.title,
    worker: { _id: worker._id, name: worker.name, avatar: worker.avatar, rating: worker.averageRating },
  });

  await Notification.create({
    recipient: job.postedBy._id,
    type: "new_application",
    title: `New application for "${job.title}"`,
    body: `${worker.name} has applied for your gig`,
    data: { applicationId: application._id, jobId },
  });

  res.status(201).json({ success: true, data: application });
});

// ── @GET /api/v1/applications/job/:jobId — Business: see all applicants ──────
exports.getApplicationsForJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return next(new ErrorResponse("Job not found", 404));
  if (job.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized", 403));
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate("worker", "name avatar bio skills averageRating totalJobsCompleted isIdVerified location")
    .sort("-createdAt");

  res.json({ success: true, count: applications.length, data: applications });
});

// ── @GET /api/v1/applications/my — Worker: see my applications ───────────────
exports.getMyApplications = asyncHandler(async (req, res) => {
  const basePopulate = {
    job: "title date startTime endTime payPerHour location status",
  };

  const { role, id } = req.user;
  let applications = [];

  if (role === "worker") {
    applications = await Application.find({ worker: id })
      .populate("job", basePopulate.job)
      .populate("business", "name businessName avatar")
      .populate("worker", "name avatar socketId")
      .sort("-createdAt");
  } else if (role === "business") {
    applications = await Application.find({ business: id })
      .populate("job", basePopulate.job)
      .populate("worker", "name avatar socketId")
      .sort("-createdAt");
  } else if (role === "admin") {
    // Admin can view all application threads (use sparingly).
    applications = await Application.find({})
      .populate("job", basePopulate.job)
      .populate("worker", "name avatar socketId")
      .populate("business", "name businessName avatar")
      .sort("-createdAt");
  }

  res.json({ success: true, data: applications });
});

// ── @GET /api/v1/applications/:id/contact — Business reveal contact ───────
exports.getApplicationContact = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate("worker", "name phone");

  if (!application) return next(new ErrorResponse("Application not found", 404));
  if (application.business.toString() !== req.user.id) {
    return next(new ErrorResponse("Not authorized", 403));
  }

  // Phone number is only revealed to shortlisters / accepted candidates
  if (!["shortlisted", "accepted"].includes(application.status)) {
    return next(new ErrorResponse("Shortlist the candidate first to view contact", 403));
  }

  if (!application.worker) {
    return next(new ErrorResponse("Worker profile not found", 404));
  }

  res.json({
    success: true,
    data: {
      name: application.worker.name,
      phone: application.worker.phone,
    },
  });
});

// ── @PATCH /api/v1/applications/:id/status — Business: accept/reject ─────────
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body; // accepted | rejected | shortlisted

  const application = await Application.findById(req.params.id)
    .populate("worker", "socketId name")
    .populate("job", "title slotsRequired slotsFilled durationHours payPerHour");

  if (!application) return next(new ErrorResponse("Application not found", 404));
  if (application.business.toString() !== req.user.id) {
    return next(new ErrorResponse("Not authorized", 403));
  }

  // Slot enforcement on accept
  if (status === "accepted") {
    if (application.job.slotsFilled >= application.job.slotsRequired) {
      return next(new ErrorResponse("All slots are filled", 400));
    }
    await Job.findByIdAndUpdate(application.job._id, {
      $inc: { slotsFilled: 1 },
      $addToSet: { hiredWorkers: application.worker._id },
    });
    application.acceptedAt = new Date();
  } else if (status === "completed" && application.status !== "completed") {
    application.completedAt = new Date();
    
    if (!application.totalPaid) {
      const duration = application.job.durationHours || 0;
      const rate = application.agreedPayPerHour || application.job.payPerHour || 0;
      application.actualHours = duration;
      application.totalPaid = parseFloat((duration * rate).toFixed(2));
    }
    
    await User.findByIdAndUpdate(application.worker._id, {
      $inc: { totalJobsCompleted: 1, totalEarnings: application.totalPaid }
    });
    await User.findByIdAndUpdate(application.business, {
      $inc: { totalSpent: application.totalPaid }
    });

    // Mark the parent Job as completed so it drops off the Find Work feed
    await Job.findByIdAndUpdate(application.job._id, { status: "completed" });
  }

  application.status = status;
  if (status === "rejected") application.rejectedAt = new Date();
  await application.save();


  // Real-time notify worker
  const io = req.app.get("io");
  const eventMap = { accepted: "application_accepted", rejected: "application_rejected", shortlisted: "application_shortlisted" };
  const businessName = req.user.businessName || req.user.name;

  const socketPayload =
    status === "shortlisted"
      ? { jobTitle: application.job.title, businessName }
      : { applicationId: application._id, jobTitle: application.job.title, status };

  notifySocket(
    io,
    application.worker.socketId,
    eventMap[status] || "application_update",
    socketPayload
  );

  const notificationPayload =
    status === "accepted"
      ? {
        type: "application_accepted",
        title: "🎉 You got the gig!",
        body: `You were accepted for "${application.job.title}"`,
      }
      : status === "completed"
        ? {
          type: "job_completed",
          title: "🏆 Job Completed!",
          body: `"${application.job.title}" is complete. Earnings added to your wallet!`,
        }
      : status === "shortlisted"
        ? {
          type: "application_shortlisted",
          title: "🎯 You've been shortlisted!",
          body: `${businessName} has shortlisted you for "${application.job.title}". They may contact you directly.`,
        }
        : {
          type: "application_rejected",
          title: "Application update",
          body: `Your application for "${application.job.title}" was not selected`,
        };

  await Notification.create({
    recipient: application.worker._id,
    ...notificationPayload,
    data: { applicationId: application._id },
  });

  res.json({ success: true, data: application });
});

// ── @POST /api/v1/applications/:id/generate-verification ─────────────────────
exports.generateVerification = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);
  if (!application) return next(new ErrorResponse("Application not found", 404));
  if (application.business.toString() !== req.user.id) return next(new ErrorResponse("Not authorized", 403));
  
  const { type } = req.body; // "start" or "end"
  if (!["start", "end"].includes(type)) return next(new ErrorResponse("Invalid verification type", 400));
  
  // ensure logical state
  if (type === "start" && application.status !== "accepted") {
    return next(new ErrorResponse("Application must be accepted to start work", 400));
  }
  if (type === "end" && application.status !== "in_progress") {
    return next(new ErrorResponse("Worker has not started work yet", 400));
  }

  const crypto = require("crypto");
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
  const qrToken = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins validity

  application.verification = { otp, qrToken, type, expiresAt };
  await application.save();

  res.json({
    success: true,
    data: { otp, qrToken, type, expiresAt }
  });
});

// ── @PATCH /api/v1/applications/:id/checkin ──────────────────────────────────
exports.checkIn = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);
  if (!application) return next(new ErrorResponse("Application not found", 404));
  if (application.worker.toString() !== req.user.id) return next(new ErrorResponse("Not authorized", 403));
  if (application.status !== "accepted") return next(new ErrorResponse("Application not accepted", 400));

  const { otp, qrToken } = req.body;
  if (!otp && !qrToken) return next(new ErrorResponse("Please provide an OTP or scan the QR code", 400));

  const v = application.verification;
  if (!v || v.type !== "start") return next(new ErrorResponse("No start code generated by business", 400));
  if (new Date() > v.expiresAt) return next(new ErrorResponse("Verification code expired. Ask the business to generate a new one.", 400));

  if (otp && v.otp !== otp) return next(new ErrorResponse("Invalid OTP", 400));
  if (qrToken && v.qrToken !== qrToken) return next(new ErrorResponse("Invalid QR Code", 400));

  // Clear verification data and check-in
  application.verification = undefined;
  application.checkInTime = new Date();
  application.status = "in_progress";
  await application.save();

  await Job.findByIdAndUpdate(application.job, { status: "in_progress" });

  res.json({ success: true, message: "Checked in successfully", checkInTime: application.checkInTime });
});

// ── @PATCH /api/v1/applications/:id/checkout ─────────────────────────────────
exports.checkOut = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id).populate("job");
  if (!application) return next(new ErrorResponse("Application not found", 404));
  if (application.worker.toString() !== req.user.id) return next(new ErrorResponse("Not authorized", 403));
  if (application.status !== "in_progress") return next(new ErrorResponse("You haven't checked in yet", 400));

  const { otp, qrToken } = req.body;
  if (!otp && !qrToken) return next(new ErrorResponse("Please provide an OTP or scan the QR code", 400));

  const v = application.verification;
  if (!v || v.type !== "end") return next(new ErrorResponse("No end code generated by business", 400));
  if (new Date() > v.expiresAt) return next(new ErrorResponse("Verification code expired. Ask the business to generate a new one.", 400));

  if (otp && v.otp !== otp) return next(new ErrorResponse("Invalid OTP", 400));
  if (qrToken && v.qrToken !== qrToken) return next(new ErrorResponse("Invalid QR Code", 400));

  // Clear verification data and check-out
  application.verification = undefined;
  const now = new Date();
  application.checkOutTime = now;
  const diffMs = now - application.checkInTime;
  application.actualHours = parseFloat((diffMs / 3600000).toFixed(2));
  application.totalPaid = parseFloat((application.actualHours * application.agreedPayPerHour).toFixed(2));
  application.status = "completed";
  application.completedAt = now;
  await application.save();

  // Update stats
  await User.findByIdAndUpdate(application.worker, {
    $inc: { totalJobsCompleted: 1, totalEarnings: application.totalPaid },
  });
  await User.findByIdAndUpdate(application.business, {
    $inc: { totalSpent: application.totalPaid },
  });

  // Mark the parent Job as completed so it drops off the Find Work feed
  await Job.findByIdAndUpdate(application.job._id, { status: "completed" });

  res.json({
    success: true,
    message: "Checked out. Great work!",
    actualHours: application.actualHours,
    totalPaid: application.totalPaid,
  });
});

// ── @PATCH /api/v1/applications/:id/withdraw — Worker withdraws ───────────────
exports.withdrawApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);
  if (!application) return next(new ErrorResponse("Application not found", 404));
  if (application.worker.toString() !== req.user.id) return next(new ErrorResponse("Not authorized", 403));
  if (["accepted", "completed"].includes(application.status)) {
    return next(new ErrorResponse("Cannot withdraw after acceptance", 400));
  }

  application.status = "withdrawn";
  await application.save();
  await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

  res.json({ success: true, message: "Application withdrawn" });
});
