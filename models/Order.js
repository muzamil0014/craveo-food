// ============================================================
// CRAVEO - ORDER MODEL
// ORDER + PAYMENT + CUSTOMER QR CONFIRMATION
// ============================================================

import mongoose from "mongoose";

// ============================================================
// NORMALIZE PAYMENT METHOD
// ============================================================

function normalizePaymentMethod(value) {
  if (!value) {
    return "cod";
  }

  const method = value
    .toString()
    .trim()
    .toLowerCase();

  // ==========================================================
  // CASH ON DELIVERY ALIASES
  // ==========================================================

  if (
    method === "cod" ||
    method === "cash on delivery" ||
    method === "cash-on-delivery" ||
    method === "cash_on_delivery"
  ) {
    return "cod";
  }

  // ==========================================================
  // CARD
  // ==========================================================

  if (
    method === "card" ||
    method === "credit-card" ||
    method === "debit-card"
  ) {
    return "card";
  }

  // ==========================================================
  // BANK TRANSFER
  // ==========================================================

  if (
    method === "bank-transfer" ||
    method === "bank transfer" ||
    method === "bank_transfer"
  ) {
    return "bank-transfer";
  }

  // ==========================================================
  // WALLET
  // ==========================================================

  if (
    method === "wallet" ||
    method === "digital-wallet" ||
    method === "digital wallet"
  ) {
    return "wallet";
  }

  return method;
}

// ============================================================
// ORDER ITEM SCHEMA
// ============================================================

const OrderItemSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // FOOD
      // ======================================================

      foodId: {
        type:
          mongoose.Schema.Types.ObjectId,
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
      },

      // ======================================================
      // PRICE
      // ======================================================

      price: {
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

      // ======================================================
      // LINE TOTAL
      // ======================================================

      lineTotal: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: true,
    }
  );

// ============================================================
// DELIVERY ADDRESS SCHEMA
// ============================================================

const DeliveryAddressSchema =
  new mongoose.Schema(
    {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      area: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

// ============================================================
// ORDER SCHEMA
// ============================================================

const OrderSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // ORDER NUMBER
      // ======================================================

      orderNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      // ======================================================
      // CUSTOMER
      // ======================================================

      userId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      customerName: {
        type: String,
        required: true,
        trim: true,
      },

      customerEmail: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },

      customerPhone: {
        type: String,
        required: true,
        trim: true,
      },

      // ======================================================
      // BRANCH
      // ======================================================

      restaurantId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
      },

      // ======================================================
      // ITEMS
      // ======================================================

      items: {
        type: [
          OrderItemSchema,
        ],
        default: [],
        required: true,
      },

      // ======================================================
      // PRICING
      // ======================================================

      subtotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      deliveryFee: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      discount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      total: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // ======================================================
      // ORDER STATUS
      // ======================================================

      status: {
        type: String,

        enum: [
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "out-for-delivery",
          "delivered",
          "cancelled",
        ],

        default:
          "pending",

        required: true,
      },

      // ======================================================
      // PAYMENT METHOD
      // ======================================================

      paymentMethod: {
        type: String,

        enum: [
          "cod",
          "card",
          "bank-transfer",
          "wallet",
        ],

        set:
          normalizePaymentMethod,

        default:
          "cod",

        required: true,
      },

      // ======================================================
      // PAYMENT STATUS
      // ======================================================

      paymentStatus: {
        type: String,

        enum: [
          "pending",
          "paid",
          "failed",
          "refunded",
        ],

        default:
          "pending",

        required: true,
      },

      // ======================================================
      // TRANSACTION
      // ======================================================

      transactionId: {
        type: String,
        default: "",
        trim: true,
      },

      // ======================================================
      // DELIVERY ADDRESS
      // ======================================================

      deliveryAddress: {
        type:
          DeliveryAddressSchema,
        required: true,
      },

      // ======================================================
      // NOTES
      // ======================================================

      notes: {
        type: String,
        default: "",
        trim: true,
      },

      // ======================================================
      // CUSTOMER QR CONFIRMATION
      //
      // Token is generated when parcel slip is prepared.
      // Customer scans QR and confirms parcel receipt.
      // ======================================================

      customerConfirmationToken: {
        type: String,
        default: "",
        trim: true,
      },

      customerConfirmed: {
        type: Boolean,
        default: false,
      },

      customerConfirmedAt: {
        type: Date,
        default: null,
      },

      // ======================================================
      // STATUS DATES
      // ======================================================

      confirmedAt: {
        type: Date,
        default: null,
      },

      preparingAt: {
        type: Date,
        default: null,
      },

      readyAt: {
        type: Date,
        default: null,
      },

      outForDeliveryAt: {
        type: Date,
        default: null,
      },

      deliveredAt: {
        type: Date,
        default: null,
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      // ======================================================
      // PAYMENT PAID DATE
      // ======================================================

      paymentPaidAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

// ============================================================
// INDEXES
// ============================================================

OrderSchema.index({
  userId: 1,
  createdAt: -1,
});

OrderSchema.index({
  restaurantId: 1,
  createdAt: -1,
});

OrderSchema.index({
  status: 1,
});

OrderSchema.index({
  paymentStatus: 1,
});

OrderSchema.index({
  paymentMethod: 1,
});

OrderSchema.index({
  customerConfirmationToken: 1,
});

// ============================================================
// MODEL
// ============================================================

const Order =
  mongoose.models.Order ||
  mongoose.model(
    "Order",
    OrderSchema
  );

export default Order;