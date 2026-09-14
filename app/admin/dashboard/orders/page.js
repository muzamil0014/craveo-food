// ============================================================
// CRAVEO - SUPER ADMIN ORDERS MANAGEMENT
// VIEW + PRINT + QR CONFIRMATION STATUS
// ============================================================

import Link from "next/link";

import {
  CheckCircle2,
  Clock3,
  Eye,
  PackageCheck,
  Printer,
  ShoppingBag,
} from "lucide-react";

import {
  connectDB,
} from "@/lib/mongodb";

import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";

// ============================================================
// FORCE FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

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
// FORMAT DATE
// ============================================================

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-PK",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    new Date(value)
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function OrdersPage({
  searchParams,
}) {
  await connectDB();

  void User;

  const params =
    await searchParams;

  const status =
    params?.status ||
    "";

  const paymentStatus =
    params?.paymentStatus ||
    "";

  const branchId =
    params?.branchId ||
    "";

  const search =
    params?.search?.trim() ||
    "";

  // ==========================================================
  // QUERY
  // ==========================================================

  const query = {};

  if (status) {
    query.status =
      status;
  }

  if (paymentStatus) {
    query.paymentStatus =
      paymentStatus;
  }

  if (branchId) {
    query.restaurantId =
      branchId;
  }

  if (search) {
    query.$or = [
      {
        orderNumber: {
          $regex:
            search,

          $options:
            "i",
        },
      },

      {
        customerName: {
          $regex:
            search,

          $options:
            "i",
        },
      },

      {
        customerEmail: {
          $regex:
            search,

          $options:
            "i",
        },
      },

      {
        customerPhone: {
          $regex:
            search,

          $options:
            "i",
        },
      },
    ];
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const [
    orders,
    branches,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    paidOrders,
  ] =
    await Promise.all([
      Order.find(
        query
      )
        .populate(
          "restaurantId",
          "name city area"
        )
        .populate(
          "userId",
          "name email"
        )
        .sort({
          createdAt:
            -1,
        })
        .lean(),

      Restaurant.find()
        .sort({
          name:
            1,
        })
        .lean(),

      Order.countDocuments(),

      Order.countDocuments({
        status:
          "pending",
      }),

      Order.countDocuments({
        status:
          "delivered",
      }),

      Order.countDocuments({
        paymentStatus:
          "paid",
      }),
    ]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="orders-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="orders-header">
        <div>
          <span className="orders-eyebrow">
            ORDER MANAGEMENT
          </span>

          <h1>
            CRAVEO Orders
          </h1>

          <p>
            Manage customer orders,
            payments, printing and
            delivery progress.
          </p>
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <section className="orders-summary-grid">
        <div className="orders-summary-card">
          <div className="orders-summary-icon">
            <ShoppingBag
              size={20}
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

        <div className="orders-summary-card">
          <div className="orders-summary-icon warning">
            <Clock3
              size={20}
            />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {pendingOrders}
            </strong>
          </div>
        </div>

        <div className="orders-summary-card">
          <div className="orders-summary-icon success">
            <PackageCheck
              size={20}
            />
          </div>

          <div>
            <span>
              Delivered
            </span>

            <strong>
              {deliveredOrders}
            </strong>
          </div>
        </div>

        <div className="orders-summary-card">
          <div className="orders-summary-icon success">
            <CheckCircle2
              size={20}
            />
          </div>

          <div>
            <span>
              Paid
            </span>

            <strong>
              {paidOrders}
            </strong>
          </div>
        </div>
      </section>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <form
        method="GET"
        className="orders-filters"
      >
        <div className="orders-filter-field orders-search-field">
          <label>
            Search
          </label>

          <input
            type="text"
            name="search"
            defaultValue={
              search
            }
            placeholder="Order number, customer, phone..."
          />
        </div>

        <div className="orders-filter-field">
          <label>
            Order Status
          </label>

          <select
            name="status"
            defaultValue={
              status
            }
          >
            <option value="">
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="preparing">
              Preparing
            </option>

            <option value="ready">
              Ready
            </option>

            <option value="out-for-delivery">
              Out for Delivery
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        <div className="orders-filter-field">
          <label>
            Payment
          </label>

          <select
            name="paymentStatus"
            defaultValue={
              paymentStatus
            }
          >
            <option value="">
              All Payments
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>
        </div>

        <div className="orders-filter-field">
          <label>
            Branch
          </label>

          <select
            name="branchId"
            defaultValue={
              branchId
            }
          >
            <option value="">
              All Branches
            </option>

            {branches.map(
              (
                branch
              ) => (
                <option
                  key={
                    branch._id.toString()
                  }
                  value={
                    branch._id.toString()
                  }
                >
                  {
                    branch.name
                  }
                </option>
              )
            )}
          </select>
        </div>

        <div className="orders-filter-actions">
          <button
            type="submit"
            className="orders-filter-btn"
          >
            Apply Filters
          </button>

          <Link
            href="/admin/dashboard/orders"
            className="orders-clear-btn"
          >
            Clear
          </Link>
        </div>
      </form>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <section className="orders-table-card">
        <div className="orders-table-header">
          <div>
            <h2>
              Orders
            </h2>

            <p>
              {orders.length} order(s)
              found.
            </p>
          </div>
        </div>

        {orders.length >
        0 ? (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Branch
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Confirmation
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map(
                  (
                    order
                  ) => (
                    <tr
                      key={
                        order._id.toString()
                      }
                    >
                      <td>
                        <strong className="order-number">
                          {
                            order.orderNumber
                          }
                        </strong>
                      </td>

                      <td>
                        <div className="order-customer-cell">
                          <strong>
                            {
                              order.customerName
                            }
                          </strong>

                          <span>
                            {
                              order.customerPhone
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        {order
                          .restaurantId
                          ?.name ||
                          "Unknown"}
                      </td>

                      <td>
                        <strong>
                          {formatPrice(
                            order.total
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`order-status-badge status-${order.status}`}
                        >
                          {order.status.replaceAll(
                            "-",
                            " "
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`payment-status-badge payment-${order.paymentStatus}`}
                        >
                          {
                            order.paymentStatus
                          }
                        </span>
                      </td>

                      {/* =======================================
                          CUSTOMER QR CONFIRMATION
                      ======================================= */}

                      <td>
                        {order.customerConfirmed ? (
                          <span className="branch-customer-confirmed-badge">
                            <CheckCircle2
                              size={13}
                            />

                            Confirmed
                          </span>
                        ) : (
                          <span className="branch-customer-pending-badge">
                            Pending
                          </span>
                        )}
                      </td>

                      <td>
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      {/* =======================================
                          VIEW + PRINT
                      ======================================= */}

                      <td>
                        <div className="admin-order-actions">
                          <Link
                            href={`/admin/dashboard/orders/${order._id.toString()}`}
                            className="order-view-btn"
                          >
                            <Eye
                              size={13}
                            />

                            View
                          </Link>

                          <Link
                            href={`/admin/dashboard/orders/${order._id.toString()}/print`}
                            className="order-print-btn"
                          >
                            <Printer
                              size={13}
                            />

                            Print
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="orders-empty">
            <ShoppingBag
              size={37}
            />

            <h3>
              No orders found
            </h3>

            <p>
              Orders will appear here
              when customers start
              ordering.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}