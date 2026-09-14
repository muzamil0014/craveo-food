// ============================================================
// CRAVEO - ADMIN CUSTOMERS API
//
// GET /api/admin/customers
// ============================================================

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import User from "@/models/User";

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
// GET CUSTOMERS
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

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams
        .get("search")
        ?.trim() || "";

    const status =
      searchParams.get("status") ||
      "";

    // ========================================================
    // QUERY
    // ========================================================

    const query = {
      role: "customer",
    };

    if (status === "active") {
      query.isActive = true;
    }

    if (status === "inactive") {
      query.isActive = false;
    }

    if (search) {
      const regex =
        new RegExp(
          escapeRegex(search),
          "i"
        );

      query.$or = [
        {
          name: regex,
        },
        {
          email: regex,
        },
        {
          phone: regex,
        },
      ];
    }

    // ========================================================
    // FETCH
    // ========================================================

    const customers =
      await User.find(query)
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      count:
        customers.length,
      customers,
    });
  } catch (error) {
    console.error(
      "GET CUSTOMERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load customers.",
      },
      {
        status: 500,
      }
    );
  }
}