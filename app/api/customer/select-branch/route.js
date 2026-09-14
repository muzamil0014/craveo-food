// ============================================================
// CRAVEO - CUSTOMER SELECT BRANCH API
// CITY SECURITY + CART PROTECTION
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
import Restaurant from "@/models/Restaurant";
import Cart from "@/models/Cart";

// ============================================================
// NORMALIZE
// ============================================================

function normalize(value) {
  return value
    ?.toString()
    .trim()
    .toLowerCase() || "";
}

// ============================================================
// PUT
// ============================================================

export async function PUT(
  request
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

    // ========================================================
    // BODY
    // ========================================================

    const body =
      await request.json();

    const restaurantId =
      body.restaurantId
        ?.toString()
        .trim();

    const forceChange =
      body.forceChange ===
      true;

    if (!restaurantId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Branch ID is required.",
        },
        {
          status: 400,
        }
      );
    }

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

    // ========================================================
    // CUSTOMER CITY REQUIRED
    // ========================================================

    const customerCity =
      normalize(
        user.city
      );

    if (!customerCity) {
      return NextResponse.json(
        {
          success: false,

          code:
            "CITY_REQUIRED",

          message:
            "Your city is missing. Please update your profile first.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // SELECTED BRANCH
    // ========================================================

    const branch =
      await Restaurant.findOne({
        _id:
          restaurantId,

        isActive:
          true,
      })
        .select(
          "_id name city area"
        )
        .lean();

    if (!branch) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Selected branch is unavailable.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // CITY SECURITY
    // ========================================================

    const branchCity =
      normalize(
        branch.city
      );

    if (
      branchCity !==
      customerCity
    ) {
      return NextResponse.json(
        {
          success: false,

          code:
            "CITY_MISMATCH",

          message:
            `You can only select CRAVEO branches in ${user.city}.`,
        },
        {
          status: 403,
        }
      );
    }

    // ========================================================
    // SAME BRANCH
    // ========================================================

    if (
      user.selectedRestaurantId &&
      user.selectedRestaurantId.toString() ===
        branch._id.toString()
    ) {
      return NextResponse.json({
        success: true,

        message:
          "Branch already selected.",

        branch: {
          id:
            branch._id.toString(),

          name:
            branch.name,

          city:
            branch.city,
        },
      });
    }

    // ========================================================
    // EXISTING CART
    // ========================================================

    const cart =
      await Cart.findOne({
        userId:
          user._id,
      });

    const cartHasItems =
      Boolean(
        cart &&
          Array.isArray(
            cart.items
          ) &&
          cart.items.length > 0
      );

    const cartDifferentBranch =
      Boolean(
        cart?.restaurantId &&
          cart.restaurantId.toString() !==
            branch._id.toString()
      );

    // ========================================================
    // CART CLEAR CONFIRMATION REQUIRED
    // ========================================================

    if (
      cartHasItems &&
      cartDifferentBranch &&
      !forceChange
    ) {
      return NextResponse.json(
        {
          success: false,

          code:
            "CART_CLEAR_REQUIRED",

          message:
            "Changing branch will clear your current cart.",
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // FORCE CHANGE - CLEAR OLD CART
    // ========================================================

    if (
      forceChange &&
      cart &&
      cartDifferentBranch
    ) {
      await Cart.deleteOne({
        _id:
          cart._id,
      });
    }

    // ========================================================
    // SAVE BRANCH
    // ========================================================

    user.selectedRestaurantId =
      branch._id;

    await user.save();

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        "Branch selected successfully.",

      branch: {
        id:
          branch._id.toString(),

        name:
          branch.name,

        city:
          branch.city,
      },
    });
  } catch (error) {
    console.error(
      "SELECT BRANCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to select branch.",
      },
      {
        status: 500,
      }
    );
  }
}