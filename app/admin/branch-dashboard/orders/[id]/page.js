// ============================================================
// CRAVEO - BRANCH ORDER DETAILS
// OWN BRANCH ONLY
// ============================================================

import Link from "next/link";
import mongoose from "mongoose";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  CreditCard,
  MapPin,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getBranchAdminSession,
} from "@/lib/auth";

import Order from "@/models/Order";

import BranchOrderStatus from "@/components/admin/branch/BranchOrderStatus";
import BranchPaymentStatus from "@/components/admin/branch/BranchPaymentStatus";

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
// PAYMENT METHOD
// ============================================================

function paymentMethodLabel(
  method
) {
  const labels = {
    cod:
      "Cash on Delivery",

    cash_on_delivery:
      "Cash on Delivery",

    cash:
      "Cash",

    card:
      "Card",

    bank_transfer:
      "Bank Transfer",

    wallet:
      "Wallet",
  };

  return (
    labels[method] ||
    method ||
    "-"
  );
}

// ============================================================
// PAYMENT STATUS
// ============================================================

function paymentStatusLabel(
  status
) {
  const labels = {
    pending:
      "Pending",

    paid:
      "Paid",

    failed:
      "Failed",

    refunded:
      "Refunded",
  };

  return (
    labels[status] ||
    status ||
    "Pending"
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function BranchOrderDetailsPage({
  params,
}) {
  // ==========================================================
  // PARAMS
  // ==========================================================

  const {
    id,
  } = await params;

  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    notFound();
  }

  // ==========================================================
  // BRANCH ADMIN SESSION
  // ==========================================================

  const session =
    await getBranchAdminSession();

  if (
    !session ||
    !session.restaurantId
  ) {
    redirect(
      "/admin/branch-login"
    );
  }

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // OWN BRANCH ORDER ONLY
  // ==========================================================

  const order =
    await Order.findOne({
      _id:
        id,

      restaurantId:
        session.restaurantId,
    }).lean();

  if (!order) {
    notFound();
  }

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
            ORDER DETAILS
          </span>

          <h1>
            {order.orderNumber}
          </h1>

          <p>
            Created{" "}
            {formatDate(
              order.createdAt
            )}
          </p>
        </div>

        <Link
          href="/admin/branch-dashboard/orders"
          className="branch-module-back-btn"
        >
          <ArrowLeft
            size={16}
          />

          Back
        </Link>
      </div>

      {/* ======================================================
          GRID
      ====================================================== */}

      <section className="branch-order-detail-grid">
        {/* ====================================================
            FOOD ITEMS
        ==================================================== */}

        <article className="branch-detail-card branch-order-items-card">
          <div className="branch-detail-heading">
            <ShoppingBag
              size={18}
            />

            <div>
              <span>
                ORDER
              </span>

              <h2>
                Food Items
              </h2>
            </div>
          </div>

          <div className="branch-order-items">
            {Array.isArray(
              order.items
            ) &&
            order.items.length >
              0 ? (
              order.items.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={`${item.foodId || "food"}-${index}`}
                    className="branch-order-item"
                  >
                    <div>
                      <strong>
                        {item.name ||
                          "Food Item"}
                      </strong>

                      <span>
                        Qty:{" "}
                        {Number(
                          item.quantity ||
                            0
                        )}

                        {item.variantName
                          ? ` • ${item.variantName}`
                          : ""}
                      </span>
                    </div>

                    <strong>
                      {formatPrice(
                        item.lineTotal
                      )}
                    </strong>
                  </div>
                )
              )
            ) : (
              <p>
                No food items.
              </p>
            )}
          </div>

          {/* ==================================================
              TOTALS
          ================================================== */}

          <div className="branch-order-summary">
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
                Delivery
              </span>

              <strong>
                {formatPrice(
                  order.deliveryFee
                )}
              </strong>
            </div>

            <div>
              <span>
                Discount
              </span>

              <strong>
                -
                {formatPrice(
                  order.discount
                )}
              </strong>
            </div>

            <div className="total">
              <span>
                Total
              </span>

              <strong>
                {formatPrice(
                  order.total
                )}
              </strong>
            </div>
          </div>
        </article>

        {/* ====================================================
            RIGHT COLUMN
        ==================================================== */}

        <div className="branch-detail-side">
          {/* ==================================================
              CUSTOMER
          ================================================== */}

          <article className="branch-detail-card">
            <div className="branch-detail-heading">
              <UserRound
                size={18}
              />

              <div>
                <span>
                  CUSTOMER
                </span>

                <h2>
                  Customer
                </h2>
              </div>
            </div>

            <div className="branch-detail-info">
              <strong>
                {order.customerName ||
                  "Customer"}
              </strong>

              <span>
                {order.customerEmail ||
                  "-"}
              </span>

              <span>
                {order.customerPhone ||
                  "-"}
              </span>
            </div>
          </article>

          {/* ==================================================
              DELIVERY
          ================================================== */}

          <article className="branch-detail-card">
            <div className="branch-detail-heading">
              <MapPin
                size={18}
              />

              <div>
                <span>
                  DELIVERY
                </span>

                <h2>
                  Address
                </h2>
              </div>
            </div>

            <p className="branch-detail-address">
              {typeof order.deliveryAddress ===
              "string"
                ? order.deliveryAddress
                : [
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
                    .join(
                      ", "
                    ) ||
                  "No address"}
            </p>
          </article>

          {/* ==================================================
              PAYMENT
              NOW EDITABLE DIRECTLY HERE
          ================================================== */}

          <article className="branch-detail-card branch-payment-card">
            <div className="branch-detail-heading">
              <CreditCard
                size={18}
              />

              <div>
                <span>
                  PAYMENT
                </span>

                <h2>
                  Payment
                </h2>
              </div>
            </div>

            {/* ================================================
                CURRENT PAYMENT INFO
            ================================================ */}

            <div className="branch-detail-info">
              <span>
                Method
              </span>

              <strong>
                {paymentMethodLabel(
                  order.paymentMethod
                )}
              </strong>

              <span>
                Current Status
              </span>

              <strong>
                {paymentStatusLabel(
                  order.paymentStatus
                )}
              </strong>
            </div>

            {/* ================================================
                PAYMENT UPDATE
            ================================================ */}

            <BranchPaymentStatus
              orderId={
                order._id.toString()
              }
              currentPaymentStatus={
                order.paymentStatus ||
                "pending"
              }
            />
          </article>

          {/* ==================================================
              ORDER STATUS
          ================================================== */}

          <BranchOrderStatus
            orderId={
              order._id.toString()
            }
            currentStatus={
              order.status ||
              "pending"
            }
          />
        </div>
      </section>
    </main>
  );
}