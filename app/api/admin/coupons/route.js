// ============================================================
// CRAVEO - ADMIN COUPONS API
//
// GET  /api/admin/coupons
// POST /api/admin/coupons
// ============================================================

import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import Coupon from "@/models/Coupon";
import Restaurant from "@/models/Restaurant";

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
// GET COUPONS
// ============================================================

export async function GET() {
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

    await connectDB();

    void Restaurant;

    const coupons =
      await Coupon.find()
        .populate(
          "restaurantIds",
          "name city area"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error(
      "GET COUPONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to load coupons.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// CREATE COUPON
// ============================================================

export async function POST(request) {
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

    await connectDB();

    const body =
      await request.json();

    // ========================================================
    // VALUES
    // ========================================================

    const code =
      body.code
        ?.toString()
        .trim()
        .toUpperCase();

    const title =
      body.title
        ?.toString()
        .trim();

    const description =
      body.description
        ?.toString()
        .trim() || "";

    const discountType =
      body.discountType;

    const discountValue =
      Number(
        body.discountValue
      );

    const minimumOrder =
      Number(
        body.minimumOrder
      ) || 0;

    const maximumDiscount =
      Number(
        body.maximumDiscount
      ) || 0;

    const usageLimit =
      Number(
        body.usageLimit
      ) || 0;

    const perUserLimit =
      Number(
        body.perUserLimit
      ) || 1;

    const startDate =
      body.startDate;

    const expiryDate =
      body.expiryDate;

    const restaurantIds =
      Array.isArray(
        body.restaurantIds
      )
        ? body.restaurantIds.filter(
            (id) =>
              mongoose.Types.ObjectId.isValid(
                id
              )
          )
        : [];

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Coupon code is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Coupon title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      ![
        "percentage",
        "fixed",
      ].includes(
        discountType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid discount type.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        discountValue
      ) ||
      discountValue <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid discount value is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      discountType ===
        "percentage" &&
      discountValue > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Percentage discount cannot exceed 100%.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !startDate ||
      !expiryDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Start and expiry dates are required.",
        },
        {
          status: 400,
        }
      );
    }

    const start =
      new Date(startDate);

    const expiry =
      new Date(expiryDate);

    if (
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        expiry.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid coupon dates.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      expiry <= start
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Expiry date must be after start date.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // UNIQUE CODE
    // ========================================================

    const existingCoupon =
      await Coupon.findOne({
        code,
      });

    if (existingCoupon) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Coupon code already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // VERIFY BRANCHES
    // ========================================================

    if (
      restaurantIds.length > 0
    ) {
      const branchCount =
        await Restaurant.countDocuments({
          _id: {
            $in: restaurantIds,
          },
        });

      if (
        branchCount !==
        restaurantIds.length
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "One or more selected branches are invalid.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // ========================================================
    // CREATE
    // ========================================================

    const coupon =
      await Coupon.create({
        code,
        title,
        description,

        discountType,
        discountValue,

        minimumOrder:
          Math.max(
            0,
            minimumOrder
          ),

        maximumDiscount:
          Math.max(
            0,
            maximumDiscount
          ),

        usageLimit:
          Math.max(
            0,
            usageLimit
          ),

        perUserLimit:
          Math.max(
            1,
            perUserLimit
          ),

        startDate:
          start,

        expiryDate:
          expiry,

        restaurantIds,

        isActive: true,
      });

    return NextResponse.json(
      {
        success: true,

        message:
          "Coupon created successfully.",

        coupon: {
          id:
            coupon._id.toString(),

          code:
            coupon.code,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE COUPON ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to create coupon.",
      },
      {
        status: 500,
      }
    );
  }
}