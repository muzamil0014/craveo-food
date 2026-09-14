// ============================================================
// CRAVEO - CUSTOMER WISHLIST PAGE
// ============================================================

import Link from "next/link";

import {
  Heart,
  ShoppingBag,
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
import Wishlist from "@/models/Wishlist";
import Food from "@/models/Food";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import WishlistItemActions from "@/components/customer/WishlistItemActions";

import "../../store.css";

// ============================================================
// FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// PRICE
// ============================================================

function money(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// PAGE
// ============================================================

export default async function WishlistPage() {
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
  // USER
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
        "_id selectedRestaurantId"
      )
      .lean();

  if (!user) {
    redirect("/login");
  }

  // ==========================================================
  // WISHLIST
  // ==========================================================

  const wishlist =
    await Wishlist.findOne({
      userId:
        user._id,
    }).lean();

  const foodIds =
    Array.isArray(
      wishlist?.items
    )
      ? wishlist.items.map(
          (item) =>
            item.foodId
        )
      : [];

  // ==========================================================
  // FOODS
  // ==========================================================

  const foods =
    foodIds.length > 0
      ? await Food.find({
          _id: {
            $in: foodIds,
          },
        }).lean()
      : [];

  // ==========================================================
  // SORT SAME AS WISHLIST
  // ==========================================================

  const foodMap =
    new Map(
      foods.map(
        (food) => [
          food._id.toString(),
          food,
        ]
      )
    );

  const orderedFoods =
    foodIds
      .map((id) =>
        foodMap.get(
          id.toString()
        )
      )
      .filter(Boolean);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="customer-wishlist-page">
        <section className="customer-wishlist-header">
          <span>
            MY CRAVEO
          </span>

          <h1>
            My Wishlist
          </h1>

          <p>
            Save your favorite foods
            and order them whenever
            you want.
          </p>
        </section>

        {orderedFoods.length >
        0 ? (
          <section className="customer-wishlist-grid">
            {orderedFoods.map(
              (food) => {
                // ============================================
                // BRANCH AVAILABILITY
                // ============================================

                const availableInSelectedBranch =
                  Boolean(
                    user.selectedRestaurantId &&
                      Array.isArray(
                        food.restaurantIds
                      ) &&
                      food.restaurantIds.some(
                        (
                          restaurantId
                        ) =>
                          restaurantId.toString() ===
                          user.selectedRestaurantId.toString()
                      ) &&
                      food.isAvailable !==
                        false &&
                      Number(
                        food.stock ||
                          0
                      ) > 0
                  );

                const currentPrice =
                  Number(
                    food.salePrice
                  ) > 0
                    ? Number(
                        food.salePrice
                      )
                    : Number(
                        food.price ||
                          0
                      );

                return (
                  <article
                    key={
                      food._id.toString()
                    }
                    className="customer-wishlist-card"
                  >
                    {/* ========================================
                        IMAGE
                    ======================================== */}

                    <Link
                      href={`/foods/${food._id}`}
                      className="customer-wishlist-image"
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
                        <ShoppingBag
                          size={30}
                        />
                      )}
                    </Link>

                    {/* ========================================
                        BODY
                    ======================================== */}

                    <div className="customer-wishlist-card-body">
                      <div className="customer-wishlist-card-top">
                        <div>
                          <h2>
                            {
                              food.name
                            }
                          </h2>

                          <p>
                            {food.description ||
                              "Delicious CRAVEO food."}
                          </p>
                        </div>

                        <WishlistItemActions
                          foodId={
                            food._id.toString()
                          }
                          mode="remove-only"
                        />
                      </div>

                      {/* ======================================
                          PRICE
                      ====================================== */}

                      <div className="customer-wishlist-price">
                        <strong>
                          {money(
                            currentPrice
                          )}
                        </strong>

                        {Number(
                          food.salePrice ||
                            0
                        ) > 0 &&
                          Number(
                            food.price ||
                              0
                          ) >
                            Number(
                              food.salePrice ||
                                0
                            ) && (
                            <span>
                              {money(
                                food.price
                              )}
                            </span>
                          )}
                      </div>

                      {/* ======================================
                          AVAILABILITY
                      ====================================== */}

                      <div
                        className={`customer-wishlist-availability ${
                          availableInSelectedBranch
                            ? "available"
                            : "unavailable"
                        }`}
                      >
                        {availableInSelectedBranch
                          ? "Available in selected branch"
                          : "Unavailable in selected branch"}
                      </div>

                      {/* ======================================
                          ACTIONS
                      ====================================== */}

                      <WishlistItemActions
                        foodId={
                          food._id.toString()
                        }
                        available={
                          availableInSelectedBranch
                        }
                      />
                    </div>
                  </article>
                );
              }
            )}
          </section>
        ) : (
          <section className="customer-wishlist-empty">
            <Heart
              size={42}
            />

            <h2>
              Your wishlist is empty
            </h2>

            <p>
              Save foods you love and
              they&apos;ll appear here.
            </p>

            <Link href="/foods">
              Explore Menu
            </Link>
          </section>
        )}
      </main>

      <CustomerFooter />
    </>
  );
}