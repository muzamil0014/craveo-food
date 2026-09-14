// ============================================================
// CRAVEO - CUSTOMER COMPLAINTS API
//
// GET  -> CUSTOMER COMPLAINT LIST
// POST -> CREATE COMPLAINT
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  revalidatePath,
} from "next/cache";

import mongoose from "mongoose";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import Complaint from "@/models/Complaint";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// CLEAN TEXT
// ============================================================

function cleanText(
  value,
  maximum = 2000
) {
  return String(
    value || ""
  )
    .trim()
    .slice(
      0,
      maximum
    );
}

// ============================================================
// GENERATE COMPLAINT NUMBER
// ============================================================

function createComplaintNumber() {
  const year =
    new Date().getFullYear();

  const stamp =
    Date.now()
      .toString()
      .slice(-7);

  const random =
    Math.floor(
      100 +
        Math.random() *
          900
    );

  return `CRV-CMP-${year}-${stamp}-${random}`;
}

// ============================================================
// CURRENT CUSTOMER
// ============================================================

async function getCustomer() {
  const session =
    await getCustomerSession();

  if (!session?.userId) {
    return {
      error:
        NextResponse.json(
          {
            success: false,

            message:
              "Please login first.",
          },
          {
            status: 401,
          }
        ),
    };
  }

  const user =
    await User.findOne({
      _id:
        session.userId,

      role:
        "customer",

      isActive:
        true,
    })
      .select(
        "_id name email phone selectedRestaurantId"
      )
      .lean();

  if (!user) {
    return {
      error:
        NextResponse.json(
          {
            success: false,

            message:
              "Customer account not found.",
          },
          {
            status: 401,
          }
        ),
    };
  }

  return {
    user,
  };
}

// ============================================================
// GET
// MY COMPLAINTS
// ============================================================

