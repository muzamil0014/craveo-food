// ============================================================
// CRAVEO - REVIEW RATING HELPER
// RECALCULATE FOOD RATING + REVIEW COUNT
// ============================================================

import mongoose from "mongoose";

import Review from "@/models/Review";
import Food from "@/models/Food";

// ============================================================
// RECALCULATE FOOD RATING
// ============================================================

export async function recalculateFoodRating(
  foodId
) {
  // ==========================================================
  // VALIDATE FOOD ID
  // ==========================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      foodId
    )
  ) {
    return {
      rating: 0,
      reviewsCount: 0,
    };
  }

  // ==========================================================
  // ONLY APPROVED + VISIBLE REVIEWS
  // ==========================================================

  const result =
    await Review.aggregate([
      {
        $match: {
          foodId:
            new mongoose.Types.ObjectId(
              foodId
            ),

          isApproved:
            true,

          isHidden:
            false,
        },
      },

      {
        $group: {
          _id:
            "$foodId",

          averageRating: {
            $avg:
              "$rating",
          },

          reviewsCount: {
            $sum:
              1,
          },
        },
      },
    ]);

  // ==========================================================
  // FINAL VALUES
  // ==========================================================

  const rating =
    result.length > 0
      ? Number(
          Number(
            result[0].averageRating
          ).toFixed(1)
        )
      : 0;

  const reviewsCount =
    result.length > 0
      ? Number(
          result[0].reviewsCount
        )
      : 0;

  // ==========================================================
  // UPDATE FOOD
  // ==========================================================

  await Food.findByIdAndUpdate(
    foodId,
    {
      $set: {
        rating,
        reviewsCount,
      },
    }
  );

  return {
    rating,
    reviewsCount,
  };
}