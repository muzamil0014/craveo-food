// ============================================================
// CRAVEO - SINGLE BRANCH ADMIN API
//
// GET    /api/admin/branch-admins/[id]
// PUT    /api/admin/branch-admins/[id]
// DELETE /api/admin/branch-admins/[id]
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
// GET
// ============================================================

export async function GET(
  request,
  { params }
) {
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

    const { id } =
      await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid admin ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    void Restaurant;

    const admin =
      await Admin.findOne({
        _id: id,
        role: "branch-admin",
      })
        .select("-password")
        .populate(
          "restaurantId",
          "name city area isActive"
        )
        .lean();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Branch Admin not found.",
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
      "GET BRANCH ADMIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load Branch Admin.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// UPDATE
// ============================================================

export async function PUT(
  request,
  { params }
) {
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

    const { id } =
      await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid admin ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const admin =
      await Admin.findOne({
        _id: id,
        role: "branch-admin",
      })
        .select(
          "+password"
        );

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Branch Admin not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await request.json();

    // ========================================================
    // QUICK STATUS UPDATE
    // ========================================================

    if (
      Object.keys(body).length ===
        1 &&
      typeof body.isActive ===
        "boolean"
    ) {
      admin.isActive =
        body.isActive;

      await admin.save();

      return NextResponse.json({
        success: true,

        message:
          admin.isActive
            ? "Branch Admin activated."
            : "Branch Admin deactivated.",

        admin: {
          id:
            admin._id.toString(),

          isActive:
            admin.isActive,
        },
      });
    }

    // ========================================================
    // FULL UPDATE
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

    const restaurantId =
      body.restaurantId
        ?.toString();

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Name and email are required.",
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
            "Selected branch not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // CHECK DUPLICATE EMAIL
    // ========================================================

    const duplicate =
      await Admin.findOne({
        _id: {
          $ne: admin._id,
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

    admin.name = name;
    admin.email = email;
    admin.phone = phone;

    admin.restaurantId =
      restaurantId;

    admin.isActive =
      body.isActive !==
      false;

    // ========================================================
    // OPTIONAL NEW PASSWORD
    // ========================================================

    const newPassword =
      body.password
        ?.toString()
        .trim();

    if (newPassword) {
      if (
        newPassword.length < 8
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

      admin.password =
        await bcrypt.hash(
          newPassword,
          12
        );
    }

    await admin.save();

    return NextResponse.json({
      success: true,

      message:
        "Branch Admin updated successfully.",
    });
  } catch (error) {
    console.error(
      "UPDATE BRANCH ADMIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update Branch Admin.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE
// ============================================================

export async function DELETE(
  request,
  { params }
) {
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

    const { id } =
      await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid admin ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const admin =
      await Admin.findOneAndDelete({
        _id: id,
        role: "branch-admin",
      });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Branch Admin not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Branch Admin deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE BRANCH ADMIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to delete Branch Admin.",
      },
      {
        status: 500,
      }
    );
  }
}