export async function GET() {
  try {
    await connectDB();

    // ========================================================
    // CUSTOMER
    // ========================================================

    const customerResult =
      await getCustomer();

    if (
      customerResult.error
    ) {
      return customerResult.error;
    }

    const user =
      customerResult.user;

    // ========================================================
    // COMPLAINTS
    // ========================================================

    const complaints =
      await Complaint.find({
        userId:
          user._id,
      })
        .sort({
          createdAt:
            -1,
        })
        .lean();

    // ========================================================
    // CUSTOMER ORDERS
    // ========================================================

    const orders =
      await Order.find({
        userId:
          user._id,
      })
        .select(
          "_id orderNumber status total createdAt"
        )
        .sort({
          createdAt:
            -1,
        })
        .limit(30)
        .lean();

    // ========================================================
    // SERIALIZE
    // ========================================================

    const complaintData =
      complaints.map(
        (
          complaint
        ) => ({
          id:
            complaint._id.toString(),

          complaintNumber:
            complaint.complaintNumber,

          category:
            complaint.category,

          subject:
            complaint.subject,

          message:
            complaint.message,

          priority:
            complaint.priority,

          status:
            complaint.status,

          branchName:
            complaint.branchName ||
            "",

          orderId:
            complaint.orderId
              ?.toString() ||
            "",

          orderNumber:
            complaint.orderNumber ||
            "",

          adminReply:
            complaint.adminReply ||
            "",

          resolvedAt:
            complaint.resolvedAt,

          closedAt:
            complaint.closedAt,

          createdAt:
            complaint.createdAt,

          updatedAt:
            complaint.updatedAt,
        })
      );

    const orderData =
      orders.map(
        (
          order
        ) => ({
          id:
            order._id.toString(),

          orderNumber:
            order.orderNumber,

          status:
            order.status,

          total:
            Number(
              order.total || 0
            ),

          createdAt:
            order.createdAt,
        })
      );

    return NextResponse.json({
      success: true,

      complaints:
        complaintData,

      orders:
        orderData,
    });
  } catch (error) {
    console.error(
      "GET CUSTOMER COMPLAINTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to load complaints.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST
// CREATE COMPLAINT
// ============================================================

export async function POST(
  request
) {
  try {
    await connectDB();

    // ========================================================
    // CUSTOMER
    // ========================================================

    const customerResult =
      await getCustomer();

    if (
      customerResult.error
    ) {
      return customerResult.error;
    }

    const user =
      customerResult.user;

    // ========================================================
    // BODY
    // ========================================================

    const body =
      await request.json();

    const category =
      cleanText(
        body.category,
        30
      ).toLowerCase();

    const subject =
      cleanText(
        body.subject,
        150
      );

    const message =
      cleanText(
        body.message,
        2000
      );

    const priority =
      cleanText(
        body.priority,
        20
      ).toLowerCase();

    const orderId =
      cleanText(
        body.orderId,
        50
      );

    // ========================================================
    // CATEGORY
    // ========================================================

    const allowedCategories =
      [
        "order",
        "delivery",
        "food",
        "payment",
        "refund",
        "account",
        "branch",
        "general",
        "other",
      ];

    if (
      !allowedCategories.includes(
        category
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please select a valid complaint category.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // PRIORITY
    // ========================================================

    const allowedPriorities =
      [
        "low",
        "medium",
        "high",
        "urgent",
      ];

    if (
      !allowedPriorities.includes(
        priority
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please select a valid priority.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // SUBJECT
    // ========================================================

    if (
      subject.length < 3
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please enter complaint subject.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // MESSAGE
    // ========================================================

    if (
      message.length < 5
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please write your complaint message.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // BRANCH
    // ========================================================

    let restaurantId =
      null;

    let branchName =
      "";

    if (
      user.selectedRestaurantId
    ) {
      const branch =
        await Restaurant.findOne({
          _id:
            user.selectedRestaurantId,

          isActive:
            true,
        })
          .select(
            "_id name"
          )
          .lean();

      if (branch) {
        restaurantId =
          branch._id;

        branchName =
          branch.name || "";
      }
    }

    // ========================================================
    // OPTIONAL ORDER
    // ========================================================

    let order =
      null;

    if (orderId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          orderId
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Invalid order selected.",
          },
          {
            status: 400,
          }
        );
      }

      order =
        await Order.findOne({
          _id:
            orderId,

          userId:
            user._id,
        })
          .select(
            "_id orderNumber restaurantId"
          )
          .lean();

      if (!order) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Selected order not found.",
          },
          {
            status: 404,
          }
        );
      }

      // ======================================================
      // ORDER BRANCH OVERRIDES SELECTED BRANCH
      // ======================================================

      if (
        order.restaurantId
      ) {
        const orderBranch =
          await Restaurant.findById(
            order.restaurantId
          )
            .select(
              "_id name"
            )
            .lean();

        if (
          orderBranch
        ) {
          restaurantId =
            orderBranch._id;

          branchName =
            orderBranch.name ||
            "";
        }
      }
    }

    // ========================================================
    // UNIQUE COMPLAINT NUMBER
    // ========================================================

    let complaintNumber =
      createComplaintNumber();

    while (
      await Complaint.exists({
        complaintNumber,
      })
    ) {
      complaintNumber =
        createComplaintNumber();
    }

    // ========================================================
    // CREATE
    // ========================================================

    const complaint =
      await Complaint.create({
        complaintNumber,

        userId:
          user._id,

        customerName:
          user.name || "",

        customerEmail:
          user.email || "",

        customerPhone:
          user.phone || "",

        restaurantId,

        branchName,

        orderId:
          order?._id ||
          null,

        orderNumber:
          order?.orderNumber ||
          "",

        category,

        subject,

        message,

        priority,

        status:
          "pending",

        adminReply:
          "",

        adminNote:
          "",

        resolvedAt:
          null,

        closedAt:
          null,
      });

    // ========================================================
    // REVALIDATE
    // ========================================================

    revalidatePath(
      "/account/complaints"
    );

    revalidatePath(
      "/admin/dashboard/complaints"
    );

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Your support request has been submitted successfully.",

        complaint: {
          id:
            complaint._id.toString(),

          complaintNumber:
            complaint.complaintNumber,

          status:
            complaint.status,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE CUSTOMER COMPLAINT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to submit complaint.",
      },
      {
        status: 500,
      }
    );
  }
}