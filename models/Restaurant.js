// ============================================================
// CRAVEO - RESTAURANT / BRANCH MODEL
// ============================================================

import mongoose from "mongoose";

// ============================================================
// RESTAURANT SCHEMA
// ============================================================

const restaurantSchema = new mongoose.Schema(
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
    // BRANCH TYPE
    // --------------------------------------------------------

    branchType: {
      type: String,

      enum: [
        "super",
        "city-main",
        "normal",
      ],

      default: "normal",

      required: true,
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
    // CONTACT
    // --------------------------------------------------------

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    // --------------------------------------------------------
    // LOCATION
    // --------------------------------------------------------

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      default: "Karachi",
      trim: true,
    },

    area: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // TIMINGS
    // --------------------------------------------------------

    openingTime: {
      type: String,
      default: "11:00",
    },

    closingTime: {
      type: String,
      default: "23:00",
    },

    // --------------------------------------------------------
    // DELIVERY
    // --------------------------------------------------------

    deliveryTime: {
      type: String,
      default: "30-45 min",
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

restaurantSchema.index({
  branchType: 1,
});

restaurantSchema.index({
  city: 1,
  branchType: 1,
});

// ============================================================
// MODEL
// ============================================================

const Restaurant =
  mongoose.models.Restaurant ||
  mongoose.model(
    "Restaurant",
    restaurantSchema
  );

export default Restaurant;