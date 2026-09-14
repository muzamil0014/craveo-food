"use client";

// ============================================================
// CRAVEO - SUPER ADMIN CLIENT LAYOUT
// ============================================================

import {
  useState,
} from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

// ============================================================
// COMPONENT
// ============================================================

export default function AdminDashboardClientLayout({
  children,
  admin,
}) {
  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  return (
    <div className="admin-dashboard-shell">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <AdminSidebar
        mobileSidebarOpen={
          mobileSidebarOpen
        }
        setMobileSidebarOpen={
          setMobileSidebarOpen
        }
      />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="admin-dashboard-main">
        <AdminNavbar
          admin={admin}
          mobileSidebarOpen={
            mobileSidebarOpen
          }
          setMobileSidebarOpen={
            setMobileSidebarOpen
          }
        />

        <div className="admin-dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}