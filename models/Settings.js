// ============================================================
// CRAVEO - SETTINGS MODEL
// ============================================================

import mongoose from "mongoose";

// ============================================================
// SETTINGS SCHEMA
// ============================================================

const SettingsSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // MAIN KEY
      // ======================================================

      key: {
        type: String,
        default: "main",
        unique: true,
        trim: true,
      },

      // ======================================================
      // GENERAL SETTINGS
      // ======================================================

      siteName: {
        type: String,
        default: "CRAVEO",
        trim: true,
      },

      siteTagline: {
        type: String,
        default:
          "Premium Food Delivery",
        trim: true,
      },

      currency: {
        type: String,
        default: "PKR",
        trim: true,
      },

      timezone: {
        type: String,
        default:
          "Asia/Karachi",
        trim: true,
      },

      // ======================================================
      // DELIVERY SETTINGS
      // ======================================================

      deliveryEnabled: {
        type: Boolean,
        default: true,
      },

      defaultDeliveryFee: {
        type: Number,
        default: 150,
        min: 0,
      },

      freeDeliveryMinimum: {
        type: Number,
        default: 0,
        min: 0,
      },

      minimumOrderAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      estimatedDeliveryMinutes: {
        type: Number,
        default: 45,
        min: 0,
      },

      // ======================================================
      // ORDER SETTINGS
      // ======================================================

      ordersEnabled: {
        type: Boolean,
        default: true,
      },

      allowOrderCancellation: {
        type: Boolean,
        default: true,
      },

      cancellationMinutes: {
        type: Number,
        default: 10,
        min: 0,
      },

      autoConfirmOrders: {
        type: Boolean,
        default: false,
      },

      // ======================================================
      // PAYMENT SETTINGS
      // ======================================================

      cashOnDeliveryEnabled: {
        type: Boolean,
        default: true,
      },

      cardPaymentEnabled: {
        type: Boolean,
        default: false,
      },

      bankTransferEnabled: {
        type: Boolean,
        default: false,
      },

      walletPaymentEnabled: {
        type: Boolean,
        default: false,
      },

      // ======================================================
      // CONTACT
      // ======================================================

      supportEmail: {
        type: String,
        default: "",
        trim: true,
      },

      supportPhone: {
        type: String,
        default: "",
        trim: true,
      },

      businessAddress: {
        type: String,
        default: "",
        trim: true,
      },

      // ======================================================
      // SOCIAL
      // ======================================================

      facebookUrl: {
        type: String,
        default: "",
        trim: true,
      },

      instagramUrl: {
        type: String,
        default: "",
        trim: true,
      },

      youtubeUrl: {
        type: String,
        default: "",
        trim: true,
      },

      tiktokUrl: {
        type: String,
        default: "",
        trim: true,
      },

      // ======================================================
      // SPECIAL OFFER BANNER
      // ======================================================

      offerBannerImage: {
        type: String,
        default:
          "/images/offer-default.jpg",
        trim: true,
      },

      offerBannerImagePublicId: {
        type: String,
        default: "",
        trim: true,
      },

      // ======================================================
      // MAINTENANCE
      // ======================================================

      maintenanceMode: {
        type: Boolean,
        default: false,
      },

      maintenanceMessage: {
        type: String,
        default:
          "CRAVEO is temporarily unavailable. Please check back soon.",
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

// ============================================================
// MODEL
// ============================================================

const Settings =
  mongoose.models.Settings ||
  mongoose.model(
    "Settings",
    SettingsSchema
  );

export default Settings;