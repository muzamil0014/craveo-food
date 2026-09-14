// ============================================================
// CRAVEO - COUPON MODEL
// GLOBAL LIMIT + PER USER USAGE TRACKING
// ============================================================

import mongoose from "mongoose";

// ============================================================
// USER USAGE SCHEMA
// ============================================================

const couponUserUsageSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,
      },

      count: {
        type:
          Number,

        default:
          1,

        min:
          0,
      },

      lastUsedAt: {
        type:
          Date,

        default:
          Date.now,
      },

      orderId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "Order",

        default:
          null,
      },
    },
    {
      _id:
        false,
    }
  );

// ============================================================
// COUPON SCHEMA
// ============================================================

const couponSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // BASIC INFORMATION
      // ======================================================

      code: {
        type:
          String,

        required:
          true,

        unique:
          true,

        uppercase:
          true,

        trim:
          true,
      },

      title: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      description: {
        type:
          String,

        default:
          "",

        trim:
          true,
      },

      // ======================================================
      // DISCOUNT
      // ======================================================

      discountType: {
        type:
          String,

        enum: [
          "percentage",
          "fixed",
        ],

        required:
          true,

        default:
          "percentage",
      },

      discountValue: {
        type:
          Number,

        required:
          true,

        min:
          0,
      },

      minimumOrder: {
        type:
          Number,

        default:
          0,

        min:
          0,
      },

      // ======================================================
      // MAXIMUM DISCOUNT
      //
      // percentage:
      // interpreted as maximum percentage ceiling.
      //
      // Example:
      // discountValue = 20
      // maximumDiscount = 25
      // effective discount = 20%
      //
      // 0 = no ceiling
      //
      // fixed:
      // interpreted as maximum PKR amount.
      // ======================================================

      maximumDiscount: {
        type:
          Number,

        default:
          0,

        min:
          0,
      },

      // ======================================================
      // GLOBAL USAGE
      // ======================================================

      usageLimit: {
        type:
          Number,

        default:
          0,

        min:
          0,
      },

      usedCount: {
        type:
          Number,

        default:
          0,

        min:
          0,
      },

      // ======================================================
      // PER USER LIMIT
      // ======================================================

      perUserLimit: {
        type:
          Number,

        default:
          1,

        min:
          1,
      },

      // ======================================================
      // USER USAGE HISTORY
      // ======================================================

      userUsages: {
        type: [
          couponUserUsageSchema,
        ],

        default: [],
      },

      // ======================================================
      // DATE RANGE
      // ======================================================

      startDate: {
        type:
          Date,

        required:
          true,
      },

      expiryDate: {
        type:
          Date,

        required:
          true,
      },

      // ======================================================
      // BRANCHES
      // EMPTY = ALL BRANCHES
      // ======================================================

      restaurantIds: [
        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref:
            "Restaurant",
        },
      ],

      // ======================================================
      // STATUS
      // ======================================================

      isActive: {
        type:
          Boolean,

        default:
          true,
      },
    },
    {
      timestamps:
        true,
    }
  );

// ============================================================
// INDEXES
// ============================================================

couponSchema.index({
  isActive:
    1,

  expiryDate:
    1,
});

couponSchema.index({
  restaurantIds:
    1,
});

couponSchema.index({
  "userUsages.userId":
    1,
});

// ============================================================
// MODEL
// ============================================================

const Coupon =
  mongoose.models.Coupon ||
  mongoose.model(
    "Coupon",
    couponSchema
  );

export default Coupon;