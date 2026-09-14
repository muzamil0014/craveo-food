"use client";

// ============================================================
// CRAVEO - BRANCH FORM
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Crown,
  ImagePlus,
  Save,
  Store,
  X,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function BranchForm({
  branch = null,
}) {
  const router =
    useRouter();

  const editing =
    Boolean(branch?._id);

  // ==========================================================
  // STATE
  // ==========================================================

  const [form, setForm] =
    useState({
      name:
        branch?.name || "",

      description:
        branch?.description || "",

      branchType:
        branch?.branchType ||
        "normal",

      phone:
        branch?.phone || "",

      email:
        branch?.email || "",

      address:
        branch?.address || "",

      city:
        branch?.city ||
        "Karachi",

      area:
        branch?.area || "",

      openingTime:
        branch?.openingTime ||
        "11:00",

      closingTime:
        branch?.closingTime ||
        "23:00",

      deliveryTime:
        branch?.deliveryTime ||
        "30-45 min",

      deliveryFee:
        branch?.deliveryFee ??
        0,

      minimumOrder:
        branch?.minimumOrder ??
        0,

      isFeatured:
        Boolean(
          branch?.isFeatured
        ),
    });

  const [image, setImage] =
    useState(null);

  const [preview, setPreview] =
    useState(
      branch?.image || ""
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
      type,
      checked,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value,
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
        success: false,

        message:
          `Empty server response. Status: ${response.status}`,
      };
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        success: false,

        message:
          `Invalid server response. Status: ${response.status}`,
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
        "Branch name is required."
      );

      return;
    }

    if (!form.city.trim()) {
      setError(
        "City is required."
      );

      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Phone is required."
      );

      return;
    }

    if (!form.address.trim()) {
      setError(
        "Address is required."
      );

      return;
    }

    try {
      setLoading(true);

      const data =
        new FormData();

      // ------------------------------------------------------
      // IMPORTANT BRANCH TYPE
      // ------------------------------------------------------

      data.set(
        "branchType",
        form.branchType
      );

      // ------------------------------------------------------
      // OTHER VALUES
      // ------------------------------------------------------

      data.set(
        "name",
        form.name.trim()
      );

      data.set(
        "description",
        form.description
      );

      data.set(
        "phone",
        form.phone.trim()
      );

      data.set(
        "email",
        form.email.trim()
      );

      data.set(
        "address",
        form.address.trim()
      );

      data.set(
        "city",
        form.city.trim()
      );

      data.set(
        "area",
        form.area.trim()
      );

      data.set(
        "openingTime",
        form.openingTime
      );

      data.set(
        "closingTime",
        form.closingTime
      );

      data.set(
        "deliveryTime",
        form.deliveryTime
      );

      data.set(
        "deliveryFee",
        String(
          form.deliveryFee
        )
      );

      data.set(
        "minimumOrder",
        String(
          form.minimumOrder
        )
      );

      data.set(
        "isFeatured",
        String(
          form.isFeatured
        )
      );

      if (image) {
        data.set(
          "image",
          image
        );
      }

      // ======================================================
      // DEBUG
      // Browser console mein selected value nazar aayegi.
      // ======================================================

      console.log(
        "Sending branch type:",
        data.get("branchType")
      );

      // ------------------------------------------------------
      // ENDPOINT
      // ------------------------------------------------------

      const endpoint =
        editing
          ? `/api/admin/branches/${branch._id}`
          : "/api/admin/branches";

      // ------------------------------------------------------
      // REQUEST
      // ------------------------------------------------------

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

      console.log(
        "Branch API result:",
        result
      );

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to save branch."
        );
      }

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      router.push(
        "/admin/dashboard/branches"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "BRANCH SAVE ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to save branch."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="branch-form-page">
      <div className="branch-form-header">
        <div>
          <span className="branch-page-eyebrow">
            BRANCH MANAGEMENT
          </span>

          <h1>
            {editing
              ? "Edit Branch"
              : "Add Branch"}
          </h1>

          <p>
            {editing
              ? `Update ${branch?.name || "branch"} information.`
              : "Create a new CRAVEO branch."}
          </p>
        </div>

        <Link
          href="/admin/dashboard/branches"
          className="branch-back-btn"
        >
          <ArrowLeft size={17} />
          Back
        </Link>
      </div>

      {error && (
        <div className="branch-form-error">
          {error}
        </div>
      )}

      <form
        className="branch-form-card"
        onSubmit={handleSubmit}
      >
        {/* ==================================================
            BRANCH INFORMATION
        ================================================== */}

        <div className="branch-form-section">
          <div className="branch-form-section-heading">
            <div className="branch-section-icon">
              <Store size={19} />
            </div>

            <div>
              <h2>
                Branch Information
              </h2>

              <p>
                Basic CRAVEO branch
                information.
              </p>
            </div>
          </div>

          <div className="branch-form-grid">
            <div className="branch-field branch-field-full">
              <label>
                Branch Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="branch-field branch-field-full">
              <label>
                Description
              </label>

              <textarea
                name="description"
                rows="4"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>
        </div>

        {/* ==================================================
            BRANCH TYPE
        ================================================== */}

        <div className="branch-form-section">
          <div className="branch-form-section-heading">
            <div className="branch-section-icon">
              <Crown size={19} />
            </div>

            <div>
              <h2>
                Branch Type
              </h2>

              <p>
                Select branch hierarchy.
              </p>
            </div>
          </div>

          <div className="branch-field">
            <label>
              Branch Type *
            </label>

            <select
              name="branchType"
              value={
                form.branchType
              }
              onChange={
                handleChange
              }
              required
            >
              <option value="super">
                Super Branch
              </option>

              <option value="city-main">
                City Main Branch
              </option>

              <option value="normal">
                Normal Branch
              </option>
            </select>
          </div>

          <div className="branch-type-rules">
            <p>
              <strong>
                Super Branch:
              </strong>{" "}
              poore system mein sirf
              1.
            </p>

            <p>
              <strong>
                City Main Branch:
              </strong>{" "}
              har city mein sirf 1.
            </p>

            <p>
              <strong>
                Normal Branch:
              </strong>{" "}
              unlimited.
            </p>
          </div>
        </div>

        {/* ==================================================
            IMAGE
        ================================================== */}

        <div className="branch-form-section">
          <div className="branch-form-section-heading">
            <div className="branch-section-icon">
              <ImagePlus
                size={19}
              />
            </div>

            <div>
              <h2>
                Branch Image
              </h2>

              <p>
                Upload branch photo.
              </p>
            </div>
          </div>

          <div className="branch-image-section">
            <div className="branch-image-preview">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Branch preview"
                  />

                  <button
                    type="button"
                    className="branch-image-remove"
                    onClick={() => {
                      setImage(null);

                      setPreview(
                        branch?.image ||
                          ""
                      );
                    }}
                  >
                    <X size={15} />
                  </button>
                </>
              ) : (
                <div className="branch-image-empty">
                  <Store size={35} />
                  Branch Image
                </div>
              )}
            </div>

            <div className="branch-image-info">
              <h3>
                Branch Photo
              </h3>

              <p>
                Maximum image size
                5MB.
              </p>

              <label className="branch-upload-btn">
                <ImagePlus
                  size={17}
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
        </div>

        {/* ==================================================
            CONTACT
        ================================================== */}

        <div className="branch-form-section">
          <div className="branch-form-section-heading">
            <div className="branch-section-icon">
              <Store size={19} />
            </div>

            <div>
              <h2>
                Contact & Location
              </h2>

              <p>
                Branch location details.
              </p>
            </div>
          </div>

          <div className="branch-form-grid">
            <div className="branch-field">
              <label>
                Phone *
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="branch-field">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="branch-field">
              <label>
                City *
              </label>

              <input
                name="city"
                value={form.city}
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="branch-field">
              <label>Area</label>

              <input
                name="area"
                value={form.area}
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="branch-field branch-field-full">
              <label>
                Address *
              </label>

              <input
                name="address"
                value={form.address}
                onChange={
                  handleChange
                }
                required
              />
            </div>
          </div>
        </div>

        {/* ==================================================
            OPERATIONS
        ================================================== */}

        <div className="branch-form-section">
          <div className="branch-form-section-heading">
            <div className="branch-section-icon">
              <Store size={19} />
            </div>

            <div>
              <h2>
                Branch Operations
              </h2>

              <p>
                Delivery and timing
                settings.
              </p>
            </div>
          </div>

          <div className="branch-form-grid branch-form-grid-3">
            <div className="branch-field">
              <label>
                Opening Time
              </label>

              <input
                type="time"
                name="openingTime"
                value={
                  form.openingTime
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="branch-field">
              <label>
                Closing Time
              </label>

              <input
                type="time"
                name="closingTime"
                value={
                  form.closingTime
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="branch-field">
              <label>
                Delivery Time
              </label>

              <input
                name="deliveryTime"
                value={
                  form.deliveryTime
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="branch-field">
              <label>
                Delivery Fee
              </label>

              <input
                type="number"
                min="0"
                name="deliveryFee"
                value={
                  form.deliveryFee
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="branch-field">
              <label>
                Minimum Order
              </label>

              <input
                type="number"
                min="0"
                name="minimumOrder"
                value={
                  form.minimumOrder
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>

          <label className="branch-checkbox-row">
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
                Featured Branch
              </strong>

              <span>
                Show this branch as
                featured.
              </span>
            </div>
          </label>
        </div>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="branch-form-actions">
          <Link
            href="/admin/dashboard/branches"
            className="branch-cancel-btn"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="branch-save-btn"
            disabled={loading}
          >
            <Save size={17} />

            {loading
              ? "Saving..."
              : editing
                ? "Update Branch"
                : "Create Branch"}
          </button>
        </div>
      </form>
    </div>
  );
}