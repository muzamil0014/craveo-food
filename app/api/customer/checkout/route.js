// ============================================================
// CRAVEO - CUSTOMER CHECKOUT API
//
// COMPLETE SECURE CHECKOUT
//
// FEATURES:
// - Customer authentication
// - Branch validation
// - Cart validation
// - Fresh food prices
// - Stock validation
// - Variant validation
// - Delivery fee
// - Coupon validation
// - Correct percentage discount
// - Total coupon usage limit
// - ONE ACCOUNT + ONE COUPON = ONE USE
// - Order creation
// - Coupon usage tracking
// - Stock reduction
// - Save address
// - Clear cart
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import Food from "@/models/Food";
import Cart from "@/models/Cart";
import Coupon from "@/models/Coupon";
import CouponUsage from "@/models/CouponUsage";
import Settings from "@/models/Settings";
import Order from "@/models/Order";

// ============================================================
// CREATE ORDER NUMBER
// ============================================================

function createOrderNumber() {
  const now =
    new Date();

  const year =
    now
      .getFullYear()
      .toString()
      .slice(-2);

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  const random =
    Math.floor(
      100000 +
        Math.random() *
          900000
    );

  return `CRV-${year}${month}${day}-${random}`;
}

// ============================================================
// CALCULATE COUPON DISCOUNT
//
// PERCENTAGE EXAMPLE:
//
// discountValue = 20
// maximumDiscount = 25
//
// Effective discount = 20%
//
// PKR 499
// 20% = 99.8
// Rounded = PKR 100
//
// percentage:
// maximumDiscount = percentage ceiling
//
// fixed:
// maximumDiscount = PKR ceiling
//
// maximumDiscount = 0
// means no ceiling
// ============================================================

function calculateCouponDiscount(
  coupon,
  subtotal
) {
  const discountValue =
    Number(
      coupon.discountValue ||
        0
    );

  const maximumDiscount =
    Number(
      coupon.maximumDiscount ||
        0
    );

  let discount =
    0;

  // ==========================================================
  // PERCENTAGE
  // ==========================================================

  if (
    coupon.discountType ===
    "percentage"
  ) {
    let percentage =
      discountValue;

    if (
      maximumDiscount >
      0
    ) {
      percentage =
        Math.min(
          percentage,
          maximumDiscount
        );
    }

    percentage =
      Math.max(
        0,
        Math.min(
          percentage,
          100
        )
      );

    discount =
      subtotal *
      (percentage /
        100);
  }

  // ==========================================================
  // FIXED
  // ==========================================================

  else if (
    coupon.discountType ===
    "fixed"
  ) {
    discount =
      discountValue;

    if (
      maximumDiscount >
      0
    ) {
      discount =
        Math.min(
          discount,
          maximumDiscount
        );
    }
  }

  // ==========================================================
  // NEVER EXCEED SUBTOTAL
  // ==========================================================

  discount =
    Math.min(
      discount,
      subtotal
    );

  return Math.round(
    Math.max(
      0,
      discount
    )
  );
}

// ============================================================
// POST - PLACE ORDER
// ============================================================

