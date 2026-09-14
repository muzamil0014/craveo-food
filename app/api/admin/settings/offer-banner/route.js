// ============================================================
// CRAVEO - OFFER BANNER SETTINGS API
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getAdminSession,
} from "@/lib/auth";

import Settings from "@/models/Settings";

// ============================================================
// PUT
// ============================================================

export async function PUT(
  request
) {
  try {
    // ========================================================
    // AUTH
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
    // BODY
    // ========================================================

    const body =
      await request.json();

    const offerBannerImage =
      body.offerBannerImage
        ?.toString()
        .trim();

    if (!offerBannerImage) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Offer banner image is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // DATABASE
    // ========================================================

    await connectDB();

    const settings =
      await Settings.findOneAndUpdate(
        {
          key: "main",
        },
        {
          $set: {
            offerBannerImage,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      ).lean();

    return NextResponse.json({
      success: true,

      message:
        "Offer banner image updated.",

      offerBannerImage:
        settings.offerBannerImage,
    });
  } catch (error) {
    console.error(
      "OFFER BANNER SETTINGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update offer banner.",
      },
      {
        status: 500,
      }
    );
  }
}