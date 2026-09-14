// ============================================================
// CRAVEO - BRANCH CUSTOMER DETAILS
// ============================================================

import Link from "next/link";

import mongoose from "mongoose";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  Mail,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";
import { getBranchAdminSession } from "@/lib/auth";

import User from "@/models/User";
import Order from "@/models/Order";

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

export default async function BranchCustomerDetailsPage({
  params,
}) {
  const { id } =
    await params;

  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    notFound();
  }

  const session =
    await getBranchAdminSession();

  await connectDB();

  // ==========================================================
  // SECURITY:
  // CUSTOMER MUST HAVE AT LEAST ONE ORDER IN THIS BRANCH
  // ==========================================================

  const hasBranchOrder =
    await Order.exists({
      userId: id,

      restaurantId:
        session.restaurantId,
    });

  if (!hasBranchOrder) {
    notFound();
  }

  const customer =
    await User.findOne({
      _id: id,
      role: "customer",
    })
      .select(
        "name email phone isActive isVerified addresses createdAt"
      )
      .lean();

  if (!customer) {
    notFound();
  }

  // ==========================================================
  // ONLY THIS BRANCH ORDERS
  // ==========================================================

  const orders =
    await Order.find({
      userId: id,

      restaurantId:
        session.restaurantId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

  const totalSpent =
    orders.reduce(
      (
        total,
        order
      ) => {
        if (
          order.status ===
          "cancelled"
        ) {
          return total;
        }

        return (
          total +
          Number(
            order.total || 0
          )
        );
      },
      0
    );

  return (
    <main className="branch-module-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="branch-module-header">
        <div>
          <span>
            CUSTOMER DETAILS
          </span>

          <h1>
            {customer.name}
          </h1>

          <p>
            Customer activity for your
            branch only.
          </p>
        </div>

        <Link
          href="/admin/branch-dashboard/customers"
          className="branch-module-back-btn"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {/* ======================================================
          CUSTOMER PROFILE
      ====================================================== */}

      <section className="branch-customer-detail-grid">
        <article className="branch-detail-card">
          <div className="branch-detail-heading">
            <UserRound size={18} />

            <div>
              <span>
                CUSTOMER
              </span>

              <h2>
                Profile Information
              </h2>
            </div>
          </div>

          <div className="branch-customer-profile-large">
            <div className="branch-customer-avatar-large">
              {customer.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "C"}
            </div>

            <div>
              <h2>
                {customer.name}
              </h2>

              <span>
                Registered Customer
              </span>
            </div>
          </div>

          <div className="branch-customer-contact-list">
            <div>
              <Mail size={16} />

              <span>
                Email
              </span>

              <strong>
                {customer.email}
              </strong>
            </div>

            <div>
              <Phone size={16} />

              <span>
                Phone
              </span>

              <strong>
                {customer.phone ||
                  "-"}
              </strong>
            </div>
          </div>
        </article>

        <article className="branch-detail-card">
          <div className="branch-detail-heading">
            <ShoppingBag size={18} />

            <div>
              <span>
                BRANCH ACTIVITY
              </span>

              <h2>
                Order Summary
              </h2>
            </div>
          </div>

          <div className="branch-customer-detail-stats">
            <div>
              <span>
                Orders
              </span>

              <strong>
                {orders.length}
              </strong>
            </div>

            <div>
              <span>
                Total Spent
              </span>

              <strong>
                {formatPrice(
                  totalSpent
                )}
              </strong>
            </div>

            <div>
              <span>
                Account
              </span>

              <strong>
                {customer.isActive !==
                false
                  ? "Active"
                  : "Inactive"}
              </strong>
            </div>
          </div>
        </article>
      </section>

      {/* ======================================================
          CUSTOMER ORDERS
      ====================================================== */}

      <section className="branch-table-card branch-customer-orders-card">
        <div className="branch-table-section-heading">
          <div>
            <span>
              ORDER HISTORY
            </span>

            <h2>
              Branch Orders
            </h2>
          </div>

          <strong>
            {orders.length}
          </strong>
        </div>

        {orders.length > 0 ? (
          <div className="branch-table-wrapper">
            <table className="branch-table">
              <thead>
                <tr>
                  <th>
                    Order
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
                    Date
                  </th>

                  <th>
                    View
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map(
                  (order) => (
                    <tr
                      key={
                        order._id.toString()
                      }
                    >
                      <td>
                        <strong>
                          {
                            order.orderNumber
                          }
                        </strong>
                      </td>

                      <td>
                        {formatPrice(
                          order.total
                        )}
                      </td>

                      <td>
                        {
                          order.paymentStatus
                        }
                      </td>

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

                      <td>
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      <td>
                        <Link
                          href={`/admin/branch-dashboard/orders/${order._id}`}
                          className="branch-table-view-btn"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="branch-module-empty small">
            No branch orders.
          </div>
        )}
      </section>
    </main>
  );
}