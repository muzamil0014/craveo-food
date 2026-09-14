"use client";

// ============================================================
// CRAVEO - BRANCH ACTIONS
// Edit + Status + Delete
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
// BRANCH ACTIONS COMPONENT
// ============================================================

export default function BranchActions({
  branchId,
  isActive,
  branchName,
}) {
  const router = useRouter();

  const [statusLoading, setStatusLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  // ==========================================================
  // TOGGLE BRANCH STATUS
  // ==========================================================

  async function handleStatusToggle() {
    try {
      setStatusLoading(true);

      const response = await fetch(
        `/api/admin/branches/${branchId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            isActive: !isActive,
          }),
        }
      );

      const text = await response.text();

      let data = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Server returned an invalid response."
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update branch status."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to update branch status."
      );
    } finally {
      setStatusLoading(false);
    }
  }

  // ==========================================================
  // DELETE BRANCH
  // ==========================================================

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${branchName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);

      const response = await fetch(
        `/api/admin/branches/${branchId}`,
        {
          method: "DELETE",
        }
      );

      const text = await response.text();

      let data = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Server returned an invalid response."
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete branch."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to delete branch."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="branch-card-actions">
      {/* ======================================================
          STATUS
      ====================================================== */}

      <button
        type="button"
        className={`branch-status-btn ${
          isActive ? "active" : "inactive"
        }`}
        onClick={handleStatusToggle}
        disabled={statusLoading}
      >
        <Power size={15} />

        {statusLoading
          ? "Updating..."
          : isActive
            ? "Active"
            : "Inactive"}
      </button>

      {/* ======================================================
          EDIT
      ====================================================== */}

      <Link
        href={`/admin/dashboard/branches/edit/${branchId}`}
        className="branch-edit-btn"
      >
        <Pencil size={15} />
        Edit
      </Link>

      {/* ======================================================
          DELETE
      ====================================================== */}

      <button
        type="button"
        className="branch-delete-btn"
        onClick={handleDelete}
        disabled={deleteLoading}
      >
        <Trash2 size={15} />

        {deleteLoading
          ? "Deleting..."
          : "Delete"}
      </button>
    </div>
  );
}