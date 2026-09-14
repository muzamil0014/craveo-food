// ============================================================
// CRAVEO - BRANCH ADMINS API
//
// GET  /api/admin/branch-admins
// POST /api/admin/branch-admins
// ============================================================

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import {
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getAdminSession,
} from "@/lib/auth";

import Admin from "@/models/Admin";
import Restaurant from "@/models/Restaurant";

// ============================================================
// SUPER ADMIN AUTH
// ============================================================

async function requireSuperAdmin() {
  const session =
    await getAdminSession();

  if (
    !session ||
    session.role !== "super-admin"
  ) {
    return null;
  }

  return session;
}

// ============================================================
// GET BRANCH ADMINS
// ============================================================

export async function GET() {
  try {
    const session =
      await requireSuperAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    void Restaurant;

    const admins =
      await Admin.find({
        role: "branch-admin",
      })
        .select("-password")
        .populate(
          "restaurantId",
          "name city area isActive"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error(
      "GET BRANCH ADMINS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load branch admins.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// CREATE BRANCH ADMIN
// ============================================================

export async function POST(request) {
  try {
    const session =
      await requireSuperAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const body =
      await request.json();

    // ========================================================
    // VALUES
    // ========================================================

    const name =
      body.name
        ?.toString()
        .trim();

    const email =
      body.email
        ?.toString()
        .trim()
        .toLowerCase();

    const phone =
      body.phone
        ?.toString()
        .trim() || "";

    const password =
      body.password
        ?.toString();

    const restaurantId =
      body.restaurantId
        ?.toString();

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin email is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !password ||
      password.length < 8
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Password must contain at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        restaurantId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid branch is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // CHECK BRANCH
    // ========================================================

    const restaurant =
      await Restaurant.findById(
        restaurantId
      );

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected branch does not exist.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      restaurant.isActive === false
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot assign an inactive branch.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // DUPLICATE EMAIL
    // ========================================================

    const existingAdmin =
      await Admin.findOne({
        email,
      });

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,

          message:
            "An admin with this email already exists.",
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
    // CREATE
    // ========================================================

    const admin =
      await Admin.create({
        name,
        email,
        phone,

        password:
          hashedPassword,

        role:
          "branch-admin",

        restaurantId,

        isActive:
          body.isActive !==
          false,
      });

    return NextResponse.json(
      {
        success: true,

        message:
          "Branch Admin created successfully.",

        admin: {
          id:
            admin._id.toString(),

          name:
            admin.name,

          email:
            admin.email,

          restaurantId:
            admin.restaurantId.toString(),
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE BRANCH ADMIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to create Branch Admin.",
      },
      {
        status: 500,
      }
    );
  }
}