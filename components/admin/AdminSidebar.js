"use client";

// ============================================================
// CRAVEO - SUPER ADMIN SIDEBAR
// ============================================================

import Image from "next/image";
import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  BarChart3,
  Building2,
  LayoutDashboard,
  MessageSquareWarning,
  Settings,
  ShoppingBag,
  Star,
  Tags,
  TicketPercent,
  UserCog,
  UsersRound,
  UtensilsCrossed,
  X,
} from "lucide-react";

import LogoutButton from "./LogoutButton";

// ============================================================
// NAV ITEMS
// ============================================================

const navItems = [
  {
    label:
      "Dashboard",

    href:
      "/admin/dashboard",

    icon:
      LayoutDashboard,
  },

  {
    label:
      "Branches",

    href:
      "/admin/dashboard/branches",

    icon:
      Building2,
  },

  {
    label:
      "Categories",

    href:
      "/admin/dashboard/categories",

    icon:
      Tags,
  },

  {
    label:
      "Foods",

    href:
      "/admin/dashboard/foods",

    icon:
      UtensilsCrossed,
  },

  {
    label:
      "Orders",

    href:
      "/admin/dashboard/orders",

    icon:
      ShoppingBag,
  },

  {
    label:
      "Customers",

    href:
      "/admin/dashboard/customers",

    icon:
      UsersRound,
  },

  {
    label:
      "Reviews",

    href:
      "/admin/dashboard/reviews",

    icon:
      Star,
  },

  {
    label:
      "Coupons",

    href:
      "/admin/dashboard/coupons",

    icon:
      TicketPercent,
  },

  {
    label:
      "Complaints",

    href:
      "/admin/dashboard/complaints",

    icon:
      MessageSquareWarning,
  },

  {
    label:
      "Branch Admins",

    href:
      "/admin/dashboard/branch-admins",

    icon:
      UserCog,
  },

  {
    label:
      "Analytics",

    href:
      "/admin/dashboard/analytics",

    icon:
      BarChart3,
  },

  {
    label:
      "Settings",

    href:
      "/admin/dashboard/settings",

    icon:
      Settings,
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function AdminSidebar({
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
      "/admin/dashboard"
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
  // CLOSE MOBILE
  // ==========================================================

  function closeMobileSidebar() {
    setMobileSidebarOpen(
      false
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* ======================================================
          OVERLAY
      ====================================================== */}

      {mobileSidebarOpen && (
        <button
          type="button"
          className="admin-mobile-sidebar-overlay"
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
        className={`admin-sidebar ${
          mobileSidebarOpen
            ? "mobile-open"
            : ""
        }`}
      >
        {/* ====================================================
            MOBILE CLOSE
        ==================================================== */}

        <button
          type="button"
          className="admin-mobile-sidebar-close"
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

        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-mark">
            <Image
              src="/images/craveo-logo.png"
              alt="CRAVEO Logo"
              width={46}
              height={46}
              priority
              className="admin-sidebar-logo-image"
            />
          </div>

          <div className="admin-sidebar-brand-text">
            <strong>
              CRAVEO
              <span>
                .
              </span>
            </strong>

            <small>
              PREMIUM FOOD
            </small>
          </div>
        </div>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <nav className="admin-sidebar-nav">
          <span className="admin-sidebar-label">
            MANAGEMENT
          </span>

          <div className="admin-sidebar-links">
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
                    className={`admin-sidebar-link ${
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

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-system">
            <Settings
              size={17}
            />

            <div>
              <strong>
                CRAVEO Control
              </strong>

              <span>
                Super Admin
              </span>
            </div>
          </div>

          {/* ==================================================
              LOGOUT
          ================================================== */}

          <div className="admin-sidebar-logout-wrap">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}