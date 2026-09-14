// ============================================================
// CRAVEO - RESTAURANT / BRANCH CARD
// ============================================================

import Link from "next/link";

import {
  ArrowRight,
  MapPin,
  Store,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function RestaurantCard({
  restaurant,
}) {
  return (
    <article className="store-restaurant-card">
      <div className="store-restaurant-image">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
          />
        ) : (
          <Store size={38} />
        )}
      </div>

      <div className="store-restaurant-content">
        <span>
          CRAVEO BRANCH
        </span>

        <h3>
          {restaurant.name}
        </h3>

        <p>
          <MapPin size={14} />

          {[
            restaurant.area,
            restaurant.city,
          ]
            .filter(Boolean)
            .join(", ") ||
            "CRAVEO Branch"}
        </p>

        <Link
          href={`/restaurants/${restaurant._id}`}
        >
          View Menu
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}