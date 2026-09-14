// ============================================================
// CRAVEO - CUSTOMER CATEGORIES PAGE
// SELECTED BRANCH BASED
// ============================================================

import Link from "next/link";

import {
  ArrowRight,
  UtensilsCrossed,
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
import Category from "@/models/Category";
import Food from "@/models/Food";
import Restaurant from "@/models/Restaurant";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";

import "../store.css";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

// ============================================================
// PAGE
// ============================================================

export default async function CategoriesPage() {
  // ==========================================================
  // LOGIN REQUIRED
  // ==========================================================

  const session =
    await getCustomerSession();

  if (!session) {
    redirect(
      "/login"
    );
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
        "selectedRestaurantId"
      )
      .lean();

  if (
    !user ||
    !user.selectedRestaurantId
  ) {
    redirect(
      "/select-branch"
    );
  }

  // ==========================================================
  // SELECTED BRANCH
  // ==========================================================

  const selectedBranch =
    await Restaurant.findOne({
      _id:
        user.selectedRestaurantId,

      isActive:
        true,
    })
      .select(
        "_id name city area"
      )
      .lean();

  if (!selectedBranch) {
    redirect(
      "/select-branch"
    );
  }

  // ==========================================================
  // GET FOODS FROM SELECTED BRANCH
  // ==========================================================

  const branchFoods =
    await Food.find({
      restaurantIds:
        selectedBranch._id,

      isAvailable:
        true,
    })
      .select(
        "categoryId"
      )
      .lean();

  // ==========================================================
  // UNIQUE CATEGORY IDS
  // ==========================================================

  const categoryIds = [
    ...new Set(
      branchFoods
        .map(
          (food) =>
            food.categoryId
              ?.toString()
        )
        .filter(Boolean)
    ),
  ];

  // ==========================================================
  // GET ONLY BRANCH CATEGORIES
  // ==========================================================

  const categories =
    categoryIds.length > 0
      ? await Category.find({
          _id: {
            $in:
              categoryIds,
          },

          isActive:
            true,
        })
          .sort({
            sortOrder:
              1,

            name:
              1,
          })
          .lean()
      : [];

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="store-list-page">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <section className="store-page-hero">
          <span>
            {
              selectedBranch.name
            }
          </span>

          <h1>
            Food Categories
          </h1>

          <p>
            Browse categories containing
            foods available at your selected
            CRAVEO branch.
          </p>
        </section>

        {/* ====================================================
            CATEGORY SECTION
        ==================================================== */}

        <section className="store-content-section">
          <div className="store-content-heading">
            <div>
              <span>
                SELECTED BRANCH
              </span>

              <h2>
                {
                  selectedBranch.name
                }
              </h2>
            </div>

            <strong>
              {categories.length}
              {" "}
              Categories
            </strong>
          </div>

          {categories.length >
          0 ? (
            <div className="customer-category-grid">
              {categories.map(
                (
                  category
                ) => (
                  <Link
                    key={
                      category._id.toString()
                    }
                    href={`/categories/${category.slug}`}
                    className="customer-category-card"
                  >
                    {/* ========================================
                        IMAGE
                    ======================================== */}

                    <div className="customer-category-image">
                      {category.image ? (
                        <img
                          src={
                            category.image
                          }
                          alt={
                            category.name
                          }
                        />
                      ) : (
                        <UtensilsCrossed
                          size={40}
                        />
                      )}
                    </div>

                    {/* ========================================
                        CONTENT
                    ======================================== */}

                    <div>
                      <h2>
                        {
                          category.name
                        }
                      </h2>

                      <span>
                        Explore Foods

                        <ArrowRight
                          size={14}
                        />
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          ) : (
            <div className="store-empty">
              No categories currently have
              available foods at{" "}
              {selectedBranch.name}.
            </div>
          )}
        </section>
      </main>

      <CustomerFooter />
    </>
  );
}