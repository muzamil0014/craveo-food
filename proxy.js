// ============================================================
// CRAVEO - ADMIN ROUTE PROTECTION
// NEXT.JS 16 PROXY
//
// SUPER ADMIN COOKIE:
// craveo_admin_token
//
// SUPER ADMIN ROLE:
// super-admin
//
// RULES:
//
// Guest:
// /admin
// /admin/dashboard
// /admin/dashboard/*
//      -> /admin/login
//
// Logged Super Admin:
// /admin/login
//      -> /admin/dashboard
//
// Customer website:
// No effect
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  jwtVerify,
} from "jose";

// ============================================================
// ADMIN COOKIE
// ============================================================

const ADMIN_COOKIE_NAME =
  "craveo_admin_token";

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
// VERIFY SUPER ADMIN TOKEN
// ============================================================

async function verifyAdminToken(
  token
) {
  if (!token) {
    return null;
  }

  try {
    const {
      payload,
    } = await jwtVerify(
      token,
      getJwtSecret()
    );

    // ========================================================
    // SUPER ADMIN ROLE REQUIRED
    // ========================================================

    if (
      payload.role !==
      "super-admin"
    ) {
      return null;
    }

    if (!payload.adminId) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ============================================================
// PROXY
// ============================================================

export async function proxy(
  request
) {
  const pathname =
    request.nextUrl.pathname;

  // ==========================================================
  // ROUTE TYPES
  // ==========================================================

  const isAdminLogin =
    pathname ===
    "/admin/login";

  const isAdminRoot =
    pathname ===
    "/admin";

  const isAdminDashboard =
    pathname ===
      "/admin/dashboard" ||
    pathname.startsWith(
      "/admin/dashboard/"
    );

  // ==========================================================
  // IGNORE OTHER ADMIN ROUTES
  // ==========================================================

  if (
    !isAdminLogin &&
    !isAdminRoot &&
    !isAdminDashboard
  ) {
    return NextResponse.next();
  }

  // ==========================================================
  // READ ADMIN COOKIE
  // ==========================================================

  const token =
    request.cookies.get(
      ADMIN_COOKIE_NAME
    )?.value;

  // ==========================================================
  // VERIFY ADMIN SESSION
  // ==========================================================

  const admin =
    await verifyAdminToken(
      token
    );

  // ==========================================================
  // /admin
  // ==========================================================

  if (isAdminRoot) {
    const url =
      request.nextUrl.clone();

    url.pathname =
      admin
        ? "/admin/dashboard"
        : "/admin/login";

    url.search = "";

    return NextResponse.redirect(
      url
    );
  }

  // ==========================================================
  // ADMIN LOGIN
  //
  // Logged admin cannot return to login page.
  // ==========================================================

  if (
    isAdminLogin &&
    admin
  ) {
    const url =
      request.nextUrl.clone();

    url.pathname =
      "/admin/dashboard";

    url.search = "";

    return NextResponse.redirect(
      url
    );
  }

  // ==========================================================
  // PROTECT SUPER ADMIN DASHBOARD
  //
  // Protects:
  //
  // /admin/dashboard
  // /admin/dashboard/analytics
  // /admin/dashboard/orders
  // /admin/dashboard/customers
  // /admin/dashboard/foods
  // /admin/dashboard/categories
  // /admin/dashboard/settings
  // etc.
  // ==========================================================

  if (
    isAdminDashboard &&
    !admin
  ) {
    const url =
      request.nextUrl.clone();

    url.pathname =
      "/admin/login";

    url.search = "";

    return NextResponse.redirect(
      url
    );
  }

  // ==========================================================
  // VALID SUPER ADMIN
  // ==========================================================

  return NextResponse.next();
}

// ============================================================
// MATCH ADMIN AREA
// ============================================================

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};