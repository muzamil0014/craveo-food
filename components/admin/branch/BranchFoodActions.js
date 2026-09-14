"use client";

// ============================================================
// CRAVEO - BRANCH FOOD ACTIONS
// ============================================================

import { useState } from "react";

import {
  PackageCheck,
  Power,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function BranchFoodActions({
  foodId,
  initialAvailable,
  initialStock,
}) {
  const [available, setAvailable] =
    useState(
      initialAvailable
    );

  const [stock, setStock] =
    useState(
      initialStock
    );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // ==========================================================
  // SAVE
  // ==========================================================

  async function saveSettings(
    nextAvailable =
      available
  ) {
    try {
      setLoading(true);
      setMessage("");

      const response =
        await fetch(
          `/api/admin/branch/foods/${foodId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                isAvailable:
                  nextAvailable,

                stock:
                  Number(
                    stock
                  ),
              }),
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
            "Unable to save food."
        );
      }

      setAvailable(
        nextAvailable
      );

      setMessage(
        "Saved."
      );
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to save."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="branch-food-actions">
      <div className="branch-food-stock-control">
        <label>
          Branch Stock
        </label>

        <input
          type="number"
          min="0"
          value={stock}
          onChange={(
            event
          ) =>
            setStock(
              event.target.value
            )
          }
        />
      </div>

      <div className="branch-food-action-buttons">
        <button
          type="button"
          className={`branch-food-toggle ${
            available
              ? "active"
              : "inactive"
          }`}
          onClick={() =>
            saveSettings(
              !available
            )
          }
          disabled={
            loading
          }
        >
          <Power
            size={14}
          />

          {available
            ? "Available"
            : "Unavailable"}
        </button>

        <button
          type="button"
          className="branch-food-save"
          onClick={() =>
            saveSettings(
              available
            )
          }
          disabled={
            loading
          }
        >
          <PackageCheck
            size={14}
          />

          {loading
            ? "Saving..."
            : "Save Stock"}
        </button>
      </div>

      {message && (
        <small>
          {message}
        </small>
      )}
    </div>
  );
}