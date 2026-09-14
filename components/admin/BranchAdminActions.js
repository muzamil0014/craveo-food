"use client";

// ============================================================
// CRAVEO - BRANCH ADMIN ACTIONS
// EDIT + STATUS + DELETE
// ============================================================

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function BranchAdminActions({
  adminId,
  adminName,
  isActive,
}) {
  const router = useRouter();

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
  // EDIT ADMIN
  // ==========================================================

  function editAdmin() {
    if (!adminId) {
      alert(
        "Branch Admin ID missing."
      );

      return;
    }

    const safeId =
      encodeURIComponent(
        String(adminId)
      );

    router.push(
      `/admin/dashboard/branch-admins/edit/${safeId}`
    );
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  async function toggleStatus() {
    if (!adminId) {
      alert(
        "Branch Admin ID missing."
      );

      return;
    }

    try {
      setLoading("status");

      const response =
        await fetch(
          `/api/admin/branch-admins/${adminId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            cache:
              "no-store",

            body:
              JSON.stringify({
                isActive:
                  !isActive,
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
      setLoading("");
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function deleteAdmin() {
    if (!adminId) {
      alert(
        "Branch Admin ID missing."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete Branch Admin "${adminName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading("delete");

      const response =
        await fetch(
          `/api/admin/branch-admins/${adminId}`,
          {
            method:
              "DELETE",

            cache:
              "no-store",
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
            "Unable to delete admin."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to delete admin."
      );
    } finally {
      setLoading("");
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="branch-admin-actions">
      {/* ======================================================
          ACTIVE / INACTIVE
      ====================================================== */}

      <button
        type="button"
        className={`branch-admin-status-btn ${
          isActive
            ? "active"
            : "inactive"
        }`}
        onClick={
          toggleStatus
        }
        disabled={
          loading !== ""
        }
      >
        <Power
          size={14}
        />

        {loading === "status"
          ? "Updating..."
          : isActive
            ? "Active"
            : "Inactive"}
      </button>

      {/* ======================================================
          EDIT
      ====================================================== */}

      <button
        type="button"
        className="branch-admin-edit-btn"
        onClick={
          editAdmin
        }
        disabled={
          loading !== ""
        }
      >
        <Pencil
          size={14}
        />

        Edit
      </button>

      {/* ======================================================
          DELETE
      ====================================================== */}

      <button
        type="button"
        className="branch-admin-delete-btn"
        onClick={
          deleteAdmin
        }
        disabled={
          loading !== ""
        }
      >
        <Trash2
          size={14}
        />

        {loading === "delete"
          ? "Deleting..."
          : "Delete"}
      </button>
    </div>
  );
}