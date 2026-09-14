// ============================================================
// CRAVEO - REVIEW MODEL
// VERIFIED CUSTOMER FOOD REVIEWS
// ============================================================

import mongoose from "mongoose";

// ============================================================
// REVIEW SCHEMA
// ============================================================

const ReviewSchema = new mongoose.Schema(
  {
    // ========================================================
    // CUSTOMER
    // ========================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ========================================================
    // FOOD
    // ========================================================

    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
      index: true,
    },

    // ========================================================
    // ORDER
    // ========================================================

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    // ========================================================
    // RESTAURANT / BRANCH
    // ========================================================

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    // ========================================================
    // SNAPSHOT INFORMATION
    // ========================================================

    customerName: {
      type: String,
      default: "",
      trim: true,
    },

    customerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    foodName: {
      type: String,
      default: "",
      trim: true,
    },

    foodImage: {
      type: String,
      default: "",
      trim: true,
    },

    orderNumber: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // RATING
    // ========================================================

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // ========================================================
    // OPTIONAL TITLE
    // ========================================================

    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ========================================================
    // REVIEW COMMENT
    // ========================================================

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },

    // ========================================================
    // VERIFIED PURCHASE
    // ========================================================

    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },

    // ========================================================
    // ADMIN MODERATION
    // ========================================================

    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },

    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ========================================================
    // ADMIN REPLY
    // ========================================================

    adminReply: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// ONE REVIEW PER FOOD PER ORDER
// ============================================================

ReviewSchema.index(
  {
    userId: 1,
    orderId: 1,
    foodId: 1,
  },
  {
    unique: true,
  }
);

// ============================================================
// PUBLIC REVIEWS INDEX
// ============================================================

ReviewSchema.index({
  foodId: 1,
  isApproved: 1,
  isHidden: 1,
  createdAt: -1,
});

// ============================================================
// BRANCH REVIEWS INDEX
// ============================================================

ReviewSchema.index({
  restaurantId: 1,
  createdAt: -1,
});

// ============================================================
// DEVELOPMENT MODEL REFRESH
// ============================================================

if (
  process.env.NODE_ENV === "development" &&
  mongoose.models.Review
) {
  delete mongoose.models.Review;
}

// ============================================================
// MODEL
// ============================================================

const Review =
  mongoose.models.Review ||
  mongoose.model(
    "Review",
    ReviewSchema
  );

export default Review;