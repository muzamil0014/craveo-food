// ============================================================
// CRAVEO - BRANCH FOODS PAGE
// ============================================================

import {
  PackageOpen,
  UtensilsCrossed,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";
import { getBranchAdminSession } from "@/lib/auth";

import Food from "@/models/Food";
import BranchFoodSetting from "@/models/BranchFoodSetting";

import BranchFoodActions from "@/components/admin/branch/BranchFoodActions";
// ============================================================
// FORCE DYNAMIC
// BRANCH ADMIN DEPENDS ON AUTH COOKIES
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// FORMAT PRICE
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

// ============================================================
// GET FOOD IMAGE
// ============================================================

function getFoodImage(food) {
  return (
    food?.image ||
    food?.imageUrl ||
    food?.thumbnail ||
    food?.photo ||
    ""
  );
}

// ============================================================
// PAGE
// ============================================================

export default async function BranchFoodsPage() {
  const session =
    await getBranchAdminSession();

  await connectDB();

  // ==========================================================
  // ONLY FOODS ASSIGNED TO THIS BRANCH
  // ==========================================================

  const foods = await Food.find({
    restaurantIds:
      session.restaurantId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  const foodIds = foods.map(
    (food) => food._id
  );

  const settings =
    await BranchFoodSetting.find({
      restaurantId:
        session.restaurantId,
      foodId: {
        $in: foodIds,
      },
    }).lean();

  const settingsMap = new Map(
    settings.map((setting) => [
      setting.foodId.toString(),
      setting,
    ])
  );

  return (
    <main className="branch-module-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="branch-module-header">
        <div>
          <span>
            FOOD MANAGEMENT
          </span>

          <h1>
            Branch Foods
          </h1>

          <p>
            Manage availability and stock
            for foods assigned to your
            branch.
          </p>
        </div>
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      {foods.length > 0 ? (
        <section className="branch-food-grid">
          {foods.map((food) => {
            const setting =
              settingsMap.get(
                food._id.toString()
              );

            const available = setting
              ? setting.isAvailable
              : food.isAvailable !== false;

            const stock = setting
              ? setting.stock
              : Number(food.stock || 0);

            const foodImage =
              getFoodImage(food);

            return (
              <article
                key={food._id.toString()}
                className="branch-food-card"
              >
                {/* ============================================
                    IMAGE
                ============================================ */}

                <div className="branch-food-image-wrap">
                  {foodImage ? (
                    <img
                      src={foodImage}
                      alt={food.name}
                      className="branch-food-image"
                    />
                  ) : (
                    <div className="branch-food-image-placeholder">
                      <UtensilsCrossed size={28} />
                    </div>
                  )}
                </div>

                {/* ============================================
                    HEADER
                ============================================ */}

                <div className="branch-food-header">
                  <div className="branch-food-icon">
                    <UtensilsCrossed size={21} />
                  </div>

                  <div className="branch-food-main">
                    <span>
                      FOOD
                    </span>

                    <h2>
                      {food.name}
                    </h2>

                    <p>
                      {formatPrice(
                        food.salePrice ||
                          food.price
                      )}
                    </p>
                  </div>
                </div>

                {/* ============================================
                    INFO
                ============================================ */}

                <div className="branch-food-info">
                  <span>
                    Stock
                    <strong>
                      {stock}
                    </strong>
                  </span>

                  <span>
                    Status
                    <strong
                      className={
                        available
                          ? "available"
                          : "unavailable"
                      }
                    >
                      {available
                        ? "Available"
                        : "Unavailable"}
                    </strong>
                  </span>
                </div>

                {/* ============================================
                    ACTIONS
                ============================================ */}

                <BranchFoodActions
                  foodId={food._id.toString()}
                  initialAvailable={
                    available
                  }
                  initialStock={stock}
                />
              </article>
            );
          })}
        </section>
      ) : (
        <section className="branch-module-empty">
          <PackageOpen size={42} />

          <h2>
            No Foods Assigned
          </h2>

          <p>
            Super Admin has not assigned
            any food to this branch.
          </p>
        </section>
      )}
    </main>
  );
}