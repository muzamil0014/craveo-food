"use client";

// ============================================================
// CRAVEO - CUSTOMER ORDER ACTIONS
// EDIT ORDER + CANCEL ORDER
// REORDER COMPLETELY REMOVED
// ============================================================

import Link from "next/link";

import {
  Edit3,
  LoaderCircle,
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

// ============================================================
// SAFE RESPONSE
// ============================================================

async function readResponse(response) {
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

export default function OrderActions({
  orderNumber,
  status,
}) {
  const router =
    useRouter();

  const [
    cancelLoading,
    setCancelLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // EDITABLE / CANCELLABLE STATUS
  // ==========================================================

  const canEdit =
    [
      "pending",
      "confirmed",
    ].includes(status);

  const canCancel =
    [
      "pending",
      "confirmed",
    ].includes(status);

  // ==========================================================
  // CANCEL ORDER
  // ==========================================================

  async function handleCancel() {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this order?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancelLoading(true);

      setMessage("");
      setError("");

      const response =
        await fetch(
          `/api/customer/orders/${orderNumber}/cancel`,
          {
            method: "POST",
            cache: "no-store",
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
            "Unable to cancel order."
        );
      }

      setMessage(
        "Order cancelled successfully."
      );

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to cancel order."
      );
    } finally {
      setCancelLoading(false);
    }
  }

  // ==========================================================
  // IF ORDER CANNOT BE EDITED
  // ==========================================================

  if (
    !canEdit &&
    !canCancel
  ) {
    return null;
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="customer-order-panel customer-order-actions-panel">
      <div className="customer-order-panel-heading">
        <span>
          ACTIONS
        </span>

        <h2>
          Order Actions
        </h2>
      </div>

      <div className="customer-order-actions">
        {/* ====================================================
            EDIT ORDER
        ==================================================== */}

        {canEdit && (
          <Link
            href={`/account/orders/${orderNumber}/edit`}
            className="customer-order-edit-btn"
          >
            <Edit3 size={16} />

            Edit Order
          </Link>
        )}

        {/* ====================================================
            CANCEL ORDER
        ==================================================== */}

        {canCancel && (
          <button
            type="button"
            className="customer-order-cancel-btn"
            disabled={
              cancelLoading
            }
            onClick={
              handleCancel
            }
          >
            {cancelLoading ? (
              <LoaderCircle
                size={16}
                className="craveo-spin"
              />
            ) : (
              <XCircle
                size={16}
              />
            )}

            {cancelLoading
              ? "Cancelling..."
              : "Cancel Order"}
          </button>
        )}
      </div>

      {message && (
        <div className="customer-order-action-success">
          {message}
        </div>
      )}

      {error && (
        <div className="customer-order-action-error">
          {error}
        </div>
      )}
    </section>
  );
}