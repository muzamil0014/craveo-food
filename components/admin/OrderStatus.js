"use client";

// ============================================================
// CRAVEO - ORDER STATUS CONTROLS
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  CreditCard,
  RefreshCw,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function OrderStatus({
  orderId,
  currentStatus,
  currentPaymentStatus,
}) {
  const router =
    useRouter();

  const [
    orderStatus,
    setOrderStatus,
  ] = useState(
    currentStatus
  );

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState(
    currentPaymentStatus
  );

  const [
    loadingType,
    setLoadingType,
  ] = useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // SAFE RESPONSE
  // ==========================================================

  async function parseResponse(
    response
  ) {
    const text =
      await response.text();

    if (!text) {
      return {
        success: false,

        message:
          `Empty response. Status: ${response.status}`,
      };
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        success: false,

        message:
          `Invalid response. Status: ${response.status}`,
      };
    }
  }

  // ==========================================================
  // UPDATE
  // ==========================================================

  async function updateOrder(
    payload,
    type
  ) {
    try {
      setLoadingType(type);

      setError("");

      const response =
        await fetch(
          `/api/admin/orders/${orderId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to update order."
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error.message ||
          "Unable to update order."
      );
    } finally {
      setLoadingType("");
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="order-status-panel">
      {error && (
        <div className="order-status-error">
          {error}
        </div>
      )}

      {/* ====================================================
          ORDER STATUS
      ==================================================== */}

      <div className="order-status-control">
        <div>
          <span>
            Order Status
          </span>

          <strong>
            Manage delivery progress
          </strong>
        </div>

        <div className="order-status-inputs">
          <select
            value={orderStatus}
            onChange={(event) =>
              setOrderStatus(
                event.target.value
              )
            }
            disabled={
              loadingType !== ""
            }
          >
            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="preparing">
              Preparing
            </option>

            <option value="ready">
              Ready
            </option>

            <option value="out-for-delivery">
              Out for Delivery
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <button
            type="button"
            onClick={() =>
              updateOrder(
                {
                  status:
                    orderStatus,
                },
                "order"
              )
            }
            disabled={
              loadingType !== ""
            }
          >
            <RefreshCw
              size={15}
            />

            {loadingType ===
            "order"
              ? "Updating..."
              : "Update"}
          </button>
        </div>
      </div>

      {/* ====================================================
          PAYMENT STATUS
      ==================================================== */}

      <div className="order-status-control">
        <div>
          <span>
            Payment Status
          </span>

          <strong>
            Manage payment state
          </strong>
        </div>

        <div className="order-status-inputs">
          <select
            value={
              paymentStatus
            }
            onChange={(event) =>
              setPaymentStatus(
                event.target.value
              )
            }
            disabled={
              loadingType !== ""
            }
          >
            <option value="pending">
              Pending
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>

          <button
            type="button"
            onClick={() =>
              updateOrder(
                {
                  paymentStatus,
                },
                "payment"
              )
            }
            disabled={
              loadingType !== ""
            }
          >
            <CreditCard
              size={15}
            />

            {loadingType ===
            "payment"
              ? "Updating..."
              : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}