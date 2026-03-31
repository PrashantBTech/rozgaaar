const express      = require("express");
const router       = express.Router();
const { protect, authorize } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const Job          = require("../models/Job.model");
const Application  = require("../models/Application.model");
const User         = require("../models/User.model");
const ErrorResponse = require("../utils/errorResponse");

// ── OpenRouter config ─────────────────────────────────────────────────────────
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const FREE_MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-8b:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "google/gemma-3-27b-it:free",
];

// ── System prompt — role-aware ────────────────────────────────────────────────
const buildSystemPrompt = (user, city) => {
  const isWorker = user.role === "worker";

  const workerSection = `
== WORKER PROFILE ==
Name: ${user.name?.split(" ")[0] || "there"}
City: ${city}
Skills: ${user.skills?.join(", ") || "not specified"}
Rating: ${user.averageRating || "new worker"}
Jobs completed: ${user.totalJobsCompleted || 0}

== YOUR CAPABILITIES FOR THIS WORKER ==
You help workers find and apply for short-duration gigs.

Available tools:
1. search_jobs
   params: { category?, minPay?, maxPay?, isUrgent?, limit? }
   category options: cafe_staff, kitchen_help, event_crew, warehouse_loader,
   delivery, retail_assistant, data_entry, cleaning, security, photography, promoter, other

2. get_job_details
   params: { jobId }

3. apply_to_job
   params: { jobId, coverNote? }
   ONLY after explicit user confirmation (yes/apply/haan/sure/go ahead)

4. get_my_applications
   params: {}
   Shows worker their existing applications with status.

5. get_profile
   params: {}
   Shows worker their own profile, rating, earnings.

== CONVERSATION RULES FOR WORKER ==
- Ask what kind of work they want
- Ask ONE clarifying question at a time (category, pay, timing)
- Search real jobs using search_jobs
- Present each job as:
  ⚡ [Title] | ₹[pay]/hr | ⏱[duration]h | 📍[city]
  [one line description]
- NEVER apply without explicit confirmation
- If no jobs found, suggest different category or broader search`.trim();

  const businessSection = `
== BUSINESS PROFILE ==
Name: ${user.name?.split(" ")[0] || "there"}
Business: ${user.businessName || "your business"}
City: ${city}
Total Jobs Posted: ${user.totalJobsCompleted || 0}

== YOUR CAPABILITIES FOR THIS BUSINESS ==
You help businesses manage their gig postings and applicants.

Available tools:
1. get_my_gigs
   params: { status? }
   status options: open, completed, expired, cancelled, all
   Shows all gigs posted by this business with stats.

2. get_gig_applications
   params: { jobId, status? }
   status options: pending, shortlisted, accepted, rejected, completed, all
   Shows all applicants for a specific gig with their profiles.

3. get_gig_stats
   params: { jobId }
   Shows detailed stats: views, applications, slots filled, applicant ratings.

4. update_application
   params: { applicationId, status }
   status options: shortlisted, accepted, rejected
   Update an applicant's status.

5. get_business_summary
   params: {}
   Shows overall business stats: total gigs, total applications, completion rate.

6. search_workers
   params: { skills?, minRating?, city?, limit? }
   Find available workers matching criteria.

== CONVERSATION RULES FOR BUSINESS ==
- Greet and ask what they need help with
- For "show my gigs" → use get_my_gigs
- For "how many applications" → use get_gig_applications or get_gig_stats
- For "accept/reject worker" → use update_application
- Present gigs as:
  📋 [Title] | ₹[pay]/hr | 📅 [date] | 👥 [filled]/[total] slots | 📩 [X] applications
- Present applicants as:
  👤 [Name] | ★[rating] | [X] jobs done | Status: [status]
- Always confirm before updating any application status`.trim();

  return `
You are Gigi, an AI assistant for Gigly — a hyperlocal instant hiring platform in India.

${isWorker ? workerSection : businessSection}

== TOOL CALL FORMAT ==
When you need data, output ONLY this JSON (no other text):
{"tool": "TOOL_NAME", "params": {...}}

== GENERAL RULES ==
- Keep replies SHORT — max 4 lines
- Be friendly, use simple English, occasional Hindi is fine 😊
- NEVER make up data — always use tools to get real information
- Always end with a clear question or next step
`.trim();
};

