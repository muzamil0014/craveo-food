// ============================================================
// CRAVEO - CUSTOMER LOGIN API
// ============================================================

import {
  NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  createCustomerToken,
  CUSTOMER_COOKIE_NAME,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Restaurant from "@/models/Restaurant";

// ============================================================
// POST - CUSTOMER LOGIN
// ============================================================

export async function POST(
  request
) {
  try {
    // ========================================================
    // BODY
    // ========================================================

    const body =
      await request.json();

    const email =
      body.email
        ?.toString()
        .trim()
        .toLowerCase();

    const password =
      body.password
        ?.toString();

    // ========================================================
    // LOGIN VALIDATION
    //
    // IMPORTANT:
    // LOGIN ME NAME REQUIRED NAHI HAI.
    // ========================================================

    if (
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Email and password are required.",
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
    // FIND CUSTOMER
    // ========================================================

    const user =
      await User.findOne({
        email,
        role:
          "customer",
      }).select(
        "+password"
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // ACTIVE STATUS
    // ========================================================

    if (
      user.isActive !==
      true
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Your account is inactive.",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================================
    // PASSWORD CHECK
    // ========================================================

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // VALIDATE SELECTED BRANCH
    // ========================================================

    let needsBranchSelection =
      true;

    if (
      user.selectedRestaurantId
    ) {
      const restaurant =
        await Restaurant.findOne({
          _id:
            user.selectedRestaurantId,

          isActive:
            true,
        })
          .select("_id")
          .lean();

      if (restaurant) {
        needsBranchSelection =
          false;
      } else {
        user.selectedRestaurantId =
          null;
      }
    }

    // ========================================================
    // LAST LOGIN
    // ========================================================

    user.lastLogin =
      new Date();

    await user.save();

    // ========================================================
    // TOKEN
    // ========================================================

    const token =
      await createCustomerToken(
        user
      );

    // ========================================================
    // RESPONSE
    // ========================================================

    const response =
      NextResponse.json({
        success: true,

        message:
          "Login successful.",

        needsBranchSelection,
      });

    // ========================================================
    // CUSTOMER COOKIE
    // ========================================================

    response.cookies.set(
      CUSTOMER_COOKIE_NAME,
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          "lax",

        path:
          "/",

        maxAge:
          60 *
          60 *
          24 *
          7,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "CUSTOMER LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Login failed.",
      },
      {
        status: 500,
      }
    );
  }
}