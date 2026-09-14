// ============================================================
// CRAVEO - SINGLE REVIEW API
//
// GET    /api/admin/reviews/[id]
// PUT    /api/admin/reviews/[id]
// DELETE /api/admin/reviews/[id]
// ============================================================

import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import Review from "@/models/Review";
import User from "@/models/User";
import Food from "@/models/Food";
import Restaurant from "@/models/Restaurant";
import Order from "@/models/Order";

// ============================================================
// AUTH
// ============================================================

async function requireSuperAdmin() {
  const session =
    await getAdminSession();

  if (
    !session ||
    session.role !== "super-admin"
  ) {
    return null;
  }

  return session;
}

// ============================================================
// VALID ID
// ============================================================

function validId(id) {
  return mongoose.Types.ObjectId.isValid(
    id
  );
}

// ============================================================
// GET REVIEW
// ============================================================

export async function GET(
  request,
  { params }
) {
  try {
    const session =
      await requireSuperAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await params;

    if (!validId(id)) {
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

    void User;
    void Food;
    void Restaurant;
    void Order;

    const review =
      await Review.findById(id)
        .populate(
          "userId",
          "name email phone"
        )
        .populate(
          "foodId",
          "name image price"
        )
        .populate(
          "restaurantId",
          "name city area address"
        )
        .populate(
          "orderId",
          "orderNumber"
        )
        .lean();

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

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(
      "GET REVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load review.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// UPDATE REVIEW
// ============================================================

export async function PUT(
  request,
  { params }
) {
  try {
    const session =
      await requireSuperAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await params;

    if (!validId(id)) {
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

    const review =
      await Review.findById(id);

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

    // ========================================================
    // ADMIN REPLY
    // ========================================================

    if (
      typeof body.adminReply ===
      "string"
    ) {
      review.adminReply =
        body.adminReply.trim();
    }

    await review.save();

    return NextResponse.json({
      success: true,

      message:
        "Review updated successfully.",

      review: {
        id:
          review._id.toString(),

        isApproved:
          review.isApproved,

        isVisible:
          review.isVisible,

        adminReply:
          review.adminReply,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE REVIEW ERROR:",
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

// ============================================================
// DELETE REVIEW
// ============================================================

export async function DELETE(
  request,
  { params }
) {
  try {
    const session =
      await requireSuperAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await params;

    if (!validId(id)) {
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

    const review =
      await Review.findById(id);

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

    await review.deleteOne();

    return NextResponse.json({
      success: true,

      message:
        "Review deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE REVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to delete review.",
      },
      {
        status: 500,
      }
    );
  }
}