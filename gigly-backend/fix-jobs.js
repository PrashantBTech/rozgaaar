// fix-jobs.js
const mongoose = require("mongoose");
const Job = require("./models/Job.model");
const Application = require("./models/Application.model");
const dotenv = require("dotenv");

dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const fixJobs = async () => {
  try {
    const jobs = await Job.find({ status: "open" });
    for (const job of jobs) {
      const completedApps = await Application.countDocuments({
        job: job._id,
        status: "completed",
      });
      // If there are any completed apps OR slots are totally filled (but we'll check completed apps)
      if (completedApps > 0) {
        job.status = "completed";
        await job.save();
        console.log(`Updated job ${job._id} to completed`);
      }
    }
    console.log("Done fixing jobs!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixJobs();
