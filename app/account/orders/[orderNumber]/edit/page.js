// ============================================================
// CRAVEO - EDIT EXISTING CUSTOMER ORDER PAGE
// ============================================================

import Link from "next/link";

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
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Order from "@/models/Order";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import EditOrderForm from "@/components/customer/EditOrderForm";
import "../../../../store.css";

// ============================================================
// CUSTOMER STORE CSS
//
// Current file:
// app/account/orders/[orderNumber]/edit/page.js
//
// store.css:
// app/store.css
// ============================================================

import "../../../../store.css";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// PAGE
// ============================================================

export default async function EditOrderPage({
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
  // CUSTOMER OWNERSHIP CHECK
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
  // EDITABLE STATUSES
  // ==========================================================

  const editableStatuses = [
    "pending",
    "confirmed",
  ];

  // ==========================================================
  // PREPARATION STARTED
  // EDIT BLOCK
  // ==========================================================

  if (
    !editableStatuses.includes(
      order.status
    )
  ) {
    redirect(
      `/account/orders/${orderNumber}`
    );
  }

  // ==========================================================
  // SERIALIZE ORDER
  // ==========================================================

  const serializedOrder = {
    orderNumber:
      order.orderNumber,

    status:
      order.status,

    subtotal:
      Number(
        order.subtotal || 0
      ),

    deliveryFee:
      Number(
        order.deliveryFee || 0
      ),

    discount:
      Number(
        order.discount || 0
      ),

    total:
      Number(
        order.total || 0
      ),

    items:
      Array.isArray(
        order.items
      )
        ? order.items.map(
            (item) => ({
              id:
                item._id
                  ?.toString() ||
                "",

              foodId:
                item.foodId
                  ?.toString() ||
                "",

              name:
                item.name || "",

              image:
                item.image || "",

              quantity:
                Number(
                  item.quantity ||
                    1
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

      <main className="customer-edit-order-page">
        <div className="customer-edit-order-container">
          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <Link
            href={`/account/orders/${orderNumber}`}
            className="customer-order-back"
          >
            <ArrowLeft
              size={16}
            />

            Back To Order
          </Link>

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section className="customer-edit-order-header">
            <span>
              UPDATE ORDER
            </span>

            <h1>
              Edit Order
            </h1>

            <p>
              Change the quantity of your ordered items.
              Saving these changes will update the same order.
              A new order will not be created.
            </p>

            <strong>
              {orderNumber}
            </strong>
          </section>

          {/* ==================================================
              EDIT ORDER FORM
          ================================================== */}

          <EditOrderForm
            order={
              serializedOrder
            }
          />
        </div>
      </main>

      <CustomerFooter />
    </>
  );
}