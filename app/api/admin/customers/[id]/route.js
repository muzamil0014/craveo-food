// ============================================================
// CRAVEO - SINGLE CUSTOMER API
//
// GET /api/admin/customers/[id]
// PUT /api/admin/customers/[id]
// ============================================================

import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import User from "@/models/User";
import Order from "@/models/Order";
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
// GET CUSTOMER
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
            "Invalid customer ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    void Restaurant;

    const customer =
      await User.findOne({
        _id: id,
        role: "customer",
      })
        .select("-password")
        .lean();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    const orders =
      await Order.find({
        userId: id,
      })
        .populate(
          "restaurantId",
          "name city"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      customer,
      orders,
    });
  } catch (error) {
    console.error(
      "GET CUSTOMER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load customer.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// UPDATE CUSTOMER STATUS
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
            "Invalid customer ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    if (
      typeof body.isActive !==
      "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid customer status is required.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const customer =
      await User.findOne({
        _id: id,
        role: "customer",
      });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    customer.isActive =
      body.isActive;

    await customer.save();

    return NextResponse.json({
      success: true,

      message:
        customer.isActive
          ? "Customer activated successfully."
          : "Customer deactivated successfully.",

      customer: {
        id:
          customer._id.toString(),

        isActive:
          customer.isActive,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE CUSTOMER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update customer.",
      },
      {
        status: 500,
      }
    );
  }
}