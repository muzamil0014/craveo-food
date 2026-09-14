// ============================================================
// CRAVEO - BRANCH COMPLAINT API
// ============================================================

import mongoose from "mongoose";

import {
  NextResponse,
} from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getBranchAdminSession } from "@/lib/auth";

import Complaint from "@/models/Complaint";

// ============================================================
// VALUES
// ============================================================

const VALID_STATUSES = [
  "open",
  "in-progress",
  "resolved",
  "closed",
];

const VALID_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
];

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
            "Invalid complaint ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const status =
      body.status
        ?.toString();

    const priority =
      body.priority
        ?.toString();

    const adminReply =
      body.adminReply
        ?.toString()
        .trim() || "";

    if (
      !VALID_STATUSES.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid complaint status.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !VALID_PRIORITIES.includes(
        priority
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid priority.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // ========================================================
    // OWN BRANCH ONLY
    // ========================================================

    const complaint =
      await Complaint.findOne({
        _id: id,

        restaurantId:
          session.restaurantId,
      });

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Complaint not found.",
        },
        {
          status: 404,
        }
      );
    }

    const oldStatus =
      complaint.status;

    complaint.status =
      status;

    complaint.priority =
      priority;

    complaint.adminReply =
      adminReply;

    // ========================================================
    // REPLY DATE
    // ========================================================

    if (adminReply) {
      complaint.repliedAt =
        new Date();
    }

    // ========================================================
    // STATUS DATES
    // ========================================================

    if (
      status ===
        "resolved" &&
      oldStatus !==
        "resolved"
    ) {
      complaint.resolvedAt =
        new Date();
    }

    if (
      status ===
        "closed" &&
      oldStatus !==
        "closed"
    ) {
      complaint.closedAt =
        new Date();
    }

    await complaint.save();

    return NextResponse.json({
      success: true,

      message:
        "Complaint updated successfully.",
    });
  } catch (error) {
    console.error(
      "BRANCH COMPLAINT UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update complaint.",
      },
      {
        status: 500,
      }
    );
  }
}