// ── Tool executor ─────────────────────────────────────────────────────────────
const executeTool = async (toolName, params, userId, userRole) => {
  switch (toolName) {

    // ── WORKER TOOLS ──────────────────────────────────────────────────────────

    case "search_jobs": {
      const query = { status: "open" };
      if (params.category) query.category   = params.category;
      if (params.minPay)   query.payPerHour = { $gte: parseFloat(params.minPay) };
      if (params.maxPay)   query.payPerHour = { ...query.payPerHour, $lte: parseFloat(params.maxPay) };
      if (params.isUrgent) query.isUrgent   = true;

      const jobs = await Job.find(query)
        .populate("postedBy", "name businessName averageRating isIdVerified")
        .sort("-isUrgent -createdAt")
        .limit(params.limit || 5)
        .lean();

      if (!jobs.length) return { found: false, message: "No jobs found matching your criteria." };

      return {
        found: true,
        count: jobs.length,
        jobs: jobs.map(j => ({
          _id:          j._id,
          title:        j.title,
          category:     j.category,
          payPerHour:   j.payPerHour,
          totalPay:     j.payPerHour * j.durationHours,
          durationHours:j.durationHours,
          date:         j.date,
          startTime:    j.startTime,
          isUrgent:     j.isUrgent,
          slotsLeft:    j.slotsRequired - j.slotsFilled,
          location:     { address: j.location?.address, city: j.location?.city },
          description:  j.description?.slice(0, 120),
          business:     j.postedBy?.businessName || j.postedBy?.name,
          rating:       j.postedBy?.averageRating,
          isVerified:   j.postedBy?.isIdVerified,
        })),
      };
    }

    case "get_job_details": {
      const job = await Job.findById(params.jobId)
        .populate("postedBy", "name businessName averageRating totalJobsCompleted isIdVerified")
        .lean();
      if (!job) return { error: "Job not found" };
      return {
        _id:          job._id,
        title:        job.title,
        description:  job.description,
        category:     job.category,
        payPerHour:   job.payPerHour,
        totalPay:     job.payPerHour * job.durationHours,
        durationHours:job.durationHours,
        date:         job.date,
        startTime:    job.startTime,
        endTime:      job.endTime,
        isUrgent:     job.isUrgent,
        slotsLeft:    job.slotsRequired - job.slotsFilled,
        location:     job.location,
        requirements: job.requirements,
        skills:       job.skills,
        paymentMode:  job.paymentMode,
        business: {
          name:     job.postedBy?.businessName || job.postedBy?.name,
          rating:   job.postedBy?.averageRating,
          verified: job.postedBy?.isIdVerified,
        },
      };
    }

    case "apply_to_job": {
      const existing = await Application.findOne({ job: params.jobId, worker: userId });
      if (existing) return {
        error:   "already_applied",
        status:  existing.status,
        message: `You already applied. Current status: ${existing.status}`,
      };

      const job = await Job.findById(params.jobId);
      if (!job)                                 return { error: "Job not found" };
      if (job.status !== "open")                return { error: "Job is no longer accepting applications" };
      if (job.slotsFilled >= job.slotsRequired) return { error: "All slots are filled" };

      const application = await Application.create({
        job:              params.jobId,
        worker:           userId,
        business:         job.postedBy,
        coverNote:        params.coverNote || "Applied via Gigly AI Assistant — Gigi",
        agreedPayPerHour: job.payPerHour,
      });
      await Job.findByIdAndUpdate(params.jobId, { $inc: { applicationsCount: 1 } });

      return {
        success:       true,
        applicationId: application._id,
        jobTitle:      job.title,
        payPerHour:    job.payPerHour,
        totalPay:      job.payPerHour * job.durationHours,
        message:       `Successfully applied for "${job.title}"!`,
      };
    }

    case "get_my_applications": {
      const apps = await Application.find({ worker: userId })
        .populate("job", "title date startTime payPerHour status location")
        .populate("business", "name businessName")
        .sort("-createdAt")
        .limit(8)
        .lean();

      if (!apps.length) return { found: false, message: "No applications yet." };

      return {
        found: true,
        count: apps.length,
        applications: apps.map(a => ({
          _id:      a._id,
          jobTitle: a.job?.title,
          business: a.business?.businessName || a.business?.name,
          status:   a.status,
          pay:      a.job?.payPerHour,
          date:     a.job?.date,
          location: a.job?.location?.city,
        })),
      };
    }

    case "get_profile": {
      const user = await User.findById(userId)
        .select("name role skills averageRating totalJobsCompleted totalEarnings walletBalance location isIdVerified businessName")
        .lean();
      return {
        name:          user.name,
        role:          user.role,
        skills:        user.skills,
        rating:        user.averageRating,
        jobsCompleted: user.totalJobsCompleted,
        totalEarnings: user.totalEarnings,
        walletBalance: user.walletBalance,
        city:          user.location?.city,
        isVerified:    user.isIdVerified,
        businessName:  user.businessName,
      };
    }

    // ── BUSINESS TOOLS ────────────────────────────────────────────────────────

    case "get_my_gigs": {
      const query = { postedBy: userId };
      if (params.status && params.status !== "all") query.status = params.status;

      const jobs = await Job.find(query)
        .sort("-createdAt")
        .limit(10)
        .lean();

      if (!jobs.length) return { found: false, message: "No gigs posted yet." };

      return {
        found: true,
        count: jobs.length,
        gigs:  jobs.map(j => ({
          _id:          j._id,
          title:        j.title,
          status:       j.status,
          payPerHour:   j.payPerHour,
          durationHours:j.durationHours,
          date:         j.date,
          startTime:    j.startTime,
          isUrgent:     j.isUrgent,
          slotsRequired:j.slotsRequired,
          slotsFilled:  j.slotsFilled,
          applications: j.applicationsCount,
          views:        j.views,
          location:     j.location?.city,
        })),
      };
    }

    case "get_gig_applications": {
      // Verify the job belongs to this business
      const job = await Job.findOne({ _id: params.jobId, postedBy: userId }).lean();
      if (!job) return { error: "Gig not found or not authorized" };

      const filter = { job: params.jobId };
      if (params.status && params.status !== "all") filter.status = params.status;

      const apps = await Application.find(filter)
        .populate("worker", "name avatar skills averageRating totalJobsCompleted isIdVerified phone location")
        .sort("-createdAt")
        .lean();

      if (!apps.length) return { found: false, message: "No applications for this gig yet." };

      return {
        found:    true,
        jobTitle: job.title,
        count:    apps.length,
        applicants: apps.map(a => ({
          applicationId: a._id,
          workerId:      a.worker?._id,
          name:          a.worker?.name,
          skills:        a.worker?.skills,
          rating:        a.worker?.averageRating,
          jobsDone:      a.worker?.totalJobsCompleted,
          isVerified:    a.worker?.isIdVerified,
          city:          a.worker?.location?.city,
          status:        a.status,
          coverNote:     a.coverNote,
          appliedAt:     a.createdAt,
        })),
      };
    }

    case "get_gig_stats": {
      const job = await Job.findOne({ _id: params.jobId, postedBy: userId }).lean();
      if (!job) return { error: "Gig not found or not authorized" };

      const appStats = await Application.aggregate([
        { $match: { job: job._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const statusCounts = {};
      appStats.forEach(s => { statusCounts[s._id] = s.count; });

      return {
        jobId:        job._id,
        title:        job.title,
        status:       job.status,
        views:        job.views,
        totalApps:    job.applicationsCount,
        slotsFilled:  job.slotsFilled,
        slotsRequired:job.slotsRequired,
        payPerHour:   job.payPerHour,
        date:         job.date,
        byStatus: {
          pending:     statusCounts.pending     || 0,
          shortlisted: statusCounts.shortlisted || 0,
          accepted:    statusCounts.accepted    || 0,
          rejected:    statusCounts.rejected    || 0,
          completed:   statusCounts.completed   || 0,
        },
      };
    }

    case "update_application": {
      const app = await Application.findById(params.applicationId)
        .populate("job", "title slotsRequired slotsFilled postedBy");
      if (!app) return { error: "Application not found" };
      if (app.job?.postedBy?.toString() !== userId) return { error: "Not authorized" };

      const allowed = ["shortlisted", "accepted", "rejected"];
      if (!allowed.includes(params.status)) {
        return { error: `Status must be one of: ${allowed.join(", ")}` };
      }

      if (params.status === "accepted") {
        if (app.job.slotsFilled >= app.job.slotsRequired) {
          return { error: "All slots are already filled" };
        }
        await Job.findByIdAndUpdate(app.job._id, {
          $inc:      { slotsFilled: 1 },
          $addToSet: { hiredWorkers: app.worker },
        });
        app.acceptedAt = new Date();
      }

      app.status = params.status;
      if (params.status === "rejected") app.rejectedAt = new Date();
      await app.save();

      return {
        success:  true,
        message:  `Application ${params.status} successfully`,
        jobTitle: app.job?.title,
        status:   params.status,
      };
    }

    case "get_business_summary": {
      const [jobs, appStats] = await Promise.all([
        Job.find({ postedBy: userId }).lean(),
        Application.aggregate([
          { $match: { business: require("mongoose").Types.ObjectId.createFromHexString(userId) } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);

      const statusMap = {};
      appStats.forEach(s => { statusMap[s._id] = s.count; });

      const openJobs      = jobs.filter(j => j.status === "open").length;
      const completedJobs = jobs.filter(j => j.status === "completed").length;
      const totalViews    = jobs.reduce((s, j) => s + (j.views || 0), 0);
      const totalApps     = jobs.reduce((s, j) => s + (j.applicationsCount || 0), 0);

      return {
        totalGigs:      jobs.length,
        openGigs:       openJobs,
        completedGigs:  completedJobs,
        totalViews,
        totalApplications: totalApps,
        hired:          statusMap.accepted   || 0,
        completed:      statusMap.completed  || 0,
        pending:        statusMap.pending    || 0,
      };
    }

    case "search_workers": {
      const query = { role: "worker", isActive: true };
      if (params.skills)     query.skills          = { $in: params.skills };
      if (params.minRating)  query.averageRating    = { $gte: parseFloat(params.minRating) };
      if (params.city)       query["location.city"] = new RegExp(params.city, "i");

      const workers = await User.find(query)
        .select("name skills averageRating totalJobsCompleted isIdVerified location")
        .sort("-averageRating")
        .limit(params.limit || 5)
        .lean();

      if (!workers.length) return { found: false, message: "No workers found." };

      return {
        found: true,
        count: workers.length,
        workers: workers.map(w => ({
          _id:       w._id,
          name:      w.name,
          skills:    w.skills,
          rating:    w.averageRating,
          jobsDone:  w.totalJobsCompleted,
          verified:  w.isIdVerified,
          city:      w.location?.city,
        })),
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
};

// ── Call OpenRouter with auto-fallback ────────────────────────────────────────
const callOpenRouter = async (messages, systemPrompt) => {
  let lastError = null;

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer":  "https://gigly.app",
          "X-Title":       "Gigly AI Concierge",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens:  700,
        }),
      });

      if (response.status === 429 || response.status === 503 || response.status === 404) {
        const errText = await response.text();
        console.warn(`[Gigi] ${model} unavailable, trying next...`);
        lastError = new Error(`${model}: ${errText}`);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        lastError = new Error(`OpenRouter error ${response.status}: ${errText}`);
        continue;
      }

      const data    = await response.json();
      const content = data?.choices?.[0]?.message?.content || "";
      if (!content) { lastError = new Error(`Empty response from ${model}`); continue; }

      console.log(`[Gigi] Model used: ${model}`);
      return content.trim();

    } catch (err) {
      console.warn(`[Gigi] ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All AI models are currently unavailable.");
};

// ── Parse tool call from AI text ──────────────────────────────────────────────
const parseToolCall = (text) => {
  try {
    const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
    const match   = cleaned.match(/\{[\s\S]*"tool"[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.tool) return parsed;
    }
  } catch {}
  return null;
};

// ── POST /api/v1/ai/chat ──────────────────────────────────────────────────────
router.post(
  "/chat",
  protect,
  authorize("worker", "business", "admin"),
  asyncHandler(async (req, res, next) => {
    const { messages, userLocation } = req.body;
    if (!messages?.length) return next(new ErrorResponse("messages array is required", 400));
    if (!process.env.OPENROUTER_API_KEY) return next(new ErrorResponse("OPENROUTER_API_KEY not set in .env", 500));

    const userId   = req.user.id;
    const userCity = userLocation?.city || req.user.location?.city || "your area";

    const fullUser = await User.findById(userId)
      .select("name role skills averageRating totalJobsCompleted businessName")
      .lean();

    const systemPrompt = buildSystemPrompt(
      { ...fullUser, role: req.user.role },
      userCity
    );

    let currentMessages = [...messages];
    let toolResults     = [];
    let finalReply      = null;
    let loopCount       = 0;

    while (loopCount < 5) {
      loopCount++;

      const aiText  = await callOpenRouter(currentMessages, systemPrompt);
      const toolCall = parseToolCall(aiText);

      if (toolCall?.tool) {
        const result = await executeTool(toolCall.tool, toolCall.params || {}, userId, req.user.role);
        toolResults.push({ tool: toolCall.tool, params: toolCall.params, result });

        currentMessages = [
          ...currentMessages,
          { role: "assistant", content: aiText },
          {
            role:    "user",
            content: `[TOOL RESULT for ${toolCall.tool}]: ${JSON.stringify(result)}\n\nNow respond naturally to the user in plain text. Do NOT output JSON.`,
          },
        ];
        continue;
      }

      finalReply = aiText;
      break;
    }

    res.json({
      success:     true,
      reply:       finalReply || "Sorry, I could not process that. Please try again!",
      toolResults,
    });
  })
);

// ── POST /api/v1/ai/apply — Direct apply without AI ──────────────────────────
router.post(
  "/apply",
  protect,
  authorize("worker", "admin"),
  asyncHandler(async (req, res, next) => {
    const { jobId, coverNote } = req.body;
    if (!jobId) return next(new ErrorResponse("jobId is required", 400));

    const result = await executeTool("apply_to_job", { jobId, coverNote }, req.user.id, req.user.role);
    if (result.error) return next(new ErrorResponse(result.message || result.error, 400));

    res.json({ success: true, data: result });
  })
);

// ── GET /api/v1/ai/suggestions ────────────────────────────────────────────────
router.get(
  "/suggestions",
  protect,
  asyncHandler(async (req, res) => {
    const isWorker = req.user.role === "worker";

    const workerSuggestions = [
      "Find me urgent gigs nearby 🔴",
      "Show cafe or restaurant work ☕",
      "What pays the most today? 💰",
      "Find delivery work 🚚",
      "Show my applications 📋",
      "I need work this weekend 📅",
      "Find easy gigs, no experience needed",
      "Show event crew jobs 🎪",
    ];

    const businessSuggestions = [
      "Show all my posted gigs 📋",
      "How many applications do I have? 📩",
      "Show pending applicants for my gigs",
      "Which gig has the most views? 👁",
      "Give me a summary of my business 📊",
      "Find workers with barista skills ☕",
      "Show completed gigs ✅",
      "Which gig has the most applications?",
    ];

    res.json({
      success: true,
      data:    isWorker ? workerSuggestions : businessSuggestions,
    });
  })
);

module.exports = router;