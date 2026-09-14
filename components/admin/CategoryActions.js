"use client";

// ============================================================
// CRAVEO - CATEGORY ACTIONS
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

export default function CategoryActions({
  categoryId,
  categoryName,
  isActive,
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
  // STATUS
  // ==========================================================

  async function toggleStatus() {
    try {
      setStatusLoading(true);

      const response =
        await fetch(
          `/api/admin/categories/${categoryId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                isActive:
                  !isActive,
              }),
          }
        );

      const data =
        await parseResponse(
          response
        );

      if (
        !response.ok ||
        data.success !== true
      ) {
        throw new Error(
          data.message ||
            "Unable to update status."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to update status."
      );
    } finally {
      setStatusLoading(false);
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function deleteCategory() {
    const confirmed =
      window.confirm(
        `Delete "${categoryName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);

      const response =
        await fetch(
          `/api/admin/categories/${categoryId}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await parseResponse(
          response
        );

      if (
        !response.ok ||
        data.success !== true
      ) {
        throw new Error(
          data.message ||
            "Unable to delete category."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to delete category."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="category-actions">
      <button
        type="button"
        className={`category-status-btn ${
          isActive
            ? "active"
            : "inactive"
        }`}
        onClick={toggleStatus}
        disabled={
          statusLoading
        }
      >
        <Power size={14} />

        {statusLoading
          ? "Updating..."
          : isActive
            ? "Active"
            : "Inactive"}
      </button>

      <Link
        href={`/admin/dashboard/categories/edit/${categoryId}`}
        className="category-edit-btn"
      >
        <Pencil size={14} />
        Edit
      </Link>

      <button
        type="button"
        className="category-delete-btn"
        onClick={
          deleteCategory
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