"use client";

// ============================================================
// CRAVEO - EDIT EXISTING ORDER FORM
// QUANTITY UPDATE ONLY
// ============================================================

import {
  LoaderCircle,
  Minus,
  Plus,
  Save,
} from "lucide-react";

import {
  useState,
} from "react";

// ============================================================
// PRICE
// ============================================================

function money(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

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
      `Invalid server response (${response.status}).`
    );
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function EditOrderForm({
  order,
}) {
  // ==========================================================
  // ITEMS
  // ==========================================================

  const [
    items,
    setItems,
  ] = useState(
    order.items.map(
      (item) => ({
        ...item,
        quantity:
          Number(
            item.quantity || 1
          ),
      })
    )
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // CHANGE QUANTITY
  // ==========================================================

  function changeQuantity(
    itemId,
    difference
  ) {
    setItems(
      (currentItems) =>
        currentItems.map(
          (item) => {
            if (
              item.id !==
              itemId
            ) {
              return item;
            }

            const next =
              Math.max(
                1,
                Math.min(
                  99,
                  item.quantity +
                    difference
                )
              );

            return {
              ...item,
              quantity: next,
            };
          }
        )
    );

    setError("");
  }

  // ==========================================================
  // CALCULATED SUBTOTAL
  // ==========================================================

  const subtotal =
    items.reduce(
      (
        total,
        item
      ) => {
        const unit =
          Number(
            item.price || 0
          ) +
          Number(
            item.variantPrice ||
              0
          );

        return (
          total +
          unit *
            Number(
              item.quantity ||
                0
            )
        );
      },
      0
    );

  // ==========================================================
  // DISCOUNT
  // ==========================================================

  const discount =
    Math.min(
      Number(
        order.discount || 0
      ),
      subtotal
    );

  // ==========================================================
  // TOTAL
  // ==========================================================

  const total =
    Math.max(
      0,
      subtotal +
        Number(
          order.deliveryFee ||
            0
        ) -
        discount
    );

  // ==========================================================
  // SAVE
  // ==========================================================

  async function handleSave() {
    try {
      setSaving(true);
      setError("");

      const response =
        await fetch(
          `/api/customer/orders/${order.orderNumber}/edit`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            cache:
              "no-store",

            body:
              JSON.stringify({
                items:
                  items.map(
                    (item) => ({
                      itemId:
                        item.id,

                      quantity:
                        Number(
                          item.quantity
                        ),
                    })
                  ),
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
            "Unable to update order."
        );
      }

      // ======================================================
      // SAME ORDER DETAILS PAGE
      // ======================================================

      window.location.replace(
        `/account/orders/${order.orderNumber}`
      );
    } catch (error) {
      setError(
        error?.message ||
          "Unable to update order."
      );

      setSaving(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="customer-edit-order-card">
      {/* ======================================================
          ITEMS
      ====================================================== */}

      <div className="customer-edit-order-items">
        {items.map(
          (item) => {
            const itemUnitPrice =
              Number(
                item.price || 0
              ) +
              Number(
                item.variantPrice ||
                  0
              );

            const lineTotal =
              itemUnitPrice *
              item.quantity;

            return (
              <div
                key={
                  item.id
                }
                className="customer-edit-order-item"
              >
                {/* ============================================
                    IMAGE
                ============================================ */}

                <div className="customer-edit-order-image">
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
                    <span>
                      CR
                    </span>
                  )}
                </div>

                {/* ============================================
                    DETAILS
                ============================================ */}

                <div className="customer-edit-order-info">
                  <strong>
                    {item.name}
                  </strong>

                  {item.variantName && (
                    <span>
                      Variant:{" "}
                      {
                        item.variantName
                      }
                    </span>
                  )}

                  <small>
                    {money(
                      itemUnitPrice
                    )}{" "}
                    each
                  </small>
                </div>

                {/* ============================================
                    QUANTITY
                ============================================ */}

                <div className="customer-edit-order-quantity">
                  <button
                    type="button"
                    disabled={
                      saving ||
                      item.quantity <=
                        1
                    }
                    onClick={() =>
                      changeQuantity(
                        item.id,
                        -1
                      )
                    }
                  >
                    <Minus
                      size={15}
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
                      saving
                    }
                    onClick={() =>
                      changeQuantity(
                        item.id,
                        1
                      )
                    }
                  >
                    <Plus
                      size={15}
                    />
                  </button>
                </div>

                {/* ============================================
                    LINE TOTAL
                ============================================ */}

                <strong className="customer-edit-order-line-total">
                  {money(
                    lineTotal
                  )}
                </strong>
              </div>
            );
          }
        )}
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="customer-edit-order-summary">
        <div>
          <span>
            Subtotal
          </span>

          <strong>
            {money(
              subtotal
            )}
          </strong>
        </div>

        <div>
          <span>
            Delivery Fee
          </span>

          <strong>
            {money(
              order.deliveryFee
            )}
          </strong>
        </div>

        {discount > 0 && (
          <div>
            <span>
              Discount
            </span>

            <strong>
              -{" "}
              {money(
                discount
              )}
            </strong>
          </div>
        )}

        <div className="customer-edit-order-total">
          <span>
            Updated Total
          </span>

          <strong>
            {money(
              total
            )}
          </strong>
        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="customer-order-action-error">
          {error}
        </div>
      )}

      {/* ======================================================
          ACTION
      ====================================================== */}

      <div className="customer-edit-order-actions">
        <button
          type="button"
          className="customer-edit-order-save-btn"
          disabled={
            saving
          }
          onClick={
            handleSave
          }
        >
          {saving ? (
            <LoaderCircle
              size={17}
              className="craveo-spin"
            />
          ) : (
            <Save
              size={17}
            />
          )}

          {saving
            ? "Updating Order..."
            : "Save Order Changes"}
        </button>
      </div>
    </section>
  );
}