// ============================================================
// CRAVEO - FEATURED CATEGORIES
// ============================================================

import Link from "next/link";

import {
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function FeaturedCategories({
  categories = [],
}) {
  // ==========================================================
  // NO CATEGORIES
  // ==========================================================

  if (
    !Array.isArray(categories) ||
    categories.length === 0
  ) {
    return null;
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="store-section">
      {/* ======================================================
          HEADING
      ====================================================== */}

      <div className="store-section-heading">
        <div>
          <span>
            CATEGORIES
          </span>

          <h2>
            Explore Food Categories
          </h2>

          <p>
            Find exactly what you are
            craving.
          </p>
        </div>

        <Link href="/categories">
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* ======================================================
          CATEGORY GRID
      ====================================================== */}

      <div className="store-category-grid">
        {categories.map(
          (category) => (
            <Link
              key={
                category._id
              }
              href={`/categories/${category.slug}`}
              className="store-category-card"
            >
              {/* ==============================================
                  IMAGE
              ============================================== */}

              <div className="store-category-image">
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
                    size={30}
                  />
                )}
              </div>

              {/* ==============================================
                  CONTENT
              ============================================== */}

              <strong>
                {category.name}
              </strong>

              <span>
                Explore
              </span>
            </Link>
          )
        )}
      </div>
    </section>
  );
}