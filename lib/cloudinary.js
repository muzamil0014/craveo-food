// ============================================================
// CRAVEO - CLOUDINARY CONFIGURATION
// ============================================================

import { v2 as cloudinary } from "cloudinary";

// ============================================================
// VALIDATE ENVIRONMENT VARIABLES
// ============================================================

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME;

const apiKey =
  process.env.CLOUDINARY_API_KEY;

const apiSecret =
  process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    "⚠️ Cloudinary environment variables are incomplete."
  );
}

// ============================================================
// CLOUDINARY CONFIG
// ============================================================

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

// ============================================================
// EXPORT
// ============================================================

export default cloudinary;