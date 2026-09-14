// ============================================================
// CRAVEO - CUSTOMER ORDERS API
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import Order from "@/models/Order";

// ============================================================
// GET
// ============================================================

export async function GET(
  request
) {
  try {
    const session =
      await getCustomerSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const status =
      searchParams.get(
        "status"
      );

    const query = {
      userId:
        session.userId,
    };

    const allowedStatuses =
      [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out-for-delivery",
        "delivered",
        "cancelled",
      ];

    if (
      allowedStatuses.includes(
        status
      )
    ) {
      query.status =
        status;
    }

    const orders =
      await Order.find(
        query
      )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "CUSTOMER ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to load orders.",
      },
      {
        status: 500,
      }
    );
  }
}