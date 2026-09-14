// ============================================================
// CRAVEO - ADMIN MODEL
// ============================================================

import mongoose from "mongoose";

// ============================================================
// ADMIN SCHEMA
// ============================================================

const adminSchema = new mongoose.Schema(
  {
    // --------------------------------------------------------
    // BASIC INFORMATION
    // --------------------------------------------------------

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // --------------------------------------------------------
    // ROLE
    // --------------------------------------------------------

    role: {
      type: String,

      enum: [
        "super-admin",
        "branch-admin",
      ],

      required: true,
      default: "branch-admin",
    },

    // --------------------------------------------------------
    // ASSIGNED BRANCH
    //
    // Super Admin = null
    // Branch Admin = required by API
    // --------------------------------------------------------

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    // --------------------------------------------------------
    // ACCOUNT STATUS
    // --------------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
    },

    // --------------------------------------------------------
    // LOGIN INFORMATION
    // --------------------------------------------------------

    lastLogin: {
      type: Date,
      default: null,
    },

    lastLoginIp: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

adminSchema.index({
  role: 1,
});

adminSchema.index({
  restaurantId: 1,
});

adminSchema.index({
  isActive: 1,
});

// ============================================================
// MODEL
// ============================================================

const Admin =
  mongoose.models.Admin ||
  mongoose.model(
    "Admin",
    adminSchema
  );

export default Admin;