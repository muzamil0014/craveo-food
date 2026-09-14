// ============================================================
// CRAVEO - ADMIN ANALYTICS API
//
// GET /api/admin/analytics
// ============================================================

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import Order from "@/models/Order";
import User from "@/models/User";
import Food from "@/models/Food";
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
// GET ANALYTICS
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

    // ========================================================
    // DATE RANGES
    // ========================================================

    const now =
      new Date();

    const startOfToday =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

    const startOfWeek =
      new Date(
        startOfToday
      );

    startOfWeek.setDate(
      startOfWeek.getDate() - 6
    );

    const startOfMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

    const startOfYear =
      new Date(
        now.getFullYear(),
        0,
        1
      );

    // ========================================================
    // GENERAL COUNTS
    // ========================================================

    const [
      totalOrders,
      totalCustomers,
      totalFoods,
      totalBranches,
    ] = await Promise.all([
      Order.countDocuments(),

      User.countDocuments({
        role: "customer",
      }),

      Food.countDocuments(),

      Restaurant.countDocuments(),
    ]);

    // ========================================================
    // REVENUE
    // ========================================================

    const totalRevenueResult =
      await Order.aggregate([
        {
          $match: {
            status: {
              $ne: "cancelled",
            },
          },
        },

        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: "$total",
            },
          },
        },
      ]);

    const totalRevenue =
      totalRevenueResult[0]
        ?.totalRevenue || 0;

    // ========================================================
    // TODAY REVENUE
    // ========================================================

    const todayRevenueResult =
      await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfToday,
            },

            status: {
              $ne: "cancelled",
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$total",
            },
          },
        },
      ]);

    const todayRevenue =
      todayRevenueResult[0]
        ?.total || 0;

    // ========================================================
    // WEEK REVENUE
    // ========================================================

    const weeklyRevenueResult =
      await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfWeek,
            },

            status: {
              $ne: "cancelled",
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$total",
            },
          },
        },
      ]);

    const weeklyRevenue =
      weeklyRevenueResult[0]
        ?.total || 0;

    // ========================================================
    // MONTH REVENUE
    // ========================================================

    const monthlyRevenueResult =
      await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
            },

            status: {
              $ne: "cancelled",
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$total",
            },
          },
        },
      ]);

    const monthlyRevenue =
      monthlyRevenueResult[0]
        ?.total || 0;

    // ========================================================
    // DAILY SALES - LAST 7 DAYS
    // ========================================================

    const dailySalesRaw =
      await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfWeek,
            },

            status: {
              $ne: "cancelled",
            },
          },
        },

        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },

              month: {
                $month: "$createdAt",
              },

              day: {
                $dayOfMonth:
                  "$createdAt",
              },
            },

            revenue: {
              $sum: "$total",
            },

            orders: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.day": 1,
          },
        },
      ]);

    // --------------------------------------------------------
    // FILL MISSING DAYS
    // --------------------------------------------------------

    const dailySales = [];

    for (
      let i = 0;
      i < 7;
      i++
    ) {
      const date =
        new Date(startOfWeek);

      date.setDate(
        startOfWeek.getDate() + i
      );

      const found =
        dailySalesRaw.find(
          (item) =>
            item._id.year ===
              date.getFullYear() &&
            item._id.month ===
              date.getMonth() + 1 &&
            item._id.day ===
              date.getDate()
        );

      dailySales.push({
        label:
          date.toLocaleDateString(
            "en-PK",
            {
              weekday: "short",
            }
          ),

        revenue:
          found?.revenue || 0,

        orders:
          found?.orders || 0,
      });
    }

    // ========================================================
    // MONTHLY SALES - CURRENT YEAR
    // ========================================================

    const monthlySalesRaw =
      await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfYear,
            },

            status: {
              $ne: "cancelled",
            },
          },
        },

        {
          $group: {
            _id: {
              month: {
                $month: "$createdAt",
              },
            },

            revenue: {
              $sum: "$total",
            },

            orders: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlySales =
      monthNames.map(
        (label, index) => {
          const found =
            monthlySalesRaw.find(
              (item) =>
                item._id.month ===
                index + 1
            );

          return {
            label,

            revenue:
              found?.revenue || 0,

            orders:
              found?.orders || 0,
          };
        }
      );

    // ========================================================
    // ORDER STATUS ANALYTICS
    // ========================================================

    const orderStatuses =
      await Order.aggregate([
        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const orderStatusData =
      orderStatuses.map(
        (item) => ({
          name:
            item._id
              ?.replaceAll(
                "-",
                " "
              ) || "Unknown",

          value:
            item.count,
        })
      );

    // ========================================================
    // CUSTOMER GROWTH
    // ========================================================

    const customerGrowthRaw =
      await User.aggregate([
        {
          $match: {
            role: "customer",

            createdAt: {
              $gte: startOfYear,
            },
          },
        },

        {
          $group: {
            _id: {
              month: {
                $month: "$createdAt",
              },
            },

            customers: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);

    const customerGrowth =
      monthNames.map(
        (label, index) => {
          const found =
            customerGrowthRaw.find(
              (item) =>
                item._id.month ===
                index + 1
            );

          return {
            label,

            customers:
              found?.customers ||
              0,
          };
        }
      );

    // ========================================================
    // TOP FOODS
    // ========================================================

    const topFoods =
      await Order.aggregate([
        {
          $unwind: "$items",
        },

        {
          $group: {
            _id: "$items.foodId",

            name: {
              $first: "$items.name",
            },

            quantity: {
              $sum:
                "$items.quantity",
            },

            revenue: {
              $sum:
                "$items.lineTotal",
            },
          },
        },

        {
          $sort: {
            quantity: -1,
          },
        },

        {
          $limit: 8,
        },
      ]);

    // ========================================================
    // BRANCH PERFORMANCE
    // ========================================================

    const branchPerformance =
      await Order.aggregate([
        {
          $match: {
            restaurantId: {
              $ne: null,
            },
          },
        },

        {
          $group: {
            _id: "$restaurantId",

            orders: {
              $sum: 1,
            },

            revenue: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "cancelled",
                    ],
                  },
                  0,
                  "$total",
                ],
              },
            },
          },
        },

        {
          $lookup: {
            from: "restaurants",

            localField: "_id",

            foreignField: "_id",

            as: "restaurant",
          },
        },

        {
          $unwind: {
            path: "$restaurant",

            preserveNullAndEmptyArrays:
              true,
          },
        },

        {
          $project: {
            _id: 1,

            name: {
              $ifNull: [
                "$restaurant.name",
                "Unknown Branch",
              ],
            },

            city: {
              $ifNull: [
                "$restaurant.city",
                "",
              ],
            },

            orders: 1,

            revenue: 1,
          },
        },

        {
          $sort: {
            revenue: -1,
          },
        },

        {
          $limit: 10,
        },
      ]);

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      summary: {
        totalRevenue,
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,

        totalOrders,
        totalCustomers,
        totalFoods,
        totalBranches,
      },

      dailySales,
      monthlySales,
      orderStatusData,
      customerGrowth,
      topFoods,
      branchPerformance,
    });
  } catch (error) {
    console.error(
      "ANALYTICS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load analytics.",
      },
      {
        status: 500,
      }
    );
  }
}