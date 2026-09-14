// ============================================================
// CRAVEO - CUSTOMER ORDER DETAILS PAGE
// ORDER ITEMS + SUMMARY + ACTIONS IN ONE MAIN COLUMN
// ============================================================

import Link from "next/link";

import {
  ArrowLeft,
  Check,
  Clock3,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  Utensils,
} from "lucide-react";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import OrderActions from "@/components/customer/OrderActions";
import OrderInvoiceButton from "@/components/customer/OrderInvoiceButton";

import "../../../store.css";

// ============================================================
// FRESH DATA
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
// STATUS LABEL
// ============================================================

function getStatusLabel(status) {
  const labels = {
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
    labels[status] ||
    status ||
    "Unknown"
  );
}

// ============================================================
// TRACKING STEPS
// ============================================================

function getTrackingSteps(
  order
) {
  if (
    order.status ===
    "cancelled"
  ) {
    return [
      {
        key: "pending",
        label:
          "Order Placed",
        description:
          "Your order was received.",
        icon:
          ShoppingBag,
        complete: true,
      },

      {
        key:
          "cancelled",
        label:
          "Order Cancelled",
        description:
          "This order has been cancelled.",
        icon:
          Clock3,
        complete: true,
        danger: true,
      },
    ];
  }

  const statuses = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "out-for-delivery",
    "delivered",
  ];

  const currentIndex =
    statuses.indexOf(
      order.status
    );

  const steps = [
    {
      key: "pending",
      label:
        "Order Placed",
      description:
        "We received your order.",
      icon:
        ShoppingBag,
    },

    {
      key:
        "confirmed",
      label:
        "Confirmed",
      description:
        "Your branch confirmed the order.",
      icon:
        Check,
    },

    {
      key:
        "preparing",
      label:
        "Preparing",
      description:
        "Your food is being prepared.",
      icon:
        Utensils,
    },

    {
      key: "ready",
      label:
        "Ready",
      description:
        "Your order is ready.",
      icon:
        Package,
    },

    {
      key:
        "out-for-delivery",
      label:
        "Out For Delivery",
      description:
        "Your order is on the way.",
      icon:
        Truck,
    },

    {
      key:
        "delivered",
      label:
        "Delivered",
      description:
        "Your order was delivered.",
      icon:
        Check,
    },
  ];

  return steps.map(
    (step, index) => ({
      ...step,

      complete:
        currentIndex >=
        index,

      active:
        currentIndex ===
        index,
    })
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function OrderDetailsPage({
  params,
}) {
  // ==========================================================
  // SESSION
  // ==========================================================

  const session =
    await getCustomerSession();

  if (!session?.userId) {
    redirect("/login");
  }

  // ==========================================================
  // PARAMS
  // ==========================================================

  const resolvedParams =
    await params;

  const orderNumber =
    resolvedParams
      ?.orderNumber
      ?.toString()
      .trim();

  if (!orderNumber) {
    notFound();
  }

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // CUSTOMER
  // ==========================================================

  const user =
    await User.findOne({
      _id:
        session.userId,

      role:
        "customer",

      isActive:
        true,
    })
      .select("_id")
      .lean();

  if (!user) {
    redirect("/login");
  }

  // ==========================================================
  // ORDER
  // ==========================================================

  const order =
    await Order.findOne({
      orderNumber,

      userId:
        user._id,
    }).lean();

  if (!order) {
    notFound();
  }

  // ==========================================================
  // BRANCH
  // ==========================================================

  const branch =
    order.restaurantId
      ? await Restaurant.findById(
          order.restaurantId
        )
          .select(
            "name city area address phone"
          )
          .lean()
      : null;

  // ==========================================================
  // TRACKING
  // ==========================================================

  const trackingSteps =
    getTrackingSteps(
      order
    );

  // ==========================================================
  // INVOICE DATA
  // ==========================================================

  const invoiceOrder = {
    orderNumber:
      order.orderNumber,

    customerName:
      order.customerName ||
      "",

    customerEmail:
      order.customerEmail ||
      "",

    customerPhone:
      order.customerPhone ||
      "",

    status:
      order.status,

    paymentMethod:
      order.paymentMethod ||
      "",

    paymentStatus:
      order.paymentStatus ||
      "",

    subtotal:
      Number(
        order.subtotal ||
          0
      ),

    deliveryFee:
      Number(
        order.deliveryFee ||
          0
      ),

    discount:
      Number(
        order.discount ||
          0
      ),

    total:
      Number(
        order.total ||
          0
      ),

    createdAt:
      order.createdAt
        ? new Date(
            order.createdAt
          ).toISOString()
        : "",

    branchName:
      branch?.name ||
      "",

    deliveryAddress:
      order.deliveryAddress ||
      {},

    items:
      Array.isArray(
        order.items
      )
        ? order.items.map(
            (item) => ({
              name:
                item.name ||
                "",

              quantity:
                Number(
                  item.quantity ||
                    0
                ),

              price:
                Number(
                  item.price ||
                    0
                ),

              variantName:
                item.variantName ||
                "",

              variantPrice:
                Number(
                  item.variantPrice ||
                    0
                ),

              lineTotal:
                Number(
                  item.lineTotal ||
                    0
                ),
            })
          )
        : [],
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="customer-order-details-page">
        {/* ====================================================
            BACK
        ==================================================== */}

        <Link
          href="/account/orders"
          className="customer-order-back"
        >
          <ArrowLeft
            size={16}
          />

          Back To Orders
        </Link>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <section className="customer-order-detail-header">
          <div>
            <span>
              ORDER DETAILS
            </span>

            <h1>
              {
                order.orderNumber
              }
            </h1>

            <p>
              Ordered on{" "}
              {formatDate(
                order.createdAt
              )}
            </p>
          </div>

          <div className="customer-order-header-actions">
            <span
              className={`customer-order-status customer-order-status-${order.status}`}
            >
              {getStatusLabel(
                order.status
              )}
            </span>

            <OrderInvoiceButton
              order={
                invoiceOrder
              }
            />
          </div>
        </section>

        {/* ====================================================
            TRACKING
        ==================================================== */}

        <section className="customer-order-panel">
          <div className="customer-order-panel-heading">
            <span>
              DELIVERY PROGRESS
            </span>

            <h2>
              Order Tracking
            </h2>
          </div>

          <div className="customer-order-timeline">
            {trackingSteps.map(
              (
                step,
                index
              ) => {
                const Icon =
                  step.icon;

                return (
                  <div
                    key={
                      step.key
                    }
                    className={`customer-order-timeline-step ${
                      step.complete
                        ? "complete"
                        : ""
                    } ${
                      step.active
                        ? "active"
                        : ""
                    } ${
                      step.danger
                        ? "danger"
                        : ""
                    }`}
                  >
                    <div className="customer-order-timeline-marker">
                      <Icon
                        size={
                          17
                        }
                      />
                    </div>

                    {index <
                      trackingSteps.length -
                        1 && (
                      <div className="customer-order-timeline-line" />
                    )}

                    <div className="customer-order-timeline-text">
                      <strong>
                        {
                          step.label
                        }
                      </strong>

                      <span>
                        {
                          step.description
                        }
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <section className="customer-order-details-main">
          {/* ==================================================
              LEFT MAIN COLUMN
          ================================================== */}

          <div className="customer-order-main-column">
            {/* ================================================
                ORDER ITEMS
            ================================================ */}

            <section className="customer-order-panel">
              <div className="customer-order-panel-heading">
                <span>
                  YOUR ORDER
                </span>

                <h2>
                  Order Items
                </h2>
              </div>

              <div className="customer-order-items">
                {order.items?.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item._id
                          ?.toString() ||
                        index
                      }
                      className="customer-order-item"
                    >
                      <div className="customer-order-item-image">
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                          />
                        ) : (
                          <ShoppingBag
                            size={
                              22
                            }
                          />
                        )}
                      </div>

                      <div className="customer-order-item-info">
                        <strong>
                          {
                            item.name
                          }
                        </strong>

                        {item.variantName && (
                          <span>
                            Variant:{" "}
                            {
                              item.variantName
                            }
                          </span>
                        )}

                        <small>
                          Qty:{" "}
                          {
                            item.quantity
                          }
                        </small>
                      </div>

                      <strong className="customer-order-item-price">
                        {formatPrice(
                          item.lineTotal
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* ================================================
                ORDER SUMMARY
                MOVED BELOW ORDER ITEMS
            ================================================ */}

            <section className="customer-order-panel customer-order-summary-panel">
              <div className="customer-order-panel-heading">
                <span>
                  PAYMENT
                </span>

                <h2>
                  Order Summary
                </h2>
              </div>

              <div className="customer-order-summary">
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatPrice(
                      order.subtotal
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Delivery Fee
                  </span>

                  <strong>
                    {formatPrice(
                      order.deliveryFee
                    )}
                  </strong>
                </div>

                {Number(
                  order.discount ||
                    0
                ) > 0 && (
                  <div>
                    <span>
                      Discount
                    </span>

                    <strong>
                      -{" "}
                      {formatPrice(
                        order.discount
                      )}
                    </strong>
                  </div>
                )}

                <div className="customer-order-summary-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    {formatPrice(
                      order.total
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment
                  </span>

                  <strong className="customer-order-payment-method">
                    {order.paymentMethod ||
                      "-"}
                  </strong>
                </div>
              </div>
            </section>

            {/* ================================================
                ORDER ACTIONS
                MOVED BELOW ORDER SUMMARY
            ================================================ */}

            <OrderActions
              orderNumber={
                order.orderNumber
              }
              status={
                order.status
              }
            />
          </div>

          {/* ==================================================
              RIGHT INFORMATION COLUMN
          ================================================== */}

          <div className="customer-order-info-column">
            {/* ================================================
                BRANCH
            ================================================ */}

            <section className="customer-order-panel">
              <div className="customer-order-panel-heading">
                <span>
                  ORDERING BRANCH
                </span>

                <h2>
                  Branch
                </h2>
              </div>

              <div className="customer-order-info-block">
                <MapPin
                  size={19}
                />

                <div>
                  <strong>
                    {branch?.name ||
                      "CRAVEO"}
                  </strong>

                  <span>
                    {[
                      branch?.area,
                      branch?.city,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(", ")}
                  </span>

                  {branch?.address && (
                    <small>
                      {
                        branch.address
                      }
                    </small>
                  )}
                </div>
              </div>
            </section>

            {/* ================================================
                DELIVERY ADDRESS
            ================================================ */}

            <section className="customer-order-panel">
              <div className="customer-order-panel-heading">
                <span>
                  DELIVERY
                </span>

                <h2>
                  Delivery Address
                </h2>
              </div>

              <div className="customer-order-address">
                <strong>
                  {order
                    .deliveryAddress
                    ?.fullName ||
                    "-"}
                </strong>

                <span>
                  {order
                    .deliveryAddress
                    ?.phone ||
                    "-"}
                </span>

                <p>
                  {[
                    order
                      .deliveryAddress
                      ?.address,

                    order
                      .deliveryAddress
                      ?.area,

                    order
                      .deliveryAddress
                      ?.city,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(", ")}
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>

      <CustomerFooter />
    </>
  );
}