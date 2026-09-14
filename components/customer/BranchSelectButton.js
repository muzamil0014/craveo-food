"use client";

// ============================================================
// CRAVEO - BRANCH SELECT BUTTON
// CHANGE BRANCH + CART CLEAR CONFIRMATION
// ============================================================

import {
  Check,
  LoaderCircle,
  MapPin,
} from "lucide-react";

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

export default function BranchSelectButton({
  restaurantId,
  branchName,
  isSelected = false,
}) {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // CLEAR CART
  // ==========================================================

  async function clearCart() {
    const response =
      await fetch(
        "/api/customer/cart",
        {
          method: "DELETE",
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
          "Unable to clear cart."
      );
    }

    // ========================================================
    // UPDATE NAVBAR BADGE
    // ========================================================

    window.dispatchEvent(
      new CustomEvent(
        "craveo-cart-updated",
        {
          detail: {
            count: 0,
          },
        }
      )
    );
  }

  // ==========================================================
  // CHANGE BRANCH
  // ==========================================================

  async function changeBranch(
    forceChange = false
  ) {
    const response =
      await fetch(
        "/api/customer/select-branch",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          cache: "no-store",

          body:
            JSON.stringify({
              restaurantId,
              forceChange,
            }),
        }
      );

    const result =
      await readResponse(
        response
      );

    return {
      response,
      result,
    };
  }

  // ==========================================================
  // SELECT BRANCH
  // ==========================================================

  async function handleSelect() {
    if (
      loading ||
      isSelected
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // ======================================================
      // FIRST TRY
      // ======================================================

      let {
        response,
        result,
      } =
        await changeBranch(
          false
        );

      // ======================================================
      // CART EXISTS
      // ======================================================

      if (
        response.status === 409 ||
        result.code ===
          "CART_NOT_EMPTY" ||
        result.code ===
          "CART_CLEAR_REQUIRED"
      ) {
        const confirmed =
          window.confirm(
            "Changing branch will clear your current cart. Do you want to continue?"
          );

        // ====================================================
        // USER CANCELLED
        // ====================================================

        if (!confirmed) {
          setLoading(false);
          return;
        }

        // ====================================================
        // CLEAR CART
        // ====================================================

        await clearCart();

        // ====================================================
        // TRY BRANCH CHANGE AGAIN
        // ====================================================

        const retry =
          await changeBranch(
            true
          );

        response =
          retry.response;

        result =
          retry.result;
      }

      // ======================================================
      // ERROR
      // ======================================================

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to select branch."
        );
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      window.location.replace("/");
    } catch (error) {
      setError(
        error?.message ||
          "Unable to select branch."
      );

      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="branch-select-action-wrap">
      <button
        type="button"
        className={`branch-select-btn ${
          isSelected
            ? "selected"
            : ""
        }`}
        disabled={
          loading ||
          isSelected
        }
        onClick={handleSelect}
      >
        {loading ? (
          <>
            <LoaderCircle
              size={17}
              className="craveo-spin"
            />

            Selecting...
          </>
        ) : isSelected ? (
          <>
            <Check size={17} />

            Selected Branch
          </>
        ) : (
          <>
            <MapPin size={17} />

            Select Branch
          </>
        )}
      </button>

      {error && (
        <div className="branch-select-error">
          {error}
        </div>
      )}
    </div>
  );
}