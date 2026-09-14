"use client";

// ============================================================
// CRAVEO - BRANCH ADMIN SIDEBAR
// ============================================================

import Image from "next/image";
import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  BarChart3,
  LayoutDashboard,
  MessageSquareWarning,
  Settings,
  ShoppingBag,
  Star,
  UserRound,
  UsersRound,
  UtensilsCrossed,
  X,
} from "lucide-react";

import BranchLogoutButton from "./BranchLogoutButton";

// ============================================================
// NAV ITEMS
// ============================================================

const navItems = [
  {
    label:
      "Dashboard",

    href:
      "/admin/branch-dashboard",

    icon:
      LayoutDashboard,
  },

  {
    label:
      "Orders",

    href:
      "/admin/branch-dashboard/orders",

    icon:
      ShoppingBag,
  },

  {
    label:
      "Foods",

    href:
      "/admin/branch-dashboard/foods",

    icon:
      UtensilsCrossed,
  },

  {
    label:
      "Customers",

    href:
      "/admin/branch-dashboard/customers",

    icon:
      UsersRound,
  },

  {
    label:
      "Reviews",

    href:
      "/admin/branch-dashboard/reviews",

    icon:
      Star,
  },

  {
    label:
      "Complaints",

    href:
      "/admin/branch-dashboard/complaints",

    icon:
      MessageSquareWarning,
  },

  {
    label:
      "Analytics",

    href:
      "/admin/branch-dashboard/analytics",

    icon:
      BarChart3,
  },

  {
    label:
      "Profile",

    href:
      "/admin/branch-dashboard/profile",

    icon:
      UserRound,
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function BranchSidebar({
  branch,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}) {
  const pathname =
    usePathname();

  // ==========================================================
  // ACTIVE
  // ==========================================================

  function isActive(
    href
  ) {
    if (
      href ===
      "/admin/branch-dashboard"
    ) {
      return (
        pathname ===
        href
      );
    }

    return pathname.startsWith(
      href
    );
  }

  // ==========================================================
  // CLOSE
  // ==========================================================

  function closeMobileSidebar() {
    setMobileSidebarOpen(
      false
    );
  }

  return (
    <>
      {/* ======================================================
          OVERLAY
      ====================================================== */}

      {mobileSidebarOpen && (
        <button
          type="button"
          className="branch-mobile-sidebar-overlay"
          onClick={
            closeMobileSidebar
          }
          aria-label="Close sidebar"
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`branch-sidebar ${
          mobileSidebarOpen
            ? "mobile-open"
            : ""
        }`}
      >
        {/* ====================================================
            CLOSE
        ==================================================== */}

        <button
          type="button"
          className="branch-mobile-sidebar-close"
          onClick={
            closeMobileSidebar
          }
          aria-label="Close sidebar"
        >
          <X
            size={20}
          />
        </button>

        {/* ====================================================
            BRAND
        ==================================================== */}

        <div className="branch-sidebar-brand">
          <div className="branch-sidebar-logo">
            <Image
              src="/images/craveo-logo.png"
              alt="CRAVEO"
              width={48}
              height={48}
              priority
            />
          </div>

          <div className="branch-sidebar-brand-text">
            <strong>
              CRAVEO
              <span>
                .
              </span>
            </strong>

            <small>
              BRANCH ADMIN
            </small>
          </div>
        </div>

        {/* ====================================================
            NAV
        ==================================================== */}

        <nav className="branch-sidebar-nav">
          <span className="branch-sidebar-nav-title">
            MANAGEMENT
          </span>

          <div className="branch-sidebar-links">
            {navItems.map(
              (
                item
              ) => {
                const Icon =
                  item.icon;

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    onClick={
                      closeMobileSidebar
                    }
                    className={`branch-sidebar-link ${
                      isActive(
                        item.href
                      )
                        ? "active"
                        : ""
                    }`}
                  >
                    <Icon
                      size={18}
                    />

                    <span>
                      {
                        item.label
                      }
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </nav>

        {/* ====================================================
            BOTTOM
        ==================================================== */}

        <div className="branch-sidebar-bottom">
          <div className="branch-sidebar-security">
            <Settings
              size={17}
            />

            <div>
              <strong>
                Branch Control
              </strong>

              <span>
                {branch?.name ||
                  "Restricted access"}
              </span>
            </div>
          </div>

          <div className="branch-sidebar-logout-wrap">
            <BranchLogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}