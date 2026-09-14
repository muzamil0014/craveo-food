// ============================================================
// CRAVEO - PUBLIC ORDER RECEIPT CONFIRMATION PAGE
// QR LINK DESTINATION
// ============================================================

import {
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import Order from "@/models/Order";

import OrderConfirmButton from "@/components/customer/OrderConfirmButton";

import "../../store.css";

// ============================================================
// FORCE FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// PRICE
// ============================================================

function formatPrice(
  value
) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// PAGE
// ============================================================

export default async function OrderConfirmPage({
  params,
  searchParams,
}) {
  // ==========================================================
  // PARAMS
  // ==========================================================

  const {
    orderNumber,
  } = await params;

  const query =
    await searchParams;

  const token =
    String(
      query?.token ||
        ""
    ).trim();

  if (
    !orderNumber ||
    !token
  ) {
    notFound();
  }

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // TOKEN + ORDER MUST MATCH
  // ==========================================================

  const order =
    await Order.findOne({
      orderNumber,

      customerConfirmationToken:
        token,
    })
      .select(
        "orderNumber customerName customerPhone items subtotal deliveryFee discount total status paymentMethod paymentStatus customerConfirmed customerConfirmedAt createdAt"
      )
      .lean();

  if (!order) {
    notFound();
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="customer-order-confirm-page">
      <section className="customer-order-confirm-card">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="customer-order-confirm-icon">
          {order.customerConfirmed ? (
            <CheckCircle2
              size={34}
            />
          ) : (
            <PackageCheck
              size={34}
            />
          )}
        </div>

        <span className="customer-order-confirm-kicker">
          CRAVEO DELIVERY
        </span>

        <h1>
          {order.customerConfirmed
            ? "Parcel Confirmed"
            : "Confirm Your Parcel"}
        </h1>

        <p className="customer-order-confirm-intro">
          {order.customerConfirmed
            ? "Thank you. This order has already been confirmed by the customer."
            : "Please verify the order information below and confirm after receiving your parcel."}
        </p>

        {/* ====================================================
            ORDER INFORMATION
        ==================================================== */}

        <div className="customer-order-confirm-summary">
          <div>
            <span>
              Order Number
            </span>

            <strong>
              {
                order.orderNumber
              }
            </strong>
          </div>

          <div>
            <span>
              Customer
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
              {order.customerPhone ||
                "-"}
            </strong>
          </div>

          <div>
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

            <strong>
              {
                order.paymentStatus
              }
            </strong>
          </div>

          <div>
            <span>
              Order Status
            </span>

            <strong>
              {
                order.status
              }
            </strong>
          </div>
        </div>

        {/* ====================================================
            ORDER ITEMS
        ==================================================== */}

        <div className="customer-order-confirm-items">
          <h2>
            Order Items
          </h2>

          {order.items.map(
            (
              item,
              index
            ) => (
              <div
                key={`${item._id || item.foodId}-${index}`}
              >
                <span>
                  {item.name}
                  {" × "}
                  {
                    item.quantity
                  }
                </span>

                <strong>
                  {formatPrice(
                    item.lineTotal
                  )}
                </strong>
              </div>
            )
          )}
        </div>

        {/* ====================================================
            SECURITY NOTE
        ==================================================== */}

        {!order.customerConfirmed && (
          <div className="customer-order-confirm-security">
            <ShieldCheck
              size={18}
            />

            <p>
              Confirm only after you have physically received
              your CRAVEO parcel.
            </p>
          </div>
        )}

        {/* ====================================================
            CONFIRM BUTTON
        ==================================================== */}

        <OrderConfirmButton
          orderNumber={
            order.orderNumber
          }
          token={
            token
          }
          alreadyConfirmed={
            order.customerConfirmed ===
            true
          }
        />
      </section>
    </main>
  );
}