// ============================================================
// CRAVEO - BRANCH ORDER PARCEL PRINT PAGE
// COMPACT A4 DELIVERY LABEL + QR CONFIRMATION
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
  getBranchAdminSession,
} from "@/lib/auth";

import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";

import PrintOrderButton from "@/components/admin/branch/PrintOrderButton";

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
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}

// ============================================================
// PAYMENT METHOD
// ============================================================

function paymentMethodLabel(value) {
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
// TOKEN
// ============================================================

function createConfirmationToken() {
  return crypto
    .randomBytes(32)
    .toString("hex");
}

// ============================================================
// PAGE
// ============================================================

export default async function BranchOrderPrintPage({
  params,
}) {
  // ==========================================================
  // PARAM
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
    });

  if (!order) {
    notFound();
  }

  // ==========================================================
  // BRANCH
  // ==========================================================

  const branch =
    await Restaurant.findById(
      session.restaurantId
    )
      .select(
        "name address area city phone"
      )
      .lean();

  // ==========================================================
  // QR TOKEN
  // ==========================================================

  if (
    !order.customerConfirmationToken
  ) {
    order.customerConfirmationToken =
      createConfirmationToken();

    await order.save();
  }

  // ==========================================================
  // CONFIRMATION URL
  // ==========================================================

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const confirmationUrl =
    `${baseUrl}/order-confirm/${encodeURIComponent(
      order.orderNumber
    )}?token=${encodeURIComponent(
      order.customerConfirmationToken
    )}`;

  // ==========================================================
  // QR CODE
  // ==========================================================

  const qrCode =
    await QRCode.toDataURL(
      confirmationUrl,
      {
        width: 260,
        margin: 1,
        errorCorrectionLevel:
          "M",
      }
    );

  // ==========================================================
  // DELIVERY ADDRESS
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
  // AMOUNT TO COLLECT
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
          SCREEN ACTION BAR
      ====================================================== */}

      <div className="craveo-print-toolbar no-print">
        <Link
          href={`/admin/branch-dashboard/orders/${order._id.toString()}`}
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
          A4 SHEET
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
            CUSTOMER / ADDRESS
        ==================================================== */}

        <section className="craveo-label-two-column">
          {/* ==================================================
              CUSTOMER
          ================================================== */}

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

          {/* ==================================================
              ADDRESS
          ================================================== */}

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
          </div>
        </section>

        {/* ====================================================
            ITEMS
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
            PAYMENT + TOTALS
        ==================================================== */}

        <section className="craveo-label-payment-section">
          {/* ==================================================
              PAYMENT DETAILS
          ================================================== */}

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
          </div>

          {/* ==================================================
              PRICE TOTALS
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
            AMOUNT + QR
        ==================================================== */}

        <section className="craveo-label-confirm-section">
          <div className="craveo-label-confirm-left">
            {/* ================================================
                AMOUNT TO COLLECT
            ================================================ */}

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

            {/* ================================================
                QR INFO
            ================================================ */}

            <div className="craveo-label-qr-note">
              Customer parcel receive karne ke baad QR code
              scan kare aur delivery confirmation complete kare.
            </div>

            {/* ================================================
                ORDER ID
            ================================================ */}

            <div className="craveo-label-order-id">
              <span>
                ORDER ID
              </span>

              <strong>
                {order._id.toString()}
              </strong>
            </div>
          </div>

          {/* ==================================================
              QR
          ================================================== */}

          <div className="craveo-label-qr-box">
            <img
              src={
                qrCode
              }
              alt="Order confirmation QR"
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