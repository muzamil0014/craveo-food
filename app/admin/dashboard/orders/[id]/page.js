// ============================================================
// CRAVEO - SUPER ADMIN ORDER DETAILS
// VIEW + MANAGEMENT + PRINT
// ============================================================

import mongoose from "mongoose";
import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  MapPin,
  Package,
  Phone,
  Printer,
  UserRound,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Food from "@/models/Food";

import OrderStatus from "@/components/admin/OrderStatus";

// ============================================================
// FORCE FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

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

export default async function OrderDetailsPage({
  params,
}) {
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
  // DATABASE
  // ==========================================================

  await connectDB();

  void Restaurant;
  void User;
  void Food;

  // ==========================================================
  // ORDER
  // ==========================================================

  const order =
    await Order.findById(
      id
    )
      .populate(
        "restaurantId",
        "name city area address phone branchType"
      )
      .populate(
        "userId",
        "name email phone"
      )
      .populate(
        "items.foodId",
        "name image"
      )
      .lean();

  if (!order) {
    notFound();
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="order-details-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="order-details-header">
        <div>
          <span className="orders-eyebrow">
            ORDER MANAGEMENT
          </span>

          <h1>
            {
              order.orderNumber
            }
          </h1>

          <p>
            Created{" "}
            {formatDate(
              order.createdAt
            )}
          </p>
        </div>

        <div className="admin-order-header-actions">
          <Link
            href={`/admin/dashboard/orders/${order._id.toString()}/print`}
            className="order-print-main-btn"
          >
            <Printer
              size={16}
            />

            Print Parcel
          </Link>

          <Link
            href="/admin/dashboard/orders"
            className="order-back-btn"
          >
            <ArrowLeft
              size={17}
            />

            Back to Orders
          </Link>
        </div>
      </div>

      {/* ======================================================
          ORDER MANAGEMENT
      ====================================================== */}

      <OrderStatus
        orderId={
          order._id.toString()
        }
        currentStatus={
          order.status
        }
        currentPaymentStatus={
          order.paymentStatus
        }
      />

      {/* ======================================================
          CUSTOMER + BRANCH
      ====================================================== */}

      <section className="order-details-grid">
        {/* ====================================================
            CUSTOMER
        ==================================================== */}

        <article className="order-info-card">
          <div className="order-info-heading">
            <UserRound
              size={19}
            />

            <h2>
              Customer
            </h2>
          </div>

          <div className="order-info-list">
            <div>
              <span>
                Name
              </span>

              <strong>
                {
                  order.customerName
                }
              </strong>
            </div>

            <div>
              <span>
                Phone
              </span>

              <strong>
                {
                  order.customerPhone
                }
              </strong>
            </div>

            <div>
              <span>
                Email
              </span>

              <strong>
                {order.customerEmail ||
                  "-"}
              </strong>
            </div>
          </div>
        </article>

        {/* ====================================================
            BRANCH
        ==================================================== */}

        <article className="order-info-card">
          <div className="order-info-heading">
            <Building2
              size={19}
            />

            <h2>
              Branch
            </h2>
          </div>

          <div className="order-info-list">
            <div>
              <span>
                Branch
              </span>

              <strong>
                {order
                  .restaurantId
                  ?.name ||
                  "Unknown"}
              </strong>
            </div>

            <div>
              <span>
                City
              </span>

              <strong>
                {order
                  .restaurantId
                  ?.city ||
                  "-"}
              </strong>
            </div>

            <div>
              <span>
                Phone
              </span>

              <strong>
                {order
                  .restaurantId
                  ?.phone ||
                  "-"}
              </strong>
            </div>
          </div>
        </article>
      </section>

      {/* ======================================================
          DELIVERY ADDRESS
      ====================================================== */}

      <section className="order-info-card order-address-card">
        <div className="order-info-heading">
          <MapPin
            size={19}
          />

          <h2>
            Delivery Address
          </h2>
        </div>

        <div className="order-address-content">
          <strong>
            {order.deliveryAddress
              ?.fullName ||
              order.customerName}
          </strong>

          <p>
            {order.deliveryAddress
              ?.address ||
              "No address"}
          </p>

          <p>
            {[
              order.deliveryAddress
                ?.area,

              order.deliveryAddress
                ?.city,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>

          {order.deliveryAddress
            ?.phone && (
            <div className="order-address-phone">
              <Phone
                size={14}
              />

              {
                order.deliveryAddress
                  .phone
              }
            </div>
          )}

          {order.deliveryAddress
            ?.instructions && (
            <div className="order-instructions">
              <strong>
                Instructions
              </strong>

              <p>
                {
                  order.deliveryAddress
                    .instructions
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          ORDER ITEMS
      ====================================================== */}

      <section className="order-items-card">
        <div className="order-info-heading">
          <Package
            size={19}
          />

          <h2>
            Order Items
          </h2>
        </div>

        <div className="order-items-list">
          {order.items.map(
            (
              item,
              index
            ) => (
              <div
                className="order-item-row"
                key={`${item.name}-${index}`}
              >
                <div className="order-item-image">
                  {item.image ||
                  item.foodId
                    ?.image ? (
                    <img
                      src={
                        item.image ||
                        item.foodId
                          ?.image
                      }
                      alt={
                        item.name
                      }
                    />
                  ) : (
                    <Package
                      size={24}
                    />
                  )}
                </div>

                <div className="order-item-info">
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

                  <span>
                    {formatPrice(
                      item.price
                    )}{" "}
                    ×{" "}
                    {
                      item.quantity
                    }
                  </span>
                </div>

                <strong className="order-item-total">
                  {formatPrice(
                    item.lineTotal
                  )}
                </strong>
              </div>
            )
          )}
        </div>
      </section>

      {/* ======================================================
          PAYMENT SUMMARY
      ====================================================== */}

      <section className="order-payment-card">
        <div className="order-payment-heading">
          <h2>
            Payment Summary
          </h2>

          <span>
            {order.paymentMethod
              .replaceAll(
                "-",
                " "
              )}
          </span>
        </div>

        <div className="order-payment-lines">
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

          <div className="order-payment-total">
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
      </section>
    </main>
  );
}