"use client";

// ============================================================
// CRAVEO - BRANCH PAYMENT STATUS MANAGEMENT
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function BranchPaymentStatus({
  orderId,
  currentPaymentStatus,
}) {
  const router = useRouter();

  const [paymentStatus, setPaymentStatus] =
    useState(
      currentPaymentStatus ||
        "pending"
    );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  // ==========================================================
  // UPDATE PAYMENT STATUS
  // ==========================================================

  async function updatePaymentStatus() {
    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      const response =
        await fetch(
          `/api/admin/branch/orders/${orderId}/status`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
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
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to update payment status."
        );
      }

      setSuccess(true);

      setMessage(
        "Payment status updated successfully."
      );

      router.refresh();
    } catch (error) {
      setSuccess(false);

      setMessage(
        error?.message ||
          "Unable to update payment status."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="branch-payment-management">
      <label>
        Change Payment Status
      </label>

      <select
        value={paymentStatus}
        onChange={(event) => {
          setPaymentStatus(
            event.target.value
          );

          setMessage("");
        }}
        disabled={loading}
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
        disabled={loading}
      >
        {loading
          ? "Updating..."
          : "Update Payment"}
      </button>

      {message && (
        <small
          className={
            success
              ? "success"
              : "error"
          }
        >
          {message}
        </small>
      )}
    </div>
  );
}