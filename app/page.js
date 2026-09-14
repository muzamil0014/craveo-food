// ============================================================
// CRAVEO - CUSTOMER HOME PAGE
// SELECTED BRANCH BASED
// FUNCTIONAL WISHLIST ENABLED
// ============================================================

import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  MapPin,
  Search,
  ShoppingBag,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";

import {
  redirect,
} from "next/navigation";

import "./store.css";

// ============================================================
// DATABASE
// ============================================================

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
import Settings from "@/models/Settings";

// ============================================================
// COMPONENTS
// ============================================================

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CustomerHero from "@/components/customer/CustomerHero";
import WishlistButton from "@/components/customer/WishlistButton";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

// ============================================================
// PRICE FORMAT
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// SERIALIZE FOOD
// ============================================================

function serializeFood(food) {
  return {
    _id:
      food._id.toString(),

    name:
      food.name || "",

    slug:
      food.slug || "",

    description:
      food.description || "",

    image:
      food.image || "",

    price:
      Number(
        food.price || 0
      ),

    salePrice:
      Number(
        food.salePrice || 0
      ),

    rating:
      Number(
        food.rating || 0
      ),

    reviewsCount:
      Number(
        food.reviewsCount || 0
      ),

    categoryId:
      food.categoryId
        ?.toString() ||
      "",
  };
}

// ============================================================
// PAGE
// ============================================================

