"use client";

// ============================================================
// CRAVEO - BRANCH REVIEW ACTIONS
// ============================================================

import { useState } from "react";

import {
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function BranchReviewActions({
  reviewId,
  initialApproved,
  initialVisible,
}) {
  const [approved, setApproved] =
    useState(
      initialApproved
    );

  const [visible, setVisible] =
    useState(
      initialVisible
    );

  const [loading, setLoading] =
    useState("");

  const [message, setMessage] =
    useState("");

  // ==========================================================
  // UPDATE
  // ==========================================================

  async function updateReview(
    values,
    action
  ) {
    try {
      setLoading(action);
      setMessage("");

      const response =
        await fetch(
          `/api/admin/branch/reviews/${reviewId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                values
              ),
          }
        );

      const text =
        await response.text();

      const result =
        text
          ? JSON.parse(text)
          : {};

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to update review."
        );
      }

      if (
        typeof values.isApproved ===
        "boolean"
      ) {
        setApproved(
          values.isApproved
        );
      }

      if (
        typeof values.isVisible ===
        "boolean"
      ) {
        setVisible(
          values.isVisible
        );
      }

      setMessage(
        "Review updated."
      );
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to update review."
      );
    } finally {
      setLoading("");
    }
  }

  return (
    <article className="branch-detail-card">
      <div className="branch-detail-heading">
        <ShieldCheck
          size={18}
        />

        <div>
          <span>
            MODERATION
          </span>

          <h2>
            Review Controls
          </h2>
        </div>
      </div>

      <div className="branch-review-actions">
        <button
          type="button"
          className={
            approved
              ? "active"
              : ""
          }
          disabled={
            loading !== ""
          }
          onClick={() =>
            updateReview(
              {
                isApproved:
                  !approved,
              },
              "approve"
            )
          }
        >
          <ShieldCheck
            size={15}
          />

          {loading ===
          "approve"
            ? "Updating..."
            : approved
              ? "Approved"
              : "Approve"}
        </button>

        <button
          type="button"
          className={
            visible
              ? "visible"
              : "hidden"
          }
          disabled={
            loading !== ""
          }
          onClick={() =>
            updateReview(
              {
                isVisible:
                  !visible,
              },
              "visible"
            )
          }
        >
          {visible ? (
            <Eye size={15} />
          ) : (
            <EyeOff
              size={15}
            />
          )}

          {loading ===
          "visible"
            ? "Updating..."
            : visible
              ? "Visible"
              : "Hidden"}
        </button>
      </div>

      {message && (
        <small className="branch-action-message">
          {message}
        </small>
      )}
    </article>
  );
}