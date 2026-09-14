// ============================================================
// CRAVEO - SUPER ADMIN ORDER PRINT PAGE
// A4 PARCEL SLIP + CUSTOMER QR CONFIRMATION
// ============================================================

import crypto from "crypto";

import Link from "next/link";

import mongoose from "mongoose";

import QRCode from "qrcode";

import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getAdminSession,
} from "@/lib/auth";

import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";

import PrintOrderButton from "@/components/admin/PrintOrderButton";

// ============================================================
// ALWAYS FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// PRICE
// ============================================================

function formatPrice(value) {
  return `Rs. ${Number(
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
    }
  ).format(
    new Date(value)
  );
}

// ============================================================
// PAYMENT METHOD
// ============================================================

function paymentMethodLabel(
  value
) {
  const labels = {
    cod:
      "Cash on Delivery",

    card:
      "Card",

    "bank-transfer":
      "Bank Transfer",

    wallet:
      "Wallet",
  };

  return (
    labels[value] ||
    value ||
    "-"
  );
}

// ============================================================
// SECURE QR TOKEN
// ============================================================

function createConfirmationToken() {
  return crypto
    .randomBytes(32)
    .toString("hex");
}

// ============================================================
// PAGE
// ============================================================

export default async function AdminOrderPrintPage({
  params,
}) {
  // ==========================================================
  // SUPER ADMIN SESSION
  // ==========================================================

  const session =
    await getAdminSession();

  if (
    !session ||
    session.role !==
      "super-admin"
  ) {
    redirect(
      "/admin/login"
    );
  }

  // ==========================================================
  // ORDER ID
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
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // ORDER
  //
  // Super Admin can access all branches.
  // ==========================================================

  const order =
    await Order.findById(
      id
    );

  if (!order) {
    notFound();
  }

  // ==========================================================
  // BRANCH
  // ==========================================================

  const branch =
    await Restaurant.findById(
      order.restaurantId
    )
      .select(
        "name address area city phone"
      )
      .lean();

  // ==========================================================
  // CREATE / REUSE QR TOKEN
  // ==========================================================

  if (
    !order.customerConfirmationToken
  ) {
    order.customerConfirmationToken =
      createConfirmationToken();

    await order.save();
  }

  // ==========================================================
  // WEBSITE URL
  // ==========================================================

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  // ==========================================================
  // CUSTOMER CONFIRM LINK
  // ==========================================================

  const confirmationUrl =
    `${baseUrl}/order-confirm/${encodeURIComponent(
      order.orderNumber
    )}?token=${encodeURIComponent(
      order.customerConfirmationToken
    )}`;

  // ==========================================================
  // QR
  // ==========================================================

  const qrCode =
    await QRCode.toDataURL(
      confirmationUrl,
      {
        width:
          260,

        margin:
          1,

        errorCorrectionLevel:
          "M",
      }
    );

  // ==========================================================
  // ADDRESS
  // ==========================================================

  const deliveryAddress =
    [
      order.deliveryAddress
        ?.address,

      order.deliveryAddress
        ?.area,

      order.deliveryAddress
        ?.city,
    ]
      .filter(Boolean)
      .join(", ");

  // ==========================================================
  // COD AMOUNT
  // ==========================================================

  const amountToCollect =
    order.paymentMethod ===
      "cod" &&
    order.paymentStatus !==
      "paid"
      ? Number(
          order.total || 0
        )
      : 0;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="craveo-print-page">
      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="craveo-print-toolbar no-print">
        <Link
          href={`/admin/dashboard/orders/${order._id.toString()}`}
          className="craveo-print-toolbar-btn"
        >
          <ArrowLeft
            size={15}
          />

          Back
        </Link>

        <PrintOrderButton />
      </div>

      {/* ======================================================
          A4 PARCEL LABEL
      ====================================================== */}

      <article className="craveo-a4-label">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="craveo-label-header">
          <div className="craveo-label-brand">
            <strong>
              CRAVEO.
            </strong>

            <span>
              FOOD DELIVERY
            </span>

            <small>
              DELIVERY PARCEL
            </small>
          </div>

          <div className="craveo-label-order-head">
            <span>
              ORDER NUMBER
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
        </header>

        {/* ====================================================
            CUSTOMER + SHIPPING
        ==================================================== */}

        <section className="craveo-label-two-column">
          <div>
            <span className="craveo-label-section-title">
              DELIVER TO
            </span>

            <h2>
              {
                order.customerName
              }
            </h2>

            <p>
              <strong>
                Phone:
              </strong>{" "}
              {order.customerPhone ||
                "-"}
            </p>

            <p>
              <strong>
                Email:
              </strong>{" "}
              {order.customerEmail ||
                "-"}
            </p>
          </div>

          <div>
            <span className="craveo-label-section-title">
              SHIPPING ADDRESS
            </span>

            <p className="craveo-label-address">
              {deliveryAddress ||
                "No delivery address"}
            </p>

            <p>
              <strong>
                Branch:
              </strong>{" "}
              {branch?.name ||
                "CRAVEO"}
            </p>

            {branch?.phone && (
              <p>
                <strong>
                  Branch Phone:
                </strong>{" "}
                {
                  branch.phone
                }
              </p>
            )}
          </div>
        </section>

        {/* ====================================================
            PARCEL ITEMS
        ==================================================== */}

        <section className="craveo-label-section">
          <div className="craveo-label-section-heading">
            <span>
              PARCEL CONTENTS
            </span>

            <small>
              {order.items?.length ||
                0}{" "}
              item(s)
            </small>
          </div>

          <table className="craveo-label-items-table">
            <thead>
              <tr>
                <th>
                  PRODUCT
                </th>

                <th>
                  OPTION
                </th>

                <th>
                  QTY
                </th>

                <th>
                  AMOUNT
                </th>
              </tr>
            </thead>

            <tbody>
              {order.items?.map(
                (
                  item,
                  index
                ) => (
                  <tr
                    key={`${item._id || item.foodId}-${index}`}
                  >
                    <td>
                      {
                        item.name
                      }
                    </td>

                    <td>
                      {item.variantName ||
                        "-"}
                    </td>

                    <td>
                      {
                        item.quantity
                      }
                    </td>

                    <td>
                      {formatPrice(
                        item.lineTotal
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </section>

        {/* ====================================================
            PAYMENT DETAILS
        ==================================================== */}

        <section className="craveo-label-payment-section">
          <div className="craveo-label-payment-info">
            <span className="craveo-label-section-title">
              PAYMENT DETAILS
            </span>

            <p>
              <strong>
                Method:
              </strong>{" "}
              {paymentMethodLabel(
                order.paymentMethod
              )}
            </p>

            <p>
              <strong>
                Payment:
              </strong>{" "}
              {String(
                order.paymentStatus ||
                  "pending"
              ).toUpperCase()}
            </p>

            <p>
              <strong>
                Order Status:
              </strong>{" "}
              {String(
                order.status ||
                  "pending"
              )
                .replaceAll(
                  "-",
                  " "
                )
                .toUpperCase()}
            </p>

            <p>
              <strong>
                Customer Confirm:
              </strong>{" "}
              {order.customerConfirmed
                ? "CONFIRMED"
                : "PENDING"}
            </p>
          </div>

          {/* ==================================================
              TOTALS
          ================================================== */}

          <div className="craveo-label-price-summary">
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
                -{formatPrice(
                  order.discount
                )}
              </strong>
            </div>

            <div className="craveo-label-grand-total">
              <span>
                TOTAL
              </span>

              <strong>
                {formatPrice(
                  order.total
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* ====================================================
            AMOUNT TO COLLECT + QR
        ==================================================== */}

        <section className="craveo-label-confirm-section">
          <div className="craveo-label-confirm-left">
            <div className="craveo-label-collect-box">
              <span>
                AMOUNT TO COLLECT
              </span>

              <strong>
                {formatPrice(
                  amountToCollect
                )}
              </strong>
            </div>

            <div className="craveo-label-qr-note">
              Customer parcel receive karne ke baad QR code
              scan kare aur delivery confirmation complete kare.
            </div>

            <div className="craveo-label-order-id">
              <span>
                ORDER ID
              </span>

              <strong>
                {order._id.toString()}
              </strong>
            </div>
          </div>

          <div className="craveo-label-qr-box">
            <img
              src={
                qrCode
              }
              alt="CRAVEO order confirmation QR"
            />

            <span>
              SCAN TO CONFIRM
            </span>
          </div>
        </section>

        {/* ====================================================
            CUSTOMER NOTE
        ==================================================== */}

        <section className="craveo-label-note-section">
          <span className="craveo-label-section-title">
            CUSTOMER NOTE
          </span>

          <p>
            {order.notes ||
              "No special instructions."}
          </p>
        </section>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="craveo-label-footer">
          <strong>
            CRAVEO Food Delivery
          </strong>

          <span>
            Thank you for ordering with us.
          </span>
        </footer>
      </article>
    </main>
  );
}