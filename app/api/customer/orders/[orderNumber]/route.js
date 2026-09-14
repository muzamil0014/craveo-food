// ============================================================
// CRAVEO - CUSTOMER CANCEL ORDER API
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  revalidatePath,
} from "next/cache";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import Order from "@/models/Order";
import Food from "@/models/Food";

// ============================================================
// POST
// ============================================================

export async function POST(
  request,
  { params }
) {
  try {
    // ========================================================
    // SESSION
    // ========================================================

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

    const resolvedParams =
      await params;

    const orderNumber =
      resolvedParams
        ?.orderNumber
        ?.toString();

    await connectDB();

    // ========================================================
    // ORDER OWNERSHIP
    // ========================================================

    const order =
      await Order.findOne({
        orderNumber,

        userId:
          session.userId,
      });

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

    // ========================================================
    // ALREADY CANCELLED
    // ========================================================

    if (
      order.status ===
      "cancelled"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order is already cancelled.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // DELIVERED
    // ========================================================

    if (
      order.status ===
      "delivered"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivered orders cannot be cancelled.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // ALLOWED STATUSES
    // ========================================================

    const cancellableStatuses =
      [
        "pending",
        "confirmed",
      ];

    if (
      !cancellableStatuses.includes(
        order.status
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This order is already being prepared and can no longer be cancelled.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // RESTORE STOCK
    //
    // Checkout par stock already decrease hota hai,
    // isliye cancellation par wapas add karna zaroori hai.
    // ========================================================

    for (
      const item of
      order.items
    ) {
      const quantity =
        Number(
          item.quantity ||
            0
        );

      if (quantity <= 0) {
        continue;
      }

      await Food.findByIdAndUpdate(
        item.foodId,
        {
          $inc: {
            stock:
              quantity,
          },

          $set: {
            isAvailable:
              true,
          },
        }
      );
    }

    // ========================================================
    // CANCEL
    // ========================================================

    order.status =
      "cancelled";

    order.cancelledAt =
      new Date();

    // ========================================================
    // PAYMENT
    // ========================================================

    if (
      order.paymentStatus ===
      "paid"
    ) {
      order.paymentStatus =
        "refunded";
    }

    await order.save();

    // ========================================================
    // REVALIDATE
    // ========================================================

    revalidatePath(
      "/account"
    );

    revalidatePath(
      "/account/orders"
    );

    revalidatePath(
      `/account/orders/${order.orderNumber}`
    );

    revalidatePath(
      "/foods"
    );

    revalidatePath(
      "/admin/dashboard/orders"
    );

    revalidatePath(
      "/admin/branch-dashboard/orders"
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        "Order cancelled successfully.",
    });
  } catch (error) {
    console.error(
      "CUSTOMER CANCEL ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to cancel order.",
      },
      {
        status: 500,
      }
    );
  }
}