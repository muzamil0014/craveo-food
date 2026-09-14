"use client";

// ============================================================
// CRAVEO - BRANCH ADMIN LOGOUT BUTTON
// ============================================================

import {
  useState,
} from "react";

import {
  LogOut,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function BranchLogoutButton() {
  const [loading, setLoading] =
    useState(false);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  async function handleLogout() {
    try {
      setLoading(true);

      await fetch(
        "/api/auth/branch-logout",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "BRANCH LOGOUT ERROR:",
        error
      );
    } finally {
      window.location.replace(
        "/admin/branch-login"
      );
    }
  }

  return (
    <button
      type="button"
      className="branch-sidebar-logout"
      onClick={
        handleLogout
      }
      disabled={
        loading
      }
    >
      <LogOut
        size={17}
      />

      {loading
        ? "Logging out..."
        : "Logout"}
    </button>
  );
}