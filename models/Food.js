// ============================================================
// CRAVEO - FOOD MODEL
// ============================================================

import mongoose from "mongoose";

// ============================================================
// FOOD VARIANT SCHEMA
// ============================================================

const foodVariantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// FOOD SCHEMA
// ============================================================

const foodSchema = new mongoose.Schema(
  {
    // --------------------------------------------------------
    // BASIC INFORMATION
    // --------------------------------------------------------

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // --------------------------------------------------------
    // ASSIGNED BRANCHES
    // --------------------------------------------------------

    restaurantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],

    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------

    image: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    // --------------------------------------------------------
    // PRICING
    // --------------------------------------------------------

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    salePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --------------------------------------------------------
    // VARIANTS
    // --------------------------------------------------------

    variants: {
      type: [foodVariantSchema],
      default: [],
    },

    // --------------------------------------------------------
    // INVENTORY
    // --------------------------------------------------------

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isPopular: {
      type: Boolean,
      default: false,
    },

    // --------------------------------------------------------
    // RATINGS
    // --------------------------------------------------------

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

foodSchema.index({
  categoryId: 1,
});

foodSchema.index({
  restaurantIds: 1,
});

foodSchema.index({
  isAvailable: 1,
});

foodSchema.index({
  isFeatured: 1,
});

foodSchema.index({
  isPopular: 1,
});

// ============================================================
// MODEL
// ============================================================

const Food =
  mongoose.models.Food ||
  mongoose.model(
    "Food",
    foodSchema
  );

export default Food;