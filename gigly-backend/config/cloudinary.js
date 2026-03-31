const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Avatar / Profile Photo Storage ───────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gigly/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});

// ── Document / ID Verification Storage ───────────────────────────────────────
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gigly/documents",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});

// ── Job Media Storage ─────────────────────────────────────────────────────────
const jobMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gigly/jobs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, quality: "auto" }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (JPG, PNG, WEBP) and PDFs are allowed"), false);
  }
};

module.exports = {
  uploadAvatar: multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }),
  uploadDocument: multer({ storage: documentStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter }),
  uploadJobMedia: multer({ storage: jobMediaStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }),
  cloudinary,
};
