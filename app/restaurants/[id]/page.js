// ============================================================
// CRAVEO - RESTAURANT DETAILS + FOOD MENU
// ============================================================

import Link from "next/link";

import {
  ArrowLeft,
  MapPin,
  Phone,
  ShoppingBag,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";

import Restaurant from "@/models/Restaurant";
import Food from "@/models/Food";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";

import "../../store.css";

// ============================================================
// FORCE FRESH DATA
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function RestaurantDetailsPage({
  params,
}) {
  const { id } =
    await params;

  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    notFound();
  }

  await connectDB();

  const restaurant =
    await Restaurant.findOne({
      _id: id,
      isActive: true,
    }).lean();

  if (!restaurant) {
    notFound();
  }

  const foods =
    await Food.find({
      restaurantIds:
        restaurant._id,

      isAvailable: true,
    })
      .sort({
        isPopular: -1,
        isFeatured: -1,
        createdAt: -1,
      })
      .lean();

  return (
    <>
      <CustomerNavbar />

      <main className="store-list-page">
        {/* ====================================================
            BACK
        ==================================================== */}

        <div className="store-back-row">
          <Link href="/restaurants">
            <ArrowLeft size={15} />
            All Branches
          </Link>
        </div>

        {/* ====================================================
            BRANCH HERO
        ==================================================== */}

        <section className="restaurant-detail-hero">
          <div className="restaurant-detail-image">
            {restaurant.image ? (
              <img
                src={
                  restaurant.image
                }
                alt={
                  restaurant.name
                }
              />
            ) : (
              <Store size={55} />
            )}
          </div>

          <div className="restaurant-detail-info">
            <span>
              CRAVEO BRANCH
            </span>

            <h1>
              {restaurant.name}
            </h1>

            <p>
              <MapPin size={16} />

              {[
                restaurant.area,
                restaurant.city,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>

            {restaurant.phone && (
              <p>
                <Phone size={16} />
                {restaurant.phone}
              </p>
            )}

            {restaurant.address && (
              <small>
                {restaurant.address}
              </small>
            )}
          </div>
        </section>

        {/* ====================================================
            MENU
        ==================================================== */}

        <section className="store-content-section">
          <div className="store-content-heading">
            <div>
              <span>
                BRANCH MENU
              </span>

              <h2>
                Available Foods
              </h2>
            </div>

            <strong>
              {foods.length} Items
            </strong>
          </div>

          {foods.length > 0 ? (
            <div className="customer-food-grid">
              {foods.map(
                (food) => (
                  <article
                    key={
                      food._id.toString()
                    }
                    className="customer-food-card"
                  >
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
              No foods are currently available at this branch.
            </div>
          )}
        </section>
      </main>

      <CustomerFooter />
    </>
  );
}