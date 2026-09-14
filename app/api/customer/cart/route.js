// ============================================================
// CRAVEO - CUSTOMER CART API
// ============================================================

import {
  NextResponse,
} from "next/server";

import mongoose from "mongoose";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Food from "@/models/Food";
import Restaurant from "@/models/Restaurant";
import Cart from "@/models/Cart";

// ============================================================
// GET CUSTOMER + SELECTED BRANCH
// ============================================================

async function getCustomerContext() {
  const session =
    await getCustomerSession();

  if (!session?.userId) {
    return {
      error:
        "Please login first.",
      status:
        401,
    };
  }

  await connectDB();

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
        "_id selectedRestaurantId"
      )
      .lean();

  if (!user) {
    return {
      error:
        "Customer account not found.",
      status:
        401,
    };
  }

  if (
    !user.selectedRestaurantId
  ) {
    return {
      error:
        "Please select a branch first.",
      status:
        400,

      code:
        "BRANCH_REQUIRED",
    };
  }

  const restaurant =
    await Restaurant.findOne({
      _id:
        user.selectedRestaurantId,

      isActive:
        true,
    })
      .select(
        "_id name"
      )
      .lean();

  if (!restaurant) {
    return {
      error:
        "Selected branch is unavailable.",
      status:
        400,

      code:
        "BRANCH_REQUIRED",
    };
  }

  return {
    user,
    restaurant,
  };
}

// ============================================================
// CALCULATE CART SUBTOTAL
// ============================================================

function calculateSubtotal(
  items = []
) {
  return items.reduce(
    (
      total,
      item
    ) => {
      const base =
        Number(
          item.unitPrice ||
            0
        );

      const variant =
        Number(
          item.variantPrice ||
            0
        );

      const quantity =
        Number(
          item.quantity ||
            0
        );

      return (
        total +
        (base + variant) *
          quantity
      );
    },
    0
  );
}

// ============================================================
// SERIALIZE CART
// ============================================================

function serializeCart(
  cart,
  restaurant
) {
  if (!cart) {
    return {
      restaurant: {
        id:
          restaurant._id.toString(),

        name:
          restaurant.name,
      },

      items: [],

      subtotal:
        0,

      totalItems:
        0,
    };
  }

  return {
    id:
      cart._id.toString(),

    restaurant: {
      id:
        restaurant._id.toString(),

      name:
        restaurant.name,
    },

    items:
      cart.items.map(
        (item) => ({
          id:
            item._id.toString(),

          foodId:
            item.foodId.toString(),

          name:
            item.name,

          image:
            item.image || "",

          quantity:
            Number(
              item.quantity ||
                1
            ),

          unitPrice:
            Number(
              item.unitPrice ||
                0
            ),

          variantName:
            item.variantName ||
            "",

          variantPrice:
            Number(
              item.variantPrice ||
                0
            ),

          lineTotal:
            (Number(
              item.unitPrice ||
                0
            ) +
              Number(
                item.variantPrice ||
                  0
              )) *
            Number(
              item.quantity ||
                1
            ),
        })
      ),

    subtotal:
      Number(
        cart.subtotal ||
          0
      ),

    totalItems:
      cart.items.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quantity ||
              0
          ),
        0
      ),
  };
}

// ============================================================
// GET CART
// ============================================================

