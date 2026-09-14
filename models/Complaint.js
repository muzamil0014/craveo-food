// ============================================================
// CRAVEO - COMPLAINT MODEL
// CUSTOMER SUPPORT + ADMIN MANAGEMENT
// ============================================================

import mongoose from "mongoose";

// ============================================================
// COMPLAINT SCHEMA
// ============================================================

const ComplaintSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // UNIQUE COMPLAINT NUMBER
      // ======================================================

      complaintNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
      },

      // ======================================================
      // CUSTOMER
      // ======================================================

      userId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      // ======================================================
      // CUSTOMER SNAPSHOT
      // ======================================================

      customerName: {
        type: String,
        required: true,
        trim: true,
      },

      customerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      customerPhone: {
        type: String,
        default: "",
        trim: true,
      },

      // ======================================================
      // BRANCH
      // ======================================================

      restaurantId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Restaurant",

        default: null,

        index: true,
      },

      branchName: {
        type: String,
        default: "",
        trim: true,
      },

      // ======================================================
      // OPTIONAL ORDER
      // ======================================================

      orderId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Order",

        default: null,

        index: true,
      },

      orderNumber: {
        type: String,
        default: "",
        trim: true,
      },

      // ======================================================
      // CATEGORY
      // ======================================================

      category: {
        type: String,

        enum: [
          "order",
          "delivery",
          "food",
          "payment",
          "refund",
          "account",
          "branch",
          "general",
          "other",
        ],

        default:
          "general",

        index: true,
      },

      // ======================================================
      // SUBJECT
      // ======================================================

      subject: {
        type: String,

        required: true,

        trim: true,

        maxlength: 150,
      },

      // ======================================================
      // MESSAGE
      // ======================================================

      message: {
        type: String,

        required: true,

        trim: true,

        minlength: 5,

        maxlength: 2000,
      },

      // ======================================================
      // PRIORITY
      // ======================================================

      priority: {
        type: String,

        enum: [
          "low",
          "medium",
          "high",
          "urgent",
        ],

        default:
          "medium",

        index: true,
      },

      // ======================================================
      // STATUS
      // ======================================================

      status: {
        type: String,

        enum: [
          "pending",
          "in-progress",
          "resolved",
          "closed",
        ],

        default:
          "pending",

        index: true,
      },

      // ======================================================
      // ADMIN RESPONSE
      // ======================================================

      adminReply: {
        type: String,

        default: "",

        trim: true,

        maxlength: 2000,
      },

      // ======================================================
      // ADMIN INTERNAL NOTE
      // ======================================================

      adminNote: {
        type: String,

        default: "",

        trim: true,

        maxlength: 2000,
      },

      // ======================================================
      // RESOLVED DATE
      // ======================================================

      resolvedAt: {
        type: Date,

        default: null,
      },

      // ======================================================
      // CLOSED DATE
      // ======================================================

      closedAt: {
        type: Date,

        default: null,
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

ComplaintSchema.index({
  userId: 1,
  createdAt: -1,
});

ComplaintSchema.index({
  restaurantId: 1,
  status: 1,
});

ComplaintSchema.index({
  status: 1,
  createdAt: -1,
});

// ============================================================
// DEVELOPMENT REFRESH
// ============================================================

if (
  process.env.NODE_ENV ===
    "development" &&
  mongoose.models.Complaint
) {
  delete mongoose.models
    .Complaint;
}

// ============================================================
// MODEL
// ============================================================

const Complaint =
  mongoose.models.Complaint ||
  mongoose.model(
    "Complaint",
    ComplaintSchema
  );

export default Complaint;