// ============================================================
// CRAVEO - CUSTOMER WISHLIST API
// GET + POST + DELETE
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

import User from "@/models/User";
import Food from "@/models/Food";
import Wishlist from "@/models/Wishlist";

// ============================================================
// GET
// LOAD CUSTOMER WISHLIST
// ============================================================

export async function GET() {
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

    const wishlist =
      await Wishlist.findOne({
        userId:
          session.userId,
      }).lean();

    const count =
      Array.isArray(
        wishlist?.items
      )
        ? wishlist.items
            .length
        : 0;

    return NextResponse.json({
      success: true,

      wishlist:
        wishlist || null,

      count,
    });
  } catch (error) {
    console.error(
      "GET WISHLIST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to load wishlist.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST
// ADD FOOD TO WISHLIST
// ============================================================

export async function POST(
  request
) {
  try {
    const session =
      await getCustomerSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,

          code:
            "LOGIN_REQUIRED",

          message:
            "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const foodId =
      body.foodId
        ?.toString()
        .trim();

    if (!foodId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Food ID is required.",
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
      })
        .select(
          "_id selectedRestaurantId"
        )
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
    // FOOD
    // ========================================================

    const food =
      await Food.findById(
        foodId
      )
        .select(
          "_id restaurantIds isAvailable"
        )
        .lean();

    if (!food) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Food not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // FOOD MUST BE ACTIVE
    // ========================================================

    if (
      food.isAvailable ===
      false
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This food is currently unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // SELECTED BRANCH VALIDATION
    // ========================================================

    if (
      !user
        .selectedRestaurantId
    ) {
      return NextResponse.json(
        {
          success: false,

          code:
            "BRANCH_REQUIRED",

          message:
            "Please select a branch first.",
        },
        {
          status: 400,
        }
      );
    }

    const availableInBranch =
      Array.isArray(
        food.restaurantIds
      ) &&
      food.restaurantIds.some(
        (restaurantId) =>
          restaurantId.toString() ===
          user.selectedRestaurantId.toString()
      );

    if (!availableInBranch) {
      return NextResponse.json(
        {
          success: false,

          code:
            "BRANCH_MISMATCH",

          message:
            "This food is not available in your selected branch.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // FIND / CREATE WISHLIST
    // ========================================================

    let wishlist =
      await Wishlist.findOne({
        userId:
          user._id,
      });

    if (!wishlist) {
      wishlist =
        new Wishlist({
          userId:
            user._id,

          items: [],
        });
    }

    // ========================================================
    // DUPLICATE CHECK
    // ========================================================

    const alreadyExists =
      wishlist.items.some(
        (item) =>
          item.foodId.toString() ===
          food._id.toString()
      );

    if (
      !alreadyExists
    ) {
      wishlist.items.push({
        foodId:
          food._id,
      });

      await wishlist.save();
    }

    const count =
      wishlist.items.length;

    // ========================================================
    // REVALIDATE
    // ========================================================

    revalidatePath(
      "/account/wishlist"
    );

    revalidatePath("/");

    revalidatePath(
      "/foods"
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      added: true,

      count,

      message:
        alreadyExists
          ? "Already in wishlist."
          : "Added to wishlist.",
    });
  } catch (error) {
    console.error(
      "ADD WISHLIST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to add to wishlist.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE
// REMOVE FOOD FROM WISHLIST
// ============================================================

export async function DELETE(
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

    const body =
      await request.json();

    const foodId =
      body.foodId
        ?.toString()
        .trim();

    if (!foodId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Food ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const wishlist =
      await Wishlist.findOne({
        userId:
          session.userId,
      });

    if (!wishlist) {
      return NextResponse.json({
        success: true,

        removed: true,

        count: 0,
      });
    }

    wishlist.items =
      wishlist.items.filter(
        (item) =>
          item.foodId.toString() !==
          foodId
      );

    await wishlist.save();

    const count =
      wishlist.items.length;

    revalidatePath(
      "/account/wishlist"
    );

    revalidatePath("/");

    revalidatePath(
      "/foods"
    );

    return NextResponse.json({
      success: true,

      removed: true,

      count,

      message:
        "Removed from wishlist.",
    });
  } catch (error) {
    console.error(
      "REMOVE WISHLIST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to remove wishlist item.",
      },
      {
        status: 500,
      }
    );
  }
}