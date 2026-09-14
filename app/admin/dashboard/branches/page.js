// ============================================================
// CRAVEO - BRANCHES MANAGEMENT PAGE
// ============================================================

import Link from "next/link";

import {
  Clock3,
  Crown,
  MapPin,
  Plus,
  Store,
  Truck,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

import BranchActions from "@/components/admin/BranchActions";

// ============================================================
// BRANCH TYPE LABEL
// ============================================================

function getBranchTypeLabel(
  type
) {
  if (type === "super") {
    return "Super Branch";
  }

  if (
    type === "city-main"
  ) {
    return "City Main Branch";
  }

  return "Normal Branch";
}

// ============================================================
// PAGE
// ============================================================

export default async function BranchesPage() {
  await connectDB();

  // ==========================================================
  // BRANCHES
  // ==========================================================

  const branches =
    await Restaurant.find()
      .sort({
        createdAt: -1,
      })
      .lean();

  // ==========================================================
  // COUNTS
  // ==========================================================

  const totalBranches =
    branches.length;

  const superBranches =
    branches.filter(
      (branch) =>
        branch.branchType ===
        "super"
    ).length;

  const cityMainBranches =
    branches.filter(
      (branch) =>
        branch.branchType ===
        "city-main"
    ).length;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="branches-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="branches-page-header">
        <div>
          <span className="branch-page-eyebrow">
            BRANCH MANAGEMENT
          </span>

          <h1>
            CRAVEO Branches
          </h1>

          <p>
            Manage Super Branch,
            City Main Branches and
            normal branches.
          </p>
        </div>

        <Link
          href="/admin/dashboard/branches/add"
          className="branch-add-button"
        >
          <Plus size={18} />
          Add Branch
        </Link>
      </div>

      {/* ====================================================
          SUMMARY CARDS
      ==================================================== */}

      <section className="branch-summary-grid">
        <div className="branch-summary-card">
          <div className="branch-summary-icon">
            <Store size={21} />
          </div>

          <div>
            <span>
              Total Branches
            </span>

            <strong>
              {totalBranches}
            </strong>
          </div>
        </div>

        <div className="branch-summary-card">
          <div className="branch-summary-icon">
            <Crown size={21} />
          </div>

          <div>
            <span>
              Super Branch
            </span>

            <strong>
              {superBranches}
            </strong>
          </div>
        </div>

        <div className="branch-summary-card">
          <div className="branch-summary-icon">
            <MapPin size={21} />
          </div>

          <div>
            <span>
              City Main Branches
            </span>

            <strong>
              {cityMainBranches}
            </strong>
          </div>
        </div>
      </section>

      {/* ====================================================
          BRANCH CARDS
      ==================================================== */}

      {branches.length > 0 ? (
        <section className="branches-grid">
          {branches.map(
            (branch) => {
              const branchType =
                branch.branchType ||
                "normal";

              return (
                <article
                  className="branch-card"
                  key={branch._id.toString()}
                >
                  {/* ==========================================
                      IMAGE
                  ========================================== */}

                  <div className="branch-card-image">
                    {branch.image ? (
                      <img
                        src={branch.image}
                        alt={branch.name}
                      />
                    ) : (
                      <div className="branch-card-image-placeholder">
                        <Store
                          size={42}
                        />

                        <span>
                          CRAVEO Branch
                        </span>
                      </div>
                    )}

                    {/* ========================================
                        BADGES
                    ======================================== */}

                    <div className="branch-card-badges">
                      {branchType !==
                        "normal" && (
                        <span
                          className={`branch-type-badge branch-type-${branchType}`}
                        >
                          {getBranchTypeLabel(
                            branchType
                          )}
                        </span>
                      )}

                      {branch.isFeatured && (
                        <span className="branch-featured-badge">
                          Featured
                        </span>
                      )}

                      <span
                        className={`branch-card-status ${
                          branch.isActive
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {branch.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* ==========================================
                      CONTENT
                  ========================================== */}

                  <div className="branch-card-content">
                    <div className="branch-card-title">
                      <h2>
                        {branch.name}
                      </h2>

                      <p>
                        {branch.description ||
                          branch.area ||
                          "CRAVEO Restaurant Branch"}
                      </p>
                    </div>

                    <div className="branch-card-details">
                      <div>
                        <MapPin
                          size={15}
                        />

                        <span>
                          {branch.area
                            ? `${branch.area}, ${branch.city}`
                            : branch.city}
                        </span>
                      </div>

                      <div>
                        <Clock3
                          size={15}
                        />

                        <span>
                          {
                            branch.openingTime
                          }
                          {" - "}
                          {
                            branch.closingTime
                          }
                        </span>
                      </div>

                      <div>
                        <Truck
                          size={15}
                        />

                        <span>
                          {
                            branch.deliveryTime
                          }
                          {" • PKR "}
                          {Number(
                            branch.deliveryFee ||
                              0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* ========================================
                        ACTIONS
                    ======================================== */}

                    <BranchActions
                      branchId={branch._id.toString()}
                      branchName={
                        branch.name
                      }
                      isActive={
                        branch.isActive
                      }
                    />
                  </div>
                </article>
              );
            }
          )}
        </section>
      ) : (
        <section className="branches-empty-state">
          <div className="branches-empty-icon">
            <Store size={38} />
          </div>

          <h2>
            No branches yet
          </h2>

          <p>
            Create your first CRAVEO
            restaurant branch.
          </p>

          <Link
            href="/admin/dashboard/branches/add"
            className="branch-add-button"
          >
            <Plus size={18} />
            Add First Branch
          </Link>
        </section>
      )}
    </main>
  );
}