export async function POST(
  request
) {
  try {
    // ========================================================
    // CUSTOMER SESSION
    // ========================================================

    const session =
      await getCustomerSession();

    if (
      !session?.userId
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // REQUEST BODY
    // ========================================================

    let body;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid checkout request.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // DELIVERY DATA
    // ========================================================

    const fullName =
      body.fullName
        ?.toString()
        .trim() ||
      "";

    const phone =
      body.phone
        ?.toString()
        .trim() ||
      "";

    const address =
      body.address
        ?.toString()
        .trim() ||
      "";

    const area =
      body.area
        ?.toString()
        .trim() ||
      "";

    const city =
      body.city
        ?.toString()
        .trim() ||
      "";

    const notes =
      body.notes
        ?.toString()
        .trim() ||
      "";

    // ========================================================
    // PAYMENT METHOD
    // ========================================================

    const paymentMethod =
      body.paymentMethod
        ?.toString()
        .trim()
        .toLowerCase() ||
      "";

    // ========================================================
    // COUPON CODE
    // ========================================================

    const couponCode =
      body.couponCode
        ?.toString()
        .trim()
        .toUpperCase() ||
      "";

    // ========================================================
    // DELIVERY VALIDATION
    // ========================================================

    if (
      !fullName ||
      !phone ||
      !address ||
      !area ||
      !city
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Complete delivery information is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // DATABASE
    // ========================================================

    await connectDB();

    // ========================================================
    // SETTINGS
    // ========================================================

    const settings =
      await Settings.findOne({
        key:
          "main",
      }).lean();

    // ========================================================
    // ONLINE ORDERS ENABLED
    // ========================================================

    if (
      settings?.ordersEnabled ===
      false
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Online ordering is currently disabled.",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================================
    // CUSTOMER
    // ========================================================

    const user =
      await User.findOne({
        _id:
          session.userId,

        role:
          "customer",

        isActive:
          true,
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Customer account not found.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // SELECTED BRANCH
    // ========================================================

    if (
      !user.selectedRestaurantId
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please select a branch first.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // ACTIVE BRANCH
    // ========================================================

    const branch =
      await Restaurant.findOne({
        _id:
          user.selectedRestaurantId,

        isActive:
          true,
      });

    if (!branch) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Selected branch is unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // CART
    // ========================================================

    const cart =
      await Cart.findOne({
        userId:
          user._id,

        restaurantId:
          branch._id,
      });

    if (
      !cart ||
      !Array.isArray(
        cart.items
      ) ||
      cart.items.length ===
        0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Your cart is empty.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // PAYMENT METHODS
    // ========================================================

    const allowedMethods =
      [];

    if (
      settings
        ?.cashOnDeliveryEnabled !==
      false
    ) {
      allowedMethods.push(
        "cod"
      );
    }

    if (
      settings
        ?.cardPaymentEnabled ===
      true
    ) {
      allowedMethods.push(
        "card"
      );
    }

    if (
      settings
        ?.bankTransferEnabled ===
      true
    ) {
      allowedMethods.push(
        "bank-transfer"
      );
    }

    if (
      settings
        ?.walletPaymentEnabled ===
      true
    ) {
      allowedMethods.push(
        "wallet"
      );
    }

    // ========================================================
    // PAYMENT VALIDATION
    // ========================================================

    if (
      !paymentMethod ||
      !allowedMethods.includes(
        paymentMethod
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please select a valid payment method.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // ORDER ITEMS
    //
    // Prices are reloaded from database.
    // Frontend price is not trusted.
    // ========================================================

    const orderItems =
      [];

    let subtotal =
      0;

    for (
      const cartItem of
      cart.items
    ) {
      // ======================================================
      // FOOD
      // ======================================================

      const food =
        await Food.findOne({
          _id:
            cartItem.foodId,

          restaurantIds:
            branch._id,

          isAvailable:
            true,
        }).lean();

      if (!food) {
        return NextResponse.json(
          {
            success: false,

            message:
              `${cartItem.name} is no longer available.`,
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // QUANTITY
      // ======================================================

      const quantity =
        Number(
          cartItem.quantity ||
            1
        );

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <
          1
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              `Invalid quantity for ${food.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // STOCK
      // ======================================================

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
              `Only ${food.stock} ${food.name} item(s) are available.`,
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // PRICE
      // ======================================================

      const price =
        Number(
          Number(
            food.salePrice
          ) >
            0
            ? food.salePrice
            : food.price
        );

      // ======================================================
      // VARIANTS
      // ======================================================

      const variants =
        Array.isArray(
          food.variants
        )
          ? food.variants
          : [];

      let variantName =
        "";

      let variantPrice =
        0;

      // ======================================================
      // SELECTED VARIANT
      // ======================================================

      if (
        cartItem.variantName
      ) {
        const selectedVariant =
          variants.find(
            (
              variant
            ) =>
              variant.name
                ?.toString()
                .trim()
                .toLowerCase() ===
              cartItem.variantName
                ?.toString()
                .trim()
                .toLowerCase()
          );

        if (
          !selectedVariant
        ) {
          return NextResponse.json(
            {
              success: false,

              message:
                `Selected variant for ${food.name} is no longer available.`,
            },
            {
              status: 400,
            }
          );
        }

        variantName =
          selectedVariant.name ||
          "";

        variantPrice =
          Number(
            selectedVariant.price ||
              0
          );
      }

      // ======================================================
      // VARIANT REQUIRED
      // ======================================================

      if (
        variants.length >
          0 &&
        !variantName
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              `Please select a variant for ${food.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // LINE TOTAL
      // ======================================================

      const lineTotal =
        (price +
          variantPrice) *
        quantity;

      subtotal +=
        lineTotal;

      orderItems.push({
        foodId:
          food._id,

        name:
          food.name,

        image:
          food.image ||
          "",

        quantity,

        price,

        variantName,

        variantPrice,

        lineTotal,
      });
    }

    // ========================================================
    // SUBTOTAL
    // ========================================================

    subtotal =
      Math.round(
        Number(
          subtotal ||
            0
        )
      );

    // ========================================================
    // MINIMUM ORDER
    // ========================================================

    const minimumOrder =
      Number(
        settings
          ?.minimumOrderAmount ||
          0
      );

    if (
      minimumOrder >
        0 &&
      subtotal <
        minimumOrder
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            `Minimum order amount is PKR ${minimumOrder.toLocaleString()}.`,
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // DELIVERY FEE
    // ========================================================

    let deliveryFee =
      Number(
        settings
          ?.defaultDeliveryFee ??
          150
      );

    // ========================================================
    // DELIVERY DISABLED
    // ========================================================

    if (
      settings
        ?.deliveryEnabled ===
      false
    ) {
      deliveryFee =
        0;
    }

    // ========================================================
    // FREE DELIVERY
    // ========================================================

    const freeDeliveryMinimum =
      Number(
        settings
          ?.freeDeliveryMinimum ||
          0
      );

    if (
      freeDeliveryMinimum >
        0 &&
      subtotal >=
        freeDeliveryMinimum
    ) {
      deliveryFee =
        0;
    }

    // ========================================================
    // COUPON
    // ========================================================

    let coupon =
      null;

    let discount =
      0;

    // ========================================================
    // COUPON VALIDATION
    // ========================================================

    if (
      couponCode
    ) {
      // ======================================================
      // FIND ACTIVE COUPON
      // ======================================================

      coupon =
        await Coupon.findOne({
          code:
            couponCode,

          isActive:
            true,
        });

      if (!coupon) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Invalid coupon code.",
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // CRITICAL SECURITY
      //
      // ONE ACCOUNT + ONE COUPON = ONE USE
      //
      // This check happens again during checkout,
      // even if frontend already validated coupon.
      // ======================================================

      const alreadyUsedCoupon =
        await CouponUsage.exists({
          couponId:
            coupon._id,

          userId:
            user._id,
        });

      if (
        alreadyUsedCoupon
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "You have already used this coupon.",
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // DATE
      // ======================================================

      const now =
        new Date();

      // ======================================================
      // START DATE
      // ======================================================

      if (
        coupon.startDate &&
        now <
          new Date(
            coupon.startDate
          )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Coupon is not active yet.",
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // EXPIRY
      // ======================================================

      if (
        coupon.expiryDate &&
        now >
          new Date(
            coupon.expiryDate
          )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Coupon has expired.",
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // COUPON MINIMUM ORDER
      // ======================================================

      const couponMinimum =
        Number(
          coupon.minimumOrder ||
            0
        );

      if (
        subtotal <
        couponMinimum
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              `Coupon requires minimum order PKR ${couponMinimum.toLocaleString()}.`,
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // GLOBAL USAGE LIMIT
      // ======================================================

      const usageLimit =
        Number(
          coupon.usageLimit ||
            0
        );

      const usedCount =
        Number(
          coupon.usedCount ||
            0
        );

      if (
        usageLimit >
          0 &&
        usedCount >=
          usageLimit
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Coupon usage limit has been reached.",
          },
          {
            status: 400,
          }
        );
      }

      // ======================================================
      // BRANCH RESTRICTION
      //
      // Empty array = every branch
      // ======================================================

      if (
        Array.isArray(
          coupon.restaurantIds
        ) &&
        coupon.restaurantIds
          .length >
          0
      ) {
        const allowed =
          coupon.restaurantIds.some(
            (
              restaurantId
            ) =>
              restaurantId
                .toString() ===
              branch._id
                .toString()
          );

        if (!allowed) {
          return NextResponse.json(
            {
              success: false,

              message:
                "Coupon is not valid for your selected branch.",
            },
            {
              status: 400,
            }
          );
        }
      }

      // ======================================================
      // DISCOUNT
      // ======================================================

      discount =
        calculateCouponDiscount(
          coupon,
          subtotal
        );
    }

    // ========================================================
    // TOTAL
    // ========================================================

    const total =
      Math.max(
        0,
        subtotal +
          deliveryFee -
          discount
      );

    // ========================================================
    // ORDER NUMBER
    // ========================================================

    let orderNumber =
      createOrderNumber();

    while (
      await Order.exists({
        orderNumber,
      })
    ) {
      orderNumber =
        createOrderNumber();
    }

    // ========================================================
    // ORDER STATUS
    // ========================================================

    const orderStatus =
      settings
        ?.autoConfirmOrders ===
      true
        ? "confirmed"
        : "pending";

    // ========================================================
    // CREATE ORDER
    // ========================================================

    const order =
      await Order.create({
        orderNumber,

        userId:
          user._id,

        customerName:
          fullName,

        customerEmail:
          user.email ||
          "",

        customerPhone:
          phone,

        restaurantId:
          branch._id,

        items:
          orderItems,

        subtotal,

        deliveryFee,

        discount,

        total,

        status:
          orderStatus,

        // ====================================================
        // PAYMENT
        // ====================================================

        paymentMethod,

        paymentStatus:
          "pending",

        // ====================================================
        // ADDRESS
        // ====================================================

        deliveryAddress: {
          fullName,

          phone,

          address,

          area,

          city,
        },

        notes,
      });

    // ========================================================
    // SAVE COUPON USAGE
    //
    // IMPORTANT:
    // Only after successful Order.create()
    //
    // MongoDB unique index:
    // couponId + userId
    //
    // protects duplicate use.
    // ========================================================

    if (
      coupon
    ) {
      try {
        // ====================================================
        // CREATE CUSTOMER COUPON USAGE
        // ====================================================

        await CouponUsage.create({
          couponId:
            coupon._id,

          couponCode:
            coupon.code,

          userId:
            user._id,

          orderId:
            order._id,

          orderNumber:
            order.orderNumber,

          usedAt:
            new Date(),
        });
      } catch (
        usageError
      ) {
        // ====================================================
        // DUPLICATE UNIQUE INDEX
        //
        // Race condition / double click protection.
        // ====================================================

        if (
          usageError?.code ===
          11000
        ) {
          // ==================================================
          // REMOVE JUST CREATED ORDER
          // Stock has not been reduced yet.
          // ==================================================

          await Order.deleteOne({
            _id:
              order._id,
          });

          return NextResponse.json(
            {
              success: false,

              message:
                "You have already used this coupon.",
            },
            {
              status: 400,
            }
          );
        }

        // ====================================================
        // OTHER COUPON USAGE ERROR
        // ====================================================

        await Order.deleteOne({
          _id:
            order._id,
        });

        throw usageError;
      }

      // ======================================================
      // GLOBAL COUPON COUNT
      // ======================================================

      coupon.usedCount =
        Number(
          coupon.usedCount ||
            0
        ) + 1;

      await coupon.save();
    }

    // ========================================================
    // REDUCE STOCK
    // ========================================================

    for (
      const orderItem of
      orderItems
    ) {
      const food =
        await Food.findById(
          orderItem.foodId
        );

      if (!food) {
        continue;
      }

      if (
        typeof food.stock ===
        "number"
      ) {
        food.stock =
          Math.max(
            0,
            food.stock -
              orderItem.quantity
          );

        // ====================================================
        // OUT OF STOCK
        // ====================================================

        if (
          food.stock ===
          0
        ) {
          food.isAvailable =
            false;
        }

        await food.save();
      }
    }

    // ========================================================
    // SAVE DELIVERY ADDRESS
    // ========================================================

    if (
      Array.isArray(
        user.addresses
      )
    ) {
      const addressExists =
        user.addresses.some(
          (
            item
          ) =>
            item.address
              ?.toLowerCase() ===
              address.toLowerCase() &&
            item.area
              ?.toLowerCase() ===
              area.toLowerCase() &&
            item.city
              ?.toLowerCase() ===
              city.toLowerCase()
        );

      if (
        !addressExists
      ) {
        user.addresses.push({
          label:
            "Home",

          fullName,

          phone,

          address,

          area,

          city,

          isDefault:
            user.addresses
              .length ===
            0,
        });

        await user.save();
      }
    }

    // ========================================================
    // CLEAR CART
    // ========================================================

    await Cart.deleteOne({
      _id:
        cart._id,
    });

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Order placed successfully.",

        order: {
          id:
            order._id.toString(),

          orderNumber:
            order.orderNumber,

          subtotal:
            Number(
              order.subtotal ||
                subtotal
            ),

          deliveryFee:
            Number(
              order.deliveryFee ||
                deliveryFee
            ),

          discount:
            Number(
              order.discount ||
                discount
            ),

          total:
            Number(
              order.total ||
                total
            ),

          status:
            order.status,

          couponCode:
            coupon
              ? coupon.code
              : null,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    // ========================================================
    // ERROR
    // ========================================================

    console.error(
      "CHECKOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to place order.",
      },
      {
        status: 500,
      }
    );
  }
}