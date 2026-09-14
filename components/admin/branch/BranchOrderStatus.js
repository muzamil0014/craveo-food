"use client";

// ============================================================
// CRAVEO - BRANCH ORDER MANAGEMENT
//
// 1. ORDER STATUS
// 2. PAYMENT STATUS
// ============================================================

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  CreditCard,
  RefreshCw,
} from "lucide-react";

// ============================================================
// SAFE JSON RESPONSE
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
      `Invalid server response (${response.status}).`
    );
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function BranchOrderStatus({
  orderId,
  currentStatus,
  currentPaymentStatus,
  paymentMethod,
}) {
  const router =
    useRouter();

  // ==========================================================
  // ORDER STATUS STATE
  // ==========================================================

  const [
    status,
    setStatus,
  ] = useState(
    currentStatus ||
      "pending"
  );

  // ==========================================================
  // PAYMENT STATUS STATE
  // ==========================================================

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState(
    currentPaymentStatus ||
      "pending"
  );

  // ==========================================================
  // ORDER STATUS UI STATE
  // ==========================================================

  const [
    statusLoading,
    setStatusLoading,
  ] = useState(false);

  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");

  // ==========================================================
  // PAYMENT UI STATE
  // ==========================================================

  const [
    paymentLoading,
    setPaymentLoading,
  ] = useState(false);

  const [
    paymentMessage,
    setPaymentMessage,
  ] = useState("");

  // ==========================================================
  // UPDATE ORDER STATUS
  // ==========================================================

  async function updateStatus() {
    try {
      setStatusLoading(
        true
      );

      setStatusMessage(
        ""
      );

      const response =
        await fetch(
          `/api/admin/branch/orders/${orderId}/status`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status,
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
            "Unable to update order status."
        );
      }

      setStatusMessage(
        "Order status updated successfully."
      );

      router.refresh();
    } catch (error) {
      setStatusMessage(
        error?.message ||
          "Unable to update order status."
      );
    } finally {
      setStatusLoading(
        false
      );
    }
  }

  // ==========================================================
  // UPDATE PAYMENT STATUS
  // ==========================================================

  async function updatePaymentStatus() {
    try {
      setPaymentLoading(
        true
      );

      setPaymentMessage(
        ""
      );

      const response =
        await fetch(
          `/api/admin/branch/orders/${orderId}/status`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                paymentStatus,
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
            "Unable to update payment status."
        );
      }

      setPaymentMessage(
        "Payment status updated successfully."
      );

      router.refresh();
    } catch (error) {
      setPaymentMessage(
        error?.message ||
          "Unable to update payment status."
      );
    } finally {
      setPaymentLoading(
        false
      );
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* ======================================================
          ORDER STATUS
      ====================================================== */}

      <article className="branch-detail-card">
        <div className="branch-detail-heading">
          <RefreshCw
            size={18}
          />

          <div>
            <span>
              MANAGEMENT
            </span>

            <h2>
              Order Status
            </h2>
          </div>
        </div>

        <div className="branch-status-form">
          <select
            value={
              status
            }
            onChange={(
              event
            ) =>
              setStatus(
                event.target.value
              )
            }
            disabled={
              statusLoading
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
            onClick={
              updateStatus
            }
            disabled={
              statusLoading
            }
          >
            {statusLoading
              ? "Updating..."
              : "Update Status"}
          </button>

          {statusMessage && (
            <small>
              {
                statusMessage
              }
            </small>
          )}
        </div>
      </article>

      {/* ======================================================
          PAYMENT STATUS MANAGEMENT
      ====================================================== */}

      <article className="branch-detail-card">
        <div className="branch-detail-heading">
          <CreditCard
            size={18}
          />

          <div>
            <span>
              PAYMENT MANAGEMENT
            </span>

            <h2>
              Payment Status
            </h2>
          </div>
        </div>

        {/* ====================================================
            PAYMENT METHOD
        ==================================================== */}

        <div className="branch-detail-info">
          <span>
            Payment Method
          </span>

          <strong>
            {paymentMethod ||
              "-"}
          </strong>
        </div>

        {/* ====================================================
            PAYMENT STATUS FORM
        ==================================================== */}

        <div className="branch-status-form">
          <select
            value={
              paymentStatus
            }
            onChange={(
              event
            ) =>
              setPaymentStatus(
                event.target.value
              )
            }
            disabled={
              paymentLoading
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
            onClick={
              updatePaymentStatus
            }
            disabled={
              paymentLoading
            }
          >
            {paymentLoading
              ? "Updating..."
              : "Update Payment"}
          </button>

          {paymentMessage && (
            <small>
              {
                paymentMessage
              }
            </small>
          )}
        </div>
      </article>
    </>
  );
}