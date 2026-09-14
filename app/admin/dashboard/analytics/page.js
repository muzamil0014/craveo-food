// ============================================================
// CRAVEO - ANALYTICS DASHBOARD
// ============================================================

import {
  Building2,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";

import Order from "@/models/Order";
import User from "@/models/User";
import Food from "@/models/Food";
import Restaurant from "@/models/Restaurant";

import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

// ============================================================
// FORMAT PRICE
// ============================================================

function formatPrice(
  value
) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// PAGE
// ============================================================

export default async function AnalyticsPage() {
  await connectDB();

  // ==========================================================
  // DATE RANGES
  // ==========================================================

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

  // ==========================================================
  // SUMMARY
  // ==========================================================

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

  // ==========================================================
  // REVENUE SUMMARY
  // ==========================================================

  async function revenueFrom(
    startDate = null
  ) {
    const match = {
      status: {
        $ne: "cancelled",
      },
    };

    if (startDate) {
      match.createdAt = {
        $gte: startDate,
      };
    }

    const result =
      await Order.aggregate([
        {
          $match: match,
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

    return (
      result[0]?.total || 0
    );
  }

  const [
    totalRevenue,
    todayRevenue,
    weeklyRevenue,
    monthlyRevenue,
  ] = await Promise.all([
    revenueFrom(),

    revenueFrom(
      startOfToday
    ),

    revenueFrom(
      startOfWeek
    ),

    revenueFrom(
      startOfMonth
    ),
  ]);

  // ==========================================================
  // DAILY SALES
  // ==========================================================

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
              $year:
                "$createdAt",
            },

            month: {
              $month:
                "$createdAt",
            },

            day: {
              $dayOfMonth:
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
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

  const dailySales = [];

  for (
    let i = 0;
    i < 7;
    i++
  ) {
    const date =
      new Date(
        startOfWeek
      );

    date.setDate(
      startOfWeek.getDate() +
        i
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

  // ==========================================================
  // MONTHLY SALES
  // ==========================================================

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

  const monthlyRaw =
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
    ]);

  const monthlySales =
    monthNames.map(
      (label, index) => {
        const found =
          monthlyRaw.find(
            (item) =>
              item._id.month ===
              index + 1
          );

        return {
          label,

          revenue:
            found?.revenue ||
            0,

          orders:
            found?.orders ||
            0,
        };
      }
    );

  // ==========================================================
  // ORDER STATUS
  // ==========================================================

  const orderStatusRaw =
    await Order.aggregate([
      {
        $group: {
          _id: "$status",

          value: {
            $sum: 1,
          },
        },
      },
    ]);

  const orderStatusData =
    orderStatusRaw.map(
      (item) => ({
        name:
          item._id
            ?.replaceAll(
              "-",
              " "
            ) || "Unknown",

        value:
          item.value,
      })
    );

  // ==========================================================
  // CUSTOMER GROWTH
  // ==========================================================

  const customerRaw =
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
              $month:
                "$createdAt",
            },
          },

          customers: {
            $sum: 1,
          },
        },
      },
    ]);

  const customerGrowth =
    monthNames.map(
      (label, index) => {
        const found =
          customerRaw.find(
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

  // ==========================================================
  // TOP FOODS
  // ==========================================================

  const topFoods =
    await Order.aggregate([
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

  // ==========================================================
  // BRANCH PERFORMANCE
  // ==========================================================

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
          _id:
            "$restaurantId",

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
          from:
            "restaurants",

          localField:
            "_id",

          foreignField:
            "_id",

          as:
            "restaurant",
        },
      },

      {
        $unwind: {
          path:
            "$restaurant",

          preserveNullAndEmptyArrays:
            true,
        },
      },

      {
        $project: {
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

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="analytics-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">
            BUSINESS INTELLIGENCE
          </span>

          <h1>
            CRAVEO Analytics
          </h1>

          <p>
            Track revenue, orders,
            customers, foods and branch
            performance.
          </p>
        </div>
      </div>

      {/* ====================================================
          REVENUE CARDS
      ==================================================== */}

      <section className="analytics-revenue-grid">
        <div className="analytics-stat-card featured">
          <div className="analytics-stat-icon">
            <DollarSign
              size={21}
            />
          </div>

          <div>
            <span>
              Total Revenue
            </span>

            <strong>
              {formatPrice(
                totalRevenue
              )}
            </strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <TrendingUp
              size={21}
            />
          </div>

          <div>
            <span>
              Today
            </span>

            <strong>
              {formatPrice(
                todayRevenue
              )}
            </strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <TrendingUp
              size={21}
            />
          </div>

          <div>
            <span>
              Last 7 Days
            </span>

            <strong>
              {formatPrice(
                weeklyRevenue
              )}
            </strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <TrendingUp
              size={21}
            />
          </div>

          <div>
            <span>
              This Month
            </span>

            <strong>
              {formatPrice(
                monthlyRevenue
              )}
            </strong>
          </div>
        </div>
      </section>

      {/* ====================================================
          SYSTEM COUNTS
      ==================================================== */}

      <section className="analytics-count-grid">
        <div className="analytics-count-card">
          <ShoppingBag
            size={20}
          />

          <div>
            <span>
              Orders
            </span>

            <strong>
              {totalOrders}
            </strong>
          </div>
        </div>

        <div className="analytics-count-card">
          <Users
            size={20}
          />

          <div>
            <span>
              Customers
            </span>

            <strong>
              {totalCustomers}
            </strong>
          </div>
        </div>

        <div className="analytics-count-card">
          <UtensilsCrossed
            size={20}
          />

          <div>
            <span>
              Foods
            </span>

            <strong>
              {totalFoods}
            </strong>
          </div>
        </div>

        <div className="analytics-count-card">
          <Building2
            size={20}
          />

          <div>
            <span>
              Branches
            </span>

            <strong>
              {totalBranches}
            </strong>
          </div>
        </div>
      </section>

      {/* ====================================================
          CHARTS
      ==================================================== */}

      <section className="analytics-chart-grid">
        <AnalyticsCharts
          dailySales={
            dailySales
          }
          monthlySales={
            monthlySales
          }
          orderStatusData={
            orderStatusData
          }
          customerGrowth={
            customerGrowth
          }
        />
      </section>

      {/* ====================================================
          TOP FOODS + BRANCH PERFORMANCE
      ==================================================== */}

      <section className="analytics-bottom-grid">
        {/* TOP FOODS */}

        <article className="analytics-table-card">
          <div className="analytics-card-heading">
            <div>
              <span>
                FOOD ANALYTICS
              </span>

              <h2>
                Top Foods
              </h2>
            </div>
          </div>

          {topFoods.length > 0 ? (
            <div className="analytics-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>
                      Food
                    </th>

                    <th>
                      Sold
                    </th>

                    <th>
                      Revenue
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {topFoods.map(
                    (
                      food,
                      index
                    ) => (
                      <tr
                        key={`${food._id || "food"}-${index}`}
                      >
                        <td>
                          <strong>
                            {food.name ||
                              "Unknown Food"}
                          </strong>
                        </td>

                        <td>
                          {
                            food.quantity
                          }
                        </td>

                        <td>
                          {formatPrice(
                            food.revenue
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="analytics-empty">
              No food sales data yet.
            </div>
          )}
        </article>

        {/* BRANCH PERFORMANCE */}

        <article className="analytics-table-card">
          <div className="analytics-card-heading">
            <div>
              <span>
                BRANCH ANALYTICS
              </span>

              <h2>
                Branch Performance
              </h2>
            </div>
          </div>

          {branchPerformance.length >
          0 ? (
            <div className="analytics-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>
                      Branch
                    </th>

                    <th>
                      Orders
                    </th>

                    <th>
                      Revenue
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {branchPerformance.map(
                    (
                      branch,
                      index
                    ) => (
                      <tr
                        key={`${branch._id || "branch"}-${index}`}
                      >
                        <td>
                          <div className="analytics-branch-cell">
                            <strong>
                              {
                                branch.name
                              }
                            </strong>

                            <span>
                              {
                                branch.city
                              }
                            </span>
                          </div>
                        </td>

                        <td>
                          {
                            branch.orders
                          }
                        </td>

                        <td>
                          {formatPrice(
                            branch.revenue
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="analytics-empty">
              No branch performance data yet.
            </div>
          )}
        </article>
      </section>
    </main>
  );
}