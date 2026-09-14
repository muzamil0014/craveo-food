// ============================================================
// CRAVEO - CUSTOMER FOOD CARD
// ============================================================

import Link from "next/link";

import {
  Heart,
  ShoppingBag,
  Star,
  UtensilsCrossed,
} from "lucide-react";

// ============================================================
// PRICE
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// COMPONENT
// ============================================================

export default function FoodCard({
  food,
}) {
  const finalPrice =
    food.salePrice ||
    food.price;

  return (
    <article className="store-food-card">
      {/* ======================================================
          IMAGE
      ====================================================== */}

      <Link
        href={`/foods/${food.slug}`}
        className="store-food-image"
      >
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
          />
        ) : (
          <div className="store-food-placeholder">
            <UtensilsCrossed
              size={38}
            />
          </div>
        )}

        {food.isFeatured && (
          <span className="store-food-featured">
            Featured
          </span>
        )}

        <button
          type="button"
          className="store-food-wishlist"
          aria-label="Wishlist"
        >
          <Heart size={17} />
        </button>
      </Link>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="store-food-card-content">
        <div className="store-food-rating">
          <Star size={14} />
          {Number(
            food.rating || 0
          ).toFixed(1)}
        </div>

        <Link
          href={`/foods/${food.slug}`}
        >
          <h3>
            {food.name}
          </h3>
        </Link>

        <p>
          {food.description ||
            "Fresh and delicious CRAVEO food."}
        </p>

        <div className="store-food-bottom">
          <div>
            <strong>
              {formatPrice(
                finalPrice
              )}
            </strong>

            {food.salePrice &&
              food.salePrice <
                food.price && (
                <del>
                  {formatPrice(
                    food.price
                  )}
                </del>
              )}
          </div>

          <button
            type="button"
            className="store-food-cart-btn"
          >
            <ShoppingBag
              size={16}
            />
          </button>
        </div>
      </div>
    </article>
  );
}