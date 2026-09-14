// ============================================================
// CRAVEO - BRANCH ADMINS MANAGEMENT PAGE
// ============================================================

import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  Plus,
  ShieldCheck,
  UserCog,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

import {
  connectDB,
} from "@/lib/mongodb";

import Admin from "@/models/Admin";
import Restaurant from "@/models/Restaurant";

import BranchAdminActions from "@/components/admin/BranchAdminActions";

// ============================================================
// FORMAT DATE
// ============================================================

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

// ============================================================
// PAGE
// ============================================================

export default async function BranchAdminsPage() {
  await connectDB();

  // ----------------------------------------------------------
  // Ensure Restaurant model is registered for populate
  // ----------------------------------------------------------

  void Restaurant;

  // ==========================================================
  // LOAD BRANCH ADMINS
  // ==========================================================

  const admins =
    await Admin.find({
      role: "branch-admin",
    })
      .select("-password")
      .populate(
        "restaurantId",
        "name city area isActive"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const activeCount =
    admins.filter(
      (admin) =>
        admin.isActive
    ).length;

  const inactiveCount =
    admins.length -
    activeCount;

  const assignedBranches =
    new Set(
      admins
        .filter(
          (admin) =>
            admin.restaurantId
        )
        .map(
          (admin) =>
            admin.restaurantId
              ._id
              .toString()
        )
    ).size;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="branch-admins-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="branch-admins-header">
        <div>
          <span className="branch-admin-eyebrow">
            ADMINISTRATION
          </span>

          <h1>
            Branch Admins
          </h1>

          <p>
            Create administrators,
            assign CRAVEO branches and
            manage branch access.
          </p>
        </div>

        {/* ====================================================
            HEADER ACTIONS
        ==================================================== */}

        <div className="branch-admin-header-actions">
          <Link
            href="/admin/dashboard/settings"
            className="branch-admin-back-btn"
          >
            <ArrowLeft
              size={17}
            />

            Back
          </Link>

          <Link
            href="/admin/dashboard/branch-admins/add"
            className="branch-admin-add-btn"
          >
            <Plus
              size={18}
            />

            Add Branch Admin
          </Link>
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <section className="branch-admin-summary-grid">
        {/* TOTAL ADMINS */}

        <div className="branch-admin-summary-card">
          <div className="branch-admin-summary-icon">
            <UserCog
              size={21}
            />
          </div>

          <div>
            <span>
              Total Admins
            </span>

            <strong>
              {admins.length}
            </strong>
          </div>
        </div>

        {/* ACTIVE ADMINS */}

        <div className="branch-admin-summary-card">
          <div className="branch-admin-summary-icon success">
            <UserRoundCheck
              size={21}
            />
          </div>

          <div>
            <span>
              Active
            </span>

            <strong>
              {activeCount}
            </strong>
          </div>
        </div>

        {/* INACTIVE ADMINS */}

        <div className="branch-admin-summary-card">
          <div className="branch-admin-summary-icon danger">
            <UserRoundX
              size={21}
            />
          </div>

          <div>
            <span>
              Inactive
            </span>

            <strong>
              {inactiveCount}
            </strong>
          </div>
        </div>

        {/* ASSIGNED BRANCHES */}

        <div className="branch-admin-summary-card">
          <div className="branch-admin-summary-icon">
            <Building2
              size={21}
            />
          </div>

          <div>
            <span>
              Assigned Branches
            </span>

            <strong>
              {assignedBranches}
            </strong>
          </div>
        </div>
      </section>

      {/* ======================================================
          BRANCH ADMIN LIST
      ====================================================== */}

      {admins.length > 0 ? (
        <section className="branch-admin-grid">
          {admins.map(
            (admin) => (
              <article
                key={
                  admin._id.toString()
                }
                className="branch-admin-card"
              >
                {/* ============================================
                    CARD HEADER
                ============================================ */}

                <div className="branch-admin-card-top">
                  <div className="branch-admin-avatar">
                    {admin.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "A"}
                  </div>

                  <div className="branch-admin-card-user">
                    <span>
                      BRANCH ADMIN
                    </span>

                    <h2>
                      {
                        admin.name
                      }
                    </h2>

                    <p>
                      {
                        admin.email
                      }
                    </p>
                  </div>

                  <span
                    className={`branch-admin-account-badge ${
                      admin.isActive
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    {admin.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {/* ============================================
                    ASSIGNED BRANCH
                ============================================ */}

                <div className="branch-admin-assigned-branch">
                  <div>
                    <ShieldCheck
                      size={17}
                    />

                    <span>
                      Assigned Branch
                    </span>
                  </div>

                  {admin.restaurantId ? (
                    <>
                      <strong>
                        {
                          admin.restaurantId
                            .name
                        }
                      </strong>

                      <small>
                        {[
                          admin.restaurantId
                            .area,

                          admin.restaurantId
                            .city,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(", ")}
                      </small>
                    </>
                  ) : (
                    <strong className="branch-admin-no-branch">
                      No branch assigned
                    </strong>
                  )}
                </div>

                {/* ============================================
                    META INFORMATION
                ============================================ */}

                <div className="branch-admin-meta">
                  <span>
                    Phone

                    <strong>
                      {admin.phone ||
                        "-"}
                    </strong>
                  </span>

                  <span>
                    Created

                    <strong>
                      {formatDate(
                        admin.createdAt
                      )}
                    </strong>
                  </span>

                  <span>
                    Last Login

                    <strong>
                      {admin.lastLogin
                        ? formatDate(
                            admin.lastLogin
                          )
                        : "Never"}
                    </strong>
                  </span>
                </div>

                {/* ============================================
                    ACTIONS
                ============================================ */}

                <BranchAdminActions
                  adminId={
                    admin._id.toString()
                  }
                  adminName={
                    admin.name
                  }
                  isActive={
                    admin.isActive
                  }
                />
              </article>
            )
          )}
        </section>
      ) : (
        /* ====================================================
           EMPTY STATE
        ==================================================== */

        <section className="branch-admin-empty">
          <UserCog
            size={42}
          />

          <h2>
            No Branch Admins
          </h2>

          <p>
            Create your first CRAVEO
            Branch Admin.
          </p>

          <Link
            href="/admin/dashboard/branch-admins/add"
            className="branch-admin-add-btn"
          >
            <Plus
              size={18}
            />

            Add Branch Admin
          </Link>
        </section>
      )}
    </main>
  );
}