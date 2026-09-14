// ============================================================
// CRAVEO - BRANCH ADMIN PROFILE API
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getBranchAdminSession,
} from "@/lib/auth";

import Admin from "@/models/Admin";
import Restaurant from "@/models/Restaurant";

// ============================================================
// GET
// ============================================================

export async function GET() {
  try {
    const session =
      await getBranchAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    void Restaurant;

    const admin =
      await Admin.findOne({
        _id:
          session.adminId,

        role:
          "branch-admin",

        restaurantId:
          session.restaurantId,

        isActive:
          true,
      })
        .select(
          "-password"
        )
        .populate(
          "restaurantId",
          "name city area address phone email branchType isActive"
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
      "BRANCH PROFILE GET ERROR:",
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
// PUT - UPDATE OWN PROFILE
// ============================================================

export async function PUT(request) {
  try {
    const session =
      await getBranchAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
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

    const phone =
      body.phone
        ?.toString()
        .trim() || "";

    // ========================================================
    // IMPORTANT:
    //
    // Branch Admin cannot change:
    // email
    // role
    // restaurantId
    // isActive
    //
    // Those belong to Super Admin.
    // ========================================================

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

    const admin =
      await Admin.findOneAndUpdate(
        {
          _id:
            session.adminId,

          role:
            "branch-admin",

          restaurantId:
            session.restaurantId,

          isActive:
            true,
        },
        {
          $set: {
            name,
            phone,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select(
          "-password"
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

      message:
        "Profile updated successfully.",

      admin,
    });
  } catch (error) {
    console.error(
      "BRANCH PROFILE UPDATE ERROR:",
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