// ============================================================
// CRAVEO - CUSTOMERS MANAGEMENT PAGE
// ============================================================

import Link from "next/link";

import {
  UserCheck,
  UserRoundX,
  Users,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";

import User from "@/models/User";
import Order from "@/models/Order";

import CustomerStatus from "@/components/admin/CustomerStatus";

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
    }
  ).format(
    new Date(value)
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function CustomersPage({
  searchParams,
}) {
  await connectDB();

  const params =
    await searchParams;

  const search =
    params?.search?.trim() ||
    "";

  const status =
    params?.status || "";

  // ==========================================================
  // QUERY
  // ==========================================================

  const query = {
    role: "customer",
  };

  if (status === "active") {
    query.isActive = true;
  }

  if (status === "inactive") {
    query.isActive = false;
  }

  if (search) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },

      {
        email: {
          $regex: search,
          $options: "i",
        },
      },

      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const [
    customers,
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
  ] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .lean(),

    User.countDocuments({
      role: "customer",
    }),

    User.countDocuments({
      role: "customer",
      isActive: true,
    }),

    User.countDocuments({
      role: "customer",
      isActive: false,
    }),
  ]);

  // ==========================================================
  // ORDER COUNTS
  // ==========================================================

  const customerIds =
    customers.map(
      (customer) =>
        customer._id
    );

  const orderStats =
    await Order.aggregate([
      {
        $match: {
          userId: {
            $in: customerIds,
          },
        },
      },

      {
        $group: {
          _id: "$userId",

          orderCount: {
            $sum: 1,
          },

          totalSpent: {
            $sum: "$total",
          },
        },
      },
    ]);

  const statsMap =
    new Map(
      orderStats.map(
        (item) => [
          item._id.toString(),
          {
            orderCount:
              item.orderCount,

            totalSpent:
              item.totalSpent,
          },
        ]
      )
    );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="customers-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="customers-header">
        <div>
          <span className="customers-eyebrow">
            CUSTOMER MANAGEMENT
          </span>

          <h1>
            CRAVEO Customers
          </h1>

          <p>
            Manage registered customers,
            accounts and order history.
          </p>
        </div>
      </div>

      {/* ====================================================
          SUMMARY
      ==================================================== */}

      <section className="customers-summary-grid">
        <div className="customers-summary-card">
          <div className="customers-summary-icon">
            <Users size={20} />
          </div>

          <div>
            <span>
              Total Customers
            </span>

            <strong>
              {totalCustomers}
            </strong>
          </div>
        </div>

        <div className="customers-summary-card">
          <div className="customers-summary-icon success">
            <UserCheck
              size={20}
            />
          </div>

          <div>
            <span>
              Active Customers
            </span>

            <strong>
              {activeCustomers}
            </strong>
          </div>
        </div>

        <div className="customers-summary-card">
          <div className="customers-summary-icon danger">
            <UserRoundX
              size={20}
            />
          </div>

          <div>
            <span>
              Inactive Customers
            </span>

            <strong>
              {inactiveCustomers}
            </strong>
          </div>
        </div>
      </section>

      {/* ====================================================
          FILTERS
      ==================================================== */}

      <form
        method="GET"
        className="customers-filters"
      >
        <div className="customers-filter-field customers-search-field">
          <label>
            Search Customer
          </label>

          <input
            type="text"
            name="search"
            defaultValue={
              search
            }
            placeholder="Name, email or phone..."
          />
        </div>

        <div className="customers-filter-field">
          <label>
            Status
          </label>

          <select
            name="status"
            defaultValue={
              status
            }
          >
            <option value="">
              All Customers
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>

        <div className="customers-filter-actions">
          <button
            type="submit"
            className="customers-filter-button"
          >
            Apply
          </button>

          <Link
            href="/admin/dashboard/customers"
            className="customers-clear-button"
          >
            Clear
          </Link>
        </div>
      </form>

      {/* ====================================================
          CUSTOMERS TABLE
      ==================================================== */}

      <section className="customers-table-card">
        <div className="customers-table-heading">
          <div>
            <h2>
              Customers
            </h2>

            <p>
              {customers.length} customer(s)
              found.
            </p>
          </div>
        </div>

        {customers.length > 0 ? (
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>
                    Customer
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Orders
                  </th>

                  <th>
                    Total Spent
                  </th>

                  <th>
                    Joined
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map(
                  (customer) => {
                    const stats =
                      statsMap.get(
                        customer._id.toString()
                      ) || {
                        orderCount: 0,
                        totalSpent: 0,
                      };

                    return (
                      <tr
                        key={
                          customer._id.toString()
                        }
                      >
                        <td>
                          <div className="customer-table-profile">
                            <div className="customer-table-avatar">
                              {customer.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "C"}
                            </div>

                            <div>
                              <strong>
                                {
                                  customer.name
                                }
                              </strong>

                              <span>
                                {
                                  customer.email
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {customer.phone ||
                            "-"}
                        </td>

                        <td>
                          <strong>
                            {
                              stats.orderCount
                            }
                          </strong>
                        </td>

                        <td>
                          PKR{" "}
                          {Number(
                            stats.totalSpent ||
                              0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {formatDate(
                            customer.createdAt
                          )}
                        </td>

                        <td>
                          <CustomerStatus
                            customerId={
                              customer._id.toString()
                            }
                            isActive={
                              customer.isActive !==
                              false
                            }
                          />
                        </td>

                        <td>
                          <Link
                            href={`/admin/dashboard/customers/${customer._id.toString()}`}
                            className="customer-view-button"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="customers-empty-state">
            <Users size={38} />

            <h3>
              No customers found
            </h3>

            <p>
              Registered CRAVEO customers
              will appear here.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}