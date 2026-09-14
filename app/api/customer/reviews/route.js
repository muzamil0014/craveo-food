// ============================================================
// CRAVEO - CUSTOMER REVIEWS API
//
// GET    -> LOAD CUSTOMER REVIEWS + REVIEWABLE ITEMS
// POST   -> CREATE REVIEW
// PUT    -> UPDATE OWN REVIEW
// DELETE -> DELETE OWN REVIEW
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  revalidatePath,
} from "next/cache";

import mongoose from "mongoose";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import {
  recalculateFoodRating,
} from "@/lib/reviewRating";

import User from "@/models/User";
import Food from "@/models/Food";
import Order from "@/models/Order";
import Review from "@/models/Review";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// CLEAN STRING
// ============================================================

function cleanText(
  value,
  maximumLength = 1000
) {
  return String(
    value || ""
  )
    .trim()
    .slice(
      0,
      maximumLength
    );
}

// ============================================================
// CUSTOMER
// ============================================================

async function getCurrentCustomer() {
  const session =
    await getCustomerSession();

  if (!session?.userId) {
    return {
      error:
        NextResponse.json(
          {
            success: false,
            message:
              "Please login first.",
          },
          {
            status: 401,
          }
        ),
    };
  }

  const user =
    await User.findOne({
      _id:
        session.userId,

      role:
        "customer",

      isActive:
        true,
    })
      .select(
        "_id name email avatar"
      )
      .lean();

  if (!user) {
    return {
      error:
        NextResponse.json(
          {
            success: false,
            message:
              "Customer account not found.",
          },
          {
            status: 401,
          }
        ),
    };
  }

  return {
    user,
  };
}

// ============================================================
// REVALIDATE REVIEW PAGES
// ============================================================

function revalidateReviewPages(
  foodSlug = ""
) {
  revalidatePath(
    "/account/reviews"
  );

  revalidatePath(
    "/foods"
  );

  revalidatePath(
    "/"
  );

  if (foodSlug) {
    revalidatePath(
      `/foods/${foodSlug}`
    );
  }

  revalidatePath(
    "/admin/dashboard/reviews"
  );
}

// ============================================================
// GET
// ============================================================

