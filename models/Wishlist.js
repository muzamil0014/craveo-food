// ============================================================
// CRAVEO - WISHLIST MODEL
// ============================================================

import mongoose from "mongoose";

// ============================================================
// WISHLIST ITEM SCHEMA
// ============================================================

const WishlistItemSchema =
  new mongoose.Schema(
    {
      foodId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Food",

        required: true,
      },

      addedAt: {
        type: Date,

        default:
          Date.now,
      },
    },
    {
      _id: true,
    }
  );

// ============================================================
// WISHLIST SCHEMA
// ============================================================

const WishlistSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        unique: true,

        index: true,
      },

      items: {
        type: [
          WishlistItemSchema,
        ],

        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

// ============================================================
// DEVELOPMENT MODEL REFRESH
// ============================================================

if (
  process.env.NODE_ENV ===
    "development" &&
  mongoose.models.Wishlist
) {
  delete mongoose.models
    .Wishlist;
}

// ============================================================
// MODEL
// ============================================================

const Wishlist =
  mongoose.models.Wishlist ||
  mongoose.model(
    "Wishlist",
    WishlistSchema
  );

export default Wishlist;