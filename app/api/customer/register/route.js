// ============================================================
// CRAVEO - CUSTOMER REGISTER API
// CITY VALIDATION FROM ACTIVE BRANCHES
// ============================================================

import {
  NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";

import {
  cookies,
} from "next/headers";

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
// POST
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

    const name =
      body.name
        ?.toString()
        .trim() || "";

    const email =
      body.email
        ?.toString()
        .trim()
        .toLowerCase() || "";

    const phone =
      body.phone
        ?.toString()
        .trim() || "";

    const city =
      body.city
        ?.toString()
        .trim() || "";

    const password =
      body.password
        ?.toString() || "";

    // ========================================================
    // VALIDATION
    // ========================================================

    if (
      !name ||
      !email ||
      !city ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Name, email, city and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      password.length < 6
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Password must be at least 6 characters.",
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
    // CITY MUST HAVE ACTIVE BRANCH
    // CASE INSENSITIVE
    // ========================================================

    const availableCities =
      await Restaurant.distinct(
        "city",
        {
          isActive: true,
        }
      );

    const validCity =
      availableCities.find(
        (item) =>
          item
            ?.toString()
            .trim()
            .toLowerCase() ===
          city.toLowerCase()
      );

    if (!validCity) {
      return NextResponse.json(
        {
          success: false,

          message:
            "CRAVEO does not currently have an active branch in this city.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // EXISTING CUSTOMER
    // ========================================================

    const existingUser =
      await User.findOne({
        email,
      })
        .select("_id")
        .lean();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,

          message:
            "An account with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // HASH PASSWORD
    // ========================================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // ========================================================
    // CREATE USER
    // ========================================================

    const user =
      await User.create({
        name,
        email,
        phone,

        // Use exact city stored on Restaurant.
        city:
          validCity
            .toString()
            .trim(),

        password:
          hashedPassword,

        role:
          "customer",

        selectedRestaurantId:
          null,

        isActive:
          true,

        isVerified:
          false,
      });

    // ========================================================
    // CUSTOMER JWT
    // ========================================================

    const token =
      await createCustomerToken(
        user
      );

    // ========================================================
    // COOKIE
    // ========================================================

    const cookieStore =
      await cookies();

    cookieStore.set(
      CUSTOMER_COOKIE_NAME,
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        maxAge:
          60 *
          60 *
          24 *
          7,
      }
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Account created successfully.",

        needsBranchSelection:
          true,

        user: {
          id:
            user._id.toString(),

          name:
            user.name,

          email:
            user.email,

          phone:
            user.phone || "",

          city:
            user.city,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CUSTOMER REGISTER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to create account.",
      },
      {
        status: 500,
      }
    );
  }
}