"use client";

// ============================================================
// CRAVEO - CUSTOMER STATUS
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Power,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function CustomerStatus({
  customerId,
  isActive,
}) {
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

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
  // TOGGLE
  // ==========================================================

  async function toggleStatus() {
    try {
      setLoading(true);

      const response =
        await fetch(
          `/api/admin/customers/${customerId}`,
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
            "Unable to update customer."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to update customer."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <button
      type="button"
      className={`customer-status-button ${
        isActive
          ? "active"
          : "inactive"
      }`}
      onClick={
        toggleStatus
      }
      disabled={
        loading
      }
    >
      <Power size={14} />

      {loading
        ? "Updating..."
        : isActive
          ? "Active"
          : "Inactive"}
    </button>
  );
}