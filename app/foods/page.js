// ============================================================
// CRAVEO - SELECTED BRANCH CUSTOMER MENU
// FUNCTIONAL WISHLIST ENABLED
// ============================================================

import Link from "next/link";

import {
  Search,
  ShoppingBag,
  Star,
  UtensilsCrossed,
} from "lucide-react";

import {
  redirect,
} from "next/navigation";

import mongoose from "mongoose";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Food from "@/models/Food";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import WishlistButton from "@/components/customer/WishlistButton";

import "../store.css";

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

export default async function FoodsPage({
  searchParams,
}) {
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

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // CUSTOMER + SELECTED BRANCH
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
        "_id name"
      )
      .lean();

  if (!selectedBranch) {
    redirect(
      "/select-branch"
    );
  }

  // ==========================================================
  // SEARCH PARAMS
  // ==========================================================

  const params =
    await searchParams;

  const search =
    params?.search
      ?.toString()
      .trim() || "";

  const category =
    params?.category
      ?.toString()
      .trim() || "";

  const sort =
    params?.sort
      ?.toString()
      .trim() || "latest";

  // ==========================================================
  // QUERY
  //
  // IMPORTANT:
  // restaurantIds ALWAYS selected branch.
  // Customer cannot choose another branch through URL.
  // ==========================================================

  const query = {
    isAvailable:
      true,

    restaurantIds:
      selectedBranch._id,
  };

  // ==========================================================
  // SEARCH FILTER
  // ==========================================================

  if (search) {
    query.$or = [
      {
        name: {
          $regex:
            search,

          $options:
            "i",
        },
      },

      {
        description: {
          $regex:
            search,

          $options:
            "i",
        },
      },
    ];
  }

  // ==========================================================
  // CATEGORY FILTER
  // ==========================================================

  if (
    category &&
    mongoose.Types.ObjectId.isValid(
      category
    )
  ) {
    query.categoryId =
      category;
  }

  // ==========================================================
  // SORT
  // ==========================================================

  let sortQuery = {
    createdAt:
      -1,
  };

  if (
    sort ===
    "price-low"
  ) {
    sortQuery = {
      price:
        1,
    };
  }

  if (
    sort ===
    "price-high"
  ) {
    sortQuery = {
      price:
        -1,
    };
  }

  if (
    sort ===
    "popular"
  ) {
    sortQuery = {
      isPopular:
        -1,

      rating:
        -1,
    };
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const [
    foods,
    categories,
  ] = await Promise.all([
    // --------------------------------------------------------
    // FOODS
    // --------------------------------------------------------

    Food.find(
      query
    )
      .sort(
        sortQuery
      )
      .lean(),

    // --------------------------------------------------------
    // CATEGORIES
    // --------------------------------------------------------

    Category.find({
      isActive:
        true,
    })
      .sort({
        name:
          1,
      })
      .lean(),
  ]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* ======================================================
          NAVBAR
      ====================================================== */}

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
            CRAVEO Menu
          </h1>

          <p>
            Only foods available at your
            selected branch are shown.
          </p>
        </section>

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <section className="customer-food-filter-card">
          <form
            action="/foods"
            method="GET"
          >
            {/* ================================================
                SEARCH
            ================================================ */}

            <div className="customer-search-field">
              <Search
                size={17}
              />

              <input
                type="text"
                name="search"
                defaultValue={
                  search
                }
                placeholder="Search foods..."
              />
            </div>

            {/* ================================================
                CATEGORY
            ================================================ */}

            <select
              name="category"
              defaultValue={
                category
              }
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item._id.toString()
                    }
                    value={
                      item._id.toString()
                    }
                  >
                    {
                      item.name
                    }
                  </option>
                )
              )}
            </select>

            {/* ================================================
                SORT
            ================================================ */}

            <select
              name="sort"
              defaultValue={
                sort
              }
            >
              <option value="latest">
                Latest
              </option>

              <option value="popular">
                Popular
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>
            </select>

            {/* ================================================
                SUBMIT
            ================================================ */}

            <button type="submit">
              <Search
                size={15}
              />

              Search
            </button>
          </form>
        </section>

        {/* ====================================================
            FOODS
        ==================================================== */}

        <section className="store-content-section">
          {/* ==================================================
              HEADING
          ================================================== */}

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
              {foods.length} Foods
            </strong>
          </div>

          {/* ==================================================
              FOOD GRID
          ================================================== */}

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
                        IMAGE WRAPPER
                    ======================================== */}

                    <div className="customer-food-image-wrapper">
                      {/* ======================================
                          FOOD IMAGE LINK
                      ====================================== */}

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

                      {/* ======================================
                          FUNCTIONAL WISHLIST HEART
                      ====================================== */}

                      <WishlistButton
                        foodId={
                          food._id.toString()
                        }
                        className="customer-food-card-wishlist"
                      />
                    </div>

                    {/* ========================================
                        FOOD BODY
                    ======================================== */}

                    <div className="customer-food-body">
                      {/* ======================================
                          RATING
                      ====================================== */}

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

                      {/* ======================================
                          FOOD NAME
                      ====================================== */}

                      <Link
                        href={`/foods/${food.slug}`}
                      >
                        <h3>
                          {
                            food.name
                          }
                        </h3>
                      </Link>

                      {/* ======================================
                          DESCRIPTION
                      ====================================== */}

                      <p>
                        {food.description ||
                          "Fresh CRAVEO food."}
                      </p>

                      {/* ======================================
                          FOOTER
                      ====================================== */}

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
              No foods are currently
              available at this branch.
            </div>
          )}
        </section>
      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <CustomerFooter />
    </>
  );
}