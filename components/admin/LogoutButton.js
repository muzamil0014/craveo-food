"use client";

// ============================================================
// CRAVEO - ADMIN LOGOUT BUTTON
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

// ============================================================
// LOGOUT BUTTON
// ============================================================

export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  async function handleLogout() {
    try {
      setLoading(true);

      await fetch("/api/auth/admin-logout", {
        method: "POST",
      });

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(
        "ADMIN LOGOUT ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="admin-navbar-logout"
      onClick={handleLogout}
      disabled={loading}
      title="Logout"
    >
      <LogOut size={18} />

      <span>
        {loading ? "Logging out..." : "Logout"}
      </span>
    </button>
  );
}