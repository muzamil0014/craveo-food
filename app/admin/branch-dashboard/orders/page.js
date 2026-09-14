// ============================================================
// CRAVEO - BRANCH ORDERS PAGE
// OWN BRANCH ORDERS + VIEW + PRINT + CUSTOMER CONFIRMATION
// ============================================================

import Link from "next/link";

import {
  CheckCircle2,
  Eye,
  PackageSearch,
  Printer,
  ShoppingBag,
} from "lucide-react";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getBranchAdminSession,
} from "@/lib/auth";

import Order from "@/models/Order";

// ============================================================
// FORCE DYNAMIC
// BRANCH ADMIN DEPENDS ON AUTH COOKIES
// ============================================================


// ============================================================
// FORCE FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

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

export default async function BranchOrdersPage() {
  // ==========================================================
  // SESSION
  // ==========================================================

  const session =
    await getBranchAdminSession();

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // ONLY OWN BRANCH ORDERS
  // ==========================================================

  const orders =
    await Order.find({
      restaurantId:
        session.restaurantId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

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
            ORDER MANAGEMENT
          </span>

          <h1>
            Branch Orders
          </h1>

          <p>
            View, print and manage orders
            for your assigned branch only.
          </p>
        </div>
      </div>

      {/* ======================================================
          ORDERS TABLE
      ====================================================== */}

      <section className="branch-table-card">
        {orders.length >
        0 ? (
          <div className="branch-table-wrapper">
            <table className="branch-table">
              <thead>
                <tr>
                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Status
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
                      {/* =======================================
                          ORDER NUMBER
                      ======================================= */}

                      <td>
                        <div className="branch-order-number">
                          <ShoppingBag
                            size={15}
                          />

                          <strong>
                            {
                              order.orderNumber
                            }
                          </strong>
                        </div>
                      </td>

                      {/* =======================================
                          CUSTOMER
                      ======================================= */}

                      <td>
                        <div className="branch-table-person">
                          <strong>
                            {
                              order.customerName
                            }
                          </strong>

                          <span>
                            {order.customerPhone ||
                              order.customerEmail ||
                              "-"}
                          </span>
                        </div>
                      </td>

                      {/* =======================================
                          TOTAL
                      ======================================= */}

                      <td>
                        <strong>
                          {formatPrice(
                            order.total
                          )}
                        </strong>
                      </td>

                      {/* =======================================
                          PAYMENT
                      ======================================= */}

                      <td>
                        <span
                          className={`branch-payment-badge branch-payment-${order.paymentStatus}`}
                        >
                          {
                            order.paymentStatus
                          }
                        </span>
                      </td>

                      {/* =======================================
                          ORDER STATUS
                      ======================================= */}

                      <td>
                        <span
                          className={`branch-order-status branch-order-${order.status}`}
                        >
                          {order.status.replaceAll(
                            "-",
                            " "
                          )}
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

                      {/* =======================================
                          DATE
                      ======================================= */}

                      <td>
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      {/* =======================================
                          ACTIONS
                      ======================================= */}

                      <td>
                        <div className="branch-order-actions">
                          {/* ===================================
                              VIEW
                          =================================== */}

                          <Link
                            href={`/admin/branch-dashboard/orders/${order._id}`}
                            className="branch-table-view-btn"
                          >
                            <Eye
                              size={14}
                            />

                            View
                          </Link>

                          {/* ===================================
                              PRINT
                          =================================== */}

                          <Link
                            href={`/admin/branch-dashboard/orders/${order._id}/print`}
                            className="branch-table-print-btn"
                          >
                            <Printer
                              size={14}
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
          /* ==================================================
             EMPTY STATE
          ================================================== */

          <div className="branch-module-empty">
            <PackageSearch
              size={40}
            />

            <h2>
              No Orders
            </h2>

            <p>
              No orders have been placed
              for this branch yet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}