"use client";

// ============================================================
// CRAVEO - CUSTOMER NAVBAR CLIENT
//
// DESKTOP:
// Logo + Links + Search + Branch + Wishlist + Cart + Profile
//
// MOBILE:
// Logo + Profile Trigger
//
// Logged In:
// Profile image click -> drawer
// Drawer bottom -> Logout
//
// Logged Out:
// User icon click -> drawer
// Customer profile card removed
// Wishlist -> Login
// My Account -> Login
// ============================================================

import Link from "next/link";

import {
  ChevronRight,
  Grid2X2,
  Headphones,
  Heart,
  Home,
  LoaderCircle,
  LogOut,
  MapPin,
  Search,
  ShoppingBag,
  Store,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

// ============================================================
// COMPONENT
// ============================================================

export default function CustomerNavbarClient({
  customer = null,
  branch = null,
  cartCount = 0,
  wishlistCount = 0,
}) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  // ==========================================================
  // MOBILE DRAWER
  // ==========================================================

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState("");

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const [
    logoutLoading,
    setLogoutLoading,
  ] = useState(false);

  const [
    logoutError,
    setLogoutError,
  ] = useState("");

  // ==========================================================
  // COUNTS
  // ==========================================================

  const [
    currentCartCount,
    setCurrentCartCount,
  ] = useState(
    Number(
      cartCount || 0
    )
  );

  const [
    currentWishlistCount,
    setCurrentWishlistCount,
  ] = useState(
    Number(
      wishlistCount || 0
    )
  );

  // ==========================================================
  // SYNC COUNTS
  // ==========================================================

  useEffect(() => {
    setCurrentCartCount(
      Number(
        cartCount || 0
      )
    );
  }, [
    cartCount,
  ]);

  useEffect(() => {
    setCurrentWishlistCount(
      Number(
        wishlistCount || 0
      )
    );
  }, [
    wishlistCount,
  ]);

  // ==========================================================
  // CART EVENT
  // ==========================================================

  useEffect(() => {
    function handleCartUpdate(
      event
    ) {
      setCurrentCartCount(
        Number(
          event.detail
            ?.count || 0
        )
      );
    }

    window.addEventListener(
      "craveo-cart-updated",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener(
        "craveo-cart-updated",
        handleCartUpdate
      );
    };
  }, []);

  // ==========================================================
  // WISHLIST EVENT
  // ==========================================================

  useEffect(() => {
    function handleWishlistUpdate(
      event
    ) {
      setCurrentWishlistCount(
        Number(
          event.detail
            ?.count || 0
        )
      );
    }

    window.addEventListener(
      "craveo-wishlist-updated",
      handleWishlistUpdate
    );

    return () => {
      window.removeEventListener(
        "craveo-wishlist-updated",
        handleWishlistUpdate
      );
    };
  }, []);

  // ==========================================================
  // CLOSE DRAWER AFTER ROUTE CHANGE
  // ==========================================================

  useEffect(() => {
    setMobileOpen(
      false
    );
  }, [
    pathname,
  ]);

  // ==========================================================
  // BODY SCROLL
  // ==========================================================

  useEffect(() => {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    document.body.style.overflow =
      mobileOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    mobileOpen,
  ]);

  // ==========================================================
  // CLOSE MENU
  // ==========================================================

  function closeMenu() {
    setMobileOpen(
      false
    );
  }

  // ==========================================================
  // SEARCH
  // ==========================================================

  function handleSearch(
    event
  ) {
    event.preventDefault();

    const value =
      search.trim();

    closeMenu();

    if (!value) {
      router.push(
        "/foods"
      );

      return;
    }

    router.push(
      `/foods?search=${encodeURIComponent(
        value
      )}`
    );
  }

  // ==========================================================
  // ACTIVE ROUTE
  // ==========================================================

  function isActive(
    href
  ) {
    if (
      href === "/"
    ) {
      return (
        pathname === "/"
      );
    }

    return pathname.startsWith(
      href
    );
  }

  // ==========================================================
  // CUSTOMER LOGOUT
  // ==========================================================

  async function handleMobileLogout() {
    try {
      setLogoutLoading(
        true
      );

      setLogoutError(
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
      // IMPORTANT
      //
      // Full browser reload.
      // This removes stale customer data from navbar.
      // ======================================================

      window.location.replace(
        "/"
      );
    } catch (error) {
      setLogoutError(
        error?.message ||
          "Unable to logout."
      );

      setLogoutLoading(
        false
      );
    }
  }

  // ==========================================================
  // MOBILE MENU ITEM
  // ==========================================================

  function MobileMenuItem({
    href,
    icon: Icon,
    title,
    subtitle,
    badge = null,
  }) {
    return (
      <Link
        href={href}
        onClick={
          closeMenu
        }
        className={`craveo-mobile-menu-item ${
          isActive(
            href
          )
            ? "active"
            : ""
        }`}
      >
        <span className="craveo-mobile-menu-item-icon">
          <Icon
            size={18}
          />
        </span>

        <span className="craveo-mobile-menu-item-content">
          <strong>
            {title}
          </strong>

          {subtitle && (
            <small>
              {subtitle}
            </small>
          )}
        </span>

        {badge !== null &&
          Number(
            badge
          ) >
            0 && (
            <span className="craveo-mobile-menu-count">
              {badge}
            </span>
          )}

        <ChevronRight
          size={16}
          className="craveo-mobile-menu-arrow"
        />
      </Link>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <header className="store-navbar">
        <div className="store-navbar-container">

          {/* ==================================================
              LOGO
          ================================================== */}

          <Link
            href="/"
            className="store-logo"
            onClick={
              closeMenu
            }
          >
            <img
              src="/images/craveo-logo.png"
              alt="CRAVEO"
              className="store-logo-image"
            />
          </Link>

          {/* ==================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <nav className="store-nav-links">
            <Link href="/">
              Home
            </Link>

            <Link href="/foods">
              Menu
            </Link>

            <Link href="/categories">
              Categories
            </Link>

            <Link
              href={
                customer
                  ? "/account/complaints"
                  : "/login"
              }
            >
              Support
            </Link>
          </nav>

          {/* ==================================================
              DESKTOP SEARCH
          ================================================== */}

          <form
            className="store-navbar-search craveo-desktop-navbar-search"
            onSubmit={
              handleSearch
            }
          >
            <Search
              size={17}
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
              placeholder="Search food..."
            />
          </form>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="store-navbar-actions">

            {/* =================================================
                DESKTOP BRANCH
            ================================================= */}

            <Link
              href="/select-branch"
              className="customer-navbar-branch craveo-desktop-navbar-action"
            >
              <MapPin
                size={17}
              />

              <span>
                <small>
                  {branch
                    ? "YOUR BRANCH"
                    : "SELECT BRANCH"}
                </small>

                <strong>
                  {branch
                    ? branch.name
                    : customer?.city ||
                      "Choose Branch"}
                </strong>
              </span>
            </Link>

            {/* =================================================
                DESKTOP WISHLIST
            ================================================= */}

            <Link
              href={
                customer
                  ? "/account/wishlist"
                  : "/login"
              }
              className="store-navbar-icon store-navbar-action-btn store-navbar-badge-link craveo-desktop-navbar-action"
              aria-label="Wishlist"
            >
              <Heart
                size={20}
              />

              {currentWishlistCount >
                0 && (
                <span className="store-navbar-count-badge">
                  {
                    currentWishlistCount
                  }
                </span>
              )}
            </Link>

            {/* =================================================
                DESKTOP CART
            ================================================= */}

            <Link
              href="/cart"
              className="store-navbar-icon store-navbar-action-btn store-navbar-badge-link craveo-desktop-navbar-action"
              aria-label="Cart"
            >
              <ShoppingBag
                size={20}
              />

              {currentCartCount >
                0 && (
                <span className="store-navbar-count-badge">
                  {
                    currentCartCount
                  }
                </span>
              )}
            </Link>

            {/* =================================================
                DESKTOP PROFILE
            ================================================= */}

            <Link
              href={
                customer
                  ? "/account"
                  : "/login"
              }
              className="store-navbar-icon store-navbar-action-btn customer-navbar-profile craveo-desktop-navbar-action"
            >
              {customer?.avatar ? (
                <img
                  src={
                    customer.avatar
                  }
                  alt={
                    customer.name ||
                    "Customer"
                  }
                  className="customer-navbar-profile-image"
                />
              ) : (
                <UserRound
                  size={20}
                />
              )}
            </Link>

            {/* =================================================
                MOBILE PROFILE / USER BUTTON
            ================================================= */}

            <button
              type="button"
              className="craveo-mobile-profile-trigger"
              onClick={() =>
                setMobileOpen(
                  (
                    current
                  ) =>
                    !current
                )
              }
              aria-label="Open account menu"
              aria-expanded={
                mobileOpen
              }
            >
              {customer?.avatar ? (
                <img
                  src={
                    customer.avatar
                  }
                  alt={
                    customer.name ||
                    "Customer"
                  }
                />
              ) : (
                <UserRound
                  size={20}
                />
              )}

              {customer &&
                (currentCartCount >
                  0 ||
                  currentWishlistCount >
                    0) && (
                  <span className="craveo-mobile-profile-dot" />
                )}
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================
          DRAWER OVERLAY
      ====================================================== */}

      {mobileOpen && (
        <button
          type="button"
          className="craveo-mobile-drawer-overlay"
          onClick={
            closeMenu
          }
          aria-label="Close menu"
        />
      )}

      {/* ======================================================
          DRAWER
      ====================================================== */}

      <aside
        className={`craveo-mobile-drawer ${
          mobileOpen
            ? "open"
            : ""
        }`}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="craveo-mobile-drawer-header">
          <Link
            href="/"
            onClick={
              closeMenu
            }
            className="craveo-mobile-drawer-logo"
          >
            <img
              src="/images/craveo-logo.png"
              alt="CRAVEO"
            />
          </Link>

          <button
            type="button"
            className="craveo-mobile-drawer-close"
            onClick={
              closeMenu
            }
            aria-label="Close menu"
          >
            <X
              size={20}
            />
          </button>
        </div>

        {/* ====================================================
            LOGGED IN CUSTOMER CARD

            IMPORTANT:
            Logout hone par customer null hoga,
            to ye complete card remove ho jayega.
        ==================================================== */}

        {customer && (
          <Link
            href="/account"
            onClick={
              closeMenu
            }
            className="craveo-mobile-user-card"
          >
            <div className="craveo-mobile-user-avatar">
              {customer.avatar ? (
                <img
                  src={
                    customer.avatar
                  }
                  alt={
                    customer.name ||
                    "Customer"
                  }
                />
              ) : (
                <UserRound
                  size={20}
                />
              )}
            </div>

            <div>
              <span>
                WELCOME BACK
              </span>

              <strong>
                {customer.name ||
                  "Customer"}
              </strong>

              <small>
                {
                  customer.email
                }
              </small>
            </div>

            <ChevronRight
              size={17}
            />
          </Link>
        )}

        {/* ====================================================
            LOGGED OUT LOGIN CARD
        ==================================================== */}

        {!customer && (
          <Link
            href="/login"
            onClick={
              closeMenu
            }
            className="craveo-mobile-user-card craveo-mobile-login-card"
          >
            <div className="craveo-mobile-user-avatar">
              <UserRound
                size={20}
              />
            </div>

            <div>
              <span>
                CRAVEO ACCOUNT
              </span>

              <strong>
                Login
              </strong>

              <small>
                Sign in to your account
              </small>
            </div>

            <ChevronRight
              size={17}
            />
          </Link>
        )}

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <form
          className="craveo-mobile-search"
          onSubmit={
            handleSearch
          }
        >
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
            placeholder="Search your favourite food..."
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch(
                  ""
                )
              }
            >
              <X
                size={15}
              />
            </button>
          )}
        </form>

        {/* ====================================================
            EXPLORE
        ==================================================== */}

        <div className="craveo-mobile-menu-section">
          <span className="craveo-mobile-menu-label">
            EXPLORE
          </span>

          <MobileMenuItem
            href="/"
            icon={
              Home
            }
            title="Home"
            subtitle="Back to homepage"
          />

          <MobileMenuItem
            href="/foods"
            icon={
              Store
            }
            title="Menu"
            subtitle="Browse all foods"
          />

          <MobileMenuItem
            href="/categories"
            icon={
              Grid2X2
            }
            title="Categories"
            subtitle="Browse food categories"
          />

          <MobileMenuItem
            href={
              customer
                ? "/account/complaints"
                : "/login"
            }
            icon={
              Headphones
            }
            title="Support"
            subtitle="Help & complaints"
          />
        </div>

        {/* ====================================================
            DELIVERY
        ==================================================== */}

        <div className="craveo-mobile-menu-section">
          <span className="craveo-mobile-menu-label">
            DELIVERY
          </span>

          <MobileMenuItem
            href="/select-branch"
            icon={
              MapPin
            }
            title={
              branch
                ? branch.name
                : "Select Branch"
            }
            subtitle={
              branch
                ? [
                    branch.area,
                    branch.city,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      ", "
                    )
                : "Choose your nearest branch"
            }
          />
        </div>

        {/* ====================================================
            ACCOUNT
        ==================================================== */}

        <div className="craveo-mobile-menu-section">
          <span className="craveo-mobile-menu-label">
            YOUR ACCOUNT
          </span>

          <MobileMenuItem
            href={
              customer
                ? "/account/wishlist"
                : "/login"
            }
            icon={
              Heart
            }
            title="Wishlist"
            subtitle={
              customer
                ? "Your saved favourites"
                : "Login to use wishlist"
            }
            badge={
              customer
                ? currentWishlistCount
                : 0
            }
          />

          <MobileMenuItem
            href="/cart"
            icon={
              ShoppingBag
            }
            title="Cart"
            subtitle="Review your order"
            badge={
              currentCartCount
            }
          />

          <MobileMenuItem
            href={
              customer
                ? "/account"
                : "/login"
            }
            icon={
              UserRound
            }
            title={
              customer
                ? "My Account"
                : "Login"
            }
            subtitle={
              customer
                ? "Profile, orders & settings"
                : "Login to continue"
            }
          />
        </div>

        {/* ====================================================
            MOBILE LOGOUT

            ONLY VISIBLE WHEN LOGGED IN
        ==================================================== */}

        {customer && (
          <div className="craveo-mobile-logout-section">
            <button
              type="button"
              className="craveo-mobile-logout-button"
              onClick={
                handleMobileLogout
              }
              disabled={
                logoutLoading
              }
            >
              {logoutLoading ? (
                <LoaderCircle
                  size={16}
                  className="craveo-mobile-logout-spinner"
                />
              ) : (
                <LogOut
                  size={16}
                />
              )}

              <span>
                {logoutLoading
                  ? "Logging out..."
                  : "Logout"}
              </span>
            </button>

            {logoutError && (
              <small className="craveo-mobile-logout-error">
                {
                  logoutError
                }
              </small>
            )}
          </div>
        )}

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="craveo-mobile-drawer-footer">
          <span>
            CRAVEO.
          </span>

          <small>
            Premium Food • Delivered
          </small>
        </div>
      </aside>
    </>
  );
}