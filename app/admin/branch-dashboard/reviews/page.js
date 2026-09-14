// ============================================================
// CRAVEO - BRANCH REVIEWS PAGE
// ============================================================

import Link from "next/link";

import {
  Eye,
  MessageSquareText,
  Star,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";
import { getBranchAdminSession } from "@/lib/auth";

import Review from "@/models/Review";
import User from "@/models/User";
import Food from "@/models/Food";
// ============================================================
// FORCE DYNAMIC
// BRANCH ADMIN DEPENDS ON AUTH COOKIES
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// PAGE
// ============================================================

export default async function BranchReviewsPage() {
  const session =
    await getBranchAdminSession();

  await connectDB();

  // Make populate models available
  void User;
  void Food;

  // ==========================================================
  // ONLY OWN BRANCH REVIEWS
  // ==========================================================

  const reviews =
    await Review.find({
      restaurantId:
        session.restaurantId,
    })
      .populate(
        "userId",
        "name email"
      )
      .populate(
        "foodId",
        "name image"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

  const approvedCount =
    reviews.filter(
      (review) =>
        review.isApproved
    ).length;

  const visibleCount =
    reviews.filter(
      (review) =>
        review.isVisible !==
        false
    ).length;

  return (
    <main className="branch-module-page">
      <div className="branch-module-header">
        <div>
          <span>
            REVIEW MANAGEMENT
          </span>

          <h1>
            Branch Reviews
          </h1>

          <p>
            Reviews submitted for your
            assigned branch.
          </p>
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <section className="branch-review-summary">
        <div>
          <Star size={20} />

          <span>
            Total Reviews
          </span>

          <strong>
            {reviews.length}
          </strong>
        </div>

        <div>
          <MessageSquareText
            size={20}
          />

          <span>
            Approved
          </span>

          <strong>
            {approvedCount}
          </strong>
        </div>

        <div>
          <Eye size={20} />

          <span>
            Visible
          </span>

          <strong>
            {visibleCount}
          </strong>
        </div>
      </section>

      {/* ======================================================
          REVIEWS
      ====================================================== */}

      {reviews.length > 0 ? (
        <section className="branch-review-grid">
          {reviews.map(
            (review) => (
              <article
                key={
                  review._id.toString()
                }
                className="branch-review-card"
              >
                <div className="branch-review-card-top">
                  <div>
                    <span>
                      CUSTOMER REVIEW
                    </span>

                    <h2>
                      {review.foodId
                        ?.name ||
                        "Food Review"}
                    </h2>
                  </div>

                  <div className="branch-review-rating">
                    <Star size={15} />

                    {
                      review.rating
                    }
                  </div>
                </div>

                <div className="branch-review-customer">
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
                </div>

                {review.title && (
                  <h3>
                    {review.title}
                  </h3>
                )}

                <p className="branch-review-comment">
                  {review.comment}
                </p>

                <div className="branch-review-badges">
                  <span
                    className={
                      review.isApproved
                        ? "approved"
                        : "pending"
                    }
                  >
                    {review.isApproved
                      ? "Approved"
                      : "Pending"}
                  </span>

                  <span
                    className={
                      review.isVisible !==
                      false
                        ? "visible"
                        : "hidden"
                    }
                  >
                    {review.isVisible !==
                    false
                      ? "Visible"
                      : "Hidden"}
                  </span>
                </div>

                <Link
                  href={`/admin/branch-dashboard/reviews/${review._id}`}
                  className="branch-review-view-btn"
                >
                  <Eye size={14} />

                  Review Details
                </Link>
              </article>
            )
          )}
        </section>
      ) : (
        <section className="branch-module-empty">
          <Star size={42} />

          <h2>
            No Reviews
          </h2>

          <p>
            No reviews found for this
            branch.
          </p>
        </section>
      )}
    </main>
  );
}