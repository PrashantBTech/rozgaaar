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
      name: "Rapid Delivery Solutions",
      email: "rapid@rozgaaar.app",
      password: await bcrypt.hash("123456789", 12),
      role: "business",
      businessName: "Rapid Delivery Solutions",
      businessCategory: "other",
      isEmailVerified: true,
      isIdVerified: true,
      averageRating: 4.9,
      location: {
        type: "Point",
        coordinates: [72.8777, 19.0760], // Mumbai
        address: "Bandra West, Mumbai",
        city: "Mumbai",
        pincode: "400050",
      },
    },
    {
      name: "DigitX Services Pvt Ltd",
      email: "digitx@rozgaaar.app",
      password: await bcrypt.hash("123456789", 12),
      role: "business",
      businessName: "DigitX Services Pvt Ltd",
      businessCategory: "office",
      isEmailVerified: true,
      isIdVerified: true,
      averageRating: 4.7,
      location: {
        type: "Point",
        coordinates: [77.2090, 28.6139], // Delhi
        address: "Connaught Place, New Delhi",
        city: "New Delhi",
        pincode: "110001",
      },
    },
    {
      name: "Elite Lifestyle Retail",
      email: "elite@rozgaaar.app",
      password: await bcrypt.hash("123456789", 12),
      role: "business",
      businessName: "Elite Lifestyle Retail",
      businessCategory: "retail",
      isEmailVerified: true,
      isIdVerified: true,
      averageRating: 4.8,
      location: {
        type: "Point",
        coordinates: [77.6412, 12.9116], // Bangalore HSR
        address: "HSR Layout, Bangalore",
        city: "Bangalore",
        pincode: "560102",
      },
    },
  ]);

  // ── Workers ────────────────────────────────────────────────────────────────
  const workers = await User.insertMany([
    {
      name: "Prashant Kumar",
      email: "mr.prashant.cse@gmail.com",
      password: await bcrypt.hash("123456789", 12),
      role: "worker",
      skills: ["data entry", "delivery", "retail"],
      isEmailVerified: true,
      isIdVerified: true,
      averageRating: 4.8,
      totalJobsCompleted: 5,
      location: {
        type: "Point",
        coordinates: [72.8777, 19.0760],
        address: "Bandra West, Mumbai",
        city: "Mumbai",
      },
    },
    {
      name: "Arjun Singh",
      email: "arjun@worker.com",
      password: await bcrypt.hash("Worker@123", 12),
      role: "worker",
      skills: ["barista", "customer service", "cashier"],
      isEmailVerified: true,
      isIdVerified: true,
      averageRating: 4.7,
      totalJobsCompleted: 12,
      location: {
        type: "Point",
        coordinates: [77.2150, 28.6200],
        address: "Karol Bagh, New Delhi",
        city: "New Delhi",
      },
    },
  ]);

  // ── Jobs ───────────────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await Job.insertMany([
    {
      title: "Delivery Partner | EV Fleet",
      description: "Join our EV fleet as a delivery partner. Deliver orders across the region with high incentives per delivery. Flexible shifts, fuel allowance, and insurance covered. Immediate joining required.",
      category: "delivery",
      skills: ["delivery", "driving"],
      postedBy: businesses[0]._id,
      date: tomorrow,
      startTime: "09:00",
      endTime: "17:00",
      durationHours: 8,
      payPerHour: 180,
      totalPay: 1440,
      slotsRequired: 5,
      isUrgent: true,
      status: "open",
      location: {
        type: "Point",
        coordinates: [72.8777, 19.0760],
        address: "Mumbai Metro Region",
        landmark: "Metro Station",
        city: "Mumbai",
        pincode: "400050",
      },
    },
    {
      title: "Data Entry Specialist",
      description: "Looking for a detail-oriented Data Entry Specialist to manage spreadsheet entries, customer logs, and documentation. This is a fully remote / work from home opportunity with flexible hours and weekly reports.",
      category: "data_entry",
      skills: ["data entry", "excel", "typing"],
      postedBy: businesses[1]._id,
      date: tomorrow,
      startTime: "10:00",
      endTime: "18:00",
      durationHours: 8,
      employmentType: "full_time",
      payPerHour: 22000, // Monthly salary stored in payPerHour for full_time
      totalPay: 22000,
      slotsRequired: 2,
      isUrgent: false,
      status: "open",
      location: {
        type: "Point",
        coordinates: [77.2090, 28.6139],
        address: "Remote / Work from Home",
        city: "Remote",
        pincode: "110001",
      },
    },
    {
      title: "Store Assistant (Retail)",
      description: "Assist with inventory management, product display, billing, and helping customers find products at our premium lifestyle store. Good communication skills are preferred.",
      category: "retail_assistant",
      skills: ["customer service", "retail", "billing"],
      postedBy: businesses[2]._id,
      date: tomorrow,
      startTime: "11:00",
      endTime: "19:00",
      durationHours: 8,
      payPerHour: 140,
      totalPay: 1120,
      slotsRequired: 3,
      isUrgent: false,
      status: "open",
      location: {
        type: "Point",
        coordinates: [77.6412, 12.9116],
        address: "HSR Layout, Bangalore",
        city: "Bangalore",
        pincode: "560102",
      },
    },
  ]);

  console.log(`
  ✅ Seed complete!
  
  👤 Admin:    admin@rozgaaar.app          / Admin@1234
  🏪 Business: rapid@rozgaaar.app         / 123456789 (Rapid Delivery)
  🏪 Business: digitx@rozgaaar.app        / 123456789 (DigitX Services)
  🏪 Business: elite@rozgaaar.app         / 123456789 (Elite Retail)
  👷 Worker: mr.prashant.cse@gmail.com    / 123456789
  👷 Worker: arjun@worker.com             / Worker@123
  📚 API Docs: http://localhost:5000/api/docs
  `);

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
