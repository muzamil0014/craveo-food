// ============================================================
// CRAVEO - SINGLE ADMIN ORDER API
//
// GET /api/admin/orders/[id]
// PUT /api/admin/orders/[id]
// ============================================================

import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Food from "@/models/Food";

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
// VALID VALUES
// ============================================================

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out-for-delivery",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

// ============================================================
// STATUS TIMESTAMP
// ============================================================

function applyStatusTimestamp(
  order,
  status
) {
  const now = new Date();

  if (
    status === "confirmed"
  ) {
    order.confirmedAt =
      now;
  }

  if (
    status === "preparing"
  ) {
    order.preparingAt =
      now;
  }

  if (
    status === "ready"
  ) {
    order.readyAt =
      now;
  }

  if (
    status ===
    "out-for-delivery"
  ) {
    order.outForDeliveryAt =
      now;
  }

  if (
    status === "delivered"
  ) {
    order.deliveredAt =
      now;
  }

  if (
    status === "cancelled"
  ) {
    order.cancelledAt =
      now;
  }
}

// ============================================================
// GET ORDER
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

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid order ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    void Restaurant;
    void User;
    void Food;

    const order =
      await Order.findById(id)
        .populate(
          "restaurantId",
          "name city area address phone branchType"
        )
        .populate(
          "userId",
          "name email phone"
        )
        .populate(
          "items.foodId",
          "name image price"
        )
        .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "GET ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load order.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// UPDATE ORDER
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

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid order ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const order =
      await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await request.json();

    // ========================================================
    // ORDER STATUS
    // ========================================================

    if (
      body.status !== undefined
    ) {
      if (
        !ORDER_STATUSES.includes(
          body.status
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Invalid order status.",
          },
          {
            status: 400,
          }
        );
      }

      order.status =
        body.status;

      applyStatusTimestamp(
        order,
        body.status
      );
    }

    // ========================================================
    // PAYMENT STATUS
    // ========================================================

    if (
      body.paymentStatus !==
      undefined
    ) {
      if (
        !PAYMENT_STATUSES.includes(
          body.paymentStatus
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Invalid payment status.",
          },
          {
            status: 400,
          }
        );
      }

      order.paymentStatus =
        body.paymentStatus;
    }

    // ========================================================
    // SAVE
    // ========================================================

    await order.save();

    return NextResponse.json({
      success: true,

      message:
        "Order updated successfully.",

      order: {
        id:
          order._id.toString(),

        status:
          order.status,

        paymentStatus:
          order.paymentStatus,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update order.",
      },
      {
        status: 500,
      }
    );
  }
}