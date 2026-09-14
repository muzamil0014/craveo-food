"use client";

// ============================================================
// CRAVEO - CUSTOMER CART PAGE
// ============================================================

import Image from "next/image";
import Link from "next/link";

import {
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

// ============================================================
// FORMAT PRICE
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// SAFE JSON
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
    return JSON.parse(
      text
    );
  } catch {
    throw new Error(
      `Server returned invalid response (${response.status}).`
    );
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function CartPageClient() {
  const [
    cart,
    setCart,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingItem,
    setUpdatingItem,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // LOAD CART
  // ==========================================================

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/customer/cart",
          {
            cache:
              "no-store",
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to load cart."
        );
      }

      setCart(
        result.cart
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to load cart."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  // ==========================================================
  // QUANTITY
  // ==========================================================

  async function updateQuantity(
    itemId,
    quantity
  ) {
    if (quantity < 1) {
      return;
    }

    try {
      setUpdatingItem(
        itemId
      );
      setError("");

      const response =
        await fetch(
          "/api/customer/cart",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                itemId,
                quantity,
              }),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to update quantity."
        );
      }

      setCart(
        result.cart
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to update cart."
      );
    } finally {
      setUpdatingItem("");
    }
  }

  // ==========================================================
  // REMOVE ITEM
  // ==========================================================

  async function removeItem(
    itemId
  ) {
    try {
      setUpdatingItem(
        itemId
      );
      setError("");

      const response =
        await fetch(
          `/api/customer/cart?itemId=${encodeURIComponent(
            itemId
          )}`,
          {
            method:
              "DELETE",
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to remove item."
        );
      }

      setCart(
        result.cart
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to remove item."
      );
    } finally {
      setUpdatingItem("");
    }
  }

  // ==========================================================
  // CLEAR CART
  // ==========================================================

  async function clearCart() {
    const confirmed =
      window.confirm(
        "Remove all items from your cart?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/customer/cart",
          {
            method:
              "DELETE",
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to clear cart."
        );
      }

      setCart(
        result.cart
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to clear cart."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="customer-cart-loading">
        <LoaderCircle
          size={25}
        />

        Loading cart...
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    !cart
  ) {
    return (
      <div className="customer-cart-error customer-cart-page-error">
        {error}
      </div>
    );
  }

  // ==========================================================
  // EMPTY
  // ==========================================================

  if (
    !cart ||
    cart.items.length ===
      0
  ) {
    return (
      <div className="customer-cart-empty">
        <div>
          <ShoppingBag
            size={38}
          />
        </div>

        <h2>
          Your cart is empty
        </h2>

        <p>
          Add something delicious from
          your selected CRAVEO branch.
        </p>

        <Link href="/foods">
          Browse Menu
        </Link>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {error && (
        <div className="customer-cart-error">
          {error}
        </div>
      )}

      <div className="customer-cart-layout">
        {/* ====================================================
            CART ITEMS
        ==================================================== */}

        <section className="customer-cart-items">
          <div className="customer-cart-items-heading">
            <div>
              <span>
                YOUR ORDER
              </span>

              <h2>
                Cart Items
              </h2>
            </div>

            <button
              type="button"
              onClick={
                clearCart
              }
            >
              <Trash2
                size={14}
              />

              Clear Cart
            </button>
          </div>

          {cart.items.map(
            (item) => (
              <article
                key={
                  item.id
                }
                className="customer-cart-item"
              >
                {/* IMAGE */}

                <div className="customer-cart-item-image">
                  {item.image ? (
                    <img
                      src={
                        item.image
                      }
                      alt={
                        item.name
                      }
                    />
                  ) : (
                    <ShoppingBag
                      size={28}
                    />
                  )}
                </div>

                {/* INFO */}

                <div className="customer-cart-item-info">
                  <h3>
                    {item.name}
                  </h3>

                  {item.variantName && (
                    <span>
                      Variant:{" "}
                      {
                        item.variantName
                      }
                    </span>
                  )}

                  <strong>
                    {formatPrice(
                      item.unitPrice +
                        item.variantPrice
                    )}
                  </strong>
                </div>

                {/* QUANTITY */}

                <div className="customer-cart-item-quantity">
                  <button
                    type="button"
                    disabled={
                      updatingItem ===
                        item.id ||
                      item.quantity <=
                        1
                    }
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity -
                          1
                      )
                    }
                  >
                    <Minus
                      size={14}
                    />
                  </button>

                  <strong>
                    {
                      item.quantity
                    }
                  </strong>

                  <button
                    type="button"
                    disabled={
                      updatingItem ===
                      item.id
                    }
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity +
                          1
                      )
                    }
                  >
                    <Plus
                      size={14}
                    />
                  </button>
                </div>

                {/* LINE TOTAL */}

                <div className="customer-cart-item-total">
                  <strong>
                    {formatPrice(
                      item.lineTotal
                    )}
                  </strong>

                  <button
                    type="button"
                    disabled={
                      updatingItem ===
                      item.id
                    }
                    onClick={() =>
                      removeItem(
                        item.id
                      )
                    }
                  >
                    <Trash2
                      size={15}
                    />
                  </button>
                </div>
              </article>
            )
          )}
        </section>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <aside className="customer-cart-summary">
          <span>
            ORDER SUMMARY
          </span>

          <h2>
            {
              cart.restaurant
                .name
            }
          </h2>

          <div className="customer-cart-summary-row">
            <span>
              Items
            </span>

            <strong>
              {
                cart.totalItems
              }
            </strong>
          </div>

          <div className="customer-cart-summary-row">
            <span>
              Subtotal
            </span>

            <strong>
              {formatPrice(
                cart.subtotal
              )}
            </strong>
          </div>

          <div className="customer-cart-summary-total">
            <span>
              Total
            </span>

            <strong>
              {formatPrice(
                cart.subtotal
              )}
            </strong>
          </div>

<Link
  href="/checkout"
  className="customer-cart-checkout-btn"
>
  Checkout 
</Link>

          <Link
            href="/foods"
            className="customer-cart-continue"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </>
  );
}