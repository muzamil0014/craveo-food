// ============================================================
// CRAVEO - BRANCH CUSTOMERS PAGE
// ============================================================

import Link from "next/link";

import {
  Eye,
  ShoppingBag,
  UserRound,
  UsersRound,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";
import { getBranchAdminSession } from "@/lib/auth";

import Order from "@/models/Order";
import User from "@/models/User";
// ============================================================
// FORCE DYNAMIC
// BRANCH ADMIN DEPENDS ON AUTH COOKIES
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// HELPERS
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function BranchCustomersPage() {
  const session =
    await getBranchAdminSession();

  await connectDB();

  // ==========================================================
  // GET ALL REGISTERED CUSTOMER IDS WHO ORDERED FROM THIS BRANCH
  // ==========================================================

  const customerIds =
    await Order.distinct(
      "userId",
      {
        restaurantId:
          session.restaurantId,

        userId: {
          $ne: null,
        },
      }
    );

  // ==========================================================
  // LOAD CUSTOMERS
  // ==========================================================

  const customers =
    await User.find({
      _id: {
        $in:
          customerIds,
      },

      role:
        "customer",
    })
      .select(
        "name email phone isActive isVerified createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

  // ==========================================================
  // LOAD BRANCH ORDER SUMMARY
  // ==========================================================

  const summaries =
    await Order.aggregate([
      {
        $match: {
          restaurantId:
            new (
              await import(
                "mongoose"
              )
            ).default.Types.ObjectId(
              session.restaurantId
            ),

          userId: {
            $ne: null,
          },
        },
      },

      {
        $group: {
          _id:
            "$userId",

          totalOrders: {
            $sum: 1,
          },

          totalSpent: {
            $sum: {
              $cond: [
                {
                  $ne: [
                    "$status",
                    "cancelled",
                  ],
                },
                "$total",
                0,
              ],
            },
          },

          lastOrderAt: {
            $max:
              "$createdAt",
          },
        },
      },
    ]);

  const summaryMap =
    new Map(
      summaries.map(
        (item) => [
          item._id.toString(),
          item,
        ]
      )
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
            CUSTOMER MANAGEMENT
          </span>

          <h1>
            Branch Customers
          </h1>

          <p>
            Customers who have placed
            orders at your assigned branch.
          </p>
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <section className="branch-customer-summary">
        <div>
          <UsersRound size={20} />

          <span>
            Total Customers
          </span>

          <strong>
            {customers.length}
          </strong>
        </div>

        <div>
          <UserRound size={20} />

          <span>
            Active Customers
          </span>

          <strong>
            {
              customers.filter(
                (customer) =>
                  customer.isActive !==
                  false
              ).length
            }
          </strong>
        </div>

        <div>
          <ShoppingBag size={20} />

          <span>
            Branch Orders
          </span>

          <strong>
            {summaries.reduce(
              (
                total,
                item
              ) =>
                total +
                item.totalOrders,
              0
            )}
          </strong>
        </div>
      </section>

      {/* ======================================================
          CUSTOMER TABLE
      ====================================================== */}

      <section className="branch-table-card">
        {customers.length > 0 ? (
          <div className="branch-table-wrapper">
            <table className="branch-table">
              <thead>
                <tr>
                  <th>
                    Customer
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Orders
                  </th>

                  <th>
                    Spent
                  </th>

                  <th>
                    Last Order
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map(
                  (customer) => {
                    const summary =
                      summaryMap.get(
                        customer._id.toString()
                      );

                    return (
                      <tr
                        key={
                          customer._id.toString()
                        }
                      >
                        <td>
                          <div className="branch-customer-cell">
                            <div className="branch-customer-avatar">
                              {customer.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "C"}
                            </div>

                            <div>
                              <strong>
                                {
                                  customer.name
                                }
                              </strong>

                              <span>
                                {
                                  customer.email
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {customer.phone ||
                            "-"}
                        </td>

                        <td>
                          {summary?.totalOrders ||
                            0}
                        </td>

                        <td>
                          {formatPrice(
                            summary?.totalSpent ||
                              0
                          )}
                        </td>

                        <td>
                          {formatDate(
                            summary?.lastOrderAt
                          )}
                        </td>

                        <td>
                          <span
                            className={`branch-customer-status ${
                              customer.isActive !==
                              false
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {customer.isActive !==
                            false
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <Link
                            href={`/admin/branch-dashboard/customers/${customer._id}`}
                            className="branch-table-view-btn"
                          >
                            <Eye size={14} />

                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="branch-module-empty">
            <UsersRound size={42} />

            <h2>
              No Customers
            </h2>

            <p>
              No registered customers have
              ordered from this branch yet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}