// ============================================================
// CRAVEO - COMPLAINT DETAILS PAGE
// ============================================================

import mongoose from "mongoose";
import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  Mail,
  MessageSquareWarning,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import { connectDB } from "@/lib/mongodb";

import Complaint from "@/models/Complaint";
import User from "@/models/User";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";

import ComplaintActions from "@/components/admin/ComplaintActions";

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
// FORMAT PRICE
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// PAGE
// ============================================================

export default async function ComplaintDetailsPage({
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

  void User;
  void Order;
  void Restaurant;

  const complaint =
    await Complaint.findById(id)
      .populate(
        "userId",
        "name email phone"
      )
      .populate(
        "orderId",
        "orderNumber status total paymentStatus"
      )
      .populate(
        "restaurantId",
        "name city area address phone"
      )
      .lean();

  if (!complaint) {
    notFound();
  }

  return (
    <main className="complaint-details-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="complaint-details-header">
        <div>
          <span className="complaints-eyebrow">
            SUPPORT MANAGEMENT
          </span>

          <h1>
            {
              complaint.complaintNumber
            }
          </h1>

          <p>
            Submitted{" "}
            {formatDate(
              complaint.createdAt
            )}
          </p>
        </div>

        <Link
          href="/admin/dashboard/complaints"
          className="complaint-back-btn"
        >
          <ArrowLeft
            size={17}
          />

          Back to Complaints
        </Link>
      </div>

      {/* ====================================================
          BADGES
      ==================================================== */}

      <section className="complaint-detail-badges">
        <span
          className={`complaint-status-badge complaint-status-${complaint.status}`}
        >
          {complaint.status.replaceAll(
            "-",
            " "
          )}
        </span>

        <span
          className={`complaint-priority-badge priority-${complaint.priority}`}
        >
          {complaint.priority}
        </span>

        <span className="complaint-category-badge">
          {complaint.category}
        </span>
      </section>

      {/* ====================================================
          MESSAGE
      ==================================================== */}

      <section className="complaint-message-card">
        <div className="complaint-card-heading">
          <MessageSquareWarning
            size={19}
          />

          <div>
            <span>
              COMPLAINT
            </span>

            <h2>
              {complaint.subject}
            </h2>
          </div>
        </div>

        <p>
          {complaint.message}
        </p>
      </section>

      {/* ====================================================
          INFO GRID
      ==================================================== */}

      <section className="complaint-info-grid">
        {/* CUSTOMER */}

        <article className="complaint-info-card">
          <div className="complaint-card-heading">
            <UserRound
              size={18}
            />

            <h2>
              Customer
            </h2>
          </div>

          <div className="complaint-info-list">
            <div>
              <span>
                Name
              </span>

              <strong>
                {
                  complaint.customerName
                }
              </strong>
            </div>

            <div>
              <span>
                Email
              </span>

              <strong>
                {complaint.customerEmail ||
                  "-"}
              </strong>
            </div>

            <div>
              <span>
                Phone
              </span>

              <strong>
                {complaint.customerPhone ||
                  "-"}
              </strong>
            </div>
          </div>

          <div className="complaint-contact-icons">
            {complaint.customerEmail && (
              <span>
                <Mail size={13} />
                {
                  complaint.customerEmail
                }
              </span>
            )}

            {complaint.customerPhone && (
              <span>
                <Phone size={13} />
                {
                  complaint.customerPhone
                }
              </span>
            )}
          </div>
        </article>

        {/* BRANCH */}

        <article className="complaint-info-card">
          <div className="complaint-card-heading">
            <Building2
              size={18}
            />

            <h2>
              Branch
            </h2>
          </div>

          {complaint.restaurantId ? (
            <div className="complaint-info-list">
              <div>
                <span>
                  Branch
                </span>

                <strong>
                  {
                    complaint
                      .restaurantId
                      .name
                  }
                </strong>
              </div>

              <div>
                <span>
                  City
                </span>

                <strong>
                  {complaint
                    .restaurantId
                    .city ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Area
                </span>

                <strong>
                  {complaint
                    .restaurantId
                    .area ||
                    "-"}
                </strong>
              </div>
            </div>
          ) : (
            <div className="complaint-no-linked-data">
              No branch linked.
            </div>
          )}
        </article>

        {/* ORDER */}

        <article className="complaint-info-card complaint-order-card">
          <div className="complaint-card-heading">
            <ShoppingBag
              size={18}
            />

            <h2>
              Linked Order
            </h2>
          </div>

          {complaint.orderId ? (
            <>
              <div className="complaint-info-list">
                <div>
                  <span>
                    Order
                  </span>

                  <strong>
                    {
                      complaint.orderId
                        .orderNumber
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    {complaint.orderId.status.replaceAll(
                      "-",
                      " "
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment
                  </span>

                  <strong>
                    {
                      complaint.orderId
                        .paymentStatus
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Total
                  </span>

                  <strong>
                    {formatPrice(
                      complaint.orderId
                        .total
                    )}
                  </strong>
                </div>
              </div>

              <Link
                href={`/admin/dashboard/orders/${complaint.orderId._id.toString()}`}
                className="complaint-order-link"
              >
                View Order
              </Link>
            </>
          ) : (
            <div className="complaint-no-linked-data">
              No order linked.
            </div>
          )}
        </article>
      </section>

      {/* ====================================================
          ADMIN ACTIONS
      ==================================================== */}

      <ComplaintActions
        complaintId={
          complaint._id.toString()
        }
        currentStatus={
          complaint.status
        }
        currentPriority={
          complaint.priority
        }
        currentReply={
          complaint.adminReply ||
          ""
        }
      />

      {/* ====================================================
          EXISTING REPLY INFO
      ==================================================== */}

      {complaint.adminReply && (
        <section className="complaint-existing-reply">
          <span>
            LAST ADMIN REPLY
          </span>

          <p>
            {
              complaint.adminReply
            }
          </p>

          {complaint.repliedAt && (
            <small>
              Replied{" "}
              {formatDate(
                complaint.repliedAt
              )}
            </small>
          )}
        </section>
      )}
    </main>
  );
}