// ============================================================
// CRAVEO - CLOUDINARY IMAGE HELPERS
// ============================================================

import cloudinary from "@/lib/cloudinary";

// ============================================================
// UPLOAD IMAGE
// ============================================================

export async function uploadImage(
  file,
  folder = "craveo"
) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Valid image file is required.");
  }

  // ----------------------------------------------------------
  // VALIDATE IMAGE TYPE
  // ----------------------------------------------------------

  if (
    !file.type ||
    !file.type.startsWith("image/")
  ) {
    throw new Error(
      "Only image files are allowed."
    );
  }

  // ----------------------------------------------------------
  // FILE SIZE - MAX 5MB
  // ----------------------------------------------------------

  const maxSize =
    5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(
      "Image must be smaller than 5MB."
    );
  }

  // ----------------------------------------------------------
  // CONVERT FILE TO BUFFER
  // ----------------------------------------------------------

  const bytes =
    await file.arrayBuffer();

  const buffer =
    Buffer.from(bytes);

  // ----------------------------------------------------------
  // CLOUDINARY UPLOAD
  // ----------------------------------------------------------

  const result =
    await new Promise(
      (resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: "image",

              transformation: [
                {
                  quality: "auto",
                  fetch_format: "auto",
                },
              ],
            },
            (error, uploadResult) => {
              if (error) {
                reject(error);
                return;
              }

              resolve(uploadResult);
            }
          );

        stream.end(buffer);
      }
    );

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

// ============================================================
// DELETE IMAGE
// ============================================================

export async function deleteImage(
  publicId
) {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(
      publicId
    );
  } catch (error) {
    console.error(
      "CLOUDINARY DELETE ERROR:",
      error
    );
  }
}