// ============================================================
// CRAVEO - SUPER ADMIN LOGIN API
// ============================================================

import {
  NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
} from "@/lib/auth";

import Admin from "@/models/Admin";

// ============================================================
// FORCE DYNAMIC
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// POST LOGIN
// ============================================================

export async function POST(
  request
) {
  try {
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

    const email =
      String(
        body.email || ""
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        body.password || ""
      );

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
    // FIND SUPER ADMIN
    // ========================================================

    const admin =
      await Admin.findOne({
        email,

        role:
          "super-admin",
      }).select(
        "+password"
      );

    if (!admin) {
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
    // ACTIVE ADMIN CHECK
    // ========================================================

    if (
      admin.isActive ===
      false
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Admin account is inactive.",
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
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // CREATE SUPER ADMIN TOKEN
    // ========================================================

    const token =
      await createAdminToken(
        admin
      );

    // ========================================================
    // UPDATE LAST LOGIN
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
          "Super Admin login successful.",

        admin: {
          id:
            admin._id.toString(),

          name:
            admin.name || "",

          email:
            admin.email || "",

          role:
            "super-admin",
        },
      });

    // ========================================================
    // ADMIN SESSION COOKIE
    //
    // Browser session cookie:
    // No maxAge / expires.
    // Browser close -> session expires.
    // ========================================================

    response.cookies.set(
      ADMIN_COOKIE_NAME,
      token,
      {
        httpOnly:
          true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          "lax",

        path:
          "/",
      }
    );

    return response;
  } catch (error) {
    console.error(
      "ADMIN LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to login.",
      },
      {
        status: 500,
      }
    );
  }
}