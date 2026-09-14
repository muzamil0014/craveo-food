// ============================================================
// CRAVEO - CUSTOMER CHANGE PASSWORD API
// ============================================================

import {
  NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";

// ============================================================
// POST
// ============================================================

export async function POST(request) {
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

    const currentPassword =
      body.currentPassword
        ?.toString() || "";

    const newPassword =
      body.newPassword
        ?.toString() || "";

    const confirmPassword =
      body.confirmPassword
        ?.toString() || "";

    // ========================================================
    // REQUIRED
    // ========================================================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "All password fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // PASSWORD LENGTH
    // ========================================================

    if (
      newPassword.length < 6
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "New password must be at least 6 characters.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // MATCH
    // ========================================================

    if (
      newPassword !==
      confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "New passwords do not match.",
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

    // password select:false hai, isliye explicitly select
    const user =
      await User.findOne({
        _id:
          session.userId,

        role:
          "customer",

        isActive:
          true,
      }).select(
        "+password"
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Customer account not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // CURRENT PASSWORD CHECK
    // ========================================================

    const currentPasswordValid =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!currentPasswordValid) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Current password is incorrect.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // SAME PASSWORD CHECK
    // ========================================================

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return NextResponse.json(
        {
          success: false,

          message:
            "New password must be different from current password.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // HASH NEW PASSWORD
    // ========================================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    user.password =
      hashedPassword;

    await user.save();

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "CUSTOMER CHANGE PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to change password.",
      },
      {
        status: 500,
      }
    );
  }
}