"use client";

// ============================================================
// CRAVEO - BRANCH DASHBOARD CLIENT LAYOUT
// ============================================================

import {
  useState,
} from "react";

import BranchSidebar from "./BranchSidebar";
import BranchNavbar from "./BranchNavbar";

// ============================================================
// COMPONENT
// ============================================================

export default function BranchDashboardClientLayout({
  children,
  admin,
  branch,
}) {
  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  return (
    <div className="branch-admin-shell">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <BranchSidebar
        branch={branch}
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

      <div className="branch-admin-main">
        <BranchNavbar
          admin={admin}
          branch={branch}
          mobileSidebarOpen={
            mobileSidebarOpen
          }
          setMobileSidebarOpen={
            setMobileSidebarOpen
          }
        />

        <div className="branch-admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}