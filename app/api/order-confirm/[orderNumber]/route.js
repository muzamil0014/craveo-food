// ============================================================
// CRAVEO - CUSTOMER PARCEL CONFIRMATION API
//
// Public QR endpoint.
//
// Security:
// Order number alone is NOT enough.
// Secure QR token must also match.
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import Order from "@/models/Order";

// ============================================================
// POST
// ============================================================

export async function POST(
  request,
  {
    params,
  }
) {
  try {
    // ========================================================
    // ORDER NUMBER
    // ========================================================

    const {
      orderNumber,
    } = await params;

    const cleanOrderNumber =
      String(
        orderNumber ||
          ""
      ).trim();

    if (
      !cleanOrderNumber
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Order number is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // BODY
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
            "Invalid request.",
        },
        {
          status: 400,
        }
      );
    }

    const token =
      String(
        body.token ||
          ""
      ).trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Confirmation token is required.",
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
    // FIND EXACT ORDER + TOKEN
    // ========================================================

    const order =
      await Order.findOne({
        orderNumber:
          cleanOrderNumber,

        customerConfirmationToken:
          token,
      });

    if (!order) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid or expired confirmation link.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // CANCELLED ORDER
    // ========================================================

    if (
      order.status ===
      "cancelled"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Cancelled order cannot be confirmed.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // ALREADY CONFIRMED
    // ========================================================

    if (
      order.customerConfirmed
    ) {
      return NextResponse.json({
        success: true,

        message:
          "This parcel has already been confirmed.",
      });
    }

    // ========================================================
    // CUSTOMER CONFIRMATION
    // ========================================================

    const now =
      new Date();

    order.customerConfirmed =
      true;

    order.customerConfirmedAt =
      now;

    // ========================================================
    // RECEIVED PARCEL = DELIVERED
    //
    // Customer can only scan this QR from the parcel.
    // After confirmation, delivery status becomes delivered.
    // ========================================================

    order.status =
      "delivered";

    order.deliveredAt =
      order.deliveredAt ||
      now;

    // ========================================================
    // COD PAYMENT
    //
    // Parcel receipt confirmation means COD cash has normally
    // been collected. Therefore mark COD payment as paid.
    // ========================================================

    if (
      order.paymentMethod ===
        "cod" &&
      order.paymentStatus ===
        "pending"
    ) {
      order.paymentStatus =
        "paid";

      order.paymentPaidAt =
        now;
    }

    // ========================================================
    // SAVE
    // ========================================================

    await order.save();

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        "Thank you. Your parcel has been confirmed successfully.",

      order: {
        orderNumber:
          order.orderNumber,

        status:
          order.status,

        paymentStatus:
          order.paymentStatus,

        customerConfirmed:
          order.customerConfirmed,
      },
    });
  } catch (error) {
    console.error(
      "CUSTOMER ORDER CONFIRM ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to confirm parcel.",
      },
      {
        status: 500,
      }
    );
  }
}