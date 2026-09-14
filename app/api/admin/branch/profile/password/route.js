// ============================================================
// CRAVEO - BRANCH ADMIN CHANGE PASSWORD
// ============================================================

import bcrypt from "bcryptjs";

import {
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getBranchAdminSession,
} from "@/lib/auth";

import Admin from "@/models/Admin";

// ============================================================
// PUT
// ============================================================

export async function PUT(request) {
  try {
    const session =
      await getBranchAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const body =
      await request.json();

    const currentPassword =
      body.currentPassword
        ?.toString();

    const newPassword =
      body.newPassword
        ?.toString();

    const confirmPassword =
      body.confirmPassword
        ?.toString();

    // ========================================================
    // VALIDATION
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

    if (
      newPassword.length < 8
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "New password must contain at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "New password and confirmation do not match.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // FIND LOGGED-IN BRANCH ADMIN
    // ========================================================

    const admin =
      await Admin.findOne({
        _id:
          session.adminId,

        role:
          "branch-admin",

        restaurantId:
          session.restaurantId,

        isActive:
          true,
      }).select(
        "+password"
      );

    if (!admin) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Branch Admin not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // VERIFY CURRENT PASSWORD
    // ========================================================

    const currentMatches =
      await bcrypt.compare(
        currentPassword,
        admin.password
      );

    if (!currentMatches) {
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
    // PREVENT SAME PASSWORD
    // ========================================================

    const samePassword =
      await bcrypt.compare(
        newPassword,
        admin.password
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
    // HASH PASSWORD
    // ========================================================

    admin.password =
      await bcrypt.hash(
        newPassword,
        12
      );

    await admin.save();

    return NextResponse.json({
      success: true,

      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "BRANCH PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to change password.",
      },
      {
        status: 500,
      }
    );
  }
}