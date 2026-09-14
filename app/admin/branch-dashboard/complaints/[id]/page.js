// ============================================================
// CRAVEO - BRANCH COMPLAINT DETAILS
// ============================================================

import Link from "next/link";

import mongoose from "mongoose";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  Mail,
  MessageSquareWarning,
  Phone,
  UserRound,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";
import { getBranchAdminSession } from "@/lib/auth";

import Complaint from "@/models/Complaint";

import BranchComplaintActions from "@/components/admin/branch/BranchComplaintActions";

// ============================================================
// PAGE
// ============================================================

export default async function BranchComplaintDetailsPage({
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
  // OWN BRANCH ONLY
  // ==========================================================

  const complaint =
    await Complaint.findOne({
      _id: id,

      restaurantId:
        session.restaurantId,
    }).lean();

  if (!complaint) {
    notFound();
  }

  return (
    <main className="branch-module-page">
      <div className="branch-module-header">
        <div>
          <span>
            COMPLAINT DETAILS
          </span>

          <h1>
            {
              complaint.complaintNumber
            }
          </h1>

          <p>
            {
              complaint.subject
            }
          </p>
        </div>

        <Link
          href="/admin/branch-dashboard/complaints"
          className="branch-module-back-btn"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <section className="branch-complaint-detail-grid">
        {/* ====================================================
            MESSAGE
        ==================================================== */}

        <article className="branch-detail-card">
          <div className="branch-detail-heading">
            <MessageSquareWarning
              size={18}
            />

            <div>
              <span>
                COMPLAINT
              </span>

              <h2>
                Customer Message
              </h2>
            </div>
          </div>

          <div className="branch-complaint-meta">
            <span>
              Category
              <strong>
                {
                  complaint.category
                }
              </strong>
            </span>

            <span>
              Priority
              <strong>
                {
                  complaint.priority
                }
              </strong>
            </span>

            <span>
              Status
              <strong>
                {
                  complaint.status
                }
              </strong>
            </span>
          </div>

          <p className="branch-complaint-message">
            {complaint.message}
          </p>

          {complaint.adminReply && (
            <div className="branch-existing-reply">
              <span>
                BRANCH ADMIN REPLY
              </span>

              <p>
                {
                  complaint.adminReply
                }
              </p>
            </div>
          )}
        </article>

        {/* ====================================================
            SIDE
        ==================================================== */}

        <div className="branch-detail-side">
          <article className="branch-detail-card">
            <div className="branch-detail-heading">
              <UserRound size={18} />

              <div>
                <span>
                  CUSTOMER
                </span>

                <h2>
                  Contact
                </h2>
              </div>
            </div>

            <div className="branch-complaint-customer-info">
              <strong>
                {
                  complaint.customerName
                }
              </strong>

              <div>
                <Mail size={14} />

                <span>
                  {complaint.email ||
                    "-"}
                </span>
              </div>

              <div>
                <Phone size={14} />

                <span>
                  {complaint.phone ||
                    "-"}
                </span>
              </div>
            </div>
          </article>

          <BranchComplaintActions
            complaintId={
              complaint._id.toString()
            }
            initialStatus={
              complaint.status
            }
            initialPriority={
              complaint.priority
            }
            initialReply={
              complaint.adminReply ||
              ""
            }
          />
        </div>
      </section>
    </main>
  );
}