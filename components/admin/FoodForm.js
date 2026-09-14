"use client";

// ============================================================
// CRAVEO - FOOD FORM
// ADD + EDIT
//
// VARIANTS REMOVED
// ============================================================

import {
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ImagePlus,
  Save,
  UtensilsCrossed,
  X,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function FoodForm({
  food = null,
  categories = [],
  branches = [],
}) {
  // ==========================================================
  // EDIT MODE
  // ==========================================================

  const editing =
    Boolean(
      food?._id
    );

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [
    form,
    setForm,
  ] = useState({
    name:
      food?.name ||
      "",

    description:
      food?.description ||
      "",

    categoryId:
      food?.categoryId ||
      "",

    price:
      food?.price ??
      "",

    salePrice:
      food?.salePrice ??
      "",

    stock:
      food?.stock ??
      0,

    isAvailable:
      food?.isAvailable !==
      false,

    isFeatured:
      Boolean(
        food?.isFeatured
      ),

    isPopular:
      Boolean(
        food?.isPopular
      ),

    restaurantIds:
      food?.restaurantIds ||
      [],
  });

  // ==========================================================
  // IMAGE
  // ==========================================================

  const [
    image,
    setImage,
  ] = useState(
    null
  );

  const [
    preview,
    setPreview,
  ] = useState(
    food?.image ||
    ""
  );

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  const [
    error,
    setError,
  ] = useState(
    ""
  );

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  function handleChange(
    event
  ) {
    const {
      name,
      value,
      type,
      checked,
    } =
      event.target;

    setForm(
      (
        previous
      ) => ({
        ...previous,

        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      })
    );

    setError(
      ""
    );
  }

  // ==========================================================
  // BRANCH TOGGLE
  // ==========================================================

  function toggleBranch(
    branchId
  ) {
    setForm(
      (
        previous
      ) => {
        const selected =
          previous.restaurantIds.includes(
            branchId
          );

        return {
          ...previous,

          restaurantIds:
            selected
              ? previous.restaurantIds.filter(
                  (
                    id
                  ) =>
                    id !==
                    branchId
                )
              : [
                  ...previous.restaurantIds,
                  branchId,
                ],
        };
      }
    );
  }

  // ==========================================================
  // IMAGE CHANGE
  // ==========================================================

  function handleImageChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // ========================================================
    // IMAGE TYPE
    // ========================================================

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

    // ========================================================
    // IMAGE SIZE
    // ========================================================

    if (
      file.size >
      5 *
        1024 *
        1024
    ) {
      setError(
        "Image must be smaller than 5MB."
      );

      return;
    }

    // ========================================================
    // SAVE PREVIEW
    // ========================================================

    setImage(
      file
    );

    setPreview(
      URL.createObjectURL(
        file
      )
    );

    setError(
      ""
    );
  }

  // ==========================================================
  // SAFE RESPONSE
  // ==========================================================

  async function parseResponse(
    response
  ) {
    const text =
      await response.text();

    if (!text) {
      return {
        success:
          false,

        message:
          `Empty response. Status: ${response.status}`,
      };
    }

    try {
      return JSON.parse(
        text
      );
    } catch {
      return {
        success:
          false,

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

    setError(
      ""
    );

    // ========================================================
    // FOOD NAME
    // ========================================================

    if (
      !form.name.trim()
    ) {
      setError(
        "Food name is required."
      );

      return;
    }

    // ========================================================
    // CATEGORY
    // ========================================================

    if (
      !form.categoryId
    ) {
      setError(
        "Please select a category."
      );

      return;
    }

    // ========================================================
    // PRICE
    // ========================================================

    if (
      !form.price ||
      Number(
        form.price
      ) <=
        0
    ) {
      setError(
        "Valid food price is required."
      );

      return;
    }

    // ========================================================
    // BRANCH
    // ========================================================

    if (
      form.restaurantIds
        .length ===
      0
    ) {
      setError(
        "Assign food to at least one branch."
      );

      return;
    }

    try {
      setLoading(
        true
      );

      // ======================================================
      // FORM DATA
      // ======================================================

      const data =
        new FormData();

      // ======================================================
      // BASIC INFORMATION
      // ======================================================

      data.set(
        "name",
        form.name.trim()
      );

      data.set(
        "description",
        form.description
      );

      data.set(
        "categoryId",
        form.categoryId
      );

      // ======================================================
      // PRICE
      // ======================================================

      data.set(
        "price",
        String(
          form.price
        )
      );

      data.set(
        "salePrice",
        String(
          form.salePrice ||
            0
        )
      );

      data.set(
        "stock",
        String(
          form.stock ||
            0
        )
      );

      // ======================================================
      // STATUS
      // ======================================================

      data.set(
        "isAvailable",
        String(
          form.isAvailable
        )
      );

      data.set(
        "isFeatured",
        String(
          form.isFeatured
        )
      );

      data.set(
        "isPopular",
        String(
          form.isPopular
        )
      );

      // ======================================================
      // BRANCHES
      // ======================================================

      form.restaurantIds.forEach(
        (
          branchId
        ) => {
          data.append(
            "restaurantIds",
            branchId
          );
        }
      );

      // ======================================================
      // VARIANTS REMOVED
      //
      // Send empty variants array so existing backend remains
      // compatible and old variants are removed when editing.
      // ======================================================

      data.set(
        "variants",
        "[]"
      );

      // ======================================================
      // IMAGE
      // ======================================================

      if (
        image
      ) {
        data.set(
          "image",
          image
        );
      }

      // ======================================================
      // ENDPOINT
      // ======================================================

      const endpoint =
        editing
          ? `/api/admin/foods/${food._id}`
          : "/api/admin/foods";

      // ======================================================
      // REQUEST
      // ======================================================

      const response =
        await fetch(
          endpoint,
          {
            method:
              editing
                ? "PUT"
                : "POST",

            body:
              data,
          }
        );

      // ======================================================
      // RESPONSE
      // ======================================================

      const result =
        await parseResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to save food."
        );
      }

      // ======================================================
      // SUCCESS REDIRECT
      // ======================================================

      window.location.replace(
        "/admin/dashboard/foods"
      );
    } catch (
      error
    ) {
      console.error(
        "FOOD SAVE ERROR:",
        error
      );

      setError(
        error?.message ||
          "Unable to save food."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="food-form-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="food-form-header">
        <div>
          <span className="food-eyebrow">
            FOOD MANAGEMENT
          </span>

          <h1>
            {editing
              ? "Edit Food"
              : "Add Food"}
          </h1>

          <p>
            {editing
              ? "Update menu item information."
              : "Create a new CRAVEO food item."}
          </p>
        </div>

        <Link
          href="/admin/dashboard/foods"
          className="food-back-btn"
        >
          <ArrowLeft
            size={17}
          />

          Back
        </Link>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="food-form-error">
          {error}
        </div>
      )}

      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        className="food-form-card"
        onSubmit={
          handleSubmit
        }
      >
        {/* ====================================================
            FOOD INFORMATION
        ==================================================== */}

        <section className="food-form-section">
          <div className="food-section-heading">
            <div className="food-section-icon">
              <UtensilsCrossed
                size={19}
              />
            </div>

            <div>
              <h2>
                Food Information
              </h2>

              <p>
                Main menu item details.
              </p>
            </div>
          </div>

          <div className="food-form-grid">
            {/* =================================================
                NAME
            ================================================= */}

            <div className="food-field">
              <label>
                Food Name *
              </label>

              <input
                name="name"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
                placeholder="Zinger Burger"
              />
            </div>

            {/* =================================================
                CATEGORY
            ================================================= */}

            <div className="food-field">
              <label>
                Category *
              </label>

              <select
                name="categoryId"
                value={
                  form.categoryId
                }
                onChange={
                  handleChange
                }
              >
                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (
                    category
                  ) => (
                    <option
                      key={
                        category._id
                      }
                      value={
                        category._id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="food-field food-field-full">
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
                placeholder="Food description..."
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            IMAGE
        ==================================================== */}

        <section className="food-form-section">
          <div className="food-section-heading">
            <div className="food-section-icon">
              <ImagePlus
                size={19}
              />
            </div>

            <div>
              <h2>
                Food Image
              </h2>

              <p>
                Upload menu item image.
              </p>
            </div>
          </div>

          <div className="food-image-area">
            {/* =================================================
                IMAGE PREVIEW
            ================================================= */}

            <div className="food-image-preview">
              {preview ? (
                <>
                  <img
                    src={
                      preview
                    }
                    alt="Food"
                  />

                  <button
                    type="button"
                    className="food-image-remove"
                    onClick={() => {
                      setImage(
                        null
                      );

                      setPreview(
                        food?.image ||
                          ""
                      );
                    }}
                  >
                    <X
                      size={15}
                    />
                  </button>
                </>
              ) : (
                <div className="food-image-empty">
                  <ImagePlus
                    size={34}
                  />

                  <span>
                    Food Image
                  </span>
                </div>
              )}
            </div>

            {/* =================================================
                UPLOAD
            ================================================= */}

            <div className="food-image-info">
              <h3>
                Menu Photo
              </h3>

              <p>
                JPG, PNG or WebP.
                Maximum 5MB.
              </p>

              <label className="food-upload-btn">
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

        {/* ====================================================
            PRICING + STOCK
        ==================================================== */}

        <section className="food-form-section">
          <div className="food-section-heading">
            <div className="food-section-icon">
              <UtensilsCrossed
                size={19}
              />
            </div>

            <div>
              <h2>
                Pricing & Stock
              </h2>

              <p>
                Manage prices and inventory.
              </p>
            </div>
          </div>

          <div className="food-form-grid food-form-grid-3">
            {/* =================================================
                REGULAR PRICE
            ================================================= */}

            <div className="food-field">
              <label>
                Regular Price *
              </label>

              <input
                type="number"
                min="0"
                name="price"
                value={
                  form.price
                }
                onChange={
                  handleChange
                }
                placeholder="500"
              />
            </div>

            {/* =================================================
                SALE PRICE
            ================================================= */}

            <div className="food-field">
              <label>
                Sale Price
              </label>

              <input
                type="number"
                min="0"
                name="salePrice"
                value={
                  form.salePrice
                }
                onChange={
                  handleChange
                }
                placeholder="450"
              />
            </div>

            {/* =================================================
                STOCK
            ================================================= */}

            <div className="food-field">
              <label>
                Stock
              </label>

              <input
                type="number"
                min="0"
                name="stock"
                value={
                  form.stock
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            ASSIGN BRANCHES
        ==================================================== */}

        <section className="food-form-section">
          <div className="food-section-heading">
            <div className="food-section-icon">
              <UtensilsCrossed
                size={19}
              />
            </div>

            <div>
              <h2>
                Assign Branches
              </h2>

              <p>
                Select branches where this food is available.
              </p>
            </div>
          </div>

          {branches.length >
          0 ? (
            <div className="food-branch-grid">
              {branches.map(
                (
                  branch
                ) => {
                  const checked =
                    form.restaurantIds.includes(
                      branch._id
                    );

                  return (
                    <label
                      className={`food-branch-option ${
                        checked
                          ? "selected"
                          : ""
                      }`}
                      key={
                        branch._id
                      }
                    >
                      <input
                        type="checkbox"
                        checked={
                          checked
                        }
                        onChange={() =>
                          toggleBranch(
                            branch._id
                          )
                        }
                      />

                      <div>
                        <strong>
                          {
                            branch.name
                          }
                        </strong>

                        <span>
                          {branch.area
                            ? `${branch.area}, ${branch.city}`
                            : branch.city}
                        </span>
                      </div>
                    </label>
                  );
                }
              )}
            </div>
          ) : (
            <div className="food-no-branches">
              No branches found.
              Create a branch first.
            </div>
          )}
        </section>

        {/* ====================================================
            FOOD STATUS
        ==================================================== */}

        <section className="food-form-section">
          <div className="food-section-heading">
            <div className="food-section-icon">
              <UtensilsCrossed
                size={19}
              />
            </div>

            <div>
              <h2>
                Food Status
              </h2>

              <p>
                Control visibility and promotion.
              </p>
            </div>
          </div>

          <div className="food-checkbox-grid">
            {/* =================================================
                AVAILABLE
            ================================================= */}

            <label className="food-checkbox-row">
              <input
                type="checkbox"
                name="isAvailable"
                checked={
                  form.isAvailable
                }
                onChange={
                  handleChange
                }
              />

              <div>
                <strong>
                  Available
                </strong>

                <span>
                  Customers can order this food.
                </span>
              </div>
            </label>

            {/* =================================================
                FEATURED
            ================================================= */}

            <label className="food-checkbox-row">
              <input
                type="checkbox"
                name="isFeatured"
                checked={
                  form.isFeatured
                }
                onChange={
                  handleChange
                }
              />

              <div>
                <strong>
                  Featured
                </strong>

                <span>
                  Highlight on website.
                </span>
              </div>
            </label>

            {/* =================================================
                POPULAR
            ================================================= */}

            <label className="food-checkbox-row">
              <input
                type="checkbox"
                name="isPopular"
                checked={
                  form.isPopular
                }
                onChange={
                  handleChange
                }
              />

              <div>
                <strong>
                  Popular
                </strong>

                <span>
                  Show in popular foods.
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="food-form-actions">
          <Link
            href="/admin/dashboard/foods"
            className="food-cancel-btn"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="food-save-btn"
            disabled={
              loading
            }
          >
            <Save
              size={17}
            />

            {loading
              ? "Saving..."
              : editing
                ? "Update Food"
                : "Create Food"}
          </button>
        </div>
      </form>
    </main>
  );
}