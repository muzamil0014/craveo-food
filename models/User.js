// ============================================================
// CRAVEO - CUSTOMER USER MODEL
// CITY + PROFILE + SELECTED BRANCH
// ============================================================

import mongoose from "mongoose";

// ============================================================
// ADDRESS SCHEMA
// ============================================================

const AddressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "Home",
      trim: true,
    },

    fullName: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    area: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

// ============================================================
// USER SCHEMA
// ============================================================

const UserSchema = new mongoose.Schema(
  {
    // ========================================================
    // NAME
    // ========================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ========================================================
    // EMAIL
    // ========================================================

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ========================================================
    // PHONE
    // ========================================================

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // CITY
    // ========================================================

    city: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // ========================================================
    // PASSWORD
    // ========================================================

    password: {
      type: String,
      required: true,
      select: false,
    },

    // ========================================================
    // AVATAR
    // ========================================================

    avatar: {
      type: String,
      default: "",
      trim: true,
    },

    avatarPublicId: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // ROLE
    // ========================================================

    role: {
      type: String,
      enum: ["customer"],
      default: "customer",
    },

    // ========================================================
    // SELECTED BRANCH
    // ========================================================

    selectedRestaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    // ========================================================
    // ACCOUNT STATUS
    // ========================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ========================================================
    // ADDRESSES
    // ========================================================

    addresses: {
      type: [AddressSchema],
      default: [],
    },

    // ========================================================
    // LAST LOGIN
    // ========================================================

    lastLogin: {
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

UserSchema.index({
  selectedRestaurantId: 1,
});

// ============================================================
// IMPORTANT
// REFRESH USER MODEL IN DEVELOPMENT
//
// Nayi schema fields jaise `city` Turbopack hot reload ke baad
// old cached model mein missing reh sakti hain.
// ============================================================

if (
  process.env.NODE_ENV === "development" &&
  mongoose.models.User
) {
  delete mongoose.models.User;
}

// ============================================================
// USER MODEL
// PREVENT OVERWRITE MODEL ERROR IN NEXT.JS
// ============================================================

const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    UserSchema
  );

export default User;