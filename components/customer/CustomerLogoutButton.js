"use client";

// ============================================================
// CRAVEO - CUSTOMER LOGOUT BUTTON
//
// IMPORTANT:
// After logout we use window.location.replace()
// instead of only router.push().
//
// This forces complete server refresh and removes
// stale customer/navbar information.
// ============================================================

import {
  LoaderCircle,
  LogOut,
} from "lucide-react";

import {
  useState,
} from "react";

// ============================================================
// COMPONENT
// ============================================================

export default function CustomerLogoutButton() {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // LOGOUT
  // ==========================================================

  async function handleLogout() {
    try {
      setLoading(
        true
      );

      setError(
        ""
      );

      const response =
        await fetch(
          "/api/customer/logout",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            cache:
              "no-store",
          }
        );

      const text =
        await response.text();

      let result =
        {};

      if (text) {
        try {
          result =
            JSON.parse(
              text
            );
        } catch {
          result =
            {};
        }
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to logout."
        );
      }

      // ======================================================
      // FULL RELOAD
      //
      // Cookie is cleared.
      // Navbar server wrapper runs again.
      // customer becomes null.
      // ======================================================

      window.location.replace(
        "/"
      );
    } catch (error) {
      setError(
        error?.message ||
          "Unable to logout."
      );

      setLoading(
        false
      );
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="craveo-logout-wrapper">
      <button
        type="button"
        className="craveo-logout-button"
        onClick={
          handleLogout
        }
        disabled={
          loading
        }
      >
        {loading ? (
          <LoaderCircle
            size={15}
            className="craveo-spin"
          />
        ) : (
          <LogOut
            size={15}
          />
        )}

        {loading
          ? "Logging out..."
          : "Logout"}
      </button>

      {error && (
        <small className="craveo-logout-error">
          {error}
        </small>
      )}
    </div>
  );
}