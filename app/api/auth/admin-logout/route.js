// ============================================================
// CRAVEO - SUPER ADMIN LOGOUT API
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

// ============================================================
// POST LOGOUT
// ============================================================

export async function POST() {
  const response =
    NextResponse.json({
      success: true,

      message:
        "Logout successful.",
    });

  // ==========================================================
  // CLEAR SUPER ADMIN COOKIE
  // ==========================================================

  response.cookies.set(
    ADMIN_COOKIE_NAME,
    "",
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

      expires:
        new Date(0),

      maxAge:
        0,
    }
  );

  // ==========================================================
  // ALSO DELETE OLD WRONG COOKIE
  //
  // Purana proxy "admin_token" use karta tha.
  // Isliye us stale cookie ko bhi remove karenge.
  // ==========================================================

  response.cookies.set(
    "admin_token",
    "",
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

      expires:
        new Date(0),

      maxAge:
        0,
    }
  );

  return response;
}