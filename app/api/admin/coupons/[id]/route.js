// ============================================================
// CRAVEO - SINGLE COUPON API
//
// GET    /api/admin/coupons/[id]
// PUT    /api/admin/coupons/[id]
// DELETE /api/admin/coupons/[id]
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
// VALID ID
// ============================================================

function validId(id) {
  return mongoose.Types.ObjectId.isValid(
    id
  );
}

// ============================================================
// GET
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

    if (!validId(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid coupon ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    void Restaurant;

    const coupon =
      await Coupon.findById(
        id
      )
        .populate(
          "restaurantIds",
          "name city area"
        )
        .lean();

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Coupon not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error(
      "GET COUPON ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load coupon.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// UPDATE
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

    if (!validId(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid coupon ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const coupon =
      await Coupon.findById(
        id
      );

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Coupon not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await request.json();

    // ========================================================
    // QUICK STATUS UPDATE
    // ========================================================

    if (
      Object.keys(body).length ===
        1 &&
      typeof body.isActive ===
        "boolean"
    ) {
      coupon.isActive =
        body.isActive;

      await coupon.save();

      return NextResponse.json({
        success: true,

        message:
          "Coupon status updated successfully.",

        coupon: {
          id:
            coupon._id.toString(),

          isActive:
            coupon.isActive,
        },
      });
    }

    // ========================================================
    // FULL UPDATE
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

    const start =
      new Date(
        body.startDate
      );

    const expiry =
      new Date(
        body.expiryDate
      );

    const restaurantIds =
      Array.isArray(
        body.restaurantIds
      )
        ? body.restaurantIds.filter(
            (branchId) =>
              mongoose.Types.ObjectId.isValid(
                branchId
              )
          )
        : [];

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!code || !title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Code and title are required.",
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
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        expiry.getTime()
      ) ||
      expiry <= start
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid start and expiry dates are required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // DUPLICATE CODE
    // --------------------------------------------------------

    const duplicate =
      await Coupon.findOne({
        _id: {
          $ne: coupon._id,
        },

        code,
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another coupon already uses this code.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------------
    // VERIFY BRANCHES
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    coupon.code = code;
    coupon.title = title;
    coupon.description =
      description;

    coupon.discountType =
      discountType;

    coupon.discountValue =
      discountValue;

    coupon.minimumOrder =
      Math.max(
        0,
        minimumOrder
      );

    coupon.maximumDiscount =
      Math.max(
        0,
        maximumDiscount
      );

    coupon.usageLimit =
      Math.max(
        0,
        usageLimit
      );

    coupon.perUserLimit =
      Math.max(
        1,
        perUserLimit
      );

    coupon.startDate =
      start;

    coupon.expiryDate =
      expiry;

    coupon.restaurantIds =
      restaurantIds;

    coupon.isActive =
      body.isActive !==
      false;

    await coupon.save();

    return NextResponse.json({
      success: true,

      message:
        "Coupon updated successfully.",

      coupon: {
        id:
          coupon._id.toString(),

        code:
          coupon.code,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE COUPON ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to update coupon.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE
// ============================================================

export async function DELETE(
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

    if (!validId(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid coupon ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const coupon =
      await Coupon.findById(
        id
      );

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Coupon not found.",
        },
        {
          status: 404,
        }
      );
    }

    await coupon.deleteOne();

    return NextResponse.json({
      success: true,

      message:
        "Coupon deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE COUPON ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to delete coupon.",
      },
      {
        status: 500,
      }
    );
  }
}