// ============================================================
// CRAVEO - ADMIN COMPLAINTS API
//
// GET /api/admin/complaints
// ============================================================

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import Complaint from "@/models/Complaint";
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
// ESCAPE REGEX
// ============================================================

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

// ============================================================
// GET COMPLAINTS
// ============================================================

export async function GET(request) {
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

    void User;
    void Order;
    void Restaurant;

    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status") ||
      "";

    const priority =
      searchParams.get("priority") ||
      "";

    const search =
      searchParams
        .get("search")
        ?.trim() || "";

    // ========================================================
    // QUERY
    // ========================================================

    const query = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      const regex =
        new RegExp(
          escapeRegex(search),
          "i"
        );

      query.$or = [
        {
          complaintNumber: regex,
        },

        {
          customerName: regex,
        },

        {
          customerEmail: regex,
        },

        {
          customerPhone: regex,
        },

        {
          subject: regex,
        },
      ];
    }

    // ========================================================
    // FETCH
    // ========================================================

    const complaints =
      await Complaint.find(query)
        .populate(
          "userId",
          "name email phone"
        )
        .populate(
          "orderId",
          "orderNumber status total"
        )
        .populate(
          "restaurantId",
          "name city area"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      count:
        complaints.length,
      complaints,
    });
  } catch (error) {
    console.error(
      "GET COMPLAINTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to load complaints.",
      },
      {
        status: 500,
      }
    );
  }
}