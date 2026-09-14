// ============================================================
// CRAVEO - BRANCH ANALYTICS PAGE
// ============================================================

import mongoose from "mongoose";

import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getBranchAdminSession,
} from "@/lib/auth";

import Order from "@/models/Order";

import BranchAnalyticsCharts from "@/components/admin/branch/BranchAnalyticsCharts";
// ============================================================
// FORCE DYNAMIC
// BRANCH ADMIN DEPENDS ON AUTH COOKIES
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// FORMAT PRICE
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// MONTH NAMES
// ============================================================

const MONTHS = [
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

// ============================================================
// PAGE
// ============================================================

export default async function BranchAnalyticsPage() {
  const session =
    await getBranchAdminSession();

  await connectDB();

  const restaurantId =
    new mongoose.Types.ObjectId(
      session.restaurantId
    );

  const now =
    new Date();

  // ==========================================================
  // DATE RANGES
  // ==========================================================

  const todayStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const sevenDaysAgo =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    );

  const fourWeeksAgo =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 27
    );

  const yearStart =
    new Date(
      now.getFullYear(),
      0,
      1
    );

  // ==========================================================
  // MAIN DATA
  // ==========================================================

  const [
    totalOrders,
    deliveredOrders,
    todayOrders,
    totalRevenueResult,
    todayRevenueResult,
    topFoods,
    dailyResult,
    weeklyResult,
    monthlyResult,
  ] = await Promise.all([
    // --------------------------------------------------------
    // TOTAL ORDERS
    // --------------------------------------------------------

    Order.countDocuments({
      restaurantId,
    }),

    // --------------------------------------------------------
    // DELIVERED ORDERS
    // --------------------------------------------------------

    Order.countDocuments({
      restaurantId,

      status:
        "delivered",
    }),

    // --------------------------------------------------------
    // TODAY ORDERS
    // --------------------------------------------------------

    Order.countDocuments({
      restaurantId,

      createdAt: {
        $gte:
          todayStart,
      },
    }),

    // --------------------------------------------------------
    // TOTAL REVENUE
    // --------------------------------------------------------

    Order.aggregate([
      {
        $match: {
          restaurantId,

          status: {
            $ne:
              "cancelled",
          },
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum:
              "$total",
          },
        },
      },
    ]),

    // --------------------------------------------------------
    // TODAY REVENUE
    // --------------------------------------------------------

    Order.aggregate([
      {
        $match: {
          restaurantId,

          createdAt: {
            $gte:
              todayStart,
          },

          status: {
            $ne:
              "cancelled",
          },
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum:
              "$total",
          },
        },
      },
    ]),

    // --------------------------------------------------------
    // TOP FOODS
    // --------------------------------------------------------

    Order.aggregate([
      {
        $match: {
          restaurantId,

          status: {
            $ne:
              "cancelled",
          },
        },
      },

      {
        $unwind:
          "$items",
      },

      {
        $group: {
          _id:
            "$items.foodId",

          name: {
            $first:
              "$items.name",
          },

          sold: {
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
          sold: -1,
        },
      },

      {
        $limit: 5,
      },
    ]),

    // --------------------------------------------------------
    // DAILY
    // --------------------------------------------------------

    Order.aggregate([
      {
        $match: {
          restaurantId,

          createdAt: {
            $gte:
              sevenDaysAgo,
          },

          status: {
            $ne:
              "cancelled",
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format:
                "%Y-%m-%d",

              date:
                "$createdAt",
            },
          },

          revenue: {
            $sum:
              "$total",
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]),

    // --------------------------------------------------------
    // WEEKLY
    // --------------------------------------------------------

    Order.aggregate([
      {
        $match: {
          restaurantId,

          createdAt: {
            $gte:
              fourWeeksAgo,
          },

          status: {
            $ne:
              "cancelled",
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $isoWeekYear:
                "$createdAt",
            },

            week: {
              $isoWeek:
                "$createdAt",
            },
          },

          revenue: {
            $sum:
              "$total",
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.week": 1,
        },
      },
    ]),

    // --------------------------------------------------------
    // MONTHLY
    // --------------------------------------------------------

    Order.aggregate([
      {
        $match: {
          restaurantId,

          createdAt: {
            $gte:
              yearStart,
          },

          status: {
            $ne:
              "cancelled",
          },
        },
      },

      {
        $group: {
          _id: {
            month: {
              $month:
                "$createdAt",
            },
          },

          revenue: {
            $sum:
              "$total",
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
    ]),
  ]);

  // ==========================================================
  // MAIN VALUES
  // ==========================================================

  const totalRevenue =
    totalRevenueResult[0]
      ?.total || 0;

  const todayRevenue =
    todayRevenueResult[0]
      ?.total || 0;

  const averageOrder =
    totalOrders > 0
      ? totalRevenue /
        totalOrders
      : 0;

  // ==========================================================
  // DAILY COMPLETE DATA
  // ==========================================================

  const dailyMap =
    new Map(
      dailyResult.map(
        (item) => [
          item._id,
          item,
        ]
      )
    );

  const dailyData =
    Array.from(
      {
        length: 7,
      },
      (
        _,
        index
      ) => {
        const date =
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() -
              (6 - index)
          );

        const key =
          `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(
            2,
            "0"
          )}-${String(
            date.getDate()
          ).padStart(
            2,
            "0"
          )}`;

        const item =
          dailyMap.get(
            key
          );

        return {
          label:
            date.toLocaleDateString(
              "en-PK",
              {
                weekday:
                  "short",
              }
            ),

          revenue:
            item?.revenue ||
            0,

          orders:
            item?.orders ||
            0,
        };
      }
    );

  // ==========================================================
  // WEEKLY DATA
  // ==========================================================

  const weeklyData =
    weeklyResult.map(
      (
        item,
        index
      ) => ({
        label:
          `Week ${index + 1}`,

        revenue:
          item.revenue || 0,

        orders:
          item.orders || 0,
      })
    );

  // ==========================================================
  // MONTHLY DATA
  // ==========================================================

  const monthlyMap =
    new Map(
      monthlyResult.map(
        (item) => [
          item._id.month,
          item,
        ]
      )
    );

  const monthlyData =
    MONTHS.map(
      (
        month,
        index
      ) => {
        const item =
          monthlyMap.get(
            index + 1
          );

        return {
          label:
            month,

          revenue:
            item?.revenue ||
            0,

          orders:
            item?.orders ||
            0,
        };
      }
    );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="branch-module-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="branch-module-header">
        <div>
          <span>
            PERFORMANCE
          </span>

          <h1>
            Branch Analytics
          </h1>

          <p>
            Daily, weekly and monthly
            branch performance.
          </p>
        </div>
      </div>

      {/* ======================================================
          STATS
      ====================================================== */}

      <section className="branch-analytics-stats">
        <div>
          <DollarSign
            size={20}
          />

          <span>
            Total Revenue
          </span>

          <strong>
            {formatPrice(
              totalRevenue
            )}
          </strong>
        </div>

        <div>
          <TrendingUp
            size={20}
          />

          <span>
            Today's Revenue
          </span>

          <strong>
            {formatPrice(
              todayRevenue
            )}
          </strong>
        </div>

        <div>
          <ShoppingBag
            size={20}
          />

          <span>
            Total Orders
          </span>

          <strong>
            {totalOrders}
          </strong>
        </div>

        <div>
          <UtensilsCrossed
            size={20}
          />

          <span>
            Average Order
          </span>

          <strong>
            {formatPrice(
              averageOrder
            )}
          </strong>
        </div>
      </section>

      {/* ======================================================
          SECONDARY STATS
      ====================================================== */}

      <section className="branch-dashboard-mini-grid">
        <div>
          <span>
            Today's Orders
          </span>

          <strong>
            {todayOrders}
          </strong>
        </div>

        <div>
          <span>
            Delivered Orders
          </span>

          <strong>
            {deliveredOrders}
          </strong>
        </div>

        <div>
          <span>
            Top Food
          </span>

          <strong>
            {topFoods[0]
              ?.name ||
              "-"}
          </strong>
        </div>
      </section>

      {/* ======================================================
          CHARTS
      ====================================================== */}

      <BranchAnalyticsCharts
        dailyData={
          dailyData
        }
        weeklyData={
          weeklyData
        }
        monthlyData={
          monthlyData
        }
      />

      {/* ======================================================
          TOP FOODS
      ====================================================== */}

      <section className="branch-analytics-panel branch-top-food-analytics">
        <div className="branch-detail-heading">
          <UtensilsCrossed
            size={18}
          />

          <div>
            <span>
              FOOD PERFORMANCE
            </span>

            <h2>
              Top Selling Foods
            </h2>
          </div>
        </div>

        {topFoods.length > 0 ? (
          <div className="branch-top-food-list">
            {topFoods.map(
              (
                food,
                index
              ) => (
                <div
                  key={`${food._id}-${index}`}
                  className="branch-top-food"
                >
                  <div className="branch-top-food-rank">
                    {index + 1}
                  </div>

                  <div className="branch-top-food-info">
                    <strong>
                      {food.name}
                    </strong>

                    <span>
                      {food.sold} sold
                    </span>
                  </div>

                  <strong className="branch-top-food-revenue">
                    {formatPrice(
                      food.revenue
                    )}
                  </strong>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="branch-dashboard-empty">
            No sales data yet.
          </div>
        )}
      </section>
    </main>
  );
}