export async function GET() {
  try {
    const context =
      await getCustomerContext();

    if (context.error) {
      return NextResponse.json(
        {
          success: false,
          code:
            context.code ||
            null,
          message:
            context.error,
        },
        {
          status:
            context.status,
        }
      );
    }

    const {
      user,
      restaurant,
    } = context;

    const cart =
      await Cart.findOne({
        userId:
          user._id,
      });

    // ========================================================
    // CART BELONGS TO ANOTHER BRANCH
    // ========================================================

    if (
      cart &&
      cart.restaurantId.toString() !==
        restaurant._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,

          code:
            "CART_BRANCH_MISMATCH",

          message:
            "Your cart belongs to another branch. Please change branch or clear the cart.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json({
      success: true,

      cart:
        serializeCart(
          cart,
          restaurant
        ),
    });
  } catch (error) {
    console.error(
      "GET CART ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to load cart.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST - ADD ITEM TO CART
// ============================================================

export async function POST(
  request
) {
  try {
    const context =
      await getCustomerContext();

    if (context.error) {
      return NextResponse.json(
        {
          success: false,
          code:
            context.code ||
            null,
          message:
            context.error,
        },
        {
          status:
            context.status,
        }
      );
    }

    const {
      user,
      restaurant,
    } = context;

    const body =
      await request.json();

    const foodId =
      body.foodId
        ?.toString();

    const requestedQuantity =
      Number(
        body.quantity ||
          1
      );

    const variantName =
      body.variantName
        ?.toString()
        .trim() || "";

    // ========================================================
    // FOOD ID
    // ========================================================

    if (
      !foodId ||
      !mongoose.Types.ObjectId.isValid(
        foodId
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid food.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // QUANTITY
    // ========================================================

    if (
      !Number.isInteger(
        requestedQuantity
      ) ||
      requestedQuantity < 1 ||
      requestedQuantity > 99
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid quantity.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // FOOD MUST BELONG TO SELECTED BRANCH
    // ========================================================

    const food =
      await Food.findOne({
        _id:
          foodId,

        isAvailable:
          true,

        restaurantIds:
          restaurant._id,
      }).lean();

    if (!food) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This food is not available at your selected branch.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // STOCK CHECK
    // ========================================================

    if (
      typeof food.stock ===
        "number" &&
      food.stock <= 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This food is out of stock.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // PRICE
    // ========================================================

    const unitPrice =
      Number(
        food.salePrice > 0
          ? food.salePrice
          : food.price
      );

    // ========================================================
    // VARIANT VALIDATION
    // ========================================================

    const variants =
      Array.isArray(
        food.variants
      )
        ? food.variants
        : [];

    let selectedVariant =
      null;

    let variantPrice =
      0;

    if (
      variants.length > 0
    ) {
      if (!variantName) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Please select a food variant.",
          },
          {
            status: 400,
          }
        );
      }

      selectedVariant =
        variants.find(
          (variant) =>
            variant.name
              ?.toString()
              .trim()
              .toLowerCase() ===
            variantName
              .toLowerCase()
        );

      if (!selectedVariant) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Selected variant is not valid.",
          },
          {
            status: 400,
          }
        );
      }

      variantPrice =
        Number(
          selectedVariant.price ||
            0
        );
    }

    // ========================================================
    // GET / CREATE CART
    // ========================================================

    let cart =
      await Cart.findOne({
        userId:
          user._id,
      });

    if (!cart) {
      cart =
        await Cart.create({
          userId:
            user._id,

          restaurantId:
            restaurant._id,

          items:
            [],
        });
    }

    // ========================================================
    // CART BRANCH LOCK
    // ========================================================

    if (
      cart.restaurantId.toString() !==
      restaurant._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,

          code:
            "CART_BRANCH_MISMATCH",

          message:
            "Your cart contains items from another branch. Clear the cart before adding this item.",
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // EXISTING SAME FOOD + SAME VARIANT
    // ========================================================

    const existingItem =
      cart.items.find(
        (item) =>
          item.foodId.toString() ===
            food._id.toString() &&
          (
            item.variantName ||
            ""
          ).toLowerCase() ===
            (
              selectedVariant?.name ||
              ""
            ).toLowerCase()
      );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity +
        requestedQuantity;

      if (
        newQuantity > 99
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Maximum quantity is 99.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        typeof food.stock ===
          "number" &&
        newQuantity >
          food.stock
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              `Only ${food.stock} item(s) are available.`,
          },
          {
            status: 400,
          }
        );
      }

      existingItem.quantity =
        newQuantity;

      // Refresh price from server
      existingItem.unitPrice =
        unitPrice;

      existingItem.variantPrice =
        variantPrice;
    } else {
      if (
        typeof food.stock ===
          "number" &&
        requestedQuantity >
          food.stock
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              `Only ${food.stock} item(s) are available.`,
          },
          {
            status: 400,
          }
        );
      }

      cart.items.push({
        foodId:
          food._id,

        name:
          food.name,

        image:
          food.image || "",

        quantity:
          requestedQuantity,

        unitPrice,

        variantName:
          selectedVariant?.name ||
          "",

        variantPrice,
      });
    }

    // ========================================================
    // SUBTOTAL
    // ========================================================

    cart.subtotal =
      calculateSubtotal(
        cart.items
      );

    await cart.save();

    return NextResponse.json({
      success: true,

      message:
        "Added to cart.",

      cart:
        serializeCart(
          cart,
          restaurant
        ),
    });
  } catch (error) {
    console.error(
      "ADD TO CART ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to add item to cart.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// PATCH - UPDATE QUANTITY
// ============================================================

export async function PATCH(
  request
) {
  try {
    const context =
      await getCustomerContext();

    if (context.error) {
      return NextResponse.json(
        {
          success: false,

          message:
            context.error,
        },
        {
          status:
            context.status,
        }
      );
    }

    const {
      user,
      restaurant,
    } = context;

    const body =
      await request.json();

    const itemId =
      body.itemId
        ?.toString();

    const quantity =
      Number(
        body.quantity
      );

    if (
      !itemId ||
      !mongoose.Types.ObjectId.isValid(
        itemId
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid cart item.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Quantity must be between 1 and 99.",
        },
        {
          status: 400,
        }
      );
    }

    const cart =
      await Cart.findOne({
        userId:
          user._id,

        restaurantId:
          restaurant._id,
      });

    if (!cart) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Cart not found.",
        },
        {
          status: 404,
        }
      );
    }

    const item =
      cart.items.id(
        itemId
      );

    if (!item) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Cart item not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // REVALIDATE FOOD / STOCK
    // ========================================================

    const food =
      await Food.findOne({
        _id:
          item.foodId,

        restaurantIds:
          restaurant._id,

        isAvailable:
          true,
      }).lean();

    if (!food) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This food is no longer available.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof food.stock ===
        "number" &&
      quantity >
        food.stock
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            `Only ${food.stock} item(s) are available.`,
        },
        {
          status: 400,
        }
      );
    }

    item.quantity =
      quantity;

    // Refresh server price
    item.unitPrice =
      Number(
        food.salePrice > 0
          ? food.salePrice
          : food.price
      );

    cart.subtotal =
      calculateSubtotal(
        cart.items
      );

    await cart.save();

    return NextResponse.json({
      success: true,

      message:
        "Cart updated.",

      cart:
        serializeCart(
          cart,
          restaurant
        ),
    });
  } catch (error) {
    console.error(
      "UPDATE CART ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to update cart.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE - REMOVE ITEM OR CLEAR CART
// ============================================================

export async function DELETE(
  request
) {
  try {
    const context =
      await getCustomerContext();

    if (context.error) {
      return NextResponse.json(
        {
          success: false,
          message:
            context.error,
        },
        {
          status:
            context.status,
        }
      );
    }

    const {
      user,
      restaurant,
    } = context;

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const itemId =
      searchParams.get(
        "itemId"
      );

    const cart =
      await Cart.findOne({
        userId:
          user._id,

        restaurantId:
          restaurant._id,
      });

    // ========================================================
    // NOTHING TO CLEAR
    // ========================================================

    if (!cart) {
      return NextResponse.json({
        success: true,

        cart:
          serializeCart(
            null,
            restaurant
          ),
      });
    }

    // ========================================================
    // CLEAR FULL CART
    // ========================================================

    if (!itemId) {
      await Cart.deleteOne({
        _id:
          cart._id,
      });

      return NextResponse.json({
        success: true,

        message:
          "Cart cleared.",

        cart:
          serializeCart(
            null,
            restaurant
          ),
      });
    }

    // ========================================================
    // REMOVE ONE ITEM
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        itemId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid cart item.",
        },
        {
          status: 400,
        }
      );
    }

    const item =
      cart.items.id(
        itemId
      );

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cart item not found.",
        },
        {
          status: 404,
        }
      );
    }

    item.deleteOne();

    // ========================================================
    // CART EMPTY
    // ========================================================

    if (
      cart.items.length ===
      0
    ) {
      await Cart.deleteOne({
        _id:
          cart._id,
      });

      return NextResponse.json({
        success: true,

        message:
          "Item removed.",

        cart:
          serializeCart(
            null,
            restaurant
          ),
      });
    }

    cart.subtotal =
      calculateSubtotal(
        cart.items
      );

    await cart.save();

    return NextResponse.json({
      success: true,

      message:
        "Item removed.",

      cart:
        serializeCart(
          cart,
          restaurant
        ),
    });
  } catch (error) {
    console.error(
      "DELETE CART ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to update cart.",
      },
      {
        status: 500,
      }
    );
  }
}