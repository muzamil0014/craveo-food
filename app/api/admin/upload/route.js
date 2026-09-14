// ============================================================
// CRAVEO - ADMIN CLOUDINARY UPLOAD API
// ============================================================

import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";

import {
  getAdminSession,
} from "@/lib/auth";

// ============================================================
// RUNTIME
// ============================================================

export const runtime =
  "nodejs";

// ============================================================
// POST - UPLOAD IMAGE TO CLOUDINARY
// ============================================================

export async function POST(
  request
) {
  try {
    // ========================================================
    // AUTHENTICATION
    // ========================================================

    const session =
      await getAdminSession();

    if (
      !session ||
      session.role !==
        "super-admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // FORM DATA
    // ========================================================

    const formData =
      await request.formData();

    const file =
      formData.get(
        "file"
      );

    const requestedFolder =
      formData.get(
        "folder"
      );

    // ========================================================
    // VALIDATE FILE
    // ========================================================

    if (
      !file ||
      typeof file ===
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image file is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // FILE TYPE
    // ========================================================

    if (
      !file.type ||
      !file.type.startsWith(
        "image/"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only image files are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // MAX SIZE - 5 MB
    // ========================================================

    const maxSize =
      5 *
      1024 *
      1024;

    if (
      file.size >
      maxSize
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image must be smaller than 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // ALLOWED CLOUDINARY FOLDERS
    // ========================================================

    const allowedFolders = [
      "craveo/settings",
      "craveo/branches",
      "craveo/categories",
      "craveo/foods",
    ];

    const folder =
      allowedFolders.includes(
        requestedFolder
      )
        ? requestedFolder
        : "craveo/settings";

    // ========================================================
    // FILE -> BUFFER
    // ========================================================

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(
        arrayBuffer
      );

    // ========================================================
    // CLOUDINARY UPLOAD
    // ========================================================

    const uploadResult =
      await new Promise(
        (
          resolve,
          reject
        ) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder,
                resource_type:
                  "image",
              },

              (
                error,
                result
              ) => {
                if (error) {
                  reject(
                    error
                  );

                  return;
                }

                resolve(
                  result
                );
              }
            );

          uploadStream.end(
            buffer
          );
        }
      );

    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        "Image uploaded successfully.",

      url:
        uploadResult.secure_url,

      publicId:
        uploadResult.public_id,
    });
  } catch (error) {
    console.error(
      "CLOUDINARY UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Image upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}