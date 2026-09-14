"use client";

// ============================================================
// CRAVEO - CATEGORY FORM
// Add + Edit
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  ImagePlus,
  LayoutGrid,
  Save,
  X,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function CategoryForm({
  category = null,
}) {
  const router =
    useRouter();

  const editing =
    Boolean(category?._id);

  // ==========================================================
  // STATE
  // ==========================================================

  const [form, setForm] =
    useState({
      name:
        category?.name || "",

      description:
        category?.description ||
        "",

      sortOrder:
        category?.sortOrder ??
        0,
    });

  const [image, setImage] =
    useState(null);

  const [preview, setPreview] =
    useState(
      category?.image || ""
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // CHANGE
  // ==========================================================

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setError("");
  }

  // ==========================================================
  // IMAGE
  // ==========================================================

  function handleImageChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select a valid image."
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image must be smaller than 5MB."
      );

      return;
    }

    setImage(file);

    setPreview(
      URL.createObjectURL(file)
    );

    setError("");
  }

  // ==========================================================
  // RESPONSE PARSER
  // ==========================================================

  async function parseResponse(
    response
  ) {
    const text =
      await response.text();

    if (!text) {
      return {
        success: false,
        message:
          `Empty response. Status: ${response.status}`,
      };
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        success: false,
        message:
          `Invalid response. Status: ${response.status}`,
      };
    }
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError(
        "Category name is required."
      );

      return;
    }

    try {
      setLoading(true);

      const data =
        new FormData();

      data.set(
        "name",
        form.name.trim()
      );

      data.set(
        "description",
        form.description
      );

      data.set(
        "sortOrder",
        String(
          form.sortOrder
        )
      );

      if (image) {
        data.set(
          "image",
          image
        );
      }

      const endpoint =
        editing
          ? `/api/admin/categories/${category._id}`
          : "/api/admin/categories";

      const response =
        await fetch(
          endpoint,
          {
            method:
              editing
                ? "PUT"
                : "POST",

            body: data,
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to save category."
        );
      }

      router.push(
        "/admin/dashboard/categories"
      );

      router.refresh();
    } catch (error) {
      setError(
        error.message ||
          "Unable to save category."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="category-form-page">
      <div className="category-form-header">
        <div>
          <span className="category-eyebrow">
            CATEGORY MANAGEMENT
          </span>

          <h1>
            {editing
              ? "Edit Category"
              : "Add Category"}
          </h1>

          <p>
            {editing
              ? "Update category information."
              : "Create a new food category."}
          </p>
        </div>

        <Link
          href="/admin/dashboard/categories"
          className="category-back-btn"
        >
          <ArrowLeft
            size={17}
          />
          Back
        </Link>
      </div>

      {error && (
        <div className="category-error">
          {error}
        </div>
      )}

      <form
        className="category-form-card"
        onSubmit={
          handleSubmit
        }
      >
        {/* ==================================================
            INFORMATION
        ================================================== */}

        <section className="category-form-section">
          <div className="category-section-heading">
            <div className="category-section-icon">
              <LayoutGrid
                size={19}
              />
            </div>

            <div>
              <h2>
                Category Information
              </h2>

              <p>
                Basic category details.
              </p>
            </div>
          </div>

          <div className="category-form-grid">
            <div className="category-field">
              <label>
                Category Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={
                  handleChange
                }
                placeholder="Burgers"
              />
            </div>

            <div className="category-field">
              <label>
                Sort Order
              </label>

              <input
                type="number"
                min="0"
                name="sortOrder"
                value={
                  form.sortOrder
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="category-field category-field-full">
              <label>
                Description
              </label>

              <textarea
                name="description"
                rows="5"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                placeholder="Category description..."
              />
            </div>
          </div>
        </section>

        {/* ==================================================
            IMAGE
        ================================================== */}

        <section className="category-form-section">
          <div className="category-section-heading">
            <div className="category-section-icon">
              <ImagePlus
                size={19}
              />
            </div>

            <div>
              <h2>
                Category Image
              </h2>

              <p>
                Image shown on customer
                website.
              </p>
            </div>
          </div>

          <div className="category-image-area">
            <div className="category-image-preview">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Category"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);

                      setPreview(
                        category?.image ||
                          ""
                      );
                    }}
                    className="category-image-remove"
                  >
                    <X size={15} />
                  </button>
                </>
              ) : (
                <div className="category-image-empty">
                  <ImagePlus
                    size={31}
                  />

                  <span>
                    Category Image
                  </span>
                </div>
              )}
            </div>

            <div className="category-image-info">
              <h3>
                Upload Image
              </h3>

              <p>
                JPG, PNG or WebP.
                Maximum 5MB.
              </p>

              <label className="category-upload-btn">
                <ImagePlus
                  size={16}
                />

                Choose Image

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={
                    handleImageChange
                  }
                />
              </label>
            </div>
          </div>
        </section>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="category-form-actions">
          <Link
            href="/admin/dashboard/categories"
            className="category-cancel-btn"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="category-save-btn"
            disabled={
              loading
            }
          >
            <Save size={17} />

            {loading
              ? "Saving..."
              : editing
                ? "Update Category"
                : "Create Category"}
          </button>
        </div>
      </form>
    </main>
  );
}