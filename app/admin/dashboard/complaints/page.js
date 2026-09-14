// ============================================================
// CRAVEO - COMPLAINTS MANAGEMENT PAGE
// ============================================================

import Link from "next/link";

import {
  CircleAlert,
  CircleCheck,
  Clock3,
  MessageSquareWarning,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";

import Complaint from "@/models/Complaint";
import User from "@/models/User";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";

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

export default async function ComplaintsPage({
  searchParams,
}) {
  await connectDB();

  void User;
  void Order;
  void Restaurant;

  const params =
    await searchParams;

  const search =
    params?.search?.trim() ||
    "";

  const status =
    params?.status || "";

  const priority =
    params?.priority || "";

  // ==========================================================
  // QUERY
  // ==========================================================

  const query = {};

  if (status) {
    query.status =
      status;
  }

  if (priority) {
    query.priority =
      priority;
  }

  if (search) {
    query.$or = [
      {
        complaintNumber: {
          $regex: search,
          $options: "i",
        },
      },

      {
        customerName: {
          $regex: search,
          $options: "i",
        },
      },

      {
        customerEmail: {
          $regex: search,
          $options: "i",
        },
      },

      {
        customerPhone: {
          $regex: search,
          $options: "i",
        },
      },

      {
        subject: {
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
    complaints,
    totalComplaints,
    openComplaints,
    progressComplaints,
    resolvedComplaints,
    urgentComplaints,
  ] = await Promise.all([
    Complaint.find(query)
      .populate(
        "userId",
        "name email"
      )
      .populate(
        "orderId",
        "orderNumber"
      )
      .populate(
        "restaurantId",
        "name city"
      )
      .sort({
        createdAt: -1,
      })
      .lean(),

    Complaint.countDocuments(),

    Complaint.countDocuments({
      status: "open",
    }),

    Complaint.countDocuments({
      status: "in-progress",
    }),

    Complaint.countDocuments({
      status: "resolved",
    }),

    Complaint.countDocuments({
      priority: "urgent",
    }),
  ]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="complaints-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="complaints-header">
        <div>
          <span className="complaints-eyebrow">
            SUPPORT MANAGEMENT
          </span>

          <h1>
            Customer Complaints
          </h1>

          <p>
            Review and resolve customer
            complaints across CRAVEO.
          </p>
        </div>
      </div>

      {/* ====================================================
          SUMMARY
      ==================================================== */}

      <section className="complaints-summary-grid">
        <div className="complaints-summary-card">
          <div className="complaints-summary-icon">
            <MessageSquareWarning
              size={20}
            />
          </div>

          <div>
            <span>
              Total Complaints
            </span>

            <strong>
              {totalComplaints}
            </strong>
          </div>
        </div>

        <div className="complaints-summary-card">
          <div className="complaints-summary-icon warning">
            <Clock3 size={20} />
          </div>

          <div>
            <span>
              Open
            </span>

            <strong>
              {openComplaints}
            </strong>
          </div>
        </div>

        <div className="complaints-summary-card">
          <div className="complaints-summary-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>
              In Progress
            </span>

            <strong>
              {progressComplaints}
            </strong>
          </div>
        </div>

        <div className="complaints-summary-card">
          <div className="complaints-summary-icon success">
            <CircleCheck
              size={20}
            />
          </div>

          <div>
            <span>
              Resolved
            </span>

            <strong>
              {resolvedComplaints}
            </strong>
          </div>
        </div>

        <div className="complaints-summary-card">
          <div className="complaints-summary-icon danger">
            <CircleAlert
              size={20}
            />
          </div>

          <div>
            <span>
              Urgent
            </span>

            <strong>
              {urgentComplaints}
            </strong>
          </div>
        </div>
      </section>

      {/* ====================================================
          FILTERS
      ==================================================== */}

      <form
        method="GET"
        className="complaints-filters"
      >
        <div className="complaints-filter-field complaints-search-field">
          <label>
            Search
          </label>

          <input
            type="text"
            name="search"
            defaultValue={
              search
            }
            placeholder="Complaint number, customer, subject..."
          />
        </div>

        <div className="complaints-filter-field">
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
              All Statuses
            </option>

            <option value="open">
              Open
            </option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="resolved">
              Resolved
            </option>

            <option value="closed">
              Closed
            </option>
          </select>
        </div>

        <div className="complaints-filter-field">
          <label>
            Priority
          </label>

          <select
            name="priority"
            defaultValue={
              priority
            }
          >
            <option value="">
              All Priorities
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>

            <option value="urgent">
              Urgent
            </option>
          </select>
        </div>

        <div className="complaints-filter-actions">
          <button
            type="submit"
            className="complaints-filter-btn"
          >
            Apply
          </button>

          <Link
            href="/admin/dashboard/complaints"
            className="complaints-clear-btn"
          >
            Clear
          </Link>
        </div>
      </form>

      {/* ====================================================
          TABLE
      ==================================================== */}

      <section className="complaints-table-card">
        <div className="complaints-table-heading">
          <div>
            <h2>
              Complaints
            </h2>

            <p>
              {complaints.length} complaint(s)
              found.
            </p>
          </div>
        </div>

        {complaints.length > 0 ? (
          <div className="complaints-table-wrapper">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>
                    Complaint
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Subject
                  </th>

                  <th>
                    Branch
                  </th>

                  <th>
                    Priority
                  </th>

                  <th>
                    Status
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
                {complaints.map(
                  (complaint) => (
                    <tr
                      key={
                        complaint._id.toString()
                      }
                    >
                      <td>
                        <strong className="complaint-number">
                          {
                            complaint.complaintNumber
                          }
                        </strong>
                      </td>

                      <td>
                        <div className="complaint-customer-cell">
                          <strong>
                            {
                              complaint.customerName
                            }
                          </strong>

                          <span>
                            {
                              complaint.customerEmail
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="complaint-subject-cell">
                          <strong>
                            {
                              complaint.subject
                            }
                          </strong>

                          <span>
                            {
                              complaint.category
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        {complaint
                          .restaurantId
                          ?.name ||
                          "-"}
                      </td>

                      <td>
                        <span
                          className={`complaint-priority-badge priority-${complaint.priority}`}
                        >
                          {
                            complaint.priority
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={`complaint-status-badge complaint-status-${complaint.status}`}
                        >
                          {complaint.status.replaceAll(
                            "-",
                            " "
                          )}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          complaint.createdAt
                        )}
                      </td>

                      <td>
                        <Link
                          href={`/admin/dashboard/complaints/${complaint._id.toString()}`}
                          className="complaint-view-btn"
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
          <div className="complaints-empty">
            <MessageSquareWarning
              size={39}
            />

            <h3>
              No complaints found
            </h3>

            <p>
              Customer complaints will
              appear here.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}