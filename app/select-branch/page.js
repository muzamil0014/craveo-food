// ============================================================
// CRAVEO - SELECT BRANCH PAGE
// CUSTOMER CITY BASED BRANCHES ONLY
// ============================================================

import {
  MapPin,
} from "lucide-react";

import {
  redirect,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Restaurant from "@/models/Restaurant";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import BranchSelectButton from "@/components/customer/BranchSelectButton";

import "../store.css";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// PAGE
// ============================================================

export default async function SelectBranchPage() {
  // ==========================================================
  // SESSION
  // ==========================================================

  const session =
    await getCustomerSession();

  if (!session?.userId) {
    redirect("/login");
  }

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
        "name email city selectedRestaurantId"
      )
      .lean();

  if (!user) {
    redirect("/login");
  }

  // ==========================================================
  // CITY REQUIRED
  // ==========================================================

  const customerCity =
    user.city
      ?.toString()
      .trim();

  // ==========================================================
  // LEGACY ACCOUNT
  // ==========================================================

  if (!customerCity) {
    return (
      <>
        <CustomerNavbar />

        <main className="branch-select-page">
          <section className="branch-select-header">
            <span>
              CITY REQUIRED
            </span>

            <h1>
              Update Your City
            </h1>

            <p>
              Your account was created before city-based branch
              selection was enabled. Please update your city before
              selecting a branch.
            </p>
          </section>

          <div className="branch-select-empty">
            <MapPin size={30} />

            <h2>
              City is missing
            </h2>

            <p>
              Add your city to your customer profile first.
            </p>
          </div>
        </main>

        <CustomerFooter />
      </>
    );
  }

  // ==========================================================
  // ONLY CUSTOMER CITY BRANCHES
  //
  // Regex makes matching case-insensitive:
  // Karachi = karachi = KARACHI
  // ==========================================================

  const cityRegex =
    new RegExp(
      `^${customerCity.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      )}$`,
      "i"
    );

  const branches =
    await Restaurant.find({
      isActive: true,

      city: cityRegex,
    })
      .sort({
        branchType: 1,
        name: 1,
      })
      .lean();

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="branch-select-page">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <section className="branch-select-header">
          <span>
            CRAVEO {customerCity}
          </span>

          <h1>
            Choose Your Branch
          </h1>

          <p>
            Hi {user.name}. Select a CRAVEO branch in{" "}
            <strong>
              {customerCity}
            </strong>
            . Only branches and foods available in your registered
            city are shown.
          </p>
        </section>

        {/* ====================================================
            BRANCHES
        ==================================================== */}

        {branches.length > 0 ? (
          <section className="branch-select-grid">
            {branches.map(
              (branch) => {
                const branchId =
                  branch._id.toString();

                const isSelected =
                  user.selectedRestaurantId
                    ?.toString() ===
                  branchId;

                return (
                  <article
                    key={branchId}
                    className={`branch-select-card ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                  >
                    {/* ========================================
                        IMAGE
                    ======================================== */}

                    <div className="branch-select-image">
                      {branch.image ? (
                        <img
                          src={
                            branch.image
                          }
                          alt={
                            branch.name
                          }
                        />
                      ) : (
                        <div className="branch-select-image-placeholder">
                          <MapPin
                            size={35}
                          />
                        </div>
                      )}
                    </div>

                    {/* ========================================
                        DETAILS
                    ======================================== */}

                    <div className="branch-select-card-body">
                      <span className="branch-select-type">
                        {branch.branchType ===
                        "city-main"
                          ? "CITY MAIN"
                          : branch.branchType ===
                              "super"
                            ? "MAIN BRANCH"
                            : "BRANCH"}
                      </span>

                      <h2>
                        {branch.name}
                      </h2>

                      <div className="branch-select-location">
                        <MapPin
                          size={15}
                        />

                        <span>
                          {[
                            branch.area,
                            branch.city,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(", ")}
                        </span>
                      </div>

                      {branch.address && (
                        <p className="branch-select-address">
                          {
                            branch.address
                          }
                        </p>
                      )}

                      {/* ======================================
                          SELECT BUTTON
                      ====================================== */}

                      <div className="branch-select-card-action">
                        <BranchSelectButton
                          restaurantId={
                            branchId
                          }
                          branchName={
                            branch.name
                          }
                          isSelected={
                            isSelected
                          }
                        />
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        ) : (
          /* ==================================================
             NO BRANCH
          ================================================== */

          <div className="branch-select-empty">
            <MapPin
              size={30}
            />

            <h2>
              No branch available
            </h2>

            <p>
              No active CRAVEO branch is currently available in{" "}
              {customerCity}.
            </p>
          </div>
        )}
      </main>

      <CustomerFooter />
    </>
  );
}