export default async function HomePage() {
  await connectDB();

  // ==========================================================
  // CUSTOMER SESSION
  // ==========================================================

  const session =
    await getCustomerSession();

  let customer =
    null;

  let selectedBranch =
    null;

  // ==========================================================
  // LOGGED-IN CUSTOMER
  // ==========================================================

  if (session?.userId) {
    customer =
      await User.findOne({
        _id:
          session.userId,

        role:
          "customer",

        isActive:
          true,
      })
        .select(
          "name email selectedRestaurantId"
        )
        .lean();

    // ========================================================
    // INVALID CUSTOMER SESSION
    // ========================================================

    if (!customer) {
      redirect(
        "/login"
      );
    }

    // ========================================================
    // CUSTOMER MUST SELECT BRANCH
    // ========================================================

    if (
      !customer.selectedRestaurantId
    ) {
      redirect(
        "/select-branch"
      );
    }

    // ========================================================
    // VERIFY SELECTED BRANCH
    // ========================================================

    selectedBranch =
      await Restaurant.findOne({
        _id:
          customer.selectedRestaurantId,

        isActive:
          true,
      })
        .select(
          "_id name city area image"
        )
        .lean();

    // ========================================================
    // SELECTED BRANCH BECAME INACTIVE
    // ========================================================

    if (!selectedBranch) {
      await User.updateOne(
        {
          _id:
            customer._id,
        },

        {
          $set: {
            selectedRestaurantId:
              null,
          },
        }
      );

      redirect(
        "/select-branch"
      );
    }
  }

  // ==========================================================
  // FOOD BASE QUERY
  //
  // Guest:
  // all available foods.
  //
  // Customer:
  // only foods from selected branch.
  // ==========================================================

  const foodBaseQuery = {
    isAvailable:
      true,
  };

  if (selectedBranch) {
    foodBaseQuery.restaurantIds =
      selectedBranch._id;
  }

  // ==========================================================
  // GET DATA
  // ==========================================================

  const [
    popularFoods,
    featuredFoods,
    restaurants,
    settings,
  ] = await Promise.all([
    // --------------------------------------------------------
    // POPULAR FOODS
    // --------------------------------------------------------

    Food.find({
      ...foodBaseQuery,

      isPopular:
        true,
    })
      .sort({
        createdAt:
          -1,
      })
      .limit(8)
      .lean(),

    // --------------------------------------------------------
    // FEATURED FOODS
    // --------------------------------------------------------

    Food.find({
      ...foodBaseQuery,

      isFeatured:
        true,
    })
      .sort({
        createdAt:
          -1,
      })
      .limit(4)
      .lean(),

    // --------------------------------------------------------
    // BRANCH DATA
    //
    // Logged customer only sees selected branch.
    // Guest can see active branches in homepage section.
    // --------------------------------------------------------

    selectedBranch
      ? Restaurant.find({
          _id:
            selectedBranch._id,
        }).lean()
      : Restaurant.find({
          isActive:
            true,
        })
          .sort({
            createdAt:
              -1,
          })
          .limit(4)
          .lean(),

    // --------------------------------------------------------
    // WEBSITE SETTINGS
    // --------------------------------------------------------

    Settings.findOne({
      key:
        "main",
    }).lean(),
  ]);

  // ==========================================================
  // ALL FOODS FOR CATEGORY FILTER
  //
  // Customer:
  // only selected branch.
  //
  // Guest:
  // all available foods.
  // ==========================================================

  const categoryFoods =
    await Food.find(
      foodBaseQuery
    )
      .select(
        "categoryId"
      )
      .lean();

  // ==========================================================
  // UNIQUE CATEGORY IDS
  // ==========================================================

  const categoryIds = [
    ...new Set(
      categoryFoods
        .map(
          (food) =>
            food.categoryId
              ?.toString()
        )
        .filter(Boolean)
    ),
  ];

  // ==========================================================
  // CATEGORIES
  //
  // Only categories that actually have foods available.
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

            createdAt:
              -1,
          })
          .limit(8)
          .lean()
      : [];

  // ==========================================================
  // SERIALIZE CATEGORIES
  // ==========================================================

  const categoryData =
    categories.map(
      (category) => ({
        _id:
          category._id.toString(),

        name:
          category.name || "",

        slug:
          category.slug || "",

        image:
          category.image || "",
      })
    );

  // ==========================================================
  // SERIALIZE FOODS
  // ==========================================================

  const popularData =
    popularFoods.map(
      serializeFood
    );

  const featuredData =
    featuredFoods.map(
      serializeFood
    );

  // ==========================================================
  // SERIALIZE BRANCHES
  // ==========================================================

  const branchData =
    restaurants.map(
      (branch) => ({
        _id:
          branch._id.toString(),

        name:
          branch.name || "",

        image:
          branch.image || "",

        city:
          branch.city || "",

        area:
          branch.area || "",
      })
    );

  // ==========================================================
  // OFFER IMAGE
  // SUPER ADMIN SETTINGS -> CLOUDINARY
  // ==========================================================

  const offerBannerImage =
    settings
      ?.offerBannerImage ||
    "/images/offer-default.jpg";

  // ==========================================================
  // REVIEWS
  // ==========================================================

  const testimonials = [
    {
      name:
        "Ayesha Khan",

      text:
        "Amazing food and super fast delivery. CRAVEO is now my first choice.",

      rating:
        5,
    },

    {
      name:
        "Sarah Ahmed",

      text:
        "Fresh food, good portions and the ordering experience is very smooth.",

      rating:
        5,
    },

    {
      name:
        "Ahmed Malik",

      text:
        "Quick delivery and excellent service. The burgers are really delicious.",

      rating:
        5,
    },
  ];

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <CustomerNavbar />

      <main className="craveo-home">
        {/* ====================================================
            HERO
        ==================================================== */}

        <CustomerHero />

        {/* ====================================================
            SELECTED BRANCH INFO
            ONLY LOGGED-IN CUSTOMER
        ==================================================== */}

        {selectedBranch && (
          <section className="customer-home-branch-bar">
            <div className="customer-home-branch-info">
              <div className="customer-home-branch-icon">
                <MapPin
                  size={19}
                />
              </div>

              <div>
                <span>
                  YOUR SELECTED BRANCH
                </span>

                <strong>
                  {
                    selectedBranch.name
                  }
                </strong>

                <small>
                  {[
                    selectedBranch.area,
                    selectedBranch.city,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      ", "
                    )}
                </small>
              </div>
            </div>

            <Link
              href="/select-branch"
              className="customer-home-change-branch"
            >
              Change Branch

              <ArrowRight
                size={14}
              />
            </Link>
          </section>
        )}

        {/* ====================================================
            POPULAR CATEGORIES
        ==================================================== */}

        <section className="craveo-home-section">
          <div className="craveo-home-section-heading">
            <div>
              <span>
                EXPLORE BY CATEGORY
              </span>

              <h2>
                Popular Categories
              </h2>
            </div>

            <Link href="/categories">
              View All

              <ArrowRight
                size={15}
              />
            </Link>
          </div>

          {categoryData.length >
          0 ? (
            <div className="craveo-home-category-row">
              {categoryData.map(
                (
                  category
                ) => (
                  <Link
                    key={
                      category._id
                    }
                    href={`/categories/${category.slug}`}
                    className="craveo-home-category-item"
                  >
                    <div className="craveo-home-category-circle">
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
                          size={25}
                        />
                      )}
                    </div>

                    <strong>
                      {
                        category.name
                      }
                    </strong>
                  </Link>
                )
              )}
            </div>
          ) : (
            <div className="store-empty">
              No categories currently
              available
              {selectedBranch
                ? ` at ${selectedBranch.name}.`
                : "."}
            </div>
          )}
        </section>

        {/* ====================================================
            POPULAR FOODS
        ==================================================== */}

        <section className="craveo-home-section">
          <div className="craveo-home-section-heading">
            <div>
              <span>
                {selectedBranch
                  ? selectedBranch.name.toUpperCase()
                  : "OUR SPECIALTIES"}
              </span>

              <h2>
                Popular Foods
              </h2>
            </div>

            <Link href="/foods">
              View Menu

              <ArrowRight
                size={15}
              />
            </Link>
          </div>

          {popularData.length >
          0 ? (
            <div className="craveo-home-food-grid">
              {popularData.map(
                (food) => (
                  <article
                    key={
                      food._id
                    }
                    className="craveo-home-food-card"
                  >
                    {/* ========================================
                        IMAGE
                    ======================================== */}

                    <div className="craveo-home-food-image">
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

                      {/* ======================================
                          REAL FUNCTIONAL WISHLIST
                      ====================================== */}

                      <WishlistButton
                        foodId={
                          food._id
                        }
                        className="craveo-home-food-wishlist"
                      />
                    </div>

                    {/* ========================================
                        CONTENT
                    ======================================== */}

                    <div className="craveo-home-food-content">
                      <div className="craveo-home-food-rating">
                        <Star
                          size={12}
                        />

                        <span>
                          {food.rating.toFixed(
                            1
                          )}
                        </span>
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
                          "Fresh and delicious CRAVEO food."}
                      </p>

                      <div className="craveo-home-food-bottom">
                        <div>
                          <strong>
                            {formatPrice(
                              food.salePrice ||
                                food.price
                            )}
                          </strong>

                          {food.salePrice >
                            0 &&
                            food.salePrice <
                              food.price && (
                              <del>
                                {formatPrice(
                                  food.price
                                )}
                              </del>
                            )}
                        </div>

                        <Link
                          href={`/foods/${food.slug}`}
                          className="customer-home-food-view"
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
              No popular foods are
              currently available
              {selectedBranch
                ? ` at ${selectedBranch.name}.`
                : "."}
            </div>
          )}
        </section>

        {/* ====================================================
            SPECIAL OFFER
        ==================================================== */}

        <section className="craveo-home-offer">
          <div className="craveo-home-offer-content">
            <span>
              CRAVEO SPECIAL OFFER
            </span>

            <h2>
              Get 20% OFF
            </h2>

            <p>
              On Your First Order
            </p>

            <div className="craveo-home-offer-code">
              Use Code

              <strong>
                CRAVEO20
              </strong>
            </div>

            <Link href="/foods">
              Order Now

              <ArrowRight
                size={15}
              />
            </Link>
          </div>

          <div className="craveo-home-offer-image">
            <img
              src={
                offerBannerImage
              }
              alt="CRAVEO Special Offer"
            />
          </div>
        </section>

        {/* ====================================================
            BRANCH SECTION
        ==================================================== */}

        <section className="craveo-home-section">
          <div className="craveo-home-section-heading">
            <div>
              <span>
                {selectedBranch
                  ? "YOUR BRANCH"
                  : "OUR BRANCHES"}
              </span>

              <h2>
                {selectedBranch
                  ? selectedBranch.name
                  : "CRAVEO Locations"}
              </h2>
            </div>

            {selectedBranch && (
              <Link href="/select-branch">
                Change Branch

                <ArrowRight
                  size={15}
                />
              </Link>
            )}
          </div>

          <div className="craveo-home-branch-grid">
            {branchData.map(
              (branch) => (
                <article
                  key={
                    branch._id
                  }
                  className="craveo-home-branch-card"
                >
                  <div className="craveo-home-branch-image">
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
                      <Store
                        size={35}
                      />
                    )}
                  </div>

                  <div className="craveo-home-branch-content">
                    <span>
                      {selectedBranch
                        ? "SELECTED BRANCH"
                        : "CRAVEO BRANCH"}
                    </span>

                    <h3>
                      {
                        branch.name
                      }
                    </h3>

                    <p>
                      <MapPin
                        size={13}
                      />

                      {[
                        branch.area,
                        branch.city,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          ", "
                        ) ||
                        "Pakistan"}
                    </p>

                    {selectedBranch ? (
                      <Link href="/foods">
                        View Menu
                      </Link>
                    ) : (
                      <Link href="/login">
                        Login To Order
                      </Link>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        {/* ====================================================
            BENEFITS
        ==================================================== */}

        <section className="craveo-home-benefits-section">
          <div className="craveo-home-section-heading">
            <div>
              <span>
                WHY CHOOSE CRAVEO
              </span>

              <h2>
                More Than Just Food
              </h2>
            </div>
          </div>

          <div className="craveo-home-benefit-grid">
            <div>
              <Clock3
                size={23}
              />

              <span>
                <strong>
                  Fast Delivery
                </strong>

                <small>
                  Hot food at your door
                </small>
              </span>
            </div>

            <div>
              <Star
                size={23}
              />

              <span>
                <strong>
                  Fresh Ingredients
                </strong>

                <small>
                  Fresh quality everyday
                </small>
              </span>
            </div>

            <div>
              <ShoppingBag
                size={23}
              />

              <span>
                <strong>
                  Easy Ordering
                </strong>

                <small>
                  Fast and simple checkout
                </small>
              </span>
            </div>

            <div>
              <Search
                size={23}
              />

              <span>
                <strong>
                  Customer Support
                </strong>

                <small>
                  We are here to help
                </small>
              </span>
            </div>
          </div>
        </section>

        {/* ====================================================
            REVIEWS
        ==================================================== */}

        <section className="craveo-home-reviews">
          <div className="craveo-home-section-heading">
            <div>
              <span>
                CUSTOMER REVIEWS
              </span>

              <h2>
                What Our Customers Say
              </h2>
            </div>
          </div>

          <div className="craveo-home-review-grid">
            {testimonials.map(
              (
                review,
                index
              ) => (
                <article
                  key={
                    index
                  }
                  className="craveo-home-review-card"
                >
                  <div className="craveo-home-stars">
                    {Array.from({
                      length:
                        review.rating,
                    }).map(
                      (
                        _,
                        starIndex
                      ) => (
                        <Star
                          key={
                            starIndex
                          }
                          size={13}
                        />
                      )
                    )}
                  </div>

                  <p>
                    “{review.text}”
                  </p>

                  <strong>
                    {review.name}
                  </strong>

                  <span>
                    CRAVEO Customer
                  </span>
                </article>
              )
            )}
          </div>
        </section>
      </main>

      <CustomerFooter />
    </>
  );
}