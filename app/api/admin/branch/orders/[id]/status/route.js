// ============================================================
// CRAVEO - BRANCH ORDER MANAGEMENT API
//
// BRANCH ADMIN CAN UPDATE:
//
// 1. Order Status
// 2. Payment Status
//
// SECURITY:
// Order MUST belong to logged-in branch.
// ============================================================

import mongoose from "mongoose";

import {
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getBranchAdminSession,
} from "@/lib/auth";

import Order from "@/models/Order";

// ============================================================
// VALID ORDER STATUSES
// ============================================================

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out-for-delivery",
  "delivered",
  "cancelled",
];

// ============================================================
// VALID PAYMENT STATUSES
// ============================================================

const VALID_PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

// ============================================================
// PUT
// ============================================================

export async function PUT(
  request,
  {
    params,
  }
) {
  try {
    // ========================================================
    // BRANCH ADMIN SESSION
    // ========================================================

    const session =
      await getBranchAdminSession();

    if (
      !session ||
      !session.restaurantId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized Branch Admin.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // ORDER ID
    // ========================================================

    const {
      id,
    } = await params;

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

    // ========================================================
    // REQUEST BODY
    // ========================================================

    let body;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request data.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VALUES
    // ========================================================

    const status =
      body.status !==
      undefined
        ? String(
            body.status
          ).trim()
        : undefined;

    const paymentStatus =
      body.paymentStatus !==
      undefined
        ? String(
            body.paymentStatus
          ).trim()
        : undefined;

    // ========================================================
    // AT LEAST ONE FIELD REQUIRED
    // ========================================================

    if (
      status ===
        undefined &&
      paymentStatus ===
        undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No update data provided.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VALIDATE ORDER STATUS
    // ========================================================

    if (
      status !==
        undefined &&
      !VALID_STATUSES.includes(
        status
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

    // ========================================================
    // VALIDATE PAYMENT STATUS
    // ========================================================

    if (
      paymentStatus !==
        undefined &&
      !VALID_PAYMENT_STATUSES.includes(
        paymentStatus
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

    // ========================================================
    // DATABASE
    // ========================================================

    await connectDB();

    // ========================================================
    // SECURITY
    //
    // Order ID + logged-in branch restaurantId
    // dono match honay chahiye.
    //
    // Frontend se restaurantId trust nahi karna.
    // ========================================================

    const order =
      await Order.findOne({
        _id:
          id,

        restaurantId:
          session.restaurantId,
      });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order not found for your branch.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // TIME
    // ========================================================

    const now =
      new Date();

    // ========================================================
    // UPDATE ORDER STATUS
    // ========================================================

    if (
      status !==
      undefined
    ) {
      order.status =
        status;

      // ------------------------------------------------------
      // CONFIRMED
      // ------------------------------------------------------

      if (
        status ===
        "confirmed"
      ) {
        order.confirmedAt =
          now;
      }

      // ------------------------------------------------------
      // PREPARING
      // ------------------------------------------------------

      if (
        status ===
        "preparing"
      ) {
        order.preparingAt =
          now;
      }

      // ------------------------------------------------------
      // READY
      // ------------------------------------------------------

      if (
        status ===
        "ready"
      ) {
        order.readyAt =
          now;
      }

      // ------------------------------------------------------
      // OUT FOR DELIVERY
      // ------------------------------------------------------

      if (
        status ===
        "out-for-delivery"
      ) {
        order.outForDeliveryAt =
          now;
      }

      // ------------------------------------------------------
      // DELIVERED
      // ------------------------------------------------------

      if (
        status ===
        "delivered"
      ) {
        order.deliveredAt =
          now;
      }

      // ------------------------------------------------------
      // CANCELLED
      // ------------------------------------------------------

      if (
        status ===
        "cancelled"
      ) {
        order.cancelledAt =
          now;
      }
    }

    // ========================================================
    // UPDATE PAYMENT STATUS
    // ========================================================

    if (
      paymentStatus !==
      undefined
    ) {
      order.paymentStatus =
        paymentStatus;

      // ------------------------------------------------------
      // PAID TIME
      // ------------------------------------------------------

      if (
        paymentStatus ===
        "paid"
      ) {
        order.paymentPaidAt =
          order.paymentPaidAt ||
          now;
      }

      // ------------------------------------------------------
      // IF CHANGED BACK FROM PAID
      // ------------------------------------------------------

      if (
        paymentStatus !==
        "paid"
      ) {
        order.paymentPaidAt =
          null;
      }
    }

    // ========================================================
    // OPTIONAL:
    // COD ORDER DELIVERED -> AUTO PAID
    //
    // Agar tum nahi chahte ke delivered par auto paid ho,
    // to ye block remove kar sakte ho.
    //
    // Filhaal branch admin manual payment update kar sakta hai.
    // ========================================================

    if (
      status ===
        "delivered" &&
      (
        order.paymentMethod ===
          "cod" ||
        order.paymentMethod ===
          "cash_on_delivery"
      ) &&
      order.paymentStatus ===
        "pending"
    ) {
      // Manual control preserve karne ke liye
      // yahan auto-paid nahi kar rahe.
    }

    // ========================================================
    // SAVE
    // ========================================================

    await order.save();

    // ========================================================
    // RESPONSE MESSAGE
    // ========================================================

    let message =
      "Order updated successfully.";

    if (
      status !==
        undefined &&
      paymentStatus !==
        undefined
    ) {
      message =
        "Order and payment status updated successfully.";
    } else if (
      status !==
      undefined
    ) {
      message =
        "Order status updated successfully.";
    } else if (
      paymentStatus !==
      undefined
    ) {
      message =
        "Payment status updated successfully.";
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      message,

      order: {
        id:
          order._id.toString(),

        orderNumber:
          order.orderNumber,

        status:
          order.status,

        paymentStatus:
          order.paymentStatus,

        paymentPaidAt:
          order.paymentPaidAt ||
          null,
      },
    });
  } catch (error) {
    console.error(
      "BRANCH ORDER UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to update order.",
      },
      {
        status: 500,
      }
    );
  }
}