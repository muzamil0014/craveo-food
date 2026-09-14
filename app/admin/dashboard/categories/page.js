// ============================================================
// CRAVEO - CATEGORIES PAGE
// ============================================================

import Link from "next/link";

import {
  LayoutGrid,
  Plus,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

import CategoryActions from "@/components/admin/CategoryActions";

// ============================================================
// PAGE
// ============================================================

export default async function CategoriesPage() {
  await connectDB();

  const categories =
    await Category.find()
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .lean();

  const activeCount =
    categories.filter(
      (item) =>
        item.isActive
    ).length;

  const inactiveCount =
    categories.length -
    activeCount;

  return (
    <main className="categories-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="categories-header">
        <div>
          <span className="category-eyebrow">
            CATEGORY MANAGEMENT
          </span>

          <h1>
            Food Categories
          </h1>

          <p>
            Manage food categories
            displayed throughout CRAVEO.
          </p>
        </div>

        <Link
          href="/admin/dashboard/categories/add"
          className="category-add-btn"
        >
          <Plus size={18} />
          Add Category
        </Link>
      </div>

      {/* ====================================================
          SUMMARY
      ==================================================== */}

      <section className="category-summary-grid">
        <div className="category-summary-card">
          <div className="category-summary-icon">
            <LayoutGrid
              size={20}
            />
          </div>

          <div>
            <span>
              Total Categories
            </span>

            <strong>
              {categories.length}
            </strong>
          </div>
        </div>

        <div className="category-summary-card">
          <div className="category-summary-icon success">
            <LayoutGrid
              size={20}
            />
          </div>

          <div>
            <span>
              Active Categories
            </span>

            <strong>
              {activeCount}
            </strong>
          </div>
        </div>

        <div className="category-summary-card">
          <div className="category-summary-icon danger">
            <LayoutGrid
              size={20}
            />
          </div>

          <div>
            <span>
              Inactive Categories
            </span>

            <strong>
              {inactiveCount}
            </strong>
          </div>
        </div>
      </section>

      {/* ====================================================
          CATEGORIES
      ==================================================== */}

      {categories.length > 0 ? (
        <section className="category-grid">
          {categories.map(
            (category) => (
              <article
                className="category-card"
                key={
                  category._id.toString()
                }
              >
                <div className="category-card-image">
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
                    <div className="category-card-placeholder">
                      <LayoutGrid
                        size={38}
                      />
                    </div>
                  )}

                  <span
                    className={`category-status-badge ${
                      category.isActive
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    {category.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="category-card-content">
                  <div className="category-card-title">
                    <h2>
                      {category.name}
                    </h2>

                    <span>
                      Order{" "}
                      {category.sortOrder ||
                        0}
                    </span>
                  </div>

                  <p>
                    {category.description ||
                      "No description added."}
                  </p>

                  <CategoryActions
                    categoryId={
                      category._id.toString()
                    }
                    categoryName={
                      category.name
                    }
                    isActive={
                      category.isActive
                    }
                  />
                </div>
              </article>
            )
          )}
        </section>
      ) : (
        <section className="categories-empty">
          <div className="categories-empty-icon">
            <LayoutGrid
              size={37}
            />
          </div>

          <h2>
            No categories yet
          </h2>

          <p>
            Add your first CRAVEO
            food category.
          </p>

          <Link
            href="/admin/dashboard/categories/add"
            className="category-add-btn"
          >
            <Plus size={18} />
            Add First Category
          </Link>
        </section>
      )}
    </main>
  );
}