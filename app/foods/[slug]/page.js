// ============================================================
// CRAVEO - CUSTOMER FOOD DETAILS
// SELECTED BRANCH + CART + CUSTOMER REVIEWS
// ============================================================

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Food from "@/models/Food";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";
import Review from "@/models/Review";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import AddToCartButton from "@/components/customer/AddToCartButton";

import "../../store.css";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// PRICE
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

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

export default async function FoodDetailsPage({
  params,
}) {
  // ==========================================================
  // PARAMS
  // ==========================================================

  const {
    slug,
  } = await params;

  // ==========================================================
  // LOGIN
  // ==========================================================

  const session =
    await getCustomerSession();

  if (!session?.userId) {
    redirect(
      "/login"
    );
  }

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // CUSTOMER
  // ==========================================================

  const user =
    await User.findOne({
      _id:
        session.userId,

      role:
        "customer",

      isActive:
        true,
    })
      .select(
        "selectedRestaurantId"
      )
      .lean();

  if (
    !user ||
    !user.selectedRestaurantId
  ) {
    redirect(
      "/select-branch"
    );
  }

  // ==========================================================
  // SELECTED BRANCH
  // ==========================================================

  const selectedBranch =
    await Restaurant.findOne({
      _id:
        user.selectedRestaurantId,

      isActive:
        true,
    })
      .select(
        "_id name city area"
      )
      .lean();

  if (!selectedBranch) {
    redirect(
      "/select-branch"
    );
  }

  // ==========================================================
  // REGISTER CATEGORY MODEL
  // ==========================================================

  void Category;

  // ==========================================================
  // FOOD
  // MUST BELONG TO SELECTED BRANCH
  // ==========================================================

  const food =
    await Food.findOne({
      slug,

      restaurantIds:
        selectedBranch._id,

      isAvailable:
        true,
    })
      .populate(
        "categoryId",
        "name slug"
      )
      .lean();

  if (!food) {
    notFound();
  }

  // ==========================================================
  // VARIANTS
  // ==========================================================

  const variants =
    Array.isArray(
      food.variants
    )
      ? food.variants.map(
          (
            variant,
            index
          ) => ({
            id:
              variant._id
                ?.toString() ||
              `${index}`,

            name:
              variant.name ||
              `Option ${index + 1}`,

            price:
              Number(
                variant.price ||
                  0
              ),
          })
        )
      : [];

  // ==========================================================
  // APPROVED PUBLIC REVIEWS
  // ==========================================================

  const reviews =
    await Review.find({
      foodId:
        food._id,

      isApproved:
        true,

      isHidden:
        false,
    })
      .sort({
        createdAt:
          -1,
      })
      .limit(20)
      .lean();

  // ==========================================================
  // CALCULATE DISPLAY RATING
  //
  // Calculated from real approved reviews for this page.
  // ==========================================================

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (
            total,
            review
          ) =>
            total +
            Number(
              review.rating ||
                0
            ),
          0
        ) /
        reviews.length
      : Number(
          food.rating || 0
        );

  const reviewCount =
    reviews.length > 0
      ? reviews.length
      : Number(
          food.reviewsCount ||
            0
        );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="food-detail-page">
        {/* ====================================================
            BACK
        ==================================================== */}

        <div className="store-back-row">
          <Link href="/foods">
            <ArrowLeft
              size={15}
            />

            Back To Menu
          </Link>
        </div>

        {/* ====================================================
            DETAILS
        ==================================================== */}

        <section className="food-detail-grid">
          {/* ==================================================
              IMAGE
          ================================================== */}

          <div className="food-detail-image">
            {food.image ? (
              <img
                src={
                  food.image
                }
                alt={
                  food.name
                }
              />
            ) : (
              <UtensilsCrossed
                size={65}
              />
            )}
          </div>

          {/* ==================================================
              INFO
          ================================================== */}

          <div className="food-detail-info">
            {/* ================================================
                CATEGORY
            ================================================ */}

            {food.categoryId && (
              <span className="food-detail-category">
                {
                  food.categoryId
                    .name
                }
              </span>
            )}

            {/* ================================================
                NAME
            ================================================ */}

            <h1>
              {food.name}
            </h1>

            {/* ================================================
                RATING
            ================================================ */}

            <div className="food-detail-rating">
              <Star
                size={16}
                fill="currentColor"
              />

              <strong>
                {Number(
                  averageRating ||
                    0
                ).toFixed(1)}
              </strong>

              <span>
                ({reviewCount}{" "}
                {reviewCount === 1
                  ? "review"
                  : "reviews"}
                )
              </span>
            </div>

            {/* ================================================
                DESCRIPTION
            ================================================ */}

            <p>
              {food.description ||
                "Fresh and delicious CRAVEO food prepared with care."}
            </p>

            {/* ================================================
                PRICE
            ================================================ */}

            <div className="food-detail-price">
              <strong>
                {formatPrice(
                  Number(
                    food.salePrice ||
                      0
                  ) > 0
                    ? food.salePrice
                    : food.price
                )}
              </strong>

              {Number(
                food.salePrice ||
                  0
              ) > 0 &&
                Number(
                  food.salePrice
                ) <
                  Number(
                    food.price
                  ) && (
                  <del>
                    {formatPrice(
                      food.price
                    )}
                  </del>
                )}
            </div>

            {/* ================================================
                BRANCH
            ================================================ */}

            <div className="food-detail-selected-branch">
              <MapPin
                size={16}
              />

              <div>
                <span>
                  Available At
                </span>

                <strong>
                  {
                    selectedBranch.name
                  }
                </strong>
              </div>
            </div>

            {/* ================================================
                STOCK
            ================================================ */}

            <div className="food-detail-status">
              <CheckCircle2
                size={17}
              />

              {Number(
                food.stock || 0
              ) > 0
                ? `${food.stock} in stock`
                : "Available"}
            </div>

            {/* ================================================
                ADD TO CART
            ================================================ */}

            <AddToCartButton
              foodId={
                food._id.toString()
              }
              variants={
                variants
              }
              stock={
                typeof food.stock ===
                "number"
                  ? food.stock
                  : null
              }
            />
          </div>
        </section>

        {/* ====================================================
            SELECTED BRANCH
        ==================================================== */}

        <section className="food-available-branches">
          <div className="store-content-heading">
            <div>
              <span>
                YOUR BRANCH
              </span>

              <h2>
                Ordering From
              </h2>
            </div>
          </div>

          <div className="food-branch-list">
            <Link
              href="/select-branch"
              className="food-branch-item"
            >
              <div className="food-branch-icon">
                <Store
                  size={20}
                />
              </div>

              <div>
                <strong>
                  {
                    selectedBranch.name
                  }
                </strong>

                <span>
                  <MapPin
                    size={12}
                  />

                  {[
                    selectedBranch.area,
                    selectedBranch.city,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      ", "
                    )}
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* ====================================================
            CUSTOMER REVIEWS
        ==================================================== */}

        <section className="food-customer-reviews">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="food-review-heading">
            <div>
              <span>
                CUSTOMER REVIEWS
              </span>

              <h2>
                What Customers Say
              </h2>

              <p>
                Reviews from verified
                CRAVEO orders.
              </p>
            </div>

            <Link
              href={`/account/reviews?foodId=${food._id.toString()}`}
              className="food-write-review-link"
            >
              <Star
                size={16}
              />

              Write A Review
            </Link>
          </div>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div className="food-review-summary">
            <div className="food-review-summary-score">
              <strong>
                {Number(
                  averageRating ||
                    0
                ).toFixed(1)}
              </strong>

              <div>
                <div className="food-review-summary-stars">
                  {[1, 2, 3, 4, 5].map(
                    (
                      star
                    ) => (
                      <Star
                        key={
                          star
                        }
                        size={17}
                        fill={
                          star <=
                          Math.round(
                            averageRating
                          )
                            ? "currentColor"
                            : "none"
                        }
                      />
                    )
                  )}
                </div>

                <span>
                  Based on{" "}
                  {reviewCount}{" "}
                  {reviewCount ===
                  1
                    ? "review"
                    : "reviews"}
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================
              REVIEWS
          ================================================== */}

          {reviews.length >
          0 ? (
            <div className="food-review-grid">
              {reviews.map(
                (review) => (
                  <article
                    key={
                      review._id.toString()
                    }
                    className="food-review-card"
                  >
                    {/* ========================================
                        TOP
                    ======================================== */}

                    <div className="food-review-card-top">
                      <div className="food-review-avatar">
                        {String(
                          review.customerName ||
                            "C"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {review.customerName ||
                            "CRAVEO Customer"}
                        </strong>

                        <span>
                          {formatDate(
                            review.createdAt
                          )}
                        </span>
                      </div>
                    </div>

                    {/* ========================================
                        STARS
                    ======================================== */}

                    <div className="food-review-stars">
                      {[1, 2, 3, 4, 5].map(
                        (
                          star
                        ) => (
                          <Star
                            key={
                              star
                            }
                            size={14}
                            fill={
                              star <=
                              Number(
                                review.rating ||
                                  0
                              )
                                ? "currentColor"
                                : "none"
                            }
                          />
                        )
                      )}
                    </div>

                    {/* ========================================
                        VERIFIED
                    ======================================== */}

                    {review.isVerifiedPurchase && (
                      <div className="food-review-verified">
                        <CheckCircle2
                          size={13}
                        />

                        Verified Purchase
                      </div>
                    )}

                    {/* ========================================
                        TITLE
                    ======================================== */}

                    {review.title && (
                      <h3>
                        {
                          review.title
                        }
                      </h3>
                    )}

                    {/* ========================================
                        COMMENT
                    ======================================== */}

                    <p>
                      {
                        review.comment
                      }
                    </p>

                    {/* ========================================
                        ADMIN REPLY
                    ======================================== */}

                    {review.adminReply && (
                      <div className="food-review-admin-reply">
                        <strong>
                          CRAVEO Response
                        </strong>

                        <p>
                          {
                            review.adminReply
                          }
                        </p>
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          ) : (
            <div className="food-review-empty">
              <MessageSquare
                size={38}
              />

              <h3>
                No reviews yet
              </h3>

              <p>
                Be the first customer to
                review this food after a
                completed delivery.
              </p>

              <Link
                href={`/account/reviews?foodId=${food._id.toString()}`}
              >
                Write A Review
              </Link>
            </div>
          )}
        </section>
      </main>

      <CustomerFooter />
    </>
  );
}