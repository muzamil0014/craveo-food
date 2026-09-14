// ============================================================
// CRAVEO - FOODS MANAGEMENT PAGE
// ============================================================

import Link from "next/link";

import {
  Package,
  Plus,
  Star,
  UtensilsCrossed,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";

import Food from "@/models/Food";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";

import FoodActions from "@/components/admin/FoodActions";

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

export default async function FoodsPage() {
  await connectDB();

  // Ensure referenced models are registered.
  void Category;
  void Restaurant;

  const foods =
    await Food.find()
      .populate(
        "categoryId",
        "name"
      )
      .populate(
        "restaurantIds",
        "name city area"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

  // ==========================================================
  // COUNTS
  // ==========================================================

  const availableCount =
    foods.filter(
      (food) =>
        food.isAvailable
    ).length;

  const featuredCount =
    foods.filter(
      (food) =>
        food.isFeatured
    ).length;

  const popularCount =
    foods.filter(
      (food) =>
        food.isPopular
    ).length;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="foods-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="foods-header">
        <div>
          <span className="food-eyebrow">
            MENU MANAGEMENT
          </span>

          <h1>
            CRAVEO Foods
          </h1>

          <p>
            Manage foods, prices,
            inventory and branch
            availability.
          </p>
        </div>

        <Link
          href="/admin/dashboard/foods/add"
          className="food-add-btn"
        >
          <Plus size={18} />
          Add Food
        </Link>
      </div>

      {/* ====================================================
          SUMMARY
      ==================================================== */}

      <section className="food-summary-grid">
        <div className="food-summary-card">
          <div className="food-summary-icon">
            <UtensilsCrossed
              size={20}
            />
          </div>

          <div>
            <span>
              Total Foods
            </span>

            <strong>
              {foods.length}
            </strong>
          </div>
        </div>

        <div className="food-summary-card">
          <div className="food-summary-icon success">
            <Package size={20} />
          </div>

          <div>
            <span>
              Available
            </span>

            <strong>
              {availableCount}
            </strong>
          </div>
        </div>

        <div className="food-summary-card">
          <div className="food-summary-icon">
            <Star size={20} />
          </div>

          <div>
            <span>
              Featured
            </span>

            <strong>
              {featuredCount}
            </strong>
          </div>
        </div>

        <div className="food-summary-card">
          <div className="food-summary-icon">
            <Star size={20} />
          </div>

          <div>
            <span>
              Popular
            </span>

            <strong>
              {popularCount}
            </strong>
          </div>
        </div>
      </section>

      {/* ====================================================
          FOODS GRID
      ==================================================== */}

      {foods.length > 0 ? (
        <section className="foods-grid">
          {foods.map(
            (food) => (
              <article
                className="food-card"
                key={
                  food._id.toString()
                }
              >
                {/* ============================================
                    IMAGE
                ============================================ */}

                <div className="food-card-image">
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.name}
                    />
                  ) : (
                    <div className="food-card-placeholder">
                      <UtensilsCrossed
                        size={41}
                      />
                    </div>
                  )}

                  <div className="food-card-badges">
                    <span
                      className={`food-availability-badge ${
                        food.isAvailable
                          ? "available"
                          : "unavailable"
                      }`}
                    >
                      {food.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </span>

                    {food.isFeatured && (
                      <span className="food-featured-badge">
                        Featured
                      </span>
                    )}

                    {food.isPopular && (
                      <span className="food-popular-badge">
                        Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* ============================================
                    CONTENT
                ============================================ */}

                <div className="food-card-content">
                  <div className="food-card-heading">
                    <div>
                      <span>
                        {food.categoryId
                          ?.name ||
                          "Uncategorized"}
                      </span>

                      <h2>
                        {food.name}
                      </h2>
                    </div>

                    <div className="food-card-price">
                      {food.salePrice >
                      0 ? (
                        <>
                          <strong>
                            {formatPrice(
                              food.salePrice
                            )}
                          </strong>

                          <del>
                            {formatPrice(
                              food.price
                            )}
                          </del>
                        </>
                      ) : (
                        <strong>
                          {formatPrice(
                            food.price
                          )}
                        </strong>
                      )}
                    </div>
                  </div>

                  <p className="food-card-description">
                    {food.description ||
                      "No description added."}
                  </p>

                  {/* ==========================================
                      META
                  ========================================== */}

                  <div className="food-card-meta">
                    <span>
                      Stock:{" "}
                      <strong>
                        {food.stock}
                      </strong>
                    </span>

                    <span>
                      Branches:{" "}
                      <strong>
                        {
                          food
                            .restaurantIds
                            ?.length
                        }
                      </strong>
                    </span>

                    <span>
                      Variants:{" "}
                      <strong>
                        {
                          food.variants
                            ?.length
                        }
                      </strong>
                    </span>
                  </div>

                  {/* ==========================================
                      BRANCHES
                  ========================================== */}

                  <div className="food-card-branches">
                    {food.restaurantIds
                      ?.slice(0, 3)
                      .map(
                        (branch) => (
                          <span
                            key={
                              branch._id.toString()
                            }
                          >
                            {
                              branch.name
                            }
                          </span>
                        )
                      )}

                    {food.restaurantIds
                      ?.length > 3 && (
                      <span>
                        +
                        {food
                          .restaurantIds
                          .length -
                          3}{" "}
                        more
                      </span>
                    )}
                  </div>

                  {/* ==========================================
                      ACTIONS
                  ========================================== */}

                  <FoodActions
                    foodId={
                      food._id.toString()
                    }
                    foodName={
                      food.name
                    }
                    isAvailable={
                      food.isAvailable
                    }
                  />
                </div>
              </article>
            )
          )}
        </section>
      ) : (
        <section className="foods-empty-state">
          <div className="foods-empty-icon">
            <UtensilsCrossed
              size={39}
            />
          </div>

          <h2>
            No foods yet
          </h2>

          <p>
            Add your first CRAVEO
            menu item.
          </p>

          <Link
            href="/admin/dashboard/foods/add"
            className="food-add-btn"
          >
            <Plus size={18} />
            Add First Food
          </Link>
        </section>
      )}
    </main>
  );
}