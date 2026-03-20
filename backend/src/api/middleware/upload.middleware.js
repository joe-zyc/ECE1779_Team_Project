const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { AppError } = require("../../core/http/errors");
const { env } = require("../../config/env");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Ensure upload directory exists (important on fresh environments/containers)
fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, "INVALID_FILE_TYPE", "Only JPEG, PNG, and WebP images are allowed."));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

// Accepts up to 10 images per request under the field name "images"
const uploadListingImages = upload.array("images", 10);

module.exports = {
  uploadListingImages,
};
