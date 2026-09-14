// ============================================================
// CRAVEO - CUSTOMER CHANGE PASSWORD API
// SECURE CURRENT PASSWORD VERIFICATION
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
// FORCE FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// PASSWORD VALIDATION
// ============================================================

function validateNewPassword(
  password
) {
  if (
    typeof password !==
      "string" ||
    password.length < 8
  ) {
    return "New password must be at least 8 characters.";
  }

  if (
    !/[A-Z]/.test(
      password
    )
  ) {
    return "Password must contain at least one uppercase letter.";
  }

  if (
    !/[a-z]/.test(
      password
    )
  ) {
    return "Password must contain at least one lowercase letter.";
  }

  if (
    !/[0-9]/.test(
      password
    )
  ) {
    return "Password must contain at least one number.";
  }

  return "";
}

// ============================================================
// POST
// CHANGE PASSWORD
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
    // DATABASE
    // ========================================================

    await connectDB();

    // ========================================================
    // BODY
    // ========================================================

    let body;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid request data.",
        },
        {
          status: 400,
        }
      );
    }

    const currentPassword =
      String(
        body.currentPassword ||
          ""
      );

    const newPassword =
      String(
        body.newPassword ||
          ""
      );

    const confirmPassword =
      String(
        body.confirmPassword ||
          ""
      );

    // ========================================================
    // REQUIRED FIELDS
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
            "Please complete all password fields.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // CONFIRM PASSWORD
    // ========================================================

    if (
      newPassword !==
      confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "New password and confirm password do not match.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // PASSWORD STRENGTH
    // ========================================================

    const passwordError =
      validateNewPassword(
        newPassword
      );

    if (passwordError) {
      return NextResponse.json(
        {
          success: false,

          message:
            passwordError,
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // CUSTOMER
    //
    // IMPORTANT:
    // Password explicitly select kar rahe hain in case schema
    // password ko select:false rakhta ho.
    // ========================================================

    const user =
      await User.findOne({
        _id:
          session.userId,

        role:
          "customer",

        isActive:
          true,
      }).select(
        "+password name email role isActive"
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
    // PASSWORD EXISTS
    // ========================================================

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Password authentication is not available for this account.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VERIFY CURRENT PASSWORD
    // ========================================================

    const currentPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (
      !currentPasswordCorrect
    ) {
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
    // NEW PASSWORD CANNOT MATCH OLD PASSWORD
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
            "New password must be different from your current password.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // HASH PASSWORD
    // ========================================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    // ========================================================
    // SAVE
    // ========================================================

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