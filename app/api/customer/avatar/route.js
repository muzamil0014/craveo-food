// ============================================================
// CRAVEO - CUSTOMER AVATAR UPLOAD API
// ============================================================

import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

// ============================================================
// NODE RUNTIME
// ============================================================

export const runtime = "nodejs";

// ============================================================
// POST
// ============================================================

export async function POST(request) {
  try {
    // ========================================================
    // CUSTOMER SESSION
    // ========================================================

    const session =
      await getCustomerSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
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
      formData.get("file");

    if (
      !file ||
      typeof file === "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select an image.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // IMAGE TYPE
    // ========================================================

    if (
      !file.type?.startsWith(
        "image/"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // MAX 5MB
    // ========================================================

    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size >
      maxSize
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be less than 5MB.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // BUFFER
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

    const result =
      await new Promise(
        (
          resolve,
          reject
        ) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "craveo/customers/avatars",

                resource_type:
                  "image",

                transformation: [
                  {
                    width: 500,
                    height: 500,
                    crop: "fill",
                    gravity: "face",
                  },
                ],
              },
              (
                error,
                uploadResult
              ) => {
                if (error) {
                  reject(error);
                  return;
                }

                resolve(
                  uploadResult
                );
              }
            );

          stream.end(
            buffer
          );
        }
      );

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      image: {
        url:
          result.secure_url,

        publicId:
          result.public_id,
      },
    });
  } catch (error) {
    console.error(
      "CUSTOMER AVATAR UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to upload profile image.",
      },
      {
        status: 500,
      }
    );
  }
}