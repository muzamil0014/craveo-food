// ============================================================
// CRAVEO - CUSTOMER AUTH UTILITIES
// ============================================================

import {
  SignJWT,
  jwtVerify,
} from "jose";

import {
  cookies,
} from "next/headers";

// ============================================================
// COOKIE
// ============================================================

export const CUSTOMER_COOKIE_NAME =
  "craveo_customer_token";

// ============================================================
// JWT SECRET
// ============================================================

function getSecretKey() {
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
// CREATE CUSTOMER TOKEN
// ============================================================

export async function createCustomerToken(
  user
) {
  return new SignJWT({
    userId:
      user._id.toString(),

    email:
      user.email,

    role:
      "customer",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(
      "7d"
    )
    .sign(
      getSecretKey()
    );
}

// ============================================================
// VERIFY TOKEN
// ============================================================

export async function verifyCustomerToken(
  token
) {
  try {
    if (!token) {
      return null;
    }

    const {
      payload,
    } = await jwtVerify(
      token,
      getSecretKey()
    );

    if (
      payload.role !==
      "customer"
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ============================================================
// GET CUSTOMER SESSION
// ============================================================

export async function getCustomerSession() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      CUSTOMER_COOKIE_NAME
    )?.value;

  return verifyCustomerToken(
    token
  );
}