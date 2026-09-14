// ============================================================
// CRAVEO - BRANCH FOOD SETTINGS API
// ============================================================

import mongoose from "mongoose";

import {
  NextResponse,
} from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getBranchAdminSession } from "@/lib/auth";

import Food from "@/models/Food";
import BranchFoodSetting from "@/models/BranchFoodSetting";

// ============================================================
// PUT
// ============================================================

export async function PUT(
  request,
  { params }
) {
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
            "Invalid food ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // ========================================================
    // SECURITY:
    // FOOD MUST BE ASSIGNED TO LOGGED-IN BRANCH
    // ========================================================

    const food =
      await Food.findOne({
        _id: id,

        restaurantIds:
          session.restaurantId,
      }).lean();

    if (!food) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Food is not assigned to this branch.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await request.json();

    const stock =
      Number(
        body.stock
      );

    if (
      !Number.isFinite(
        stock
      ) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Stock must be 0 or greater.",
        },
        {
          status: 400,
        }
      );
    }

    const isAvailable =
      body.isAvailable ===
      true;

    // ========================================================
    // UPSERT BRANCH-SPECIFIC SETTINGS
    // ========================================================

    const setting =
      await BranchFoodSetting.findOneAndUpdate(
        {
          restaurantId:
            session.restaurantId,

          foodId:
            id,
        },
        {
          $set: {
            isAvailable,
            stock,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    return NextResponse.json({
      success: true,

      message:
        "Branch food settings saved.",

      setting: {
        isAvailable:
          setting.isAvailable,

        stock:
          setting.stock,
      },
    });
  } catch (error) {
    console.error(
      "BRANCH FOOD UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update branch food.",
      },
      {
        status: 500,
      }
    );
  }
}