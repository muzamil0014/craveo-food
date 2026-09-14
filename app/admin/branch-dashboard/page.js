// ============================================================
// CRAVEO - BRANCH ADMIN DASHBOARD
// ============================================================

import Link from "next/link";

import {
  Clock3,
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
import Food from "@/models/Food";
import Restaurant from "@/models/Restaurant";

// ============================================================
// FORMAT PRICE
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function BranchDashboardPage() {
  const session =
    await getBranchAdminSession();

  // Layout already protects the route.
  // Session should exist here.

  await connectDB();

  void Restaurant;
  void Food;

  const restaurantId =
    session.restaurantId;

  // ==========================================================
  // DATES
  // ==========================================================

  const now =
    new Date();

  const todayStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  // ==========================================================
  // MAIN COUNTS
  // ==========================================================

  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    deliveredOrders,
    totalFoods,
  ] = await Promise.all([
    Order.countDocuments({
      restaurantId,
    }),

    Order.countDocuments({
      restaurantId,

      createdAt: {
        $gte:
          todayStart,
      },
    }),

    Order.countDocuments({
      restaurantId,

      status: {
        $in: [
          "pending",
          "confirmed",
          "preparing",
        ],
      },
    }),

    Order.countDocuments({
      restaurantId,

      status:
        "delivered",
    }),

    Food.countDocuments({
      restaurantIds:
        restaurantId,
    }),
  ]);

  // ==========================================================
  // TOTAL REVENUE
  // ==========================================================

  const totalRevenueResult =
    await Order.aggregate([
      {
        $match: {
          restaurantId:
            new (
              await import(
                "mongoose"
              )
            ).default.Types.ObjectId(
              restaurantId
            ),

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
    ]);

  const totalRevenue =
    totalRevenueResult[0]
      ?.total || 0;

  // ==========================================================
  // TODAY REVENUE
  // ==========================================================

  const todayRevenueResult =
    await Order.aggregate([
      {
        $match: {
          restaurantId:
            new (
              await import(
                "mongoose"
              )
            ).default.Types.ObjectId(
              restaurantId
            ),

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
    ]);

  const todayRevenue =
    todayRevenueResult[0]
      ?.total || 0;

  // ==========================================================
  // RECENT ORDERS
  // ==========================================================

  const recentOrders =
    await Order.find({
      restaurantId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(6)
      .lean();

  // ==========================================================
  // TOP FOODS
  // ==========================================================

  const mongoose =
    await import(
      "mongoose"
    );

  const branchObjectId =
    new mongoose.default.Types.ObjectId(
      restaurantId
    );

  const topFoods =
    await Order.aggregate([
      {
        $match: {
          restaurantId:
            branchObjectId,

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

          image: {
            $first:
              "$items.image",
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
    ]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="branch-dashboard-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="branch-dashboard-header">
        <div>
          <span>
            BRANCH OVERVIEW
          </span>

          <h1>
            Welcome,{" "}
            {session.name}
          </h1>

          <p>
            Monitor sales, orders and
            food performance for your
            assigned CRAVEO branch.
          </p>
        </div>
      </div>

      {/* ======================================================
          PRIMARY STATS
      ====================================================== */}

      <section className="branch-dashboard-stat-grid">
        <div className="branch-dashboard-stat-card featured">
          <div className="branch-dashboard-stat-icon">
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

        <div className="branch-dashboard-stat-card">
          <div className="branch-dashboard-stat-icon">
            <TrendingUp
              size={21}
            />
          </div>

          <div>
            <span>
              Today's Revenue
            </span>

            <strong>
              {formatPrice(
                todayRevenue
              )}
            </strong>
          </div>
        </div>

        <div className="branch-dashboard-stat-card">
          <div className="branch-dashboard-stat-icon">
            <ShoppingBag
              size={21}
            />
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {totalOrders}
            </strong>
          </div>
        </div>

        <div className="branch-dashboard-stat-card">
          <div className="branch-dashboard-stat-icon">
            <UtensilsCrossed
              size={21}
            />
          </div>

          <div>
            <span>
              Branch Foods
            </span>

            <strong>
              {totalFoods}
            </strong>
          </div>
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
            Active Orders
          </span>

          <strong>
            {pendingOrders}
          </strong>
        </div>

        <div>
          <span>
            Delivered
          </span>

          <strong>
            {deliveredOrders}
          </strong>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <section className="branch-dashboard-content-grid">
        {/* ====================================================
            RECENT ORDERS
        ==================================================== */}

        <article className="branch-dashboard-panel">
          <div className="branch-dashboard-panel-heading">
            <div>
              <span>
                ORDERS
              </span>

              <h2>
                Recent Orders
              </h2>
            </div>

            <Link
              href="/admin/branch-dashboard/orders"
            >
              View All
            </Link>
          </div>

          {recentOrders.length >
          0 ? (
            <div className="branch-dashboard-order-list">
              {recentOrders.map(
                (order) => (
                  <div
                    key={
                      order._id.toString()
                    }
                    className="branch-dashboard-order"
                  >
                    <div className="branch-dashboard-order-icon">
                      <ShoppingBag
                        size={17}
                      />
                    </div>

                    <div className="branch-dashboard-order-main">
                      <strong>
                        {
                          order.orderNumber
                        }
                      </strong>

                      <span>
                        {
                          order.customerName
                        }
                      </span>
                    </div>

                    <div className="branch-dashboard-order-total">
                      <strong>
                        {formatPrice(
                          order.total
                        )}
                      </strong>

                      <small>
                        {formatDate(
                          order.createdAt
                        )}
                      </small>
                    </div>

                    <span
                      className={`branch-order-status branch-order-${order.status}`}
                    >
                      {order.status.replaceAll(
                        "-",
                        " "
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="branch-dashboard-empty">
              No branch orders yet.
            </div>
          )}
        </article>

        {/* ====================================================
            TOP FOODS
        ==================================================== */}

        <article className="branch-dashboard-panel">
          <div className="branch-dashboard-panel-heading">
            <div>
              <span>
                FOOD PERFORMANCE
              </span>

              <h2>
                Top Foods
              </h2>
            </div>

            <Link
              href="/admin/branch-dashboard/foods"
            >
              Foods
            </Link>
          </div>

          {topFoods.length >
          0 ? (
            <div className="branch-top-food-list">
              {topFoods.map(
                (
                  food,
                  index
                ) => (
                  <div
                    key={`${food._id || "food"}-${index}`}
                    className="branch-top-food"
                  >
                    <div className="branch-top-food-rank">
                      {index + 1}
                    </div>

                    <div className="branch-top-food-info">
                      <strong>
                        {food.name ||
                          "Unknown Food"}
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
              No food sales data yet.
            </div>
          )}
        </article>
      </section>
    </main>
  );
}