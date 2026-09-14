// ============================================================
// CRAVEO - ADMIN ORDERS API
//
// GET /api/admin/orders
// ============================================================

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";

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
// ESCAPE REGEX
// ============================================================

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

// ============================================================
// GET ORDERS
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

    // Register models for populate.
    void Restaurant;
    void User;

    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status") ||
      "";

    const paymentStatus =
      searchParams.get(
        "paymentStatus"
      ) || "";

    const branchId =
      searchParams.get(
        "branchId"
      ) || "";

    const search =
      searchParams
        .get("search")
        ?.trim() || "";

    // ========================================================
    // QUERY
    // ========================================================

    const query = {};

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus =
        paymentStatus;
    }

    if (branchId) {
      query.restaurantId =
        branchId;
    }

    if (search) {
      const regex =
        new RegExp(
          escapeRegex(search),
          "i"
        );

      query.$or = [
        {
          orderNumber: regex,
        },

        {
          customerName: regex,
        },

        {
          customerEmail: regex,
        },

        {
          customerPhone: regex,
        },
      ];
    }

    // ========================================================
    // FETCH
    // ========================================================

    const orders =
      await Order.find(query)
        .populate(
          "restaurantId",
          "name city area branchType"
        )
        .populate(
          "userId",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      count:
        orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "GET ADMIN ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load orders.",
      },
      {
        status: 500,
      }
    );
  }
}