// ============================================================
// CRAVEO - BRANCH ADMIN PROFILE PAGE
// ============================================================

import {
  Building2,
  Clock3,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  redirect,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getBranchAdminSession,
} from "@/lib/auth";

import Admin from "@/models/Admin";
import Restaurant from "@/models/Restaurant";

import BranchProfileForm from "@/components/admin/branch/BranchProfileForm";
import BranchChangePasswordForm from "@/components/admin/branch/BranchChangePasswordForm";
// ============================================================
// FORCE DYNAMIC
// BRANCH ADMIN DEPENDS ON AUTH COOKIES
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function BranchProfilePage() {
  const session =
    await getBranchAdminSession();

  if (!session) {
    redirect(
      "/admin/branch-login"
    );
  }

  await connectDB();

  void Restaurant;

  // ==========================================================
  // ADMIN
  // ==========================================================

  const admin =
    await Admin.findOne({
      _id:
        session.adminId,

      role:
        "branch-admin",

      restaurantId:
        session.restaurantId,

      isActive:
        true,
    })
      .select(
        "-password"
      )
      .lean();

  if (!admin) {
    redirect(
      "/admin/branch-login"
    );
  }

  // ==========================================================
  // ASSIGNED BRANCH
  // ==========================================================

  const branch =
    await Restaurant.findOne({
      _id:
        session.restaurantId,

      isActive:
        true,
    })
      .select(
        "name city area address phone email branchType image isActive"
      )
      .lean();

  if (!branch) {
    redirect(
      "/admin/branch-login"
    );
  }

  // ==========================================================
  // SERIALIZE
  // ==========================================================

  const adminData = {
    id:
      admin._id.toString(),

    name:
      admin.name || "",

    email:
      admin.email || "",

    phone:
      admin.phone || "",

    role:
      admin.role,

    lastLogin:
      admin.lastLogin
        ? admin.lastLogin.toISOString()
        : null,

    createdAt:
      admin.createdAt
        ? admin.createdAt.toISOString()
        : null,
  };

  const branchData = {
    id:
      branch._id.toString(),

    name:
      branch.name || "",

    city:
      branch.city || "",

    area:
      branch.area || "",

    address:
      branch.address || "",

    phone:
      branch.phone || "",

    email:
      branch.email || "",

    branchType:
      branch.branchType ||
      "normal",
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="branch-profile-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="branch-module-header">
        <div>
          <span>
            ACCOUNT
          </span>

          <h1>
            Branch Admin Profile
          </h1>

          <p>
            Manage your account and view
            assigned branch information.
          </p>
        </div>
      </div>

      {/* ======================================================
          PROFILE HERO
      ====================================================== */}

      <section className="branch-profile-hero">
        <div className="branch-profile-avatar">
          {adminData.name
            ?.charAt(0)
            ?.toUpperCase() ||
            "B"}
        </div>

        <div className="branch-profile-identity">
          <span>
            BRANCH ADMIN
          </span>

          <h2>
            {adminData.name}
          </h2>

          <p>
            {adminData.email}
          </p>
        </div>

        <div className="branch-profile-active">
          <ShieldCheck
            size={16}
          />

          Active Account
        </div>
      </section>

      {/* ======================================================
          ACCOUNT STATS
      ====================================================== */}

      <section className="branch-profile-stats">
        <div>
          <UserRound
            size={18}
          />

          <span>
            Role
          </span>

          <strong>
            Branch Admin
          </strong>
        </div>

        <div>
          <Building2
            size={18}
          />

          <span>
            Assigned Branch
          </span>

          <strong>
            {branchData.name}
          </strong>
        </div>

        <div>
          <Clock3
            size={18}
          />

          <span>
            Last Login
          </span>

          <strong>
            {formatDate(
              adminData.lastLogin
            )}
          </strong>
        </div>
      </section>

      {/* ======================================================
          PROFILE + PASSWORD
      ====================================================== */}

      <section className="branch-profile-grid">
        <BranchProfileForm
          admin={
            adminData
          }
        />

        <BranchChangePasswordForm />
      </section>

      {/* ======================================================
          ASSIGNED BRANCH
      ====================================================== */}

      <section className="branch-profile-card branch-assigned-branch-card">
        <div className="branch-profile-card-heading">
          <div className="branch-profile-heading-icon">
            <Building2
              size={20}
            />
          </div>

          <div>
            <span>
              ASSIGNED BRANCH
            </span>

            <h2>
              Branch Information
            </h2>

            <p>
              Branch assignment is
              controlled by Super Admin.
            </p>
          </div>
        </div>

        <div className="branch-assigned-branch-grid">
          <div>
            <Building2
              size={16}
            />

            <span>
              Branch Name
            </span>

            <strong>
              {branchData.name}
            </strong>
          </div>

          <div>
            <MapPin
              size={16}
            />

            <span>
              Location
            </span>

            <strong>
              {[
                branchData.area,
                branchData.city,
              ]
                .filter(Boolean)
                .join(", ") ||
                "-"}
            </strong>
          </div>

          <div>
            <Mail
              size={16}
            />

            <span>
              Branch Email
            </span>

            <strong>
              {branchData.email ||
                "-"}
            </strong>
          </div>

          <div>
            <ShieldCheck
              size={16}
            />

            <span>
              Branch Type
            </span>

            <strong>
              {branchData.branchType.replaceAll(
                "-",
                " "
              )}
            </strong>
          </div>
        </div>

        {branchData.address && (
          <div className="branch-assigned-address">
            <span>
              Address
            </span>

            <p>
              {branchData.address}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}