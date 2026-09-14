"use client";

// ============================================================
// CRAVEO - WISHLIST HEART BUTTON
// ============================================================

import {
  Heart,
  LoaderCircle,
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

export default function WishlistButton({
  foodId,
  initialWishlisted = false,
  className = "",
}) {
  const [
    wishlisted,
    setWishlisted,
  ] = useState(
    initialWishlisted
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ==========================================================
  // TOGGLE
  // ==========================================================

  async function toggleWishlist() {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/customer/wishlist",
          {
            method:
              wishlisted
                ? "DELETE"
                : "POST",

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

      // ======================================================
      // LOGIN
      // ======================================================

      if (
        response.status ===
          401 ||
        result.code ===
          "LOGIN_REQUIRED"
      ) {
        window.location.href =
          "/login";

        return;
      }

      // ======================================================
      // BRANCH
      // ======================================================

      if (
        result.code ===
        "BRANCH_REQUIRED"
      ) {
        window.location.href =
          "/select-branch";

        return;
      }

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to update wishlist."
        );
      }

      const nextValue =
        !wishlisted;

      setWishlisted(
        nextValue
      );

      // ======================================================
      // UPDATE NAVBAR BADGE
      // ======================================================

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
    } catch (error) {
      window.alert(
        error?.message ||
          "Unable to update wishlist."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <button
      type="button"
      className={`customer-wishlist-btn ${
        wishlisted
          ? "active"
          : ""
      } ${className}`}
      onClick={
        toggleWishlist
      }
      disabled={
        loading
      }
      aria-label={
        wishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
    >
      {loading ? (
        <LoaderCircle
          size={18}
          className="craveo-spin"
        />
      ) : (
        <Heart
          size={19}
          fill={
            wishlisted
              ? "currentColor"
              : "none"
          }
        />
      )}
    </button>
  );
}