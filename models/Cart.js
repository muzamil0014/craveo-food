// ============================================================
// CRAVEO - CUSTOMER CART MODEL
// ============================================================

import mongoose from "mongoose";

// ============================================================
// CART ITEM SCHEMA
// ============================================================

const CartItemSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // FOOD
      // ======================================================

      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      image: {
        type: String,
        default: "",
        trim: true,
      },

      // ======================================================
      // QUANTITY
      // ======================================================

      quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 99,
        default: 1,
      },

      // ======================================================
      // BASE FOOD PRICE
      // ======================================================

      unitPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      // ======================================================
      // VARIANT
      // ======================================================

      variantName: {
        type: String,
        default: "",
        trim: true,
      },

      variantPrice: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      _id: true,
    }
  );

// ============================================================
// CART SCHEMA
// ============================================================

const CartSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // CUSTOMER
      // ======================================================

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },

      // ======================================================
      // LOCKED BRANCH
      // ======================================================

      restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
      },

      // ======================================================
      // ITEMS
      // ======================================================

      items: {
        type: [CartItemSchema],
        default: [],
      },

      // ======================================================
      // SUBTOTAL
      // ======================================================

      subtotal: {
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

CartSchema.index({
  restaurantId: 1,
});

CartSchema.index({
  updatedAt: -1,
});

// ============================================================
// MODEL
// ============================================================

const Cart =
  mongoose.models.Cart ||
  mongoose.model(
    "Cart",
    CartSchema
  );

export default Cart;