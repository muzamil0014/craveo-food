// ============================================================
// CRAVEO - CUSTOMER REORDER API
// OLD ORDER -> CURRENT CART
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

import User from "@/models/User";
import Order from "@/models/Order";
import Food from "@/models/Food";
import Cart from "@/models/Cart";
import Restaurant from "@/models/Restaurant";

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
    // USER
    // ========================================================

    const user =
      await User.findOne({
        _id:
          session.userId,

        role:
          "customer",

        isActive:
          true,
      });

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

    if (
      !user.selectedRestaurantId
    ) {
      return NextResponse.json(
        {
          success: false,
          code:
            "BRANCH_REQUIRED",

          message:
            "Select a branch first.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // ORDER OWNERSHIP
    // ========================================================

    const order =
      await Order.findOne({
        orderNumber,

        userId:
          user._id,
      }).lean();

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
    // SAME BRANCH REQUIRED
    // ========================================================

    if (
      order.restaurantId.toString() !==
      user.selectedRestaurantId.toString()
    ) {
      return NextResponse.json(
        {
          success: false,

          code:
            "BRANCH_MISMATCH",

          message:
            "Select the same branch used for this order before reordering.",
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // BRANCH VALID
    // ========================================================

    const branch =
      await Restaurant.findOne({
        _id:
          user.selectedRestaurantId,

        isActive:
          true,
      })
        .select("_id")
        .lean();

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected branch is unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // BUILD CART ITEMS
    // ========================================================

    const cartItems = [];

    let subtotal = 0;

    for (
      const oldItem of
      order.items
    ) {
      const food =
        await Food.findOne({
          _id:
            oldItem.foodId,

          restaurantIds:
            branch._id,

          isAvailable:
            true,
        }).lean();

      // ======================================================
      // FOOD REMOVED / UNAVAILABLE
      // ======================================================

      if (!food) {
        continue;
      }

      const requestedQuantity =
        Math.max(
          1,
          Number(
            oldItem.quantity ||
              1
          )
        );

      const availableStock =
        Number(
          food.stock || 0
        );

      if (
        availableStock <=
        0
      ) {
        continue;
      }

      const quantity =
        Math.min(
          requestedQuantity,
          availableStock
        );

      // ======================================================
      // CURRENT BASE PRICE
      // ======================================================

      const unitPrice =
        Number(
          Number(
            food.salePrice
          ) > 0
            ? food.salePrice
            : food.price
        );

      // ======================================================
      // VARIANT
      // ======================================================

      let variantName = "";
      let variantPrice = 0;

      if (
        oldItem.variantName
      ) {
        const variant =
          Array.isArray(
            food.variants
          )
            ? food.variants.find(
                (item) =>
                  item.name
                    ?.toString()
                    .trim()
                    .toLowerCase() ===
                  oldItem.variantName
                    .toString()
                    .trim()
                    .toLowerCase()
              )
            : null;

        if (variant) {
          variantName =
            variant.name;

          variantPrice =
            Number(
              variant.price ||
                0
            );
        }
      }

      const lineTotal =
        (
          unitPrice +
          variantPrice
        ) *
        quantity;

      subtotal +=
        lineTotal;

      cartItems.push({
        foodId:
          food._id,

        name:
          food.name,

        image:
          food.image || "",

        quantity,

        unitPrice,

        variantName,

        variantPrice,
      });
    }

    // ========================================================
    // NOTHING AVAILABLE
    // ========================================================

    if (
      cartItems.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "None of the foods from this order are currently available.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // REPLACE CURRENT CART
    // ========================================================

    let cart =
      await Cart.findOne({
        userId:
          user._id,
      });

    if (!cart) {
      cart =
        new Cart({
          userId:
            user._id,

          restaurantId:
            branch._id,

          items:
            [],

          subtotal:
            0,
        });
    }

    cart.restaurantId =
      branch._id;

    cart.items =
      cartItems;

    cart.subtotal =
      subtotal;

    await cart.save();

    // ========================================================
    // COUNT
    // ========================================================

    const cartCount =
      cart.items.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quantity ||
              0
          ),
        0
      );

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        "Items added to cart.",

      cartCount,
    });
  } catch (error) {
    console.error(
      "CUSTOMER REORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to reorder.",
      },
      {
        status: 500,
      }
    );
  }
}