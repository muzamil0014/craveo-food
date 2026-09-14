"use client";

// ============================================================
// CRAVEO - COUPON ACTIONS
// ============================================================

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function CouponActions({
  couponId,
  couponCode,
  isActive,
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
  // STATUS
  // ==========================================================

  async function toggleStatus() {
    try {
      setLoading("status");

      const response =
        await fetch(
          `/api/admin/coupons/${couponId}`,
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
            "Unable to update coupon."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to update coupon."
      );
    } finally {
      setLoading("");
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function deleteCoupon() {
    const confirmed =
      window.confirm(
        `Delete coupon "${couponCode}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading("delete");

      const response =
        await fetch(
          `/api/admin/coupons/${couponId}`,
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
            "Unable to delete coupon."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error.message ||
          "Unable to delete coupon."
      );
    } finally {
      setLoading("");
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="coupon-actions">
      <button
        type="button"
        className={`coupon-status-btn ${
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
        <Power size={14} />

        {loading === "status"
          ? "Updating..."
          : isActive
            ? "Active"
            : "Inactive"}
      </button>

      <Link
        href={`/admin/dashboard/coupons/edit/${couponId}`}
        className="coupon-edit-btn"
      >
        <Pencil size={14} />
        Edit
      </Link>

      <button
        type="button"
        className="coupon-delete-btn"
        onClick={
          deleteCoupon
        }
        disabled={
          loading !== ""
        }
      >
        <Trash2 size={14} />

        {loading === "delete"
          ? "Deleting..."
          : "Delete"}
      </button>
    </div>
  );
}