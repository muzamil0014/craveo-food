// ============================================================
// CRAVEO - BRANCH ADMIN LOGOUT
// ============================================================

import {
  NextResponse,
} from "next/server";

// ============================================================
// POST
// ============================================================

export async function POST() {
  const response =
    NextResponse.json({
      success: true,

      message:
        "Branch Admin logged out.",
    });

  response.cookies.set(
    "craveo_branch_admin_token",
    "",
    {
      httpOnly: true,

      expires:
        new Date(0),

      path: "/",

      sameSite: "lax",
    }
  );

  return response;
}