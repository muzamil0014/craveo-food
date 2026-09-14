// ============================================================
// CRAVEO - REVIEW DETAILS PAGE
// ============================================================

import mongoose from "mongoose";
import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  MessageSquareText,
  ShoppingBag,
  Star,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

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
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}

// ============================================================
// STAR RATING
// ============================================================

function RatingStars({
  rating,
}) {
  return (
    <div className="review-stars review-stars-large">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            size={18}
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

export default async function ReviewDetailsPage({
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
  void Food;
  void Restaurant;
  void Order;

  const review =
    await Review.findById(id)
      .populate(
        "userId",
        "name email phone"
      )
      .populate(
        "foodId",
        "name image price"
      )
      .populate(
        "restaurantId",
        "name city area address"
      )
      .populate(
        "orderId",
        "orderNumber status total"
      )
      .lean();

  if (!review) {
    notFound();
  }

  return (
    <main className="review-details-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="review-details-header">
        <div>
          <span className="reviews-eyebrow">
            REVIEW MANAGEMENT
          </span>

          <h1>
            Review Details
          </h1>

          <p>
            Submitted{" "}
            {formatDate(
              review.createdAt
            )}
          </p>
        </div>

        <Link
          href="/admin/dashboard/reviews"
          className="review-back-btn"
        >
          <ArrowLeft size={17} />

          Back to Reviews
        </Link>
      </div>

      {/* ====================================================
          STATUS / ACTIONS
      ==================================================== */}

      <section className="review-detail-status-card">
        <div>
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
      </section>

      {/* ====================================================
          REVIEW CONTENT
      ==================================================== */}

      <section className="review-detail-content-card">
        <div className="review-detail-rating">
          <RatingStars
            rating={
              review.rating
            }
          />

          <strong>
            {review.rating}/5
          </strong>
        </div>

        {review.title && (
          <h2>
            {review.title}
          </h2>
        )}

        <p>
          {review.comment}
        </p>
      </section>

      {/* ====================================================
          INFORMATION GRID
      ==================================================== */}

      <section className="review-details-grid">
        {/* CUSTOMER */}

        <article className="review-info-card">
          <div className="review-info-heading">
            <UserRound
              size={18}
            />

            <h3>
              Customer
            </h3>
          </div>

          <div className="review-info-list">
            <div>
              <span>
                Name
              </span>

              <strong>
                {review.userId
                  ?.name ||
                  "-"}
              </strong>
            </div>

            <div>
              <span>
                Email
              </span>

              <strong>
                {review.userId
                  ?.email ||
                  "-"}
              </strong>
            </div>

            <div>
              <span>
                Phone
              </span>

              <strong>
                {review.userId
                  ?.phone ||
                  "-"}
              </strong>
            </div>
          </div>
        </article>

        {/* FOOD */}

        <article className="review-info-card">
          <div className="review-info-heading">
            <UtensilsCrossed
              size={18}
            />

            <h3>
              Food
            </h3>
          </div>

          <div className="review-detail-food">
            <div className="review-detail-food-image">
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
                <UtensilsCrossed
                  size={25}
                />
              )}
            </div>

            <div>
              <strong>
                {review.foodId
                  ?.name ||
                  "Unknown Food"}
              </strong>

              <span>
                PKR{" "}
                {Number(
                  review.foodId
                    ?.price ||
                    0
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </article>

        {/* BRANCH */}

        <article className="review-info-card">
          <div className="review-info-heading">
            <Building2
              size={18}
            />

            <h3>
              Branch
            </h3>
          </div>

          <div className="review-info-list">
            <div>
              <span>
                Branch
              </span>

              <strong>
                {review.restaurantId
                  ?.name ||
                  "-"}
              </strong>
            </div>

            <div>
              <span>
                City
              </span>

              <strong>
                {review.restaurantId
                  ?.city ||
                  "-"}
              </strong>
            </div>
          </div>
        </article>

        {/* ORDER */}

        <article className="review-info-card">
          <div className="review-info-heading">
            <ShoppingBag
              size={18}
            />

            <h3>
              Order
            </h3>
          </div>

          {review.orderId ? (
            <div className="review-info-list">
              <div>
                <span>
                  Order
                </span>

                <strong>
                  {review.orderId
                    .orderNumber}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong>
                  {review.orderId
                    .status
                    ?.replaceAll(
                      "-",
                      " "
                    )}
                </strong>
              </div>

              <Link
                href={`/admin/dashboard/orders/${review.orderId._id.toString()}`}
                className="review-order-link"
              >
                View Order
              </Link>
            </div>
          ) : (
            <div className="review-no-data">
              No linked order.
            </div>
          )}
        </article>
      </section>

      {/* ====================================================
          ADMIN REPLY
      ==================================================== */}

      {review.adminReply && (
        <section className="review-admin-reply">
          <div>
            <MessageSquareText
              size={18}
            />

            <h3>
              Admin Reply
            </h3>
          </div>

          <p>
            {review.adminReply}
          </p>
        </section>
      )}
    </main>
  );
}