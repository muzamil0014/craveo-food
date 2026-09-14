// ============================================================
// CRAVEO - AUTH UTILITIES
// NEXT.JS 16 + JOSE
//
// SUPER ADMIN:
// cookie = craveo_admin_token
// role   = super-admin
//
// BRANCH ADMIN:
// cookie = craveo_branch_admin_token
// role   = branch-admin
// ============================================================

import {
  cookies,
} from "next/headers";

import {
  SignJWT,
  jwtVerify,
} from "jose";

// ============================================================
// COOKIE NAMES
// ============================================================

export const ADMIN_COOKIE_NAME =
  "craveo_admin_token";

export const BRANCH_ADMIN_COOKIE_NAME =
  "craveo_branch_admin_token";

// ============================================================
// JWT SECRET
// ============================================================

function getJwtSecret() {
  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing in .env.local"
    );
  }

  return new TextEncoder().encode(
    secret
  );
}

// ============================================================
// CREATE SUPER ADMIN TOKEN
// ============================================================

export async function createAdminToken(
  admin
) {
  if (!admin) {
    throw new Error(
      "Admin data is required to create token."
    );
  }

  const adminId =
    admin._id?.toString() ||
    admin.id?.toString();

  if (!adminId) {
    throw new Error(
      "Admin ID is required."
    );
  }

  const token =
    await new SignJWT({
      adminId,

      name:
        admin.name || "",

      email:
        admin.email || "",

      role:
        "super-admin",
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

  return token;
}

// ============================================================
// CREATE BRANCH ADMIN TOKEN
// ============================================================

export async function createBranchAdminToken(
  admin
) {
  if (!admin) {
    throw new Error(
      "Branch Admin data is required."
    );
  }

  const adminId =
    admin._id?.toString() ||
    admin.id?.toString();

  const restaurantId =
    admin.restaurantId?._id?.toString() ||
    admin.restaurantId?.toString();

  if (!adminId) {
    throw new Error(
      "Branch Admin ID is required."
    );
  }

  if (!restaurantId) {
    throw new Error(
      "Branch Admin must have an assigned restaurant."
    );
  }

  const token =
    await new SignJWT({
      adminId,

      name:
        admin.name || "",

      email:
        admin.email || "",

      role:
        "branch-admin",

      restaurantId,
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

  return token;
}

// ============================================================
// VERIFY JWT TOKEN
// ============================================================

export async function verifyAuthToken(
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

    return payload;
  } catch {
    return null;
  }
}

// ============================================================
// GET SUPER ADMIN SESSION
// ============================================================

export async function getAdminSession() {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        ADMIN_COOKIE_NAME
      )?.value;

    if (!token) {
      return null;
    }

    const payload =
      await verifyAuthToken(
        token
      );

    if (!payload) {
      return null;
    }

    // ========================================================
    // EXACT SUPER ADMIN ROLE
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
  } catch (error) {
    console.error(
      "GET ADMIN SESSION ERROR:",
      error
    );

    return null;
  }
}

// ============================================================
// GET BRANCH ADMIN SESSION
// ============================================================

export async function getBranchAdminSession() {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        BRANCH_ADMIN_COOKIE_NAME
      )?.value;

    if (!token) {
      return null;
    }

    const payload =
      await verifyAuthToken(
        token
      );

    if (!payload) {
      return null;
    }

    // ========================================================
    // BRANCH ADMIN ROLE
    // ========================================================

    if (
      payload.role !==
      "branch-admin"
    ) {
      return null;
    }

    // ========================================================
    // BRANCH REQUIRED
    // ========================================================

    if (
      !payload.restaurantId
    ) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error(
      "GET BRANCH ADMIN SESSION ERROR:",
      error
    );

    return null;
  }
}

// ============================================================
// REQUIRE SUPER ADMIN
// ============================================================

export async function requireAdmin() {
  const session =
    await getAdminSession();

  if (!session) {
    const error =
      new Error(
        "Unauthorized Super Admin."
      );

    error.status = 401;

    throw error;
  }

  return session;
}

// ============================================================
// REQUIRE BRANCH ADMIN
// ============================================================

export async function requireBranchAdmin() {
  const session =
    await getBranchAdminSession();

  if (!session) {
    const error =
      new Error(
        "Unauthorized Branch Admin."
      );

    error.status = 401;

    throw error;
  }

  return session;
}