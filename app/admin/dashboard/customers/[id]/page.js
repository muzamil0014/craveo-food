// ============================================================
// CRAVEO - CUSTOMER DETAILS PAGE
// ============================================================

import mongoose from "mongoose";
import Link from "next/link";

import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import { connectDB } from "@/lib/mongodb";

import User from "@/models/User";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";

import CustomerStatus from "@/components/admin/CustomerStatus";

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
// PAGE
// ============================================================

export default async function CustomerDetailsPage({
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

  await connectDB();

  void Restaurant;

  const customer =
    await User.findOne({
      _id: id,
      role: "customer",
    })
      .select("-password")
      .lean();

  if (!customer) {
    notFound();
  }

  // ==========================================================
  // CUSTOMER ORDERS
  // ==========================================================

  const orders =
    await Order.find({
      userId: customer._id,
    })
      .populate(
        "restaurantId",
        "name city"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

  // ==========================================================
  // STATS
  // ==========================================================

  const totalSpent =
    orders
      .filter(
        (order) =>
          order.status !==
          "cancelled"
      )
      .reduce(
        (total, order) =>
          total +
          Number(
            order.total || 0
          ),
        0
      );

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status ===
        "delivered"
    ).length;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="customer-details-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="customer-details-header">
        <div>
          <span className="customers-eyebrow">
            CUSTOMER MANAGEMENT
          </span>

          <h1>
            Customer Details
          </h1>

          <p>
            View customer account and
            complete order history.
          </p>
        </div>

        <Link
          href="/admin/dashboard/customers"
          className="customer-back-button"
        >
          <ArrowLeft
            size={17}
          />

          Back to Customers
        </Link>
      </div>

      {/* ====================================================
          PROFILE
      ==================================================== */}

      <section className="customer-profile-card">
        <div className="customer-profile-main">
          <div className="customer-profile-avatar-large">
            {customer.name
              ?.charAt(0)
              ?.toUpperCase() ||
              "C"}
          </div>

          <div className="customer-profile-name">
            <span>
              CUSTOMER
            </span>

            <h2>
              {customer.name}
            </h2>

            <p>
              Joined{" "}
              {formatDate(
                customer.createdAt
              )}
            </p>
          </div>
        </div>

        <CustomerStatus
          customerId={
            customer._id.toString()
          }
          isActive={
            customer.isActive !==
            false
          }
        />
      </section>

      {/* ====================================================
          STATS
      ==================================================== */}

      <section className="customer-details-stats">
        <div>
          <span>
            Total Orders
          </span>

          <strong>
            {orders.length}
          </strong>
        </div>

        <div>
          <span>
            Delivered
          </span>

          <strong>
            {deliveredOrders}
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
      </section>

      {/* ====================================================
          CONTACT
      ==================================================== */}

      <section className="customer-details-grid">
        <article className="customer-info-card">
          <div className="customer-info-heading">
            <UserRound
              size={19}
            />

            <h2>
              Contact Information
            </h2>
          </div>

          <div className="customer-contact-list">
            <div>
              <Mail size={16} />

              <div>
                <span>
                  Email
                </span>

                <strong>
                  {customer.email}
                </strong>
              </div>
            </div>

            <div>
              <Phone size={16} />

              <div>
                <span>
                  Phone
                </span>

                <strong>
                  {customer.phone ||
                    "Not added"}
                </strong>
              </div>
            </div>
          </div>
        </article>

        <article className="customer-info-card">
          <div className="customer-info-heading">
            <MapPin
              size={19}
            />

            <h2>
              Saved Addresses
            </h2>
          </div>

          {customer.addresses?.length >
          0 ? (
            <div className="customer-address-list">
              {customer.addresses.map(
                (
                  address,
                  index
                ) => (
                  <div
                    className="customer-address-item"
                    key={
                      address._id
                        ?.toString() ||
                      index
                    }
                  >
                    <strong>
                      {address.label ||
                        "Address"}
                    </strong>

                    <p>
                      {
                        address.address
                      }
                    </p>

                    <span>
                      {[
                        address.area,
                        address.city,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(", ")}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="customer-no-address">
              No saved addresses.
            </div>
          )}
        </article>
      </section>

      {/* ====================================================
          CUSTOMER ORDERS
      ==================================================== */}

      <section className="customer-orders-card">
        <div className="customer-info-heading">
          <ShoppingBag
            size={19}
          />

          <div>
            <h2>
              Order History
            </h2>

            <p>
              All orders placed by this
              customer.
            </p>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="customer-orders-table-wrapper">
            <table className="customer-orders-table">
              <thead>
                <tr>
                  <th>
                    Order
                  </th>

                  <th>
                    Branch
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Payment
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
                        {order
                          .restaurantId
                          ?.name ||
                          "Unknown"}
                      </td>

                      <td>
                        {formatPrice(
                          order.total
                        )}
                      </td>

                      <td>
                        <span
                          className={`order-status-badge status-${order.status}`}
                        >
                          {order.status.replaceAll(
                            "-",
                            " "
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`payment-status-badge payment-${order.paymentStatus}`}
                        >
                          {
                            order.paymentStatus
                          }
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      <td>
                        <Link
                          href={`/admin/dashboard/orders/${order._id.toString()}`}
                          className="customer-order-view-button"
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
          <div className="customer-orders-empty">
            <ShoppingBag
              size={34}
            />

            <p>
              This customer has not
              placed any orders yet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}