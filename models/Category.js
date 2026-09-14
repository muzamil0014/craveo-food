// ============================================================
// CRAVEO - CATEGORY MODEL
// ============================================================

import mongoose from "mongoose";

// ============================================================
// CATEGORY SCHEMA
// ============================================================

const categorySchema = new mongoose.Schema(
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
    // STATUS
    // --------------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
    },

    // --------------------------------------------------------
    // SORT ORDER
    // --------------------------------------------------------

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEX
// ============================================================

categorySchema.index({
  isActive: 1,
  sortOrder: 1,
});

// ============================================================
// MODEL
// ============================================================

const Category =
  mongoose.models.Category ||
  mongoose.model(
    "Category",
    categorySchema
  );

export default Category;