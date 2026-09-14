// ============================================================
// CRAVEO - SUPER ADMIN PROFILE PAGE
// ============================================================

import Link from "next/link";

import {
  ArrowLeft,
  Clock3,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import { redirect } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import Admin from "@/models/Admin";

import SuperAdminProfileForm from "@/components/admin/SuperAdminProfileForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function SuperAdminProfilePage() {
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

  await connectDB();

  const admin =
    await Admin.findOne({
      _id: session.adminId,
      role: "super-admin",
    })
      .select("-password")
      .lean();

  if (!admin) {
    redirect(
      "/admin/login"
    );
  }

  const serializedAdmin = {
    _id:
      admin._id.toString(),

    name:
      admin.name || "",

    email:
      admin.email || "",

    phone:
      admin.phone || "",

    role:
      admin.role,

    isActive:
      admin.isActive !==
      false,

    lastLogin:
      admin.lastLogin
        ? admin.lastLogin.toISOString()
        : null,

    createdAt:
      admin.createdAt
        ? admin.createdAt.toISOString()
        : null,
  };

  return (
    <main className="super-profile-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="super-profile-page-header">
        <div>
          <span>
            ADMINISTRATION
          </span>

          <h1>
            Super Admin Profile
          </h1>

          <p>
            Manage account information,
            password and security details.
          </p>
        </div>

        <Link
          href="/admin/dashboard/settings"
          className="super-profile-back-btn"
        >
          <ArrowLeft
            size={17}
          />

          Back to Settings
        </Link>
      </div>

      {/* ======================================================
          PROFILE HERO
      ====================================================== */}

      <section className="super-profile-hero">
        <div className="super-profile-avatar-large">
          {serializedAdmin.name
            ?.charAt(0)
            ?.toUpperCase() ||
            "A"}
        </div>

        <div className="super-profile-identity">
          <span>
            SUPER ADMIN
          </span>

          <h2>
            {
              serializedAdmin.name
            }
          </h2>

          <p>
            {
              serializedAdmin.email
            }
          </p>
        </div>

        <div className="super-profile-status">
          <ShieldCheck
            size={16}
          />

          Active Super Admin
        </div>
      </section>

      {/* ======================================================
          ACCOUNT STATS
      ====================================================== */}

      <section className="super-profile-stats">
        <div>
          <UserCog
            size={19}
          />

          <span>
            Account Role
          </span>

          <strong>
            Super Admin
          </strong>
        </div>

        <div>
          <Clock3
            size={19}
          />

          <span>
            Last Login
          </span>

          <strong>
            {formatDate(
              serializedAdmin.lastLogin
            )}
          </strong>
        </div>

        <div>
          <ShieldCheck
            size={19}
          />

          <span>
            Account Status
          </span>

          <strong>
            {serializedAdmin.isActive
              ? "Active"
              : "Inactive"}
          </strong>
        </div>
      </section>

      {/* ======================================================
          FORMS
      ====================================================== */}

      <section className="super-profile-grid">
        <SuperAdminProfileForm
          admin={
            serializedAdmin
          }
        />

        <ChangePasswordForm />
      </section>
    </main>
  );
}