// ============================================================
// CRAVEO - CUSTOMER MY ORDERS PAGE
// ============================================================

import Link from "next/link";

import {
  ChevronRight,
  Clock3,
  Package,
  ShoppingBag,
} from "lucide-react";

import { redirect } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { getCustomerSession } from "@/lib/customerAuth";

import User from "@/models/User";
import Order from "@/models/Order";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";

import "../../store.css";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// PRICE
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// DATE
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

// ============================================================
// STATUS LABEL
// ============================================================

function getStatusLabel(status) {
  const statuses = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    "out-for-delivery":
      "Out For Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    statuses[status] ||
    status ||
    "Unknown"
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function MyOrdersPage({
  searchParams,
}) {
  // ==========================================================
  // SESSION
  // ==========================================================

  const session =
    await getCustomerSession();

  if (!session?.userId) {
    redirect("/login");
  }

  await connectDB();

  // ==========================================================
  // USER
  // ==========================================================

  const user =
    await User.findOne({
      _id: session.userId,
      role: "customer",
      isActive: true,
    })
      .select("_id name")
      .lean();

  if (!user) {
    redirect("/login");
  }

  // ==========================================================
  // SEARCH PARAMS
  // ==========================================================

  const params =
    await searchParams;

  const selectedStatus =
    params?.status
      ?.toString()
      .trim() || "";

  // ==========================================================
  // QUERY
  // ==========================================================

  const query = {
    userId: user._id,
  };

  const validStatuses = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "out-for-delivery",
    "delivered",
    "cancelled",
  ];

  if (
    validStatuses.includes(
      selectedStatus
    )
  ) {
    query.status =
      selectedStatus;
  }

  // ==========================================================
  // ORDERS
  // ==========================================================

  const orders =
    await Order.find(query)
      .sort({
        createdAt: -1,
      })
      .lean();

  // ==========================================================
  // COUNTS
  // ==========================================================

  const [
    totalOrders,
    activeOrders,
    deliveredOrders,
  ] = await Promise.all([
    Order.countDocuments({
      userId: user._id,
    }),

    Order.countDocuments({
      userId: user._id,

      status: {
        $in: [
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "out-for-delivery",
        ],
      },
    }),

    Order.countDocuments({
      userId: user._id,
      status: "delivered",
    }),
  ]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="customer-orders-page">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <section className="customer-orders-header">
          <span>
            MY CRAVEO
          </span>

          <h1>
            My Orders
          </h1>

          <p>
            View your orders,
            delivery progress and
            previous purchases.
          </p>
        </section>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <section className="customer-orders-summary">
          <div className="customer-orders-summary-card">
            <ShoppingBag
              size={21}
            />

            <div>
              <span>
                Total Orders
              </span>

              <strong>
                {totalOrders}
              </strong>
            </div>
          </div>

          <div className="customer-orders-summary-card">
            <Clock3 size={21} />

            <div>
              <span>
                Active Orders
              </span>

              <strong>
                {activeOrders}
              </strong>
            </div>
          </div>

          <div className="customer-orders-summary-card">
            <Package size={21} />

            <div>
              <span>
                Delivered
              </span>

              <strong>
                {
                  deliveredOrders
                }
              </strong>
            </div>
          </div>
        </section>

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <section className="customer-orders-filters">
          <Link
            href="/account/orders"
            className={
              !selectedStatus
                ? "active"
                : ""
            }
          >
            All
          </Link>

          <Link
            href="/account/orders?status=pending"
            className={
              selectedStatus ===
              "pending"
                ? "active"
                : ""
            }
          >
            Pending
          </Link>

          <Link
            href="/account/orders?status=confirmed"
            className={
              selectedStatus ===
              "confirmed"
                ? "active"
                : ""
            }
          >
            Confirmed
          </Link>

          <Link
            href="/account/orders?status=preparing"
            className={
              selectedStatus ===
              "preparing"
                ? "active"
                : ""
            }
          >
            Preparing
          </Link>

          <Link
            href="/account/orders?status=out-for-delivery"
            className={
              selectedStatus ===
              "out-for-delivery"
                ? "active"
                : ""
            }
          >
            On The Way
          </Link>

          <Link
            href="/account/orders?status=delivered"
            className={
              selectedStatus ===
              "delivered"
                ? "active"
                : ""
            }
          >
            Delivered
          </Link>

          <Link
            href="/account/orders?status=cancelled"
            className={
              selectedStatus ===
              "cancelled"
                ? "active"
                : ""
            }
          >
            Cancelled
          </Link>
        </section>

        {/* ====================================================
            ORDER LIST
        ==================================================== */}

        {orders.length > 0 ? (
          <section className="customer-orders-list">
            {orders.map(
              (order) => (
                <Link
                  key={
                    order._id.toString()
                  }
                  href={`/account/orders/${order.orderNumber}`}
                  className="customer-order-card"
                >
                  {/* ==========================================
                      LEFT
                  ========================================== */}

                  <div className="customer-order-card-main">
                    <div className="customer-order-card-icon">
                      <ShoppingBag
                        size={20}
                      />
                    </div>

                    <div>
                      <span className="customer-order-card-label">
                        ORDER
                      </span>

                      <strong>
                        {
                          order.orderNumber
                        }
                      </strong>

                      <small>
                        {formatDate(
                          order.createdAt
                        )}
                      </small>
                    </div>
                  </div>

                  {/* ==========================================
                      ITEMS
                  ========================================== */}

                  <div className="customer-order-card-items">
                    <span>
                      Items
                    </span>

                    <strong>
                      {Array.isArray(
                        order.items
                      )
                        ? order.items.reduce(
                            (
                              total,
                              item
                            ) =>
                              total +
                              Number(
                                item.quantity ||
                                  0
                              ),
                            0
                          )
                        : 0}
                    </strong>
                  </div>

                  {/* ==========================================
                      STATUS
                  ========================================== */}

                  <span
                    className={`customer-order-status customer-order-status-${order.status}`}
                  >
                    {getStatusLabel(
                      order.status
                    )}
                  </span>

                  {/* ==========================================
                      TOTAL
                  ========================================== */}

                  <strong className="customer-order-card-total">
                    {formatPrice(
                      order.total
                    )}
                  </strong>

                  <ChevronRight
                    size={18}
                  />
                </Link>
              )
            )}
          </section>
        ) : (
          <section className="customer-orders-empty">
            <ShoppingBag
              size={38}
            />

            <h2>
              No orders found
            </h2>

            <p>
              You don&apos;t have
              any orders in this
              section yet.
            </p>

            <Link href="/foods">
              Browse Menu
            </Link>
          </section>
        )}
      </main>

      <CustomerFooter />
    </>
  );
}