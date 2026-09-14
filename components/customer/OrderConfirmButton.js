"use client";

// ============================================================
// CRAVEO - CUSTOMER PARCEL CONFIRMATION BUTTON
// ============================================================

import {
  useState,
} from "react";

import {
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

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

export default function OrderConfirmButton({
  orderNumber,
  token,
  alreadyConfirmed = false,
}) {
  // ==========================================================
  // STATE
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    confirmed,
    setConfirmed,
  ] = useState(
    alreadyConfirmed
  );

  const [
    message,
    setMessage,
  ] = useState(
    alreadyConfirmed
      ? "This parcel has already been confirmed."
      : ""
  );

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // CONFIRM
  // ==========================================================

  async function handleConfirm() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response =
        await fetch(
          `/api/order-confirm/${encodeURIComponent(
            orderNumber
          )}`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                token,
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
            "Unable to confirm parcel."
        );
      }

      setConfirmed(
        true
      );

      setMessage(
        result.message ||
          "Parcel confirmed successfully."
      );
    } catch (error) {
      setError(
        error?.message ||
          "Unable to confirm parcel."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="customer-order-confirm-action">
      <button
        type="button"
        onClick={
          handleConfirm
        }
        disabled={
          loading ||
          confirmed
        }
        className={
          confirmed
            ? "customer-order-confirm-btn confirmed"
            : "customer-order-confirm-btn"
        }
      >
        {loading ? (
          <>
            <LoaderCircle
              size={18}
              className="craveo-spin"
            />

            Confirming...
          </>
        ) : confirmed ? (
          <>
            <CheckCircle2
              size={18}
            />

            Parcel Confirmed
          </>
        ) : (
          <>
            <CheckCircle2
              size={18}
            />

            Confirm Parcel Received
          </>
        )}
      </button>

      {message && (
        <p className="customer-order-confirm-success">
          {message}
        </p>
      )}

      {error && (
        <p className="customer-order-confirm-error">
          {error}
        </p>
      )}
    </div>
  );
}