// ============================================================
// CRAVEO - CATEGORY FOODS PAGE
// SELECTED BRANCH BASED
// ============================================================

import Link from "next/link";

import {
  ArrowLeft,
  ShoppingBag,
  Star,
  UtensilsCrossed,
} from "lucide-react";

import {
  notFound,
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

import "../../store.css";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

// ============================================================
// FORMAT PRICE
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// PAGE
// ============================================================

export default async function CategoryFoodsPage({
  params,
}) {
  const { slug } =
    await params;

  // ==========================================================
  // LOGIN
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
  // BRANCH
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
  // CATEGORY
  // ==========================================================

  const category =
    await Category.findOne({
      slug,

      isActive:
        true,
    }).lean();

  if (!category) {
    notFound();
  }

  // ==========================================================
  // FOODS
  //
  // IMPORTANT:
  // CATEGORY + SELECTED BRANCH BOTH REQUIRED
  // ==========================================================

  const foods =
    await Food.find({
      categoryId:
        category._id,

      restaurantIds:
        selectedBranch._id,

      isAvailable:
        true,
    })
      .sort({
        isPopular:
          -1,

        isFeatured:
          -1,

        createdAt:
          -1,
      })
      .lean();

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="store-list-page">
        {/* ====================================================
            BACK
        ==================================================== */}

        <div className="store-back-row">
          <Link href="/categories">
            <ArrowLeft
              size={15}
            />

            Categories
          </Link>
        </div>

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
            {
              category.name
            }
          </h1>

          <p>
            {category.description ||
              `${category.name} foods currently available at ${selectedBranch.name}.`}
          </p>
        </section>

        {/* ====================================================
            CONTENT
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
              {foods.length}
              {" "}
              Foods
            </strong>
          </div>

          {foods.length >
          0 ? (
            <div className="customer-food-grid">
              {foods.map(
                (food) => (
                  <article
                    key={
                      food._id.toString()
                    }
                    className="customer-food-card"
                  >
                    {/* ========================================
                        IMAGE
                    ======================================== */}

                    <Link
                      href={`/foods/${food.slug}`}
                      className="customer-food-image"
                    >
                      {food.image ? (
                        <img
                          src={
                            food.image
                          }
                          alt={
                            food.name
                          }
                        />
                      ) : (
                        <UtensilsCrossed
                          size={35}
                        />
                      )}
                    </Link>

                    {/* ========================================
                        BODY
                    ======================================== */}

                    <div className="customer-food-body">
                      <div className="customer-food-rating">
                        <Star
                          size={13}
                        />

                        {Number(
                          food.rating ||
                            0
                        ).toFixed(
                          1
                        )}
                      </div>

                      <Link
                        href={`/foods/${food.slug}`}
                      >
                        <h3>
                          {
                            food.name
                          }
                        </h3>
                      </Link>

                      <p>
                        {food.description ||
                          "Fresh CRAVEO food."}
                      </p>

                      <div className="customer-food-footer">
                        <strong>
                          {formatPrice(
                            food.salePrice ||
                              food.price
                          )}
                        </strong>

                        <Link
                          href={`/foods/${food.slug}`}
                        >
                          <ShoppingBag
                            size={14}
                          />

                          View
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          ) : (
            <div className="store-empty">
              No {category.name} foods are
              currently available at{" "}
              {selectedBranch.name}.
            </div>
          )}
        </section>
      </main>

      <CustomerFooter />
    </>
  );
}