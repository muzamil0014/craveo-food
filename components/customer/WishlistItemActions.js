"use client";

// ============================================================
// CRAVEO - WISHLIST ITEM ACTIONS
// REMOVE + ADD TO CART
// ============================================================

import {
  HeartOff,
  LoaderCircle,
  ShoppingCart,
} from "lucide-react";

import {
  useState,
} from "react";

// ============================================================
// SAFE RESPONSE
// ============================================================

async function readResponse(
  response
) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid response (${response.status}).`
    );
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function WishlistItemActions({
  foodId,
  available = true,
  mode = "full",
}) {
  const [
    removeLoading,
    setRemoveLoading,
  ] = useState(false);

  const [
    cartLoading,
    setCartLoading,
  ] = useState(false);

  // ==========================================================
  // REMOVE
  // ==========================================================

  async function removeWishlist() {
    try {
      setRemoveLoading(
        true
      );

      const response =
        await fetch(
          "/api/customer/wishlist",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                foodId,
              }),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to remove item."
        );
      }

      window.dispatchEvent(
        new CustomEvent(
          "craveo-wishlist-updated",
          {
            detail: {
              count:
                Number(
                  result.count ||
                    0
                ),
            },
          }
        )
      );

      window.location.reload();
    } catch (error) {
      window.alert(
        error?.message ||
          "Unable to remove item."
      );

      setRemoveLoading(
        false
      );
    }
  }

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  async function addToCart() {
    if (!available) {
      return;
    }

    try {
      setCartLoading(true);

      const response =
        await fetch(
          "/api/customer/cart",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                foodId,

                quantity: 1,

                variantName:
                  "",
              }),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to add to cart."
        );
      }

      window.dispatchEvent(
        new CustomEvent(
          "craveo-cart-updated",
          {
            detail: {
              count:
                Number(
                  result.cartCount ||
                    0
                ),
            },
          }
        )
      );

      window.location.href =
        "/cart";
    } catch (error) {
      window.alert(
        error?.message ||
          "Unable to add to cart."
      );

      setCartLoading(false);
    }
  }

  // ==========================================================
  // REMOVE ONLY
  // ==========================================================

  if (
    mode ===
    "remove-only"
  ) {
    return (
      <button
        type="button"
        className="customer-wishlist-remove-icon"
        onClick={
          removeWishlist
        }
        disabled={
          removeLoading
        }
      >
        {removeLoading ? (
          <LoaderCircle
            size={17}
            className="craveo-spin"
          />
        ) : (
          <HeartOff
            size={18}
          />
        )}
      </button>
    );
  }

  // ==========================================================
  // FULL ACTIONS
  // ==========================================================

  return (
    <div className="customer-wishlist-actions">
      <button
        type="button"
        className="customer-wishlist-cart-btn"
        disabled={
          !available ||
          cartLoading
        }
        onClick={
          addToCart
        }
      >
        {cartLoading ? (
          <LoaderCircle
            size={17}
            className="craveo-spin"
          />
        ) : (
          <ShoppingCart
            size={17}
          />
        )}

        {cartLoading
          ? "Adding..."
          : available
          ? "Add To Cart"
          : "Unavailable"}
      </button>

      <button
        type="button"
        className="customer-wishlist-remove-btn"
        onClick={
          removeWishlist
        }
        disabled={
          removeLoading
        }
      >
        {removeLoading ? (
          <LoaderCircle
            size={17}
            className="craveo-spin"
          />
        ) : (
          <HeartOff
            size={17}
          />
        )}

        Remove
      </button>
    </div>
  );
}