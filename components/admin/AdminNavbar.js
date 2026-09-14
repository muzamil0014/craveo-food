"use client";

// ============================================================
// CRAVEO - SUPER ADMIN NAVBAR
// FUNCTIONAL SEARCH
// ============================================================

import {
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  BarChart3,
  Bell,
  Building2,
  LayoutDashboard,
  Menu,
  MessageSquareWarning,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tags,
  TicketPercent,
  UserCog,
  UsersRound,
  UtensilsCrossed,
  X,
} from "lucide-react";

// ============================================================
// SEARCH ITEMS
// ============================================================

const searchItems = [
  {
    label:
      "Dashboard",

    keywords:
      "dashboard home overview",

    href:
      "/admin/dashboard",

    icon:
      LayoutDashboard,
  },

  {
    label:
      "Branches",

    keywords:
      "branch branches restaurant locations",

    href:
      "/admin/dashboard/branches",

    icon:
      Building2,
  },

  {
    label:
      "Categories",

    keywords:
      "category categories",

    href:
      "/admin/dashboard/categories",

    icon:
      Tags,
  },

  {
    label:
      "Foods",

    keywords:
      "food foods menu products",

    href:
      "/admin/dashboard/foods",

    icon:
      UtensilsCrossed,
  },

  {
    label:
      "Orders",

    keywords:
      "order orders sales delivery",

    href:
      "/admin/dashboard/orders",

    icon:
      ShoppingBag,
  },

  {
    label:
      "Customers",

    keywords:
      "customer customers users",

    href:
      "/admin/dashboard/customers",

    icon:
      UsersRound,
  },

  {
    label:
      "Reviews",

    keywords:
      "review reviews rating ratings",

    href:
      "/admin/dashboard/reviews",

    icon:
      Star,
  },

  {
    label:
      "Coupons",

    keywords:
      "coupon coupons discount discounts promo",

    href:
      "/admin/dashboard/coupons",

    icon:
      TicketPercent,
  },

  {
    label:
      "Complaints",

    keywords:
      "complaint complaints support",

    href:
      "/admin/dashboard/complaints",

    icon:
      MessageSquareWarning,
  },

  {
    label:
      "Branch Admins",

    keywords:
      "branch admin admins staff manager",

    href:
      "/admin/dashboard/branch-admins",

    icon:
      UserCog,
  },

  {
    label:
      "Analytics",

    keywords:
      "analytics reports revenue sales statistics",

    href:
      "/admin/dashboard/analytics",

    icon:
      BarChart3,
  },

  {
    label:
      "Settings",

    keywords:
      "settings configuration system",

    href:
      "/admin/dashboard/settings",

    icon:
      Settings,
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function AdminNavbar({
  admin,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}) {
  const router =
    useRouter();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    focused,
    setFocused,
  ] = useState(false);

  // ==========================================================
  // ADMIN INITIAL
  // ==========================================================

  const initial =
    admin?.name
      ?.charAt(0)
      ?.toUpperCase() ||
    "A";

  // ==========================================================
  // FILTER SEARCH ITEMS
  // ==========================================================

  const filteredItems =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return searchItems.slice(
          0,
          6
        );
      }

      return searchItems.filter(
        (
          item
        ) =>
          item.label
            .toLowerCase()
            .includes(
              value
            ) ||
          item.keywords
            .toLowerCase()
            .includes(
              value
            )
      );
    }, [
      search,
    ]);

  // ==========================================================
  // OPEN PAGE
  // ==========================================================

  function openSearchItem(
    item
  ) {
    if (!item) {
      return;
    }

    setSearch("");
    setFocused(false);

    router.push(
      item.href
    );
  }

  // ==========================================================
  // ENTER SEARCH
  // ==========================================================

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (
      filteredItems.length >
      0
    ) {
      openSearchItem(
        filteredItems[0]
      );
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <header className="admin-navbar">
      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      <button
        type="button"
        className="admin-mobile-menu-btn"
        onClick={() =>
          setMobileSidebarOpen(
            !mobileSidebarOpen
          )
        }
        aria-label="Open sidebar"
      >
        {mobileSidebarOpen ? (
          <X
            size={21}
          />
        ) : (
          <Menu
            size={21}
          />
        )}
      </button>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <form
        className="admin-navbar-search-wrap"
        onSubmit={
          handleSubmit
        }
      >
        <div className="admin-navbar-search">
          <Search
            size={18}
          />

          <input
            type="text"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            onFocus={() =>
              setFocused(
                true
              )
            }
            onBlur={() => {
              setTimeout(
                () =>
                  setFocused(
                    false
                  ),
                150
              );
            }}
            placeholder="Search orders, customers, foods..."
            autoComplete="off"
          />

          {search && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() =>
                setSearch(
                  ""
                )
              }
              aria-label="Clear search"
            >
              <X
                size={14}
              />
            </button>
          )}
        </div>

        {/* ====================================================
            SEARCH RESULTS
        ==================================================== */}

        {focused && (
          <div className="admin-search-results">
            {filteredItems.length >
            0 ? (
              filteredItems.map(
                (
                  item
                ) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      key={
                        item.href
                      }
                      type="button"
                      className="admin-search-result-item"
                      onMouseDown={(
                        event
                      ) =>
                        event.preventDefault()
                      }
                      onClick={() =>
                        openSearchItem(
                          item
                        )
                      }
                    >
                      <span className="admin-search-result-icon">
                        <Icon
                          size={15}
                        />
                      </span>

                      <span>
                        {
                          item.label
                        }
                      </span>
                    </button>
                  );
                }
              )
            ) : (
              <div className="admin-search-empty">
                No matching page found.
              </div>
            )}
          </div>
        )}
      </form>

      {/* ======================================================
          RIGHT
      ====================================================== */}

      <div className="admin-navbar-right">
        <button
          type="button"
          className="admin-navbar-icon-btn"
          aria-label="Notifications"
        >
          <Bell
            size={19}
          />

          <span className="admin-notification-dot" />
        </button>

        <div className="admin-navbar-divider" />

        <div className="admin-navbar-profile">
          <div className="admin-navbar-avatar">
            {initial}
          </div>

          <div className="admin-profile-details">
            <strong>
              {admin?.name ||
                "Super Admin"}
            </strong>

            <span>
              <ShieldCheck
                size={12}
              />

              Super Admin
            </span>

            <small>
              {
                admin?.email
              }
            </small>
          </div>
        </div>
      </div>
    </header>
  );
}