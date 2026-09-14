// ============================================================
// CRAVEO - ADMIN REVIEWS API
//
// GET /api/admin/reviews
// ============================================================

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
// GET REVIEWS
// ============================================================

export async function GET(request) {
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

    await connectDB();

    // --------------------------------------------------------
    // REGISTER POPULATE MODELS
    // --------------------------------------------------------

    void User;
    void Food;
    void Restaurant;
    void Order;

    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status") ||
      "";

    const rating =
      searchParams.get("rating") ||
      "";

    // ========================================================
    // QUERY
    // ========================================================

    const query = {};

    if (status === "approved") {
      query.isApproved = true;
    }

    if (status === "pending") {
      query.isApproved = false;
    }

    if (status === "hidden") {
      query.isVisible = false;
    }

    if (
      rating &&
      ["1", "2", "3", "4", "5"].includes(
        rating
      )
    ) {
      query.rating =
        Number(rating);
    }

    // ========================================================
    // FETCH
    // ========================================================

    const reviews =
      await Review.find(query)
        .populate(
          "userId",
          "name email phone"
        )
        .populate(
          "foodId",
          "name image"
        )
        .populate(
          "restaurantId",
          "name city area"
        )
        .populate(
          "orderId",
          "orderNumber"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      count:
        reviews.length,
      reviews,
    });
  } catch (error) {
    console.error(
      "GET REVIEWS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load reviews.",
      },
      {
        status: 500,
      }
    );
  }
}