export async function GET(
  request
) {
  try {
    // ========================================================
    // DATABASE
    // ========================================================

    await connectDB();

    // ========================================================
    // CUSTOMER
    // ========================================================

    const customerResult =
      await getCurrentCustomer();

    if (
      customerResult.error
    ) {
      return customerResult.error;
    }

    const user =
      customerResult.user;

    // ========================================================
    // OPTIONAL FOOD FILTER
    // ========================================================

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const foodId =
      searchParams
        .get("foodId")
        ?.trim() || "";

    // ========================================================
    // VALIDATE FOOD FILTER
    // ========================================================

    if (
      foodId &&
      !mongoose.Types.ObjectId.isValid(
        foodId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid food ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // REVIEW QUERY
    // ========================================================

    const reviewQuery = {
      userId:
        user._id,
    };

    if (foodId) {
      reviewQuery.foodId =
        foodId;
    }

    // ========================================================
    // EXISTING REVIEWS
    // ========================================================

    const reviews =
      await Review.find(
        reviewQuery
      )
        .sort({
          createdAt:
            -1,
        })
        .lean();

    // ========================================================
    // ALL DELIVERED ORDERS
    //
    // Only delivered items are reviewable.
    // ========================================================

    const deliveredOrders =
      await Order.find({
        userId:
          user._id,

        status:
          "delivered",
      })
        .select(
          "_id orderNumber restaurantId items createdAt deliveredAt"
        )
        .sort({
          deliveredAt:
            -1,

          createdAt:
            -1,
        })
        .lean();

    // ========================================================
    // ALL CUSTOMER REVIEWS FOR DUPLICATE CHECK
    //
    // Don't use filtered reviews here.
    // ========================================================

    const allCustomerReviews =
      await Review.find({
        userId:
          user._id,
      })
        .select(
          "orderId foodId"
        )
        .lean();

    const reviewedKeys =
      new Set(
        allCustomerReviews.map(
          (review) =>
            `${review.orderId?.toString()}-${review.foodId?.toString()}`
        )
      );

    // ========================================================
    // REVIEWABLE ITEMS
    // ========================================================

    const reviewableItems =
      [];

    for (
      const order of
      deliveredOrders
    ) {
      for (
        const item of
        order.items || []
      ) {
        const currentFoodId =
          item.foodId
            ?.toString();

        if (!currentFoodId) {
          continue;
        }

        // ====================================================
        // FOOD FILTER
        // ====================================================

        if (
          foodId &&
          currentFoodId !==
            foodId
        ) {
          continue;
        }

        // ====================================================
        // ALREADY REVIEWED?
        // ====================================================

        const reviewKey =
          `${order._id.toString()}-${currentFoodId}`;

        if (
          reviewedKeys.has(
            reviewKey
          )
        ) {
          continue;
        }

        reviewableItems.push({
          orderId:
            order._id.toString(),

          orderNumber:
            order.orderNumber ||
            "",

          restaurantId:
            order.restaurantId
              ?.toString() ||
            "",

          foodId:
            currentFoodId,

          foodName:
            item.name || "",

          foodImage:
            item.image || "",

          quantity:
            Number(
              item.quantity || 1
            ),

          variantName:
            item.variantName ||
            "",

          deliveredAt:
            order.deliveredAt ||
            order.createdAt,
        });
      }
    }

    // ========================================================
    // SERIALIZE REVIEWS
    // ========================================================

    const serializedReviews =
      reviews.map(
        (review) => ({
          id:
            review._id.toString(),

          foodId:
            review.foodId
              ?.toString() ||
            "",

          orderId:
            review.orderId
              ?.toString() ||
            "",

          restaurantId:
            review.restaurantId
              ?.toString() ||
            "",

          foodName:
            review.foodName ||
            "",

          foodImage:
            review.foodImage ||
            "",

          orderNumber:
            review.orderNumber ||
            "",

          rating:
            Number(
              review.rating || 0
            ),

          title:
            review.title || "",

          comment:
            review.comment ||
            "",

          isVerifiedPurchase:
            Boolean(
              review.isVerifiedPurchase
            ),

          isApproved:
            Boolean(
              review.isApproved
            ),

          isHidden:
            Boolean(
              review.isHidden
            ),

          adminReply:
            review.adminReply ||
            "",

          createdAt:
            review.createdAt,

          updatedAt:
            review.updatedAt,
        })
      );

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      reviews:
        serializedReviews,

      reviewableItems,

      totalReviews:
        serializedReviews.length,

      totalReviewable:
        reviewableItems.length,
    });
  } catch (error) {
    console.error(
      "GET CUSTOMER REVIEWS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to load reviews.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST
// CREATE REVIEW
// ============================================================

export async function POST(
  request
) {
  try {
    // ========================================================
    // DATABASE
    // ========================================================

    await connectDB();

    // ========================================================
    // CUSTOMER
    // ========================================================

    const customerResult =
      await getCurrentCustomer();

    if (
      customerResult.error
    ) {
      return customerResult.error;
    }

    const user =
      customerResult.user;

    // ========================================================
    // BODY
    // ========================================================

    const body =
      await request.json();

    const orderId =
      cleanText(
        body.orderId,
        50
      );

    const foodId =
      cleanText(
        body.foodId,
        50
      );

    const rating =
      Number(
        body.rating
      );

    const title =
      cleanText(
        body.title,
        100
      );

    const comment =
      cleanText(
        body.comment,
        1000
      );

    // ========================================================
    // ID VALIDATION
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      ) ||
      !mongoose.Types.ObjectId.isValid(
        foodId
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid order or food.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // RATING VALIDATION
    // ========================================================

    if (
      !Number.isInteger(
        rating
      ) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please select a rating between 1 and 5 stars.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // COMMENT VALIDATION
    // ========================================================

    if (
      comment.length < 3
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please write your review.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // ORDER MUST BELONG TO CUSTOMER + BE DELIVERED
    // ========================================================

    const order =
      await Order.findOne({
        _id:
          orderId,

        userId:
          user._id,

        status:
          "delivered",
      }).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Only delivered orders can be reviewed.",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================================
    // FOOD MUST EXIST IN ORDER
    // ========================================================

    const orderItem =
      order.items?.find(
        (item) =>
          item.foodId
            ?.toString() ===
          foodId
      );

    if (!orderItem) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This food was not found in this order.",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================================
    // DUPLICATE REVIEW
    // ========================================================

    const existingReview =
      await Review.findOne({
        userId:
          user._id,

        orderId:
          order._id,

        foodId,
      }).lean();

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,

          message:
            "You have already reviewed this food from this order.",
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // FOOD
    // ========================================================

    const food =
      await Food.findById(
        foodId
      )
        .select(
          "_id name image slug"
        )
        .lean();

    if (!food) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Food not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // CREATE REVIEW
    // ========================================================

    const review =
      await Review.create({
        userId:
          user._id,

        foodId:
          food._id,

        orderId:
          order._id,

        restaurantId:
          order.restaurantId,

        customerName:
          user.name || "",

        customerEmail:
          user.email || "",

        foodName:
          orderItem.name ||
          food.name ||
          "",

        foodImage:
          orderItem.image ||
          food.image ||
          "",

        orderNumber:
          order.orderNumber ||
          "",

        rating,

        title,

        comment,

        isVerifiedPurchase:
          true,

        // ====================================================
        // ADMIN MUST APPROVE
        // ====================================================

        isApproved:
          false,

        isHidden:
          false,
      });

    // ========================================================
    // CALCULATE CURRENT PUBLIC RATING
    // ========================================================

    await recalculateFoodRating(
      food._id.toString()
    );

    // ========================================================
    // REVALIDATE
    // ========================================================

    revalidateReviewPages(
      food.slug
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Review submitted successfully. It is waiting for admin approval.",

        review: {
          id:
            review._id.toString(),

          rating:
            review.rating,

          title:
            review.title,

          comment:
            review.comment,

          isApproved:
            review.isApproved,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    // ========================================================
    // DUPLICATE DATABASE INDEX
    // ========================================================

    if (
      error?.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "You have already reviewed this food from this order.",
        },
        {
          status: 409,
        }
      );
    }

    console.error(
      "CREATE CUSTOMER REVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to submit review.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// PUT
// UPDATE OWN REVIEW
// ============================================================

export async function PUT(
  request
) {
  try {
    await connectDB();

    // ========================================================
    // CUSTOMER
    // ========================================================

    const customerResult =
      await getCurrentCustomer();

    if (
      customerResult.error
    ) {
      return customerResult.error;
    }

    const user =
      customerResult.user;

    // ========================================================
    // BODY
    // ========================================================

    const body =
      await request.json();

    const reviewId =
      cleanText(
        body.reviewId,
        50
      );

    const rating =
      Number(
        body.rating
      );

    const title =
      cleanText(
        body.title,
        100
      );

    const comment =
      cleanText(
        body.comment,
        1000
      );

    // ========================================================
    // VALIDATE REVIEW ID
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        reviewId
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid review ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // RATING
    // ========================================================

    if (
      !Number.isInteger(
        rating
      ) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please select a rating between 1 and 5 stars.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // COMMENT
    // ========================================================

    if (
      comment.length < 3
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please write your review.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // OWN REVIEW ONLY
    // ========================================================

    const review =
      await Review.findOne({
        _id:
          reviewId,

        userId:
          user._id,
      });

    if (!review) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Review not found.",
        },
        {
          status: 404,
        }
      );
    }

    const foodId =
      review.foodId.toString();

    // ========================================================
    // UPDATE REVIEW
    // ========================================================

    review.rating =
      rating;

    review.title =
      title;

    review.comment =
      comment;

    // ========================================================
    // EDITED REVIEW REQUIRES APPROVAL AGAIN
    // ========================================================

    review.isApproved =
      false;

    review.isHidden =
      false;

    await review.save();

    // ========================================================
    // FOOD RATING
    // ========================================================

    await recalculateFoodRating(
      foodId
    );

    const food =
      await Food.findById(
        foodId
      )
        .select(
          "slug"
        )
        .lean();

    // ========================================================
    // REVALIDATE
    // ========================================================

    revalidateReviewPages(
      food?.slug || ""
    );

    return NextResponse.json({
      success: true,

      message:
        "Review updated successfully. It is waiting for approval.",
    });
  } catch (error) {
    console.error(
      "UPDATE CUSTOMER REVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to update review.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE
// DELETE OWN REVIEW
// ============================================================

export async function DELETE(
  request
) {
  try {
    await connectDB();

    // ========================================================
    // CUSTOMER
    // ========================================================

    const customerResult =
      await getCurrentCustomer();

    if (
      customerResult.error
    ) {
      return customerResult.error;
    }

    const user =
      customerResult.user;

    // ========================================================
    // BODY
    // ========================================================

    const body =
      await request.json();

    const reviewId =
      cleanText(
        body.reviewId,
        50
      );

    // ========================================================
    // REVIEW ID
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        reviewId
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid review ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // DELETE OWN REVIEW
    // ========================================================

    const review =
      await Review.findOneAndDelete({
        _id:
          reviewId,

        userId:
          user._id,
      });

    if (!review) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Review not found.",
        },
        {
          status: 404,
        }
      );
    }

    const foodId =
      review.foodId.toString();

    // ========================================================
    // RECALCULATE RATING
    // ========================================================

    await recalculateFoodRating(
      foodId
    );

    const food =
      await Food.findById(
        foodId
      )
        .select(
          "slug"
        )
        .lean();

    revalidateReviewPages(
      food?.slug || ""
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        "Review deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE CUSTOMER REVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to delete review.",
      },
      {
        status: 500,
      }
    );
  }
}