"use client";

// ============================================================
// CRAVEO - BRANCH ADMIN NAVBAR
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
  LayoutDashboard,
  Menu,
  MessageSquareWarning,
  Search,
  ShoppingBag,
  Star,
  UserRound,
  UsersRound,
  UtensilsCrossed,
  X,
} from "lucide-react";

// ============================================================
// SEARCH ITEMS
// ============================================================

const branchSearchItems = [
  {
    label:
      "Dashboard",

    keywords:
      "dashboard home overview",

    href:
      "/admin/branch-dashboard",

    icon:
      LayoutDashboard,
  },

  {
    label:
      "Orders",

    keywords:
      "order orders delivery",

    href:
      "/admin/branch-dashboard/orders",

    icon:
      ShoppingBag,
  },

  {
    label:
      "Foods",

    keywords:
      "food foods menu stock inventory",

    href:
      "/admin/branch-dashboard/foods",

    icon:
      UtensilsCrossed,
  },

  {
    label:
      "Customers",

    keywords:
      "customer customers users",

    href:
      "/admin/branch-dashboard/customers",

    icon:
      UsersRound,
  },

  {
    label:
      "Reviews",

    keywords:
      "review reviews rating",

    href:
      "/admin/branch-dashboard/reviews",

    icon:
      Star,
  },

  {
    label:
      "Complaints",

    keywords:
      "complaint complaints support",

    href:
      "/admin/branch-dashboard/complaints",

    icon:
      MessageSquareWarning,
  },

  {
    label:
      "Analytics",

    keywords:
      "analytics sales revenue reports",

    href:
      "/admin/branch-dashboard/analytics",

    icon:
      BarChart3,
  },

  {
    label:
      "Profile",

    keywords:
      "profile account admin",

    href:
      "/admin/branch-dashboard/profile",

    icon:
      UserRound,
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function BranchNavbar({
  admin,
  branch,
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
  // FILTER
  // ==========================================================

  const filteredItems =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return branchSearchItems.slice(
          0,
          5
        );
      }

      return branchSearchItems.filter(
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
  // OPEN
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
  // ENTER
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

  return (
    <header className="branch-navbar">
      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      <button
        type="button"
        className="branch-mobile-menu-btn"
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
        className="branch-navbar-search-wrap"
        onSubmit={
          handleSubmit
        }
      >
        <div className="branch-navbar-search">
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
            placeholder="Search orders, foods, customers..."
            autoComplete="off"
          />

          {search && (
            <button
              type="button"
              className="branch-search-clear"
              onClick={() =>
                setSearch(
                  ""
                )
              }
            >
              <X
                size={14}
              />
            </button>
          )}
        </div>

        {/* ====================================================
            RESULTS
        ==================================================== */}

        {focused && (
          <div className="branch-search-results">
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
                      className="branch-search-result-item"
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
                      <span className="branch-search-result-icon">
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
              <div className="branch-search-empty">
                No matching page found.
              </div>
            )}
          </div>
        )}
      </form>

      {/* ======================================================
          RIGHT
      ====================================================== */}

      <div className="branch-navbar-right">
        <div className="branch-navbar-branch">
          <div>
            <span>
              CURRENT BRANCH
            </span>

            <strong>
              {branch?.name ||
                "Branch"}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="branch-navbar-notification"
          aria-label="Notifications"
        >
          <Bell
            size={19}
          />

          <span />
        </button>

        <div className="branch-navbar-divider" />

        <div className="branch-navbar-profile">
          <div className="branch-navbar-avatar">
            {admin?.name
              ?.charAt(0)
              ?.toUpperCase() ||
              "B"}
          </div>

          <div>
            <strong>
              {admin?.name ||
                "Branch Admin"}
            </strong>

            <span>
              Branch Admin
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