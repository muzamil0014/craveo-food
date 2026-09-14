"use client";

// ============================================================
// CRAVEO - REVIEW ACTIONS
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Check,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function ReviewActions({
  reviewId,
  customerName,
  isApproved,
  isVisible,
}) {
  const router =
    useRouter();

  const [loading, setLoading] =
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
  // UPDATE REVIEW
  // ==========================================================

  async function updateReview(
    payload,
    type
  ) {
    try {
      setLoading(type);

      const response =
        await fetch(
          `/api/admin/reviews/${reviewId}`,
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
            "Unable to update review."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to update review."
      );
    } finally {
      setLoading("");
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function deleteReview() {
    const confirmed =
      window.confirm(
        `Delete review from "${customerName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading("delete");

      const response =
        await fetch(
          `/api/admin/reviews/${reviewId}`,
          {
            method: "DELETE",
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
            "Unable to delete review."
        );
      }

      window.location.replace(
        "/admin/dashboard/reviews"
      );
    } catch (error) {
      alert(
        error.message ||
          "Unable to delete review."
      );

      setLoading("");
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="review-actions">
      {/* ======================================================
          APPROVE / UNAPPROVE
      ====================================================== */}

      <button
        type="button"
        className={`review-approve-btn ${
          isApproved
            ? "approved"
            : ""
        }`}
        disabled={loading !== ""}
        onClick={() =>
          updateReview(
            {
              isApproved:
                !isApproved,
            },
            "approve"
          )
        }
      >
        <Check size={14} />

        {loading === "approve"
          ? "Updating..."
          : isApproved
            ? "Unapprove"
            : "Approve"}
      </button>

      {/* ======================================================
          SHOW / HIDE
      ====================================================== */}

      <button
        type="button"
        className={`review-visibility-btn ${
          !isVisible
            ? "hidden"
            : ""
        }`}
        disabled={loading !== ""}
        onClick={() =>
          updateReview(
            {
              isVisible:
                !isVisible,
            },
            "visibility"
          )
        }
      >
        {isVisible ? (
          <EyeOff size={14} />
        ) : (
          <Eye size={14} />
        )}

        {loading === "visibility"
          ? "Updating..."
          : isVisible
            ? "Hide"
            : "Show"}
      </button>

      {/* ======================================================
          DELETE
      ====================================================== */}

      <button
        type="button"
        className="review-delete-btn"
        disabled={loading !== ""}
        onClick={deleteReview}
      >
        <Trash2 size={14} />

        {loading === "delete"
          ? "Deleting..."
          : "Delete"}
      </button>
    </div>
  );
}