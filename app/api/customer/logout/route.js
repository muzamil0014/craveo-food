// ============================================================
// CRAVEO - CUSTOMER LOGOUT API
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  cookies,
} from "next/headers";

import {
  CUSTOMER_COOKIE_NAME,
} from "@/lib/customerAuth";

// ============================================================
// POST
// ============================================================

export async function POST() {
  try {
    const cookieStore =
      await cookies();

    // ========================================================
    // DELETE CUSTOMER AUTH COOKIE
    // ========================================================

    cookieStore.delete(
      CUSTOMER_COOKIE_NAME
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,
      message:
        "Logged out successfully.",
    });
  } catch (error) {
    console.error(
      "CUSTOMER LOGOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to logout.",
      },
      {
        status: 500,
      }
    );
  }
}