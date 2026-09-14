// ============================================================
// CRAVEO - COUPON USAGE MODEL
//
// RULE:
// ONE CUSTOMER + ONE COUPON = ONE USE
// ============================================================

import mongoose from "mongoose";

// ============================================================
// SCHEMA
// ============================================================

const couponUsageSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // COUPON
      // ======================================================

      couponId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "Coupon",

        required:
          true,
      },

      couponCode: {
        type:
          String,

        required:
          true,

        uppercase:
          true,

        trim:
          true,
      },

      // ======================================================
      // CUSTOMER
      // ======================================================

      userId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,
      },

      // ======================================================
      // ORDER
      // ======================================================

      orderId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "Order",

        required:
          true,
      },

      orderNumber: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      // ======================================================
      // USED DATE
      // ======================================================

      usedAt: {
        type:
          Date,

        default:
          Date.now,
      },
    },
    {
      timestamps:
        true,
    }
  );

// ============================================================
// UNIQUE SECURITY INDEX
//
// SAME CUSTOMER CANNOT USE SAME COUPON TWICE.
// ============================================================

couponUsageSchema.index(
  {
    couponId:
      1,

    userId:
      1,
  },
  {
    unique:
      true,
  }
);

// ============================================================
// OTHER INDEXES
// ============================================================

couponUsageSchema.index({
  couponCode:
    1,
});

couponUsageSchema.index({
  userId:
    1,

  createdAt:
    -1,
});

// ============================================================
// MODEL
// ============================================================

const CouponUsage =
  mongoose.models
    .CouponUsage ||
  mongoose.model(
    "CouponUsage",
    couponUsageSchema
  );

export default CouponUsage;