// ============================================================
// CRAVEO - CUSTOMER ACCOUNT PAGE
// PROFILE + CITY + BRANCH + RECENT ORDERS + SUPPORT + ADDRESSES
// ============================================================

import Link from "next/link";

import {
  ChevronRight,
  Clock3,
  Edit3,
  Headphones,
  KeyRound,
  LogOut,
  MapPin,
  PackageCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { redirect } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { getCustomerSession } from "@/lib/customerAuth";

import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import Order from "@/models/Order";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CustomerLogoutButton from "@/components/customer/CustomerLogoutButton";

import "../store.css";

// ============================================================
// ALWAYS FRESH
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// HELPERS
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}

function statusLabel(status) {
  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    "out-for-delivery":
      "Out For Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    labels[status] ||
    status
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function AccountPage() {
  // ==========================================================
  // SESSION
  // ==========================================================

  const session =
    await getCustomerSession();

  if (!session?.userId) {
    redirect("/login");
  }

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // CUSTOMER
  // ==========================================================

  const user =
    await User.findOne({
      _id:
        session.userId,

      role:
        "customer",

      isActive:
        true,
    })
      .select(
        "name email phone city avatar avatarPublicId selectedRestaurantId addresses"
      )
      .lean();

  if (!user) {
    redirect("/login");
  }

  // ==========================================================
  // SELECTED BRANCH
  // ==========================================================

  let branch =
    null;

  if (
    user.selectedRestaurantId
  ) {
    branch =
      await Restaurant.findOne({
        _id:
          user.selectedRestaurantId,

        isActive:
          true,
      })
        .select(
          "name city area address"
        )
        .lean();
  }

  // ==========================================================
  // ORDERS
  // ==========================================================

  const [
    totalOrders,
    recentOrders,
  ] =
    await Promise.all([
      Order.countDocuments({
        userId:
          user._id,
      }),

      Order.find({
        userId:
          user._id,
      })
        .sort({
          createdAt:
            -1,
        })
        .limit(4)
        .select(
          "orderNumber total status paymentMethod paymentStatus createdAt"
        )
        .lean(),
    ]);

  // ==========================================================
  // ADDRESS COUNT
  // ==========================================================

  const addressCount =
    Array.isArray(
      user.addresses
    )
      ? user.addresses.length
      : 0;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <CustomerNavbar />

      <main className="craveo-account-page">
        {/* ====================================================
            PROFILE HERO
        ==================================================== */}

        <section className="craveo-account-hero">
          <div className="craveo-account-hero-left">
            {/* ================================================
                AVATAR
            ================================================ */}

            <div className="craveo-account-avatar-large">
              {user.avatar ? (
                <img
                  src={
                    user.avatar
                  }
                  alt={
                    user.name ||
                    "Customer"
                  }
                />
              ) : (
                <UserRound
                  size={38}
                />
              )}
            </div>

            {/* ================================================
                CUSTOMER INFORMATION
            ================================================ */}

            <div className="craveo-account-hero-info">
              <span>
                MY CRAVEO ACCOUNT
              </span>

              <h1>
                {user.name}
              </h1>

              <p>
                {user.email}
              </p>

              {user.phone && (
                <small>
                  {user.phone}
                </small>
              )}
            </div>
          </div>

          {/* ================================================
              HERO ACTIONS
          ================================================ */}

          <div className="craveo-account-hero-actions">
            <Link
              href="/account/edit"
              className="craveo-account-main-btn"
            >
              <Edit3
                size={15}
              />

              Edit Profile
            </Link>

            {/* ==============================================
                CHANGE PASSWORD -> SECURITY PAGE
            ============================================== */}

            <Link
              href="/account/security"
              className="craveo-account-outline-btn"
            >
              <KeyRound
                size={15}
              />

              Change Password
            </Link>
          </div>
        </section>

        {/* ====================================================
            ACCOUNT STATS
        ==================================================== */}

        <section className="craveo-account-stats">
          {/* ================================================
              TOTAL ORDERS
          ================================================ */}

          <Link
            href="/account/orders"
            className="craveo-account-stat craveo-account-stat-link"
          >
            <div className="craveo-account-stat-icon">
              <ShoppingBag
                size={20}
              />
            </div>

            <div>
              <span>
                Total Orders
              </span>

              <strong>
                {totalOrders}
              </strong>
            </div>

            <ChevronRight
              size={16}
            />
          </Link>

          {/* ================================================
              SAVED ADDRESSES
          ================================================ */}

          <Link
            href="/account/addresses"
            className="craveo-account-stat craveo-account-stat-link"
          >
            <div className="craveo-account-stat-icon">
              <MapPin
                size={20}
              />
            </div>

            <div>
              <span>
                Saved Addresses
              </span>

              <strong>
                {addressCount}
              </strong>
            </div>

            <ChevronRight
              size={16}
            />
          </Link>

          {/* ================================================
              SELECTED BRANCH
          ================================================ */}

          <div className="craveo-account-stat">
            <div className="craveo-account-stat-icon">
              <PackageCheck
                size={20}
              />
            </div>

            <div>
              <span>
                Selected Branch
              </span>

              <strong className="craveo-account-stat-branch">
                {branch?.name ||
                  "Not Selected"}
              </strong>
            </div>
          </div>
        </section>

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <section className="craveo-account-main-grid">
          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <div className="craveo-account-left-column">
            {/* ================================================
                PERSONAL INFORMATION
            ================================================ */}

            <section className="craveo-account-panel craveo-account-personal-panel">
              <div className="craveo-account-personal-heading">
                <span>
                  PROFILE DETAILS
                </span>

                <h2>
                  Personal Information
                </h2>
              </div>

              <div className="craveo-account-personal-list">
                {/* ============================================
                    NAME
                ============================================ */}

                <div className="craveo-account-personal-row">
                  <span>
                    Full Name
                  </span>

                  <strong>
                    {user.name ||
                      "-"}
                  </strong>
                </div>

                {/* ============================================
                    EMAIL
                ============================================ */}

                <div className="craveo-account-personal-row">
                  <span>
                    Email Address
                  </span>

                  <strong>
                    {user.email ||
                      "-"}
                  </strong>
                </div>

                {/* ============================================
                    PHONE
                ============================================ */}

                <div className="craveo-account-personal-row">
                  <span>
                    Phone Number
                  </span>

                  <strong>
                    {user.phone ||
                      "Not added"}
                  </strong>
                </div>

                {/* ============================================
                    CITY
                ============================================ */}

                <div className="craveo-account-personal-row">
                  <span>
                    City
                  </span>

                  <strong>
                    {user.city ||
                      "Not selected"}
                  </strong>
                </div>
              </div>
            </section>

            {/* ================================================
                RECENT ORDERS
            ================================================ */}

            <section className="craveo-account-panel">
              <div className="craveo-account-panel-header">
                <div>
                  <span>
                    ORDER HISTORY
                  </span>

                  <h2>
                    Recent Orders
                  </h2>
                </div>

                <Link href="/account/orders">
                  View All

                  <ChevronRight
                    size={14}
                  />
                </Link>
              </div>

              {recentOrders.length >
              0 ? (
                <div className="craveo-account-recent-orders">
                  {recentOrders.map(
                    (
                      order
                    ) => (
                      <Link
                        key={
                          order._id.toString()
                        }
                        href={`/account/orders/${order.orderNumber}`}
                        className="craveo-account-order-row"
                      >
                        {/* ====================================
                            ICON
                        ==================================== */}

                        <div className="craveo-account-order-icon">
                          <ShoppingBag
                            size={17}
                          />
                        </div>

                        {/* ====================================
                            ORDER INFO
                        ==================================== */}

                        <div className="craveo-account-order-info">
                          <strong>
                            {
                              order.orderNumber
                            }
                          </strong>

                          <span>
                            <Clock3
                              size={11}
                            />

                            {formatDate(
                              order.createdAt
                            )}
                          </span>
                        </div>

                        {/* ====================================
                            STATUS
                        ==================================== */}

                        <span
                          className={`customer-order-status customer-order-status-${order.status}`}
                        >
                          {statusLabel(
                            order.status
                          )}
                        </span>

                        {/* ====================================
                            PRICE
                        ==================================== */}

                        <strong className="craveo-account-order-price">
                          {formatPrice(
                            order.total
                          )}
                        </strong>

                        <ChevronRight
                          size={16}
                        />
                      </Link>
                    )
                  )}
                </div>
              ) : (
                <div className="craveo-account-no-orders">
                  <ShoppingBag
                    size={28}
                  />

                  <strong>
                    No orders yet
                  </strong>

                  <p>
                    Your latest CRAVEO
                    orders will appear
                    here.
                  </p>

                  <Link href="/foods">
                    Browse Menu
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <aside className="craveo-account-side-column">
            {/* ================================================
                SELECTED BRANCH
            ================================================ */}

            <section className="craveo-account-panel craveo-account-branch-panel">
              <div className="craveo-account-panel-header">
                <div>
                  <span>
                    ORDERING BRANCH
                  </span>

                  <h2>
                    Selected Branch
                  </h2>
                </div>
              </div>

              {branch ? (
                <div className="craveo-account-branch-content">
                  <div className="craveo-account-branch-icon">
                    <MapPin
                      size={21}
                    />
                  </div>

                  <div>
                    <strong>
                      {branch.name}
                    </strong>

                    <span>
                      {[
                        branch.area,
                        branch.city,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          ", "
                        )}
                    </span>

                    {branch.address && (
                      <p>
                        {
                          branch.address
                        }
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="craveo-account-muted">
                  No branch selected.
                </p>
              )}

              <Link
                href="/select-branch"
                className="craveo-account-change-branch"
              >
                Change Branch

                <ChevronRight
                  size={14}
                />
              </Link>
            </section>

            {/* ================================================
                ACCOUNT & SUPPORT
            ================================================ */}

            <section className="craveo-account-panel">
              <div className="craveo-account-panel-header">
                <div>
                  <span>
                    ACCOUNT
                  </span>

                  <h2>
                    Account & Support
                  </h2>
                </div>
              </div>

              {/* ==============================================
                  SAVED ADDRESSES
              ============================================== */}

              <Link
                href="/account/addresses"
                className="craveo-account-security-link"
              >
                <div>
                  <MapPin
                    size={18}
                  />
                </div>

                <span>
                  <strong>
                    Saved Addresses
                  </strong>

                  <small>
                    Manage delivery
                    addresses
                  </small>
                </span>

                <ChevronRight
                  size={15}
                />
              </Link>

              {/* ==============================================
                  CHANGE PASSWORD -> SECURITY PAGE
              ============================================== */}

              <Link
                href="/account/security"
                className="craveo-account-security-link"
              >
                <div>
                  <KeyRound
                    size={18}
                  />
                </div>

                <span>
                  <strong>
                    Change Password
                  </strong>

                  <small>
                    Update your account
                    password
                  </small>
                </span>

                <ChevronRight
                  size={15}
                />
              </Link>

              {/* ==============================================
                  HELP & COMPLAINTS
              ============================================== */}

              <Link
                href="/account/complaints"
                className="craveo-account-security-link"
              >
                <div>
                  <Headphones
                    size={18}
                  />
                </div>

                <span>
                  <strong>
                    Help & Complaints
                  </strong>

                  <small>
                    Contact CRAVEO
                    support
                  </small>
                </span>

                <ChevronRight
                  size={15}
                />
              </Link>
            </section>

            {/* ================================================
                LOGOUT
            ================================================ */}

            <section className="craveo-account-panel craveo-account-logout-panel">
              <div className="craveo-account-panel-header">
                <div>
                  <span>
                    SESSION
                  </span>

                  <h2>
                    Logout
                  </h2>
                </div>

                <LogOut
                  size={17}
                />
              </div>

              <p>
                Logout securely from
                your CRAVEO account.
              </p>

              <CustomerLogoutButton />
            </section>
          </aside>
        </section>
      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <CustomerFooter />
    </>
  );
}