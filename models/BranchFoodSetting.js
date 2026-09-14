// ============================================================
// CRAVEO - BRANCH FOOD SETTINGS MODEL
// ============================================================

import mongoose from "mongoose";

// ============================================================
// SCHEMA
// ============================================================

const branchFoodSettingSchema =
  new mongoose.Schema(
    {
      restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
      },

      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
      },

      isAvailable: {
        type: Boolean,
        default: true,
      },

      stock: {
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
// ONE SETTING PER FOOD PER BRANCH
// ============================================================

branchFoodSettingSchema.index(
  {
    restaurantId: 1,
    foodId: 1,
  },
  {
    unique: true,
  }
);

// ============================================================
// MODEL
// ============================================================

const BranchFoodSetting =
  mongoose.models.BranchFoodSetting ||
  mongoose.model(
    "BranchFoodSetting",
    branchFoodSettingSchema
  );

export default BranchFoodSetting;