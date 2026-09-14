// ============================================================
// CRAVEO - BRANCH COMPLAINTS PAGE
// ============================================================

import Link from "next/link";

import {
  CircleCheck,
  Clock3,
  Eye,
  MessageSquareWarning,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";
import { getBranchAdminSession } from "@/lib/auth";

import Complaint from "@/models/Complaint";
// ============================================================
// FORCE DYNAMIC
// BRANCH ADMIN DEPENDS ON AUTH COOKIES
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
// PAGE
// ============================================================

export default async function BranchComplaintsPage() {
  const session =
    await getBranchAdminSession();

  await connectDB();

  const complaints =
    await Complaint.find({
      restaurantId:
        session.restaurantId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

  const openCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "open"
    ).length;

  const progressCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "in-progress"
    ).length;

  const resolvedCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "resolved"
    ).length;

  return (
    <main className="branch-module-page">
      <div className="branch-module-header">
        <div>
          <span>
            SUPPORT MANAGEMENT
          </span>

          <h1>
            Branch Complaints
          </h1>

          <p>
            Customer complaints related
            to your assigned branch.
          </p>
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <section className="branch-complaint-summary">
        <div>
          <MessageSquareWarning
            size={20}
          />

          <span>
            Open
          </span>

          <strong>
            {openCount}
          </strong>
        </div>

        <div>
          <Clock3 size={20} />

          <span>
            In Progress
          </span>

          <strong>
            {progressCount}
          </strong>
        </div>

        <div>
          <CircleCheck size={20} />

          <span>
            Resolved
          </span>

          <strong>
            {resolvedCount}
          </strong>
        </div>
      </section>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <section className="branch-table-card">
        {complaints.length > 0 ? (
          <div className="branch-table-wrapper">
            <table className="branch-table">
              <thead>
                <tr>
                  <th>
                    Complaint
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Category
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
                    View
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
                        <div className="branch-table-person">
                          <strong>
                            {
                              complaint.complaintNumber
                            }
                          </strong>

                          <span>
                            {
                              complaint.subject
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        {
                          complaint.customerName
                        }
                      </td>

                      <td>
                        {
                          complaint.category
                        }
                      </td>

                      <td>
                        <span
                          className={`branch-priority-badge ${complaint.priority}`}
                        >
                          {
                            complaint.priority
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={`branch-complaint-status ${complaint.status}`}
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
                          href={`/admin/branch-dashboard/complaints/${complaint._id}`}
                          className="branch-table-view-btn"
                        >
                          <Eye size={14} />

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
          <div className="branch-module-empty">
            <MessageSquareWarning
              size={42}
            />

            <h2>
              No Complaints
            </h2>

            <p>
              No complaints found for
              this branch.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}