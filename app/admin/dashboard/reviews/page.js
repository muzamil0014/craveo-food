// ============================================================
// CRAVEO - REVIEWS MANAGEMENT PAGE
// ============================================================

import Link from "next/link";

import {
  EyeOff,
  MessageSquareText,
  Star,
  StarHalf,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";

import Review from "@/models/Review";
import User from "@/models/User";
import Food from "@/models/Food";
import Restaurant from "@/models/Restaurant";
import Order from "@/models/Order";

import ReviewActions from "@/components/admin/ReviewActions";

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
// RATING STARS
// ============================================================

function RatingStars({
  rating,
}) {
  return (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            size={13}
            fill={
              star <= rating
                ? "currentColor"
                : "none"
            }
          />
        )
      )}
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function ReviewsPage({
  searchParams,
}) {
  await connectDB();

  void User;
  void Food;
  void Restaurant;
  void Order;

  const params =
    await searchParams;

  const status =
    params?.status || "";

  const rating =
    params?.rating || "";

  // ==========================================================
  // QUERY
  // ==========================================================

  const query = {};

  if (status === "approved") {
    query.isApproved = true;
  }

  if (status === "pending") {
    query.isApproved = false;
  }

  if (status === "hidden") {
    query.isVisible = false;
  }

  if (
    ["1", "2", "3", "4", "5"].includes(
      rating
    )
  ) {
    query.rating =
      Number(rating);
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const [
    reviews,
    totalReviews,
    approvedReviews,
    pendingReviews,
    hiddenReviews,
  ] = await Promise.all([
    Review.find(query)
      .populate(
        "userId",
        "name email"
      )
      .populate(
        "foodId",
        "name image"
      )
      .populate(
        "restaurantId",
        "name city"
      )
      .populate(
        "orderId",
        "orderNumber"
      )
      .sort({
        createdAt: -1,
      })
      .lean(),

    Review.countDocuments(),

    Review.countDocuments({
      isApproved: true,
    }),

    Review.countDocuments({
      isApproved: false,
    }),

    Review.countDocuments({
      isVisible: false,
    }),
  ]);

  // ==========================================================
  // AVERAGE RATING
  // ==========================================================

  const ratingResult =
    await Review.aggregate([
      {
        $group: {
          _id: null,

          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

  const averageRating =
    ratingResult.length > 0
      ? Number(
          ratingResult[0]
            .averageRating
        ).toFixed(1)
      : "0.0";

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="reviews-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="reviews-header">
        <div>
          <span className="reviews-eyebrow">
            REVIEW MANAGEMENT
          </span>

          <h1>
            Customer Reviews
          </h1>

          <p>
            Moderate customer feedback,
            ratings and food reviews.
          </p>
        </div>
      </div>

      {/* ====================================================
          SUMMARY
      ==================================================== */}

      <section className="reviews-summary-grid">
        <div className="reviews-summary-card">
          <div className="reviews-summary-icon">
            <MessageSquareText
              size={20}
            />
          </div>

          <div>
            <span>
              Total Reviews
            </span>

            <strong>
              {totalReviews}
            </strong>
          </div>
        </div>

        <div className="reviews-summary-card">
          <div className="reviews-summary-icon success">
            <Star size={20} />
          </div>

          <div>
            <span>
              Approved
            </span>

            <strong>
              {approvedReviews}
            </strong>
          </div>
        </div>

        <div className="reviews-summary-card">
          <div className="reviews-summary-icon warning">
            <StarHalf
              size={20}
            />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {pendingReviews}
            </strong>
          </div>
        </div>

        <div className="reviews-summary-card">
          <div className="reviews-summary-icon danger">
            <EyeOff
              size={20}
            />
          </div>

          <div>
            <span>
              Hidden
            </span>

            <strong>
              {hiddenReviews}
            </strong>
          </div>
        </div>

        <div className="reviews-summary-card">
          <div className="reviews-summary-icon">
            <Star size={20} />
          </div>

          <div>
            <span>
              Average Rating
            </span>

            <strong>
              {averageRating}
            </strong>
          </div>
        </div>
      </section>

      {/* ====================================================
          FILTERS
      ==================================================== */}

      <form
        method="GET"
        className="reviews-filters"
      >
        <div className="reviews-filter-field">
          <label>
            Review Status
          </label>

          <select
            name="status"
            defaultValue={status}
          >
            <option value="">
              All Reviews
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="hidden">
              Hidden
            </option>
          </select>
        </div>

        <div className="reviews-filter-field">
          <label>
            Rating
          </label>

          <select
            name="rating"
            defaultValue={rating}
          >
            <option value="">
              All Ratings
            </option>

            <option value="5">
              5 Stars
            </option>

            <option value="4">
              4 Stars
            </option>

            <option value="3">
              3 Stars
            </option>

            <option value="2">
              2 Stars
            </option>

            <option value="1">
              1 Star
            </option>
          </select>
        </div>

        <div className="reviews-filter-actions">
          <button
            type="submit"
            className="reviews-filter-btn"
          >
            Apply
          </button>

          <Link
            href="/admin/dashboard/reviews"
            className="reviews-clear-btn"
          >
            Clear
          </Link>
        </div>
      </form>

      {/* ====================================================
          REVIEWS
      ==================================================== */}

      {reviews.length > 0 ? (
        <section className="reviews-grid">
          {reviews.map(
            (review) => (
              <article
                className="review-card"
                key={
                  review._id.toString()
                }
              >
                {/* ============================================
                    CARD TOP
                ============================================ */}

                <div className="review-card-top">
                  <div className="review-customer">
                    <div className="review-customer-avatar">
                      {review.userId
                        ?.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "C"}
                    </div>

                    <div>
                      <strong>
                        {review.userId
                          ?.name ||
                          "Customer"}
                      </strong>

                      <span>
                        {formatDate(
                          review.createdAt
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="review-card-badges">
                    <span
                      className={`review-approval-badge ${
                        review.isApproved
                          ? "approved"
                          : "pending"
                      }`}
                    >
                      {review.isApproved
                        ? "Approved"
                        : "Pending"}
                    </span>

                    {!review.isVisible && (
                      <span className="review-hidden-badge">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                {/* ============================================
                    RATING
                ============================================ */}

                <div className="review-rating-row">
                  <RatingStars
                    rating={
                      review.rating
                    }
                  />

                  <strong>
                    {review.rating}/5
                  </strong>
                </div>

                {/* ============================================
                    CONTENT
                ============================================ */}

                {review.title && (
                  <h2>
                    {review.title}
                  </h2>
                )}

                <p className="review-comment">
                  {review.comment}
                </p>

                {/* ============================================
                    FOOD
                ============================================ */}

                <div className="review-food-row">
                  <div className="review-food-image">
                    {review.foodId
                      ?.image ? (
                      <img
                        src={
                          review.foodId
                            .image
                        }
                        alt={
                          review.foodId
                            .name
                        }
                      />
                    ) : (
                      <Star
                        size={21}
                      />
                    )}
                  </div>

                  <div>
                    <span>
                      Food
                    </span>

                    <strong>
                      {review.foodId
                        ?.name ||
                        "Unknown Food"}
                    </strong>
                  </div>
                </div>

                {/* ============================================
                    META
                ============================================ */}

                <div className="review-meta">
                  <span>
                    Branch:{" "}
                    <strong>
                      {review
                        .restaurantId
                        ?.name ||
                        "N/A"}
                    </strong>
                  </span>

                  {review.orderId && (
                    <span>
                      Order:{" "}
                      <strong>
                        {review
                          .orderId
                          ?.orderNumber ||
                          "N/A"}
                      </strong>
                    </span>
                  )}
                </div>

                {/* ============================================
                    ACTIONS
                ============================================ */}

                <div className="review-card-footer">
                  <Link
                    href={`/admin/dashboard/reviews/${review._id.toString()}`}
                    className="review-view-btn"
                  >
                    View Details
                  </Link>

                  <ReviewActions
                    reviewId={
                      review._id.toString()
                    }
                    customerName={
                      review.userId
                        ?.name ||
                      "Customer"
                    }
                    isApproved={
                      review.isApproved
                    }
                    isVisible={
                      review.isVisible
                    }
                  />
                </div>
              </article>
            )
          )}
        </section>
      ) : (
        <section className="reviews-empty">
          <Star size={39} />

          <h2>
            No reviews found
          </h2>

          <p>
            Customer reviews will appear
            here.
          </p>
        </section>
      )}
    </main>
  );
}