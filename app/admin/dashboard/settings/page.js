// ============================================================
// CRAVEO - SUPER ADMIN SETTINGS PAGE
// ============================================================

import Link from "next/link";

import {
  ImageIcon,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import {
  redirect,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getAdminSession,
} from "@/lib/auth";

import Settings from "@/models/Settings";

import SettingsForm from "@/components/admin/SettingsForm";

import OfferBannerSettings from "@/components/admin/OfferBannerSettings";

// ============================================================
// PAGE
// ============================================================

export default async function SettingsPage() {
  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  const session =
    await getAdminSession();

  if (
    !session ||
    session.role !== "super-admin"
  ) {
    redirect(
      "/admin/login"
    );
  }

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // GET SETTINGS
  // ==========================================================

  let settings =
    await Settings.findOne({
      key: "main",
    }).lean();

  // ==========================================================
  // CREATE DEFAULT SETTINGS IF NOT FOUND
  // ==========================================================

  if (!settings) {
    const createdSettings =
      await Settings.create({
        key: "main",
      });

    settings =
      createdSettings.toObject();
  }

  // ==========================================================
  // SERIALIZE SETTINGS
  //
  // Never send Mongoose ObjectId / Date objects directly
  // to Client Components.
  // ==========================================================

  const serializedSettings = {
    // --------------------------------------------------------
    // GENERAL
    // --------------------------------------------------------

    siteName:
      settings.siteName ||
      "CRAVEO",

    siteTagline:
      settings.siteTagline ||
      "Premium Food Delivery",

    currency:
      settings.currency ||
      "PKR",

    timezone:
      settings.timezone ||
      "Asia/Karachi",

    // --------------------------------------------------------
    // DELIVERY
    // --------------------------------------------------------

    deliveryEnabled:
      settings.deliveryEnabled !==
      false,

    defaultDeliveryFee:
      Number(
        settings.defaultDeliveryFee ??
          150
      ),

    freeDeliveryMinimum:
      Number(
        settings.freeDeliveryMinimum ??
          0
      ),

    minimumOrderAmount:
      Number(
        settings.minimumOrderAmount ??
          0
      ),

    estimatedDeliveryMinutes:
      Number(
        settings.estimatedDeliveryMinutes ??
          45
      ),

    // --------------------------------------------------------
    // ORDERS
    // --------------------------------------------------------

    ordersEnabled:
      settings.ordersEnabled !==
      false,

    allowOrderCancellation:
      settings.allowOrderCancellation !==
      false,

    cancellationMinutes:
      Number(
        settings.cancellationMinutes ??
          10
      ),

    autoConfirmOrders:
      settings.autoConfirmOrders ===
      true,

    // --------------------------------------------------------
    // PAYMENT
    // --------------------------------------------------------

    cashOnDeliveryEnabled:
      settings.cashOnDeliveryEnabled !==
      false,

    cardPaymentEnabled:
      settings.cardPaymentEnabled ===
      true,

    bankTransferEnabled:
      settings.bankTransferEnabled ===
      true,

    walletPaymentEnabled:
      settings.walletPaymentEnabled ===
      true,

    // --------------------------------------------------------
    // CONTACT
    // --------------------------------------------------------

    supportEmail:
      settings.supportEmail ||
      "",

    supportPhone:
      settings.supportPhone ||
      "",

    businessAddress:
      settings.businessAddress ||
      "",

    // --------------------------------------------------------
    // SOCIAL
    // --------------------------------------------------------

    facebookUrl:
      settings.facebookUrl ||
      "",

    instagramUrl:
      settings.instagramUrl ||
      "",

    youtubeUrl:
      settings.youtubeUrl ||
      "",

    tiktokUrl:
      settings.tiktokUrl ||
      "",

    // --------------------------------------------------------
    // SPECIAL OFFER BANNER
    // --------------------------------------------------------

    offerBannerImage:
      settings.offerBannerImage ||
      "",

    offerBannerImagePublicId:
      settings.offerBannerImagePublicId ||
      "",

    // --------------------------------------------------------
    // MAINTENANCE
    // --------------------------------------------------------

    maintenanceMode:
      settings.maintenanceMode ===
      true,

    maintenanceMessage:
      settings.maintenanceMessage ||
      "CRAVEO is temporarily unavailable. Please check back soon.",
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="settings-page">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="settings-page-header">
        <div>
          <span>
            SYSTEM CONFIGURATION
          </span>

          <h1>
            CRAVEO Settings
          </h1>

          <p>
            Manage CRAVEO system,
            branches, administrators,
            delivery, orders and customer
            website settings.
          </p>
        </div>
      </div>

      {/* ======================================================
          ADMINISTRATION MANAGEMENT
      ====================================================== */}

      <section className="settings-admin-management">
        <div className="settings-admin-management-heading">
          <div className="settings-admin-management-icon">
            <ShieldCheck
              size={20}
            />
          </div>

          <div>
            <span>
              ADMINISTRATION
            </span>

            <h2>
              Admin Management
            </h2>

            <p>
              Manage Super Admin and
              Branch Admin access.
            </p>
          </div>
        </div>

        <div className="settings-admin-grid">
          {/* ==================================================
              SUPER ADMIN PROFILE
          ================================================== */}

          <article className="settings-admin-card">
            <div className="settings-admin-card-icon">
              <ShieldCheck
                size={22}
              />
            </div>

            <div className="settings-admin-card-content">
              <span>
                SUPER ADMIN
              </span>

              <h3>
                Super Admin Profile
              </h3>

              <p>
                Manage your profile,
                password and security
                settings.
              </p>
            </div>

            <Link
              href="/admin/dashboard/profile"
              className="settings-admin-button"
            >
              Manage Profile
            </Link>
          </article>

          {/* ==================================================
              BRANCH ADMINS
          ================================================== */}

          <article className="settings-admin-card">
            <div className="settings-admin-card-icon neutral">
              <UserCog
                size={22}
              />
            </div>

            <div className="settings-admin-card-content">
              <span>
                BRANCH ADMIN
              </span>

              <h3>
                Branch Admins
              </h3>

              <p>
                Create branch admins,
                assign restaurants and
                control account status.
              </p>
            </div>

            <Link
              href="/admin/dashboard/branch-admins"
              className="settings-admin-button"
            >
              Manage Branch Admins
            </Link>
          </article>
        </div>
      </section>

      {/* ======================================================
          MAIN SYSTEM SETTINGS
      ====================================================== */}

      <SettingsForm
        initialSettings={
          serializedSettings
        }
      />

      {/* ======================================================
          SPECIAL OFFER BANNER SETTINGS
      ====================================================== */}

      <section className="settings-offer-section-heading">
        <div className="settings-offer-heading-icon">
          <ImageIcon
            size={20}
          />
        </div>

        <div>
          <span>
            CUSTOMER WEBSITE
          </span>

          <h2>
            Homepage Offer Banner
          </h2>

          <p>
            Upload and change the image
            displayed in the homepage
            special offer section.
          </p>
        </div>
      </section>

      <OfferBannerSettings
        initialImage={
          serializedSettings.offerBannerImage
        }
      />
    </main>
  );
}