"use client";

// ============================================================
// CRAVEO - FOOD ACTIONS
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function FoodActions({
  foodId,
  foodName,
  isAvailable,
}) {
  const router =
    useRouter();

  const [
    statusLoading,
    setStatusLoading,
  ] = useState(false);

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

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
  // TOGGLE AVAILABILITY
  // ==========================================================

  async function toggleAvailability() {
    try {
      setStatusLoading(true);

      const response =
        await fetch(
          `/api/admin/foods/${foodId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                isAvailable:
                  !isAvailable,
              }),
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
            "Unable to update food."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to update food."
      );
    } finally {
      setStatusLoading(false);
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function deleteFood() {
    const confirmed =
      window.confirm(
        `Delete "${foodName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);

      const response =
        await fetch(
          `/api/admin/foods/${foodId}`,
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
            "Unable to delete food."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to delete food."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="food-actions">
      <button
        type="button"
        className={`food-status-btn ${
          isAvailable
            ? "active"
            : "inactive"
        }`}
        onClick={
          toggleAvailability
        }
        disabled={
          statusLoading
        }
      >
        <Power size={14} />

        {statusLoading
          ? "Updating..."
          : isAvailable
            ? "Available"
            : "Unavailable"}
      </button>

      <Link
        href={`/admin/dashboard/foods/edit/${foodId}`}
        className="food-edit-btn"
      >
        <Pencil size={14} />
        Edit
      </Link>

      <button
        type="button"
        className="food-delete-btn"
        onClick={
          deleteFood
        }
        disabled={
          deleteLoading
        }
      >
        <Trash2 size={14} />

        {deleteLoading
          ? "Deleting..."
          : "Delete"}
      </button>
    </div>
  );
}