// ============================================================
// CRAVEO - BRANCH ADMIN LOGIN API
// ============================================================

import bcrypt from "bcryptjs";

import {
  SignJWT,
} from "jose";

import {
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import Admin from "@/models/Admin";
import Restaurant from "@/models/Restaurant";

// ============================================================
// JWT SECRET
// ============================================================

function getJwtSecret() {
  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing."
    );
  }

  return new TextEncoder().encode(
    secret
  );
}

// ============================================================
// POST
// ============================================================

export async function POST(request) {
  try {
    await connectDB();

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
    // VALIDATION
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
    // FIND BRANCH ADMIN
    // ========================================================

    const admin =
      await Admin.findOne({
        email,
        role: "branch-admin",
      }).select(
        "+password"
      );

    if (!admin) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid Branch Admin credentials.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // ADMIN STATUS
    // ========================================================

    if (!admin.isActive) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Your Branch Admin account is inactive.",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================================
    // BRANCH REQUIRED
    // ========================================================

    if (!admin.restaurantId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "No branch is assigned to this administrator.",
        },
        {
          status: 403,
        }
      );
    }

    const restaurant =
      await Restaurant.findById(
        admin.restaurantId
      );

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Assigned branch does not exist.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      restaurant.isActive ===
      false
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Assigned branch is currently inactive.",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================================
    // PASSWORD
    // ========================================================

    const validPassword =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid Branch Admin credentials.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // JWT
    // IMPORTANT:
    // restaurantId comes from database,
    // never from frontend
    // ========================================================

    const token =
      await new SignJWT({
        adminId:
          admin._id.toString(),

        name:
          admin.name,

        email:
          admin.email,

        role:
          "branch-admin",

        restaurantId:
          admin.restaurantId.toString(),
      })
        .setProtectedHeader({
          alg: "HS256",
        })
        .setIssuedAt()
        .setExpirationTime(
          "7d"
        )
        .sign(
          getJwtSecret()
        );

    // ========================================================
    // LAST LOGIN
    // ========================================================

    admin.lastLogin =
      new Date();

    await admin.save();

    // ========================================================
    // RESPONSE
    // ========================================================

    const response =
      NextResponse.json({
        success: true,

        message:
          "Branch Admin login successful.",

        redirect:
          "/admin/branch-dashboard",
      });

    response.cookies.set(
      "craveo_branch_admin_token",
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error(
      "BRANCH LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to login.",
      },
      {
        status: 500,
      }
    );
  }
}