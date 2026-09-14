// ============================================================
// CRAVEO - SUPER ADMIN PROFILE API
//
// GET /api/admin/profile
// PUT /api/admin/profile
// ============================================================

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import Admin from "@/models/Admin";

// ============================================================
// AUTH
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
// GET PROFILE
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

    const admin =
      await Admin.findOne({
        _id: session.adminId,
        role: "super-admin",
      })
        .select("-password")
        .lean();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Super Admin not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error(
      "GET SUPER ADMIN PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to load profile.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// UPDATE PROFILE
// ============================================================

export async function PUT(request) {
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

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name is required.",
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
            "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const duplicate =
      await Admin.findOne({
        _id: {
          $ne: session.adminId,
        },
        email,
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another admin already uses this email.",
        },
        {
          status: 409,
        }
      );
    }

    const admin =
      await Admin.findOneAndUpdate(
        {
          _id: session.adminId,
          role: "super-admin",
        },
        {
          $set: {
            name,
            email,
            phone,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select("-password")
        .lean();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Super Admin not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Profile updated successfully.",
      admin,
    });
  } catch (error) {
    console.error(
      "UPDATE SUPER ADMIN PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to update profile.",
      },
      {
        status: 500,
      }
    );
  }
}