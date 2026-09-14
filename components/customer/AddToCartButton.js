"use client";

// ============================================================
// CRAVEO - ADD TO CART
// FORCE PAGE RELOAD AFTER SUCCESS
// ============================================================

import {
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import {
  useState,
} from "react";

// ============================================================
// SAFE RESPONSE
// ============================================================

async function readResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid server response (${response.status}).`
    );
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function AddToCartButton({
  foodId,
  variants = [],
  stock = null,
}) {
  // ==========================================================
  // SAFE VARIANTS
  // ==========================================================

  const safeVariants =
    Array.isArray(variants)
      ? variants
      : [];

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    variantName,
    setVariantName,
  ] = useState(
    safeVariants[0]?.name || ""
  );

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // STOCK
  // ==========================================================

  const safeStock =
    typeof stock === "number"
      ? stock
      : null;

  const outOfStock =
    safeStock !== null &&
    safeStock <= 0;

  // ==========================================================
  // DECREASE
  // ==========================================================

  function decrease() {
    setQuantity(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );

    setError("");
  }

  // ==========================================================
  // INCREASE
  // ==========================================================

  function increase() {
    setQuantity(
      (current) => {
        const max =
          safeStock !== null &&
          safeStock > 0
            ? Math.min(
                safeStock,
                99
              )
            : 99;

        return Math.min(
          current + 1,
          max
        );
      }
    );

    setError("");
  }

  // ==========================================================
  // FORCE CURRENT PAGE RELOAD
  // ==========================================================

  function forceReload() {
    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      "_cartRefresh",
      Date.now().toString()
    );

    window.location.replace(
      url.toString()
    );
  }

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  async function handleAdd() {
    if (loading) {
      return;
    }

    try {
      // ======================================================
      // LOADING
      // ======================================================

      setLoading(true);
      setError("");

      // ======================================================
      // FOOD VALIDATION
      // ======================================================

      if (!foodId) {
        throw new Error(
          "Food ID is missing."
        );
      }

      // ======================================================
      // STOCK VALIDATION
      // ======================================================

      if (outOfStock) {
        throw new Error(
          "This food is out of stock."
        );
      }

      if (
        safeStock !== null &&
        quantity > safeStock
      ) {
        throw new Error(
          `Only ${safeStock} item(s) available in stock.`
        );
      }

      // ======================================================
      // VARIANT VALIDATION
      // ======================================================

      if (
        safeVariants.length > 0 &&
        !variantName
      ) {
        throw new Error(
          "Please select a variant."
        );
      }

      // ======================================================
      // ADD TO CART API
      // ======================================================

      const response =
        await fetch(
          "/api/customer/cart",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            cache: "no-store",

            body:
              JSON.stringify({
                foodId,

                quantity:
                  Number(quantity),

                variantName:
                  variantName || "",
              }),
          }
        );

      // ======================================================
      // RESPONSE
      // ======================================================

      const result =
        await readResponse(
          response
        );

      // ======================================================
      // ERROR RESPONSE
      // ======================================================

      if (
        !response.ok ||
        result.success !== true
      ) {
        // ====================================================
        // BRANCH REQUIRED
        // ====================================================

        if (
          result.code ===
          "BRANCH_REQUIRED"
        ) {
          window.location.replace(
            "/select-branch"
          );

          return;
        }

        throw new Error(
          result.message ||
            "Unable to add to cart."
        );
      }

      // ======================================================
      // SUCCESS
      //
      // IMPORTANT:
      // API ne cart successfully save kar diya.
      // Ab direct forced reload/navigation hogi.
      // ======================================================

      forceReload();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to add to cart."
      );

      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="customer-add-cart-box">
      {/* ======================================================
          VARIANTS
      ====================================================== */}

      {safeVariants.length > 0 && (
        <div className="customer-cart-variant-section">
          <span>
            Choose Variant
          </span>

          <div className="customer-cart-variant-options">
            {safeVariants.map(
              (
                variant,
                index
              ) => (
                <button
                  type="button"
                  key={
                    variant.id ||
                    variant._id ||
                    `${variant.name}-${index}`
                  }
                  className={
                    variantName ===
                    variant.name
                      ? "active"
                      : ""
                  }
                  disabled={loading}
                  onClick={() => {
                    setVariantName(
                      variant.name
                    );

                    setError("");
                  }}
                >
                  <strong>
                    {variant.name}
                  </strong>

                  {Number(
                    variant.price || 0
                  ) > 0 && (
                    <small>
                      + PKR{" "}
                      {Number(
                        variant.price
                      ).toLocaleString()}
                    </small>
                  )}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          QUANTITY + ADD BUTTON
      ====================================================== */}

      <div className="customer-add-cart-actions">
        {/* ====================================================
            QUANTITY
        ==================================================== */}

        <div className="customer-cart-quantity">
          <button
            type="button"
            onClick={decrease}
            disabled={
              loading ||
              quantity <= 1
            }
          >
            <Minus size={15} />
          </button>

          <strong>
            {quantity}
          </strong>

          <button
            type="button"
            onClick={increase}
            disabled={
              loading ||
              outOfStock ||
              (
                safeStock !== null &&
                quantity >=
                  safeStock
              )
            }
          >
            <Plus size={15} />
          </button>
        </div>

        {/* ====================================================
            ADD TO CART
        ==================================================== */}

        <button
          type="button"
          className="customer-add-cart-button"
          disabled={
            loading ||
            outOfStock
          }
          onClick={handleAdd}
        >
          {loading ? (
            <>
              <LoaderCircle
                size={17}
                className="craveo-spin"
              />

              Adding...
            </>
          ) : outOfStock ? (
            <>
              <ShoppingBag
                size={17}
              />

              Out of Stock
            </>
          ) : (
            <>
              <ShoppingBag
                size={17}
              />

              Add To Cart
            </>
          )}
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="customer-cart-error">
          {error}
        </div>
      )}
    </div>
  );
}