// ============================================================
// CRAVEO - SUPER ADMIN DASHBOARD
// ============================================================

import {
  BadgeDollarSign,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  ArrowRight,
  Store,
} from "lucide-react";

import Link from "next/link";

import { connectDB } from "@/lib/mongodb";

import Order from "@/models/Order";
import User from "@/models/User";
import Food from "@/models/Food";
import Restaurant from "@/models/Restaurant";

import DashboardCard from "@/components/admin/DashboardCard";
import SalesChart from "@/components/admin/SalesChart";

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
// FORMAT CURRENCY
// ============================================================

function formatCurrency(value = 0) {
  return `Rs. ${Number(value).toLocaleString()}`;
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

// ============================================================
// DASHBOARD PAGE
// ============================================================

export default async function AdminDashboardPage() {
  // ==========================================================
  // CONNECT DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // BASIC DASHBOARD STATISTICS
  // ==========================================================

  const [
    revenueResult,
    totalOrders,
    totalCustomers,
    totalFoods,
  ] = await Promise.all([
    Order.aggregate([
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
    ]),

    Order.countDocuments(),

    User.countDocuments(),

    Food.countDocuments(),
  ]);

  const totalRevenue =
    revenueResult[0]?.totalRevenue || 0;

  // ==========================================================
  // SALES CHART - CURRENT YEAR
  // ==========================================================

  const currentYear =
    new Date().getFullYear();

  const yearlySales =
    await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(
              currentYear,
              0,
              1
            ),

            $lt: new Date(
              currentYear + 1,
              0,
              1
            ),
          },

          status: {
            $ne: "cancelled",
          },
        },
      },

      {
        $group: {
          _id: {
            $month: "$createdAt",
          },

          revenue: {
            $sum: "$total",
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

  const salesMap =
    new Map(
      yearlySales.map(
        (item) => [
          item._id,
          item.revenue,
        ]
      )
    );

  const salesChartData =
    MONTHS.map(
      (month, index) => ({
        month,

        revenue:
          salesMap.get(
            index + 1
          ) || 0,
      })
    );

  // ==========================================================
  // RECENT ORDERS
  // ==========================================================

  const recentOrders =
    await Order.find()
      .populate(
        "restaurantId",
        "name"
      )
      .sort({
        createdAt: -1,
      })
      .limit(6)
      .lean();

  // ==========================================================
  // TOP FOODS
  // ==========================================================

  const topFoods =
    await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },
        },
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.foodId",

          name: {
            $first:
              "$items.name",
          },

          image: {
            $first:
              "$items.image",
          },

          totalSold: {
            $sum:
              "$items.quantity",
          },

          revenue: {
            $sum:
              "$items.subtotal",
          },
        },
      },

      {
        $sort: {
          totalSold: -1,
        },
      },

      {
        $limit: 5,
      },
    ]);

  // ==========================================================
  // BRANCH PERFORMANCE
  // ==========================================================

  const branchPerformance =
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
          _id:
            "$restaurantId",

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
          revenue: -1,
        },
      },

      {
        $limit: 5,
      },

      {
        $lookup: {
          from:
            Restaurant.collection.name,

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
    ]);

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="admin-dashboard-page">
      {/* ====================================================
          PAGE HEADING
      ==================================================== */}

      <div className="admin-page-heading">
        <div>
          <span>
            CRAVEO CONTROL CENTER
          </span>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Monitor your restaurant network,
            orders and business performance.
          </p>
        </div>

        <div className="admin-dashboard-date">
          {formatDate(new Date())}
        </div>
      </div>

      {/* ====================================================
          DASHBOARD CARDS
      ==================================================== */}

      <section className="admin-stats-grid">
        <DashboardCard
          title="Total Revenue"
          value={formatCurrency(
            totalRevenue
          )}
          subtitle="All-time revenue"
          icon={BadgeDollarSign}
        />

        <DashboardCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          subtitle="Orders received"
          icon={ShoppingBag}
        />

        <DashboardCard
          title="Total Customers"
          value={totalCustomers.toLocaleString()}
          subtitle="Registered customers"
          icon={Users}
        />

        <DashboardCard
          title="Total Foods"
          value={totalFoods.toLocaleString()}
          subtitle="Foods in menu"
          icon={UtensilsCrossed}
        />
      </section>

      {/* ====================================================
          SALES CHART
      ==================================================== */}

      <section className="admin-dashboard-card admin-sales-section">
        <div className="admin-card-heading">
          <div>
            <span>
              SALES PERFORMANCE
            </span>

            <h2>
              Sales Overview
            </h2>

            <p>
              Monthly revenue for{" "}
              {currentYear}.
            </p>
          </div>

          <div className="admin-chart-year">
            {currentYear}
          </div>
        </div>

        <SalesChart
          data={salesChartData}
        />
      </section>

      {/* ====================================================
          RECENT ORDERS
      ==================================================== */}

      <section className="admin-dashboard-card">
        <div className="admin-card-heading admin-card-heading-row">
          <div>
            <span>
              LATEST ACTIVITY
            </span>

            <h2>
              Recent Orders
            </h2>
          </div>

          <Link
            href="/admin/dashboard/orders"
            className="admin-view-all-link"
          >
            View All

            <ArrowRight
              size={16}
            />
          </Link>
        </div>

        <div className="admin-orders-table-wrap">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Branch</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.length >
              0 ? (
                recentOrders.map(
                  (order) => (
                    <tr
                      key={order._id.toString()}
                    >
                      <td>
                        <Link
                          href={`/admin/dashboard/orders/${order._id}`}
                          className="admin-order-number"
                        >
                          #
                          {order.orderNumber ||
                            order._id
                              .toString()
                              .slice(-6)
                              .toUpperCase()}
                        </Link>
                      </td>

                      <td>
                        <div className="admin-table-customer">
                          <div className="admin-table-avatar">
                            {(
                              order.customerName ||
                              "C"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span>
                            {order.customerName ||
                              "Customer"}
                          </span>
                        </div>
                      </td>

                      <td>
                        {order
                          .restaurantId
                          ?.name ||
                          "N/A"}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            order.total
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`admin-status-badge admin-status-${order.status}`}
                        >
                          {order.status
                            ?.replaceAll(
                              "-",
                              " "
                            ) ||
                            "pending"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          order.createdAt
                        )}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="admin-empty-table"
                  >
                    No orders found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ====================================================
          TOP FOODS + BRANCH PERFORMANCE
      ==================================================== */}

      <section className="admin-dashboard-bottom-grid">
        {/* ==================================================
            TOP FOODS
        ================================================== */}

        <div className="admin-dashboard-card">
          <div className="admin-card-heading">
            <span>
              CUSTOMER FAVORITES
            </span>

            <h2>Top Foods</h2>

            <p>
              Best-selling menu items.
            </p>
          </div>

          <div className="admin-ranking-list">
            {topFoods.length >
            0 ? (
              topFoods.map(
                (
                  food,
                  index
                ) => (
                  <div
                    className="admin-ranking-item"
                    key={
                      food._id?.toString() ||
                      `${food.name}-${index}`
                    }
                  >
                    <div className="admin-ranking-number">
                      {index + 1}
                    </div>

                    <div className="admin-ranking-info">
                      <strong>
                        {food.name ||
                          "Food"}
                      </strong>

                      <span>
                        {food.totalSold}
                        {" "}
                        sold
                      </span>
                    </div>

                    <div className="admin-ranking-value">
                      {formatCurrency(
                        food.revenue
                      )}
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="admin-empty-state">
                <UtensilsCrossed
                  size={27}
                />

                <p>
                  Top foods will appear
                  after orders are placed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            BRANCH PERFORMANCE
        ================================================== */}

        <div className="admin-dashboard-card">
          <div className="admin-card-heading">
            <span>
              RESTAURANT NETWORK
            </span>

            <h2>
              Branch Performance
            </h2>

            <p>
              Highest performing branches.
            </p>
          </div>

          <div className="admin-ranking-list">
            {branchPerformance.length >
            0 ? (
              branchPerformance.map(
                (
                  branch,
                  index
                ) => (
                  <div
                    className="admin-ranking-item"
                    key={
                      branch._id?.toString() ||
                      index
                    }
                  >
                    <div className="admin-branch-rank-icon">
                      <Store
                        size={17}
                      />
                    </div>

                    <div className="admin-ranking-info">
                      <strong>
                        {branch
                          .restaurant
                          ?.name ||
                          "Unknown Branch"}
                      </strong>

                      <span>
                        {branch.orders}
                        {" "}
                        orders
                      </span>
                    </div>

                    <div className="admin-ranking-value">
                      {formatCurrency(
                        branch.revenue
                      )}
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="admin-empty-state">
                <Store
                  size={27}
                />

                <p>
                  Branch performance will
                  appear after branch
                  orders are received.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}