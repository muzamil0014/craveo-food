// ============================================================
// CRAVEO - CUSTOMER COUPON VALIDATION API
//
// SECURITY:
// ONE ACCOUNT + ONE COUPON = ONE USE
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
import Cart from "@/models/Cart";
import Coupon from "@/models/Coupon";
import CouponUsage from "@/models/CouponUsage";
import Restaurant from "@/models/Restaurant";

// ============================================================
// CALCULATE DISCOUNT
// ============================================================

function calculateDiscount(
  coupon,
  subtotal
) {
  const discountValue =
    Number(
      coupon.discountValue ||
        0
    );

  const maximumDiscount =
    Number(
      coupon.maximumDiscount ||
        0
    );

  let discount =
    0;

  // ==========================================================
  // PERCENTAGE
  // ==========================================================

  if (
    coupon.discountType ===
    "percentage"
  ) {
    let percentage =
      discountValue;

    if (
      maximumDiscount >
      0
    ) {
      percentage =
        Math.min(
          percentage,
          maximumDiscount
        );
    }

    percentage =
      Math.max(
        0,
        Math.min(
          percentage,
          100
        )
      );

    discount =
      subtotal *
      (percentage /
        100);
  }

  // ==========================================================
  // FIXED
  // ==========================================================

  else {
    discount =
      discountValue;

    if (
      maximumDiscount >
      0
    ) {
      discount =
        Math.min(
          discount,
          maximumDiscount
        );
    }
  }

  // ==========================================================
  // FINAL
  // ==========================================================

  return Math.round(
    Math.min(
      Math.max(
        discount,
        0
      ),
      subtotal
    )
  );
}

// ============================================================
// POST
// ============================================================

export async function POST(
  request
) {
  try {
    // ========================================================
    // SESSION
    // ========================================================

    const session =
      await getCustomerSession();

    if (
      !session?.userId
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Please login first.",
        },
        {
          status:
            401,
        }
      );
    }

    // ========================================================
    // BODY
    // ========================================================

    const body =
      await request.json();

    const code =
      String(
        body.code ||
          ""
      )
        .trim()
        .toUpperCase();

    // ========================================================
    // OPTIONAL COUPON
    // ========================================================

    if (!code) {
      return NextResponse.json({
        success:
          true,

        coupon:
          null,

        discount:
          0,
      });
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
          session.userId,

        role:
          "customer",

        isActive:
          true,
      })
        .select(
          "_id selectedRestaurantId"
        )
        .lean();

    if (
      !user ||
      !user.selectedRestaurantId
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Select a branch first.",
        },
        {
          status:
            400,
        }
      );
    }

    // ========================================================
    // BRANCH
    // ========================================================

    const branch =
      await Restaurant.findOne({
        _id:
          user.selectedRestaurantId,

        isActive:
          true,
      })
        .select(
          "_id name"
        )
        .lean();

    if (!branch) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Selected branch is unavailable.",
        },
        {
          status:
            400,
        }
      );
    }

    // ========================================================
    // CART
    // ========================================================

    const cart =
      await Cart.findOne({
        userId:
          user._id,

        restaurantId:
          branch._id,
      }).lean();

    if (
      !cart ||
      !cart.items?.length
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Your cart is empty.",
        },
        {
          status:
            400,
        }
      );
    }

    const subtotal =
      Number(
        cart.subtotal ||
          0
      );

    // ========================================================
    // COUPON
    // ========================================================

    const coupon =
      await Coupon.findOne({
        code,

        isActive:
          true,
      }).lean();

    if (!coupon) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Invalid coupon code.",
        },
        {
          status:
            404,
        }
      );
    }

    // ========================================================
    // ONE ACCOUNT = ONE USE
    // ========================================================

    const alreadyUsed =
      await CouponUsage.exists({
        couponId:
          coupon._id,

        userId:
          user._id,
      });

    if (
      alreadyUsed
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "You have already used this coupon.",
        },
        {
          status:
            400,
        }
      );
    }

    // ========================================================
    // DATE VALIDATION
    // ========================================================

    const now =
      new Date();

    if (
      coupon.startDate &&
      now <
        new Date(
          coupon.startDate
        )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "This coupon is not active yet.",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      coupon.expiryDate &&
      now >
        new Date(
          coupon.expiryDate
        )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "This coupon has expired.",
        },
        {
          status:
            400,
        }
      );
    }

    // ========================================================
    // MINIMUM ORDER
    // ========================================================

    const minimumOrder =
      Number(
        coupon.minimumOrder ||
          0
      );

    if (
      subtotal <
      minimumOrder
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            `Minimum order amount is PKR ${minimumOrder.toLocaleString()}.`,
        },
        {
          status:
            400,
        }
      );
    }

    // ========================================================
    // GLOBAL USAGE LIMIT
    // ========================================================

    const usageLimit =
      Number(
        coupon.usageLimit ||
          0
      );

    const usedCount =
      Number(
        coupon.usedCount ||
          0
      );

    if (
      usageLimit >
        0 &&
      usedCount >=
        usageLimit
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Coupon usage limit has been reached.",
        },
        {
          status:
            400,
        }
      );
    }

    // ========================================================
    // BRANCH VALIDATION
    // ========================================================

    if (
      Array.isArray(
        coupon.restaurantIds
      ) &&
      coupon.restaurantIds
        .length >
        0
    ) {
      const allowed =
        coupon.restaurantIds.some(
          (
            restaurantId
          ) =>
            restaurantId
              .toString() ===
            branch._id.toString()
        );

      if (!allowed) {
        return NextResponse.json(
          {
            success:
              false,

            message:
              "This coupon is not valid for your selected branch.",
          },
          {
            status:
              400,
          }
        );
      }
    }

    // ========================================================
    // DISCOUNT
    // ========================================================

    const discount =
      calculateDiscount(
        coupon,
        subtotal
      );

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success:
        true,

      message:
        "Coupon applied.",

      coupon: {
        code:
          coupon.code,

        title:
          coupon.title ||
          coupon.code,

        discountType:
          coupon.discountType,

        discountValue:
          Number(
            coupon.discountValue ||
              0
          ),

        discount,
      },

      discount,
    });
  } catch (error) {
    console.error(
      "COUPON VALIDATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          error?.message ||
          "Unable to validate coupon.",
      },
      {
        status:
          500,
      }
    );
  }
}