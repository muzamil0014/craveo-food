"use client";

// ============================================================
// CRAVEO - CUSTOMER REVIEWS MANAGER
// CREATE + EDIT + DELETE REVIEWS
// ============================================================

import {
  CheckCircle2,
  Edit3,
  LoaderCircle,
  MessageSquare,
  PackageCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

// ============================================================
// SAFE RESPONSE
// ============================================================

async function readResponse(
  response
) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    throw new Error(
      `Invalid server response (${response.status}).`
    );
  }
}

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
// STAR SELECTOR
// ============================================================

function StarSelector({
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div className="customer-review-star-selector">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <button
            key={star}
            type="button"
            disabled={
              disabled
            }
            className={
              star <= value
                ? "active"
                : ""
            }
            onClick={() =>
              onChange(
                star
              )
            }
            aria-label={`${star} star`}
          >
            <Star
              size={24}
              fill={
                star <= value
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        )
      )}
    </div>
  );
}

// ============================================================
// STATIC STAR DISPLAY
// ============================================================

function RatingStars({
  rating,
}) {
  return (
    <div className="customer-review-display-stars">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            size={15}
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
// MAIN COMPONENT
// ============================================================

export default function CustomerReviewsManager({
  initialFoodId = "",
}) {
  const router =
    useRouter();

  // ==========================================================
  // DATA
  // ==========================================================

  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    reviewableItems,
    setReviewableItems,
  ] = useState([]);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  // ==========================================================
  // MESSAGE
  // ==========================================================

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  // ==========================================================
  // CREATE FORM
  // ==========================================================

  const [
    activeItem,
    setActiveItem,
  ] = useState(null);

  const [
    rating,
    setRating,
  ] = useState(0);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    comment,
    setComment,
  ] = useState("");

  // ==========================================================
  // EDIT FORM
  // ==========================================================

  const [
    editingReviewId,
    setEditingReviewId,
  ] = useState("");

  const [
    editRating,
    setEditRating,
  ] = useState(0);

  const [
    editTitle,
    setEditTitle,
  ] = useState("");

  const [
    editComment,
    setEditComment,
  ] = useState("");

  // ==========================================================
  // LOAD REVIEWS
  // ==========================================================

  async function loadReviews() {
    try {
      setLoading(true);

      setError("");

      const query =
        initialFoodId
          ? `?foodId=${encodeURIComponent(
              initialFoodId
            )}`
          : "";

      const response =
        await fetch(
          `/api/customer/reviews${query}`,
          {
            method: "GET",
            cache:
              "no-store",
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to load reviews."
        );
      }

      setReviews(
        Array.isArray(
          result.reviews
        )
          ? result.reviews
          : []
      );

      setReviewableItems(
        Array.isArray(
          result.reviewableItems
        )
          ? result.reviewableItems
          : []
      );
    } catch (error) {
      setError(
        error?.message ||
          "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadReviews();
  }, [initialFoodId]);

  // ==========================================================
  // OPEN CREATE FORM
  // ==========================================================

  function openReviewForm(
    item
  ) {
    setActiveItem(
      item
    );

    setRating(0);
    setTitle("");
    setComment("");

    setError("");
    setMessage("");
  }

  // ==========================================================
  // CLOSE CREATE FORM
  // ==========================================================

  function closeReviewForm() {
    setActiveItem(
      null
    );

    setRating(0);
    setTitle("");
    setComment("");
  }

  // ==========================================================
  // SUBMIT REVIEW
  // ==========================================================

  async function submitReview(
    event
  ) {
    event.preventDefault();

    if (!activeItem) {
      return;
    }

    if (
      rating < 1 ||
      rating > 5
    ) {
      setError(
        "Please select a star rating."
      );

      return;
    }

    if (
      comment.trim().length <
      3
    ) {
      setError(
        "Please write your review."
      );

      return;
    }

    try {
      setSaving(true);

      setError("");
      setMessage("");

      const response =
        await fetch(
          "/api/customer/reviews",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                orderId:
                  activeItem.orderId,

                foodId:
                  activeItem.foodId,

                rating,

                title:
                  title.trim(),

                comment:
                  comment.trim(),
              }),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to submit review."
        );
      }

      setMessage(
        result.message ||
          "Review submitted successfully."
      );

      closeReviewForm();

      await loadReviews();

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to submit review."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // START EDIT
  // ==========================================================

  function startEdit(
    review
  ) {
    setEditingReviewId(
      review.id
    );

    setEditRating(
      Number(
        review.rating || 0
      )
    );

    setEditTitle(
      review.title || ""
    );

    setEditComment(
      review.comment ||
        ""
    );

    setError("");
    setMessage("");
  }

  // ==========================================================
  // CANCEL EDIT
  // ==========================================================

  function cancelEdit() {
    setEditingReviewId(
      ""
    );

    setEditRating(0);
    setEditTitle("");
    setEditComment("");
  }

  // ==========================================================
  // UPDATE REVIEW
  // ==========================================================

  async function updateReview(
    event,
    reviewId
  ) {
    event.preventDefault();

    if (
      editRating < 1 ||
      editRating > 5
    ) {
      setError(
        "Please select a star rating."
      );

      return;
    }

    if (
      editComment.trim()
        .length < 3
    ) {
      setError(
        "Please write your review."
      );

      return;
    }

    try {
      setSaving(true);

      setError("");
      setMessage("");

      const response =
        await fetch(
          "/api/customer/reviews",
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                reviewId,

                rating:
                  editRating,

                title:
                  editTitle.trim(),

                comment:
                  editComment.trim(),
              }),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to update review."
        );
      }

      setMessage(
        result.message ||
          "Review updated successfully."
      );

      cancelEdit();

      await loadReviews();

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to update review."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // DELETE REVIEW
  // ==========================================================

  async function deleteReview(
    reviewId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this review?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      setError("");
      setMessage("");

      const response =
        await fetch(
          "/api/customer/reviews",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                reviewId,
              }),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to delete review."
        );
      }

      setMessage(
        result.message ||
          "Review deleted successfully."
      );

      await loadReviews();

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to delete review."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // LOADING UI
  // ==========================================================

  if (loading) {
    return (
      <div className="customer-reviews-loading">
        <LoaderCircle
          size={26}
          className="craveo-spin"
        />

        Loading reviews...
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="customer-reviews-manager">
      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <div className="customer-review-error">
          {error}
        </div>
      )}

      {message && (
        <div className="customer-review-success">
          {message}
        </div>
      )}

      {/* ======================================================
          REVIEWABLE ITEMS
      ====================================================== */}

      <section className="customer-review-section">
        <div className="customer-review-section-heading">
          <div>
            <span>
              VERIFIED ORDERS
            </span>

            <h2>
              Ready To Review
            </h2>

            <p>
              Only foods from delivered
              orders can be reviewed.
            </p>
          </div>

          <PackageCheck
            size={24}
          />
        </div>

        {reviewableItems.length >
        0 ? (
          <div className="customer-reviewable-grid">
            {reviewableItems.map(
              (item) => (
                <article
                  key={`${item.orderId}-${item.foodId}`}
                  className="customer-reviewable-card"
                >
                  <div className="customer-reviewable-food">
                    <div className="customer-review-food-image">
                      {item.foodImage ? (
                        <img
                          src={
                            item.foodImage
                          }
                          alt={
                            item.foodName
                          }
                        />
                      ) : (
                        <MessageSquare
                          size={22}
                        />
                      )}
                    </div>

                    <div>
                      <h3>
                        {
                          item.foodName
                        }
                      </h3>

                      {item.variantName && (
                        <span>
                          {
                            item.variantName
                          }
                        </span>
                      )}

                      <small>
                        Order{" "}
                        {
                          item.orderNumber
                        }
                      </small>

                      <small>
                        Delivered{" "}
                        {formatDate(
                          item.deliveredAt
                        )}
                      </small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="customer-write-review-btn"
                    onClick={() =>
                      openReviewForm(
                        item
                      )
                    }
                  >
                    <Star
                      size={16}
                    />

                    Write Review
                  </button>
                </article>
              )
            )}
          </div>
        ) : (
          <div className="customer-review-empty">
            <CheckCircle2
              size={34}
            />

            <h3>
              No reviews waiting
            </h3>

            <p>
              Delivered foods that you
              haven&apos;t reviewed will
              appear here.
            </p>
          </div>
        )}
      </section>

      {/* ======================================================
          CREATE REVIEW FORM
      ====================================================== */}

      {activeItem && (
        <section className="customer-review-form-card">
          <div className="customer-review-form-header">
            <div>
              <span>
                WRITE REVIEW
              </span>

              <h2>
                {
                  activeItem.foodName
                }
              </h2>

              <p>
                Order{" "}
                {
                  activeItem.orderNumber
                }
              </p>
            </div>

            <button
              type="button"
              onClick={
                closeReviewForm
              }
            >
              <X
                size={18}
              />
            </button>
          </div>

          <form
            onSubmit={
              submitReview
            }
            className="customer-review-form"
          >
            <div className="customer-review-form-field">
              <label>
                Your Rating
              </label>

              <StarSelector
                value={
                  rating
                }
                onChange={
                  setRating
                }
                disabled={
                  saving
                }
              />
            </div>

            <div className="customer-review-form-field">
              <label>
                Review Title
              </label>

              <input
                type="text"
                value={
                  title
                }
                onChange={(
                  event
                ) =>
                  setTitle(
                    event.target
                      .value
                  )
                }
                maxLength={
                  100
                }
                placeholder="e.g. Amazing burger"
              />
            </div>

            <div className="customer-review-form-field">
              <label>
                Your Review *
              </label>

              <textarea
                value={
                  comment
                }
                onChange={(
                  event
                ) =>
                  setComment(
                    event.target
                      .value
                  )
                }
                maxLength={
                  1000
                }
                rows={5}
                required
                placeholder="Tell us about your experience..."
              />
            </div>

            <div className="customer-review-form-actions">
              <button
                type="button"
                className="customer-review-cancel-btn"
                onClick={
                  closeReviewForm
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="customer-review-submit-btn"
                disabled={
                  saving
                }
              >
                {saving ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="craveo-spin"
                    />

                    Submitting...
                  </>
                ) : (
                  <>
                    <Star
                      size={17}
                    />

                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ======================================================
          MY REVIEWS
      ====================================================== */}

      <section className="customer-review-section">
        <div className="customer-review-section-heading">
          <div>
            <span>
              MY REVIEWS
            </span>

            <h2>
              Review History
            </h2>

            <p>
              View, edit or remove your
              reviews.
            </p>
          </div>

          <MessageSquare
            size={24}
          />
        </div>

        {reviews.length >
        0 ? (
          <div className="customer-my-review-grid">
            {reviews.map(
              (review) => (
                <article
                  key={
                    review.id
                  }
                  className="customer-my-review-card"
                >
                  {/* ==========================================
                      FOOD
                  ========================================== */}

                  <div className="customer-my-review-top">
                    <div className="customer-reviewable-food">
                      <div className="customer-review-food-image">
                        {review.foodImage ? (
                          <img
                            src={
                              review.foodImage
                            }
                            alt={
                              review.foodName
                            }
                          />
                        ) : (
                          <MessageSquare
                            size={21}
                          />
                        )}
                      </div>

                      <div>
                        <h3>
                          {
                            review.foodName
                          }
                        </h3>

                        <small>
                          Order{" "}
                          {
                            review.orderNumber
                          }
                        </small>
                      </div>
                    </div>

                    <span
                      className={`customer-review-status ${
                        review.isHidden
                          ? "hidden"
                          : review.isApproved
                          ? "approved"
                          : "pending"
                      }`}
                    >
                      {review.isHidden
                        ? "Hidden"
                        : review.isApproved
                        ? "Approved"
                        : "Pending Approval"}
                    </span>
                  </div>

                  {/* ==========================================
                      NORMAL VIEW
                  ========================================== */}

                  {editingReviewId !==
                  review.id ? (
                    <>
                      <RatingStars
                        rating={
                          review.rating
                        }
                      />

                      {review.title && (
                        <h4>
                          {
                            review.title
                          }
                        </h4>
                      )}

                      <p className="customer-my-review-comment">
                        {
                          review.comment
                        }
                      </p>

                      {review.isVerifiedPurchase && (
                        <div className="customer-review-verified">
                          <CheckCircle2
                            size={14}
                          />

                          Verified Purchase
                        </div>
                      )}

                      {review.adminReply && (
                        <div className="customer-review-admin-reply">
                          <strong>
                            CRAVEO Reply
                          </strong>

                          <p>
                            {
                              review.adminReply
                            }
                          </p>
                        </div>
                      )}

                      <div className="customer-my-review-footer">
                        <span>
                          {formatDate(
                            review.createdAt
                          )}
                        </span>

                        <div>
                          <button
                            type="button"
                            className="customer-review-edit-btn"
                            onClick={() =>
                              startEdit(
                                review
                              )
                            }
                          >
                            <Edit3
                              size={15}
                            />

                            Edit
                          </button>

                          <button
                            type="button"
                            className="customer-review-delete-btn"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              deleteReview(
                                review.id
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />

                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* ========================================
                       EDIT FORM
                    ======================================== */

                    <form
                      className="customer-review-edit-form"
                      onSubmit={(
                        event
                      ) =>
                        updateReview(
                          event,
                          review.id
                        )
                      }
                    >
                      <StarSelector
                        value={
                          editRating
                        }
                        onChange={
                          setEditRating
                        }
                        disabled={
                          saving
                        }
                      />

                      <input
                        type="text"
                        value={
                          editTitle
                        }
                        onChange={(
                          event
                        ) =>
                          setEditTitle(
                            event.target
                              .value
                          )
                        }
                        maxLength={
                          100
                        }
                        placeholder="Review title"
                      />

                      <textarea
                        value={
                          editComment
                        }
                        onChange={(
                          event
                        ) =>
                          setEditComment(
                            event.target
                              .value
                          )
                        }
                        rows={5}
                        maxLength={
                          1000
                        }
                        required
                      />

                      <div className="customer-review-form-actions">
                        <button
                          type="button"
                          className="customer-review-cancel-btn"
                          onClick={
                            cancelEdit
                          }
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="customer-review-submit-btn"
                          disabled={
                            saving
                          }
                        >
                          {saving
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  )}
                </article>
              )
            )}
          </div>
        ) : (
          <div className="customer-review-empty">
            <MessageSquare
              size={34}
            />

            <h3>
              No reviews yet
            </h3>

            <p>
              Your submitted reviews will
              appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}