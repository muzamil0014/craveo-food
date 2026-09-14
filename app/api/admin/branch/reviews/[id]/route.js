// ============================================================
// CRAVEO - BRANCH REVIEW API
// ============================================================

import mongoose from "mongoose";

import {
  NextResponse,
} from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getBranchAdminSession } from "@/lib/auth";

import Review from "@/models/Review";

// ============================================================
// PUT
// ============================================================

export async function PUT(
  request,
  { params }
) {
  try {
    const session =
      await getBranchAdminSession();

    if (!session) {
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

    const { id } =
      await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid review ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // ========================================================
    // OWN BRANCH ONLY
    // ========================================================

    const review =
      await Review.findOne({
        _id: id,

        restaurantId:
          session.restaurantId,
      });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Review not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await request.json();

    // ========================================================
    // APPROVAL
    // ========================================================

    if (
      typeof body.isApproved ===
      "boolean"
    ) {
      review.isApproved =
        body.isApproved;
    }

    // ========================================================
    // VISIBILITY
    // ========================================================

    if (
      typeof body.isVisible ===
      "boolean"
    ) {
      review.isVisible =
        body.isVisible;
    }

    await review.save();

    return NextResponse.json({
      success: true,

      message:
        "Review updated successfully.",

      review: {
        isApproved:
          review.isApproved,

        isVisible:
          review.isVisible,
      },
    });
  } catch (error) {
    console.error(
      "BRANCH REVIEW UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update review.",
      },
      {
        status: 500,
      }
    );
  }
}