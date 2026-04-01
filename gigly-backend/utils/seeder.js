require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Job = require("../models/Job.model");
const { connectDB } = require("../config/db");

const seed = async () => {
  await connectDB();
  console.log("🌱 Seeding database...");

  // ── Clear existing ─────────────────────────────────────────────────────────
  await User.deleteMany();
  await Job.deleteMany();

  // ── Admin ──────────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: "Rozgaaar Admin",
    email: "admin@rozgaaar.app",
    password: "Admin@1234",
    role: "admin",
    isEmailVerified: true,
    isIdVerified: true,
  });

  // ── Businesses ─────────────────────────────────────────────────────────────
  const businesses = await User.insertMany([
    {
      name: "Rohan Mehta",
      email: "prashant@gmail.com",
      password: await bcrypt.hash("987654321", 12),
      role: "business",
      businessName: "Brew & Grind Café",
      businessCategory: "cafe",
      isEmailVerified: true,
      isIdVerified: true,
      averageRating: 4.5,
      location: {
        type: "Point",
        coordinates: [77.2090, 28.6139], // New Delhi
        address: "Connaught Place, New Delhi",
        city: "New Delhi",
        pincode: "110001",
      },
    },
    {
      name: "Rohan Mehta",
      email: "prashant@gmail.com",
      password: await bcrypt.hash("987654321", 12),
      role: "business",
      businessName: "EventPro India",
      businessCategory: "event",
      isEmailVerified: true,
      isIdVerified: true,
      averageRating: 4.8,
      location: {
        type: "Point",
        coordinates: [72.8777, 19.0760], // Mumbai
        address: "Bandra West, Mumbai",
        city: "Mumbai",
        pincode: "400050",
      },
    },
  ]);

  // ── Workers ────────────────────────────────────────────────────────────────
  // const workers = await User.insertMany([
  //   {
  //     name: "Arjun Singh",
  //     email: "arjun@worker.com",
  //     password: await bcrypt.hash("Worker@123", 12),
  //     role: "worker",
  //     skills: ["barista", "customer service", "cashier"],
  //     isEmailVerified: true,
  //     isIdVerified: true,
  //     averageRating: 4.7,
  //     totalJobsCompleted: 12,
  //     location: {
  //       type: "Point",
  //       coordinates: [77.2150, 28.6200],
  //       address: "Karol Bagh, New Delhi",
  //       city: "New Delhi",
  //     },
  //   },
  //   {
  //     name: "Sneha Patel",
  //     email: "sneha@worker.com",
  //     password: await bcrypt.hash("Worker@123", 12),
  //     role: "worker",
  //     skills: ["event crew", "decoration", "hosting"],
  //     isEmailVerified: true,
  //     isIdVerified: true,
  //     averageRating: 4.9,
  //     totalJobsCompleted: 27,
  //     location: {
  //       type: "Point",
  //       coordinates: [72.8850, 19.0800],
  //       address: "Andheri, Mumbai",
  //       city: "Mumbai",
  //     },
  //   },
  //   {
  //     name: "Rahul Kumar",
  //     email: "rahul@worker.com",
  //     password: await bcrypt.hash("Worker@123", 12),
  //     role: "worker",
  //     skills: ["warehouse", "loading", "forklift"],
  //     isEmailVerified: true,
  //     totalJobsCompleted: 5,
  //     location: {
  //       type: "Point",
  //       coordinates: [77.1025, 28.7041],
  //       address: "Rohini, New Delhi",
  //       city: "New Delhi",
  //     },
  //   },
  // ]);

  // ── Jobs ───────────────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await Job.insertMany([
    {
      title: "Barista needed for morning rush",
      description: "Experienced barista required for busy morning shift at our café in CP. Must know espresso-based drinks and latte art basics.",
      category: "cafe_staff",
      skills: ["barista", "coffee"],
      postedBy: businesses[0]._id,
      date: tomorrow,
      startTime: "07:00",
      endTime: "12:00",
      durationHours: 5,
      payPerHour: 180,
      totalPay: 900,
      slotsRequired: 2,
      isUrgent: true,
      status: "open",
      location: {
        type: "Point",
        coordinates: [77.2090, 28.6139],
        address: "Connaught Place, New Delhi",
        landmark: "Near Regal Cinema",
        city: "New Delhi",
        pincode: "110001",
      },
    },
    {
      title: "Event crew for corporate gala",
      description: "Looking for 5 enthusiastic crew members for a corporate gala dinner. Duties include setup, guest welcome, and teardown.",
      category: "event_crew",
      skills: ["event crew", "hospitality"],
      postedBy: businesses[1]._id,
      date: tomorrow,
      startTime: "16:00",
      endTime: "23:00",
      durationHours: 7,
      payPerHour: 200,
      totalPay: 1400,
      slotsRequired: 5,
      isUrgent: false,
      status: "open",
      location: {
        type: "Point",
        coordinates: [72.8777, 19.0760],
        address: "Bandra Kurla Complex, Mumbai",
        city: "Mumbai",
        pincode: "400051",
      },
    },
    {
      title: "Warehouse loader — same day",
      description: "Immediate requirement: 3 loaders for unloading a truck at our warehouse. No experience needed, just physical fitness.",
      category: "warehouse_loader",
      skills: ["loading", "physical work"],
      postedBy: businesses[0]._id,
      date: new Date(),
      startTime: "14:00",
      endTime: "18:00",
      durationHours: 4,
      payPerHour: 150,
      totalPay: 600,
      slotsRequired: 3,
      isUrgent: true,
      status: "open",
      location: {
        type: "Point",
        coordinates: [77.1500, 28.6500],
        address: "Okhla Industrial Area, New Delhi",
        city: "New Delhi",
        pincode: "110020",
      },
    },
  ]);

  console.log(`
✅ Seed complete!

👤 Admin:    admin@rozgaaar.app     / Admin@1234
🏪 Business: prashant@gmail.com     / 987654321
🏪 Business: aarif@gmail.com     / 123456789
👷 Worker: mr.prashant.cse@gmail.com / 123456789
📚 API Docs: http://localhost:5000/api/docs
  `);

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
