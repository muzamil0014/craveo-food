// ============================================================
// CRAVEO - BRANCH REVIEW DETAILS
// ============================================================

import Link from "next/link";

import mongoose from "mongoose";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  MessageSquareText,
  Star,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";
import { getBranchAdminSession } from "@/lib/auth";

import Review from "@/models/Review";
import User from "@/models/User";
import Food from "@/models/Food";

import BranchReviewActions from "@/components/admin/branch/BranchReviewActions";

// ============================================================
// PAGE
// ============================================================

export default async function BranchReviewDetailsPage({
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

  void User;
  void Food;

  // ==========================================================
  // SECURITY: OWN BRANCH ONLY
  // ==========================================================

  const review =
    await Review.findOne({
      _id: id,

      restaurantId:
        session.restaurantId,
    })
      .populate(
        "userId",
        "name email phone"
      )
      .populate(
        "foodId",
        "name image price"
      )
      .lean();

  if (!review) {
    notFound();
  }

  return (
    <main className="branch-module-page">
      <div className="branch-module-header">
        <div>
          <span>
            REVIEW DETAILS
          </span>

          <h1>
            Customer Review
          </h1>

          <p>
            Manage review visibility and
            approval.
          </p>
        </div>

        <Link
          href="/admin/branch-dashboard/reviews"
          className="branch-module-back-btn"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <section className="branch-review-detail-grid">
        <article className="branch-detail-card">
          <div className="branch-detail-heading">
            <MessageSquareText
              size={18}
            />

            <div>
              <span>
                REVIEW
              </span>

              <h2>
                Review Content
              </h2>
            </div>
          </div>

          <div className="branch-review-detail-rating">
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <Star
                  key={star}
                  size={20}
                  fill={
                    star <=
                    review.rating
                      ? "currentColor"
                      : "none"
                  }
                />
              )
            )}

            <strong>
              {review.rating}/5
            </strong>
          </div>

          {review.title && (
            <h3 className="branch-review-detail-title">
              {review.title}
            </h3>
          )}

          <p className="branch-review-detail-comment">
            {review.comment}
          </p>

          {review.adminReply && (
            <div className="branch-review-admin-reply">
              <span>
                ADMIN REPLY
              </span>

              <p>
                {
                  review.adminReply
                }
              </p>
            </div>
          )}
        </article>

        <div className="branch-detail-side">
          <article className="branch-detail-card">
            <div className="branch-detail-heading">
              <UserRound size={18} />

              <div>
                <span>
                  CUSTOMER
                </span>

                <h2>
                  Customer
                </h2>
              </div>
            </div>

            <div className="branch-detail-info">
              <strong>
                {review.userId
                  ?.name ||
                  "Customer"}
              </strong>

              <span>
                {review.userId
                  ?.email ||
                  "-"}
              </span>

              <span>
                {review.userId
                  ?.phone ||
                  "-"}
              </span>
            </div>
          </article>

          <article className="branch-detail-card">
            <div className="branch-detail-heading">
              <UtensilsCrossed
                size={18}
              />

              <div>
                <span>
                  FOOD
                </span>

                <h2>
                  Reviewed Food
                </h2>
              </div>
            </div>

            <div className="branch-detail-info">
              <strong>
                {review.foodId
                  ?.name ||
                  "Unknown Food"}
              </strong>
            </div>
          </article>

          <BranchReviewActions
            reviewId={
              review._id.toString()
            }
            initialApproved={
              review.isApproved
            }
            initialVisible={
              review.isVisible !==
              false
            }
          />
        </div>
      </section>
    </main>
  );
}