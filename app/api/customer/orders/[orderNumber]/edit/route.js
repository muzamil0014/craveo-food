// ============================================================
// CRAVEO - EDIT EXISTING CUSTOMER ORDER API
// SAME ORDER UPDATE
// STOCK DELTA MANAGEMENT
// ============================================================

import mongoose from "mongoose";

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

import User from "@/models/User";
import Order from "@/models/Order";
import Food from "@/models/Food";

// ============================================================
// PUT
// ============================================================

export async function PUT(
  request,
  { params }
) {
  let databaseSession = null;

  try {
    // ========================================================
    // CUSTOMER SESSION
    // ========================================================

    const customerSession =
      await getCustomerSession();

    if (
      !customerSession?.userId
    ) {
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

    // ========================================================
    // PARAMS
    // ========================================================

    const resolvedParams =
      await params;

    const orderNumber =
      resolvedParams
        ?.orderNumber
        ?.toString()
        .trim();

    if (!orderNumber) {
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

    const body =
      await request.json();

    const requestedItems =
      Array.isArray(
        body.items
      )
        ? body.items
        : [];

    if (
      requestedItems.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Order items are required.",
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
    // CUSTOMER
    // ========================================================

    const user =
      await User.findOne({
        _id:
          customerSession.userId,

        role:
          "customer",

        isActive:
          true,
      })
        .select("_id")
        .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // START DATABASE TRANSACTION
    // ========================================================

    databaseSession =
      await mongoose.startSession();

    databaseSession.startTransaction();

    // ========================================================
    // ORDER
    // OWNERSHIP CHECK
    // ========================================================

    const order =
      await Order.findOne({
        orderNumber,

        userId:
          user._id,
      }).session(
        databaseSession
      );

    if (!order) {
      await databaseSession.abortTransaction();

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
    // EDIT STATUS CHECK
    // ========================================================

    const editableStatuses = [
      "pending",
      "confirmed",
    ];

    if (
      !editableStatuses.includes(
        order.status
      )
    ) {
      await databaseSession.abortTransaction();

      return NextResponse.json(
        {
          success: false,

          message:
            "This order can no longer be edited because preparation has started.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // ITEM COUNT MUST MATCH
    //
    // Current version only edits quantities.
    // Items cannot be injected from frontend.
    // ========================================================

    if (
      requestedItems.length !==
      order.items.length
    ) {
      await databaseSession.abortTransaction();

      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid order items.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // PROCESS EVERY ORDER ITEM
    // ========================================================

    for (
      const orderItem of
      order.items
    ) {
      const requested =
        requestedItems.find(
          (item) =>
            item.itemId
              ?.toString() ===
            orderItem._id.toString()
        );

      if (!requested) {
        await databaseSession.abortTransaction();

        return NextResponse.json(
          {
            success: false,

            message:
              `Missing quantity for ${orderItem.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // NEW QUANTITY
      // ======================================================

      const newQuantity =
        Number(
          requested.quantity
        );

      if (
        !Number.isInteger(
          newQuantity
        ) ||
        newQuantity < 1 ||
        newQuantity > 99
      ) {
        await databaseSession.abortTransaction();

        return NextResponse.json(
          {
            success: false,

            message:
              `Invalid quantity for ${orderItem.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // OLD QUANTITY
      // ======================================================

      const oldQuantity =
        Number(
          orderItem.quantity ||
            0
        );

      // ======================================================
      // DIFFERENCE
      //
      // Example:
      // old = 2
      // new = 3
      // difference = +1
      //
      // Stock se sirf 1 minus hoga.
      // ======================================================

      const difference =
        newQuantity -
        oldQuantity;

      // ======================================================
      // QUANTITY INCREASE
      // ======================================================

      if (difference > 0) {
        const updatedFood =
          await Food.findOneAndUpdate(
            {
              _id:
                orderItem.foodId,

              stock: {
                $gte:
                  difference,
              },

              isAvailable:
                true,
            },
            {
              $inc: {
                stock:
                  -difference,
              },
            },
            {
              new: true,

              session:
                databaseSession,
            }
          );

        if (!updatedFood) {
          await databaseSession.abortTransaction();

          return NextResponse.json(
            {
              success: false,

              message:
                `Not enough stock available for ${orderItem.name}.`,
            },
            {
              status: 400,
            }
          );
        }

        // ====================================================
        // ZERO STOCK
        // ====================================================

        if (
          Number(
            updatedFood.stock
          ) <= 0
        ) {
          updatedFood.stock = 0;

          updatedFood.isAvailable =
            false;

          await updatedFood.save({
            session:
              databaseSession,
          });
        }
      }

      // ======================================================
      // QUANTITY DECREASE
      //
      // Example:
      // old = 3
      // new = 1
      // difference = -2
      //
      // 2 stock restore hoga.
      // ======================================================

      if (difference < 0) {
        const restoreQuantity =
          Math.abs(
            difference
          );

        await Food.findByIdAndUpdate(
          orderItem.foodId,
          {
            $inc: {
              stock:
                restoreQuantity,
            },

            $set: {
              isAvailable:
                true,
            },
          },
          {
            session:
              databaseSession,
          }
        );
      }

      // ======================================================
      // UPDATE ORDER ITEM QUANTITY
      // ======================================================

      orderItem.quantity =
        newQuantity;

      // ======================================================
      // LINE TOTAL
      //
      // Existing order price use hoga,
      // naya product price nahi.
      // ======================================================

      const unitTotal =
        Number(
          orderItem.price ||
            0
        ) +
        Number(
          orderItem.variantPrice ||
            0
        );

      orderItem.lineTotal =
        Math.round(
          unitTotal *
            newQuantity
        );
    }

    // ========================================================
    // RECALCULATE SUBTOTAL
    // ========================================================

    const subtotal =
      order.items.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.lineTotal ||
              0
          ),
        0
      );

    // ========================================================
    // DISCOUNT
    //
    // Existing discount preserve kar rahe hain,
    // lekin subtotal se zyada nahi ho sakta.
    // ========================================================

    const discount =
      Math.min(
        Number(
          order.discount || 0
        ),
        subtotal
      );

    // ========================================================
    // DELIVERY FEE
    // ========================================================

    const deliveryFee =
      Number(
        order.deliveryFee ||
          0
      );

    // ========================================================
    // TOTAL
    // ========================================================

    const total =
      Math.max(
        0,
        subtotal +
          deliveryFee -
          discount
      );

    // ========================================================
    // SAVE SAME ORDER
    // ========================================================

    order.subtotal =
      Math.round(
        subtotal
      );

    order.discount =
      Math.round(
        discount
      );

    order.total =
      Math.round(
        total
      );

    await order.save({
      session:
        databaseSession,
    });

    // ========================================================
    // COMMIT
    // ========================================================

    await databaseSession.commitTransaction();

    databaseSession.endSession();

    databaseSession =
      null;

    // ========================================================
    // REVALIDATE CUSTOMER
    // ========================================================

    revalidatePath(
      "/account"
    );

    revalidatePath(
      "/account/orders"
    );

    revalidatePath(
      `/account/orders/${orderNumber}`
    );

    // ========================================================
    // REVALIDATE STOCK PAGES
    // ========================================================

    revalidatePath(
      "/"
    );

    revalidatePath(
      "/foods"
    );

    revalidatePath(
      "/categories"
    );

    // ========================================================
    // ADMIN
    // ========================================================

    revalidatePath(
      "/admin/dashboard/orders"
    );

    revalidatePath(
      "/admin/dashboard/foods"
    );

    revalidatePath(
      "/admin/branch-dashboard/orders"
    );

    revalidatePath(
      "/admin/branch-dashboard/foods"
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        "Order updated successfully.",

      order: {
        orderNumber:
          order.orderNumber,

        subtotal:
          order.subtotal,

        deliveryFee:
          order.deliveryFee,

        discount:
          order.discount,

        total:
          order.total,

        items:
          order.items.map(
            (item) => ({
              id:
                item._id.toString(),

              foodId:
                item.foodId.toString(),

              name:
                item.name,

              quantity:
                item.quantity,

              lineTotal:
                item.lineTotal,
            })
          ),
      },
    });
  } catch (error) {
    // ========================================================
    // ROLLBACK
    // ========================================================

    if (
      databaseSession
    ) {
      try {
        await databaseSession.abortTransaction();
      } catch {
        // Ignore rollback error.
      }

      databaseSession.endSession();
    }

    console.error(
      "EDIT CUSTOMER ORDER ERROR:",
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