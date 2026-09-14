"use client";

// ============================================================
// CRAVEO - COUPON FORM
// ============================================================

import Link from "next/link";
import { useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  Save,
  TicketPercent,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function CouponForm({
  coupon = null,
  branches = [],
}) {
  const editing =
    Boolean(coupon?._id);

  // ==========================================================
  // STATE
  // ==========================================================

  const [form, setForm] =
    useState({
      code:
        coupon?.code || "",

      title:
        coupon?.title || "",

      description:
        coupon?.description ||
        "",

      discountType:
        coupon?.discountType ||
        "percentage",

      discountValue:
        coupon?.discountValue ??
        "",

      minimumOrder:
        coupon?.minimumOrder ??
        0,

      maximumDiscount:
        coupon?.maximumDiscount ??
        0,

      usageLimit:
        coupon?.usageLimit ??
        0,

      perUserLimit:
        coupon?.perUserLimit ??
        1,

      startDate:
        coupon?.startDate || "",

      expiryDate:
        coupon?.expiryDate || "",

      restaurantIds:
        coupon?.restaurantIds ||
        [],

      isActive:
        coupon?.isActive !==
        false,
    });

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
  // BRANCH TOGGLE
  // ==========================================================

  function toggleBranch(
    branchId
  ) {
    setForm(
      (previous) => {
        const selected =
          previous.restaurantIds.includes(
            branchId
          );

        return {
          ...previous,

          restaurantIds:
            selected
              ? previous.restaurantIds.filter(
                  (id) =>
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

    if (!form.code.trim()) {
      setError(
        "Coupon code is required."
      );

      return;
    }

    if (!form.title.trim()) {
      setError(
        "Coupon title is required."
      );

      return;
    }

    if (
      !form.discountValue ||
      Number(
        form.discountValue
      ) <= 0
    ) {
      setError(
        "Valid discount value is required."
      );

      return;
    }

    if (
      form.discountType ===
        "percentage" &&
      Number(
        form.discountValue
      ) > 100
    ) {
      setError(
        "Percentage cannot exceed 100%."
      );

      return;
    }

    if (
      !form.startDate ||
      !form.expiryDate
    ) {
      setError(
        "Start and expiry dates are required."
      );

      return;
    }

    if (
      new Date(
        form.expiryDate
      ) <=
      new Date(
        form.startDate
      )
    ) {
      setError(
        "Expiry date must be after start date."
      );

      return;
    }

    try {
      setLoading(true);

      const endpoint =
        editing
          ? `/api/admin/coupons/${coupon._id}`
          : "/api/admin/coupons";

      const response =
        await fetch(
          endpoint,
          {
            method:
              editing
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                ...form,

                code:
                  form.code
                    .trim()
                    .toUpperCase(),

                title:
                  form.title.trim(),
              }),
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
            "Unable to save coupon."
        );
      }

      window.location.replace(
        "/admin/dashboard/coupons"
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to save coupon."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="coupon-form-page">
      <div className="coupon-form-header">
        <div>
          <span className="coupon-eyebrow">
            COUPON MANAGEMENT
          </span>

          <h1>
            {editing
              ? "Edit Coupon"
              : "Add Coupon"}
          </h1>

          <p>
            Configure discount rules,
            usage limits and validity.
          </p>
        </div>

        <Link
          href="/admin/dashboard/coupons"
          className="coupon-back-btn"
        >
          <ArrowLeft
            size={17}
          />
          Back
        </Link>
      </div>

      {error && (
        <div className="coupon-form-error">
          {error}
        </div>
      )}

      <form
        className="coupon-form-card"
        onSubmit={
          handleSubmit
        }
      >
        {/* ==================================================
            BASIC
        ================================================== */}

        <section className="coupon-form-section">
          <div className="coupon-section-heading">
            <div className="coupon-section-icon">
              <TicketPercent
                size={19}
              />
            </div>

            <div>
              <h2>
                Coupon Information
              </h2>

              <p>
                Basic coupon details.
              </p>
            </div>
          </div>

          <div className="coupon-form-grid">
            <div className="coupon-field">
              <label>
                Coupon Code *
              </label>

              <input
                name="code"
                value={form.code}
                onChange={
                  handleChange
                }
                placeholder="CRAVEO20"
              />
            </div>

            <div className="coupon-field">
              <label>
                Coupon Title *
              </label>

              <input
                name="title"
                value={
                  form.title
                }
                onChange={
                  handleChange
                }
                placeholder="20% OFF"
              />
            </div>

            <div className="coupon-field coupon-field-full">
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
                placeholder="Coupon description..."
              />
            </div>
          </div>
        </section>

        {/* ==================================================
            DISCOUNT
        ================================================== */}

        <section className="coupon-form-section">
          <div className="coupon-section-heading">
            <div className="coupon-section-icon">
              <TicketPercent
                size={19}
              />
            </div>

            <div>
              <h2>
                Discount Rules
              </h2>

              <p>
                Configure coupon value
                and order requirements.
              </p>
            </div>
          </div>

          <div className="coupon-form-grid coupon-form-grid-3">
            <div className="coupon-field">
              <label>
                Discount Type
              </label>

              <select
                name="discountType"
                value={
                  form.discountType
                }
                onChange={
                  handleChange
                }
              >
                <option value="percentage">
                  Percentage
                </option>

                <option value="fixed">
                  Fixed Amount
                </option>
              </select>
            </div>

            <div className="coupon-field">
              <label>
                Discount Value *
              </label>

              <input
                type="number"
                min="0"
                name="discountValue"
                value={
                  form.discountValue
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="coupon-field">
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

            <div className="coupon-field">
              <label>
                Maximum Discount
              </label>

              <input
                type="number"
                min="0"
                name="maximumDiscount"
                value={
                  form.maximumDiscount
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="coupon-field">
              <label>
                Total Usage Limit
              </label>

              <input
                type="number"
                min="0"
                name="usageLimit"
                value={
                  form.usageLimit
                }
                onChange={
                  handleChange
                }
              />

              <small>
                0 = unlimited
              </small>
            </div>

            <div className="coupon-field">
              <label>
                Per User Limit
              </label>

              <input
                type="number"
                min="1"
                name="perUserLimit"
                value={
                  form.perUserLimit
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>
        </section>

        {/* ==================================================
            DATES
        ================================================== */}

        <section className="coupon-form-section">
          <div className="coupon-section-heading">
            <div className="coupon-section-icon">
              <CalendarDays
                size={19}
              />
            </div>

            <div>
              <h2>
                Validity
              </h2>

              <p>
                Set coupon start and
                expiry dates.
              </p>
            </div>
          </div>

          <div className="coupon-form-grid">
            <div className="coupon-field">
              <label>
                Start Date *
              </label>

              <input
                type="datetime-local"
                name="startDate"
                value={
                  form.startDate
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="coupon-field">
              <label>
                Expiry Date *
              </label>

              <input
                type="datetime-local"
                name="expiryDate"
                value={
                  form.expiryDate
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>
        </section>

        {/* ==================================================
            BRANCHES
        ================================================== */}

        <section className="coupon-form-section">
          <div className="coupon-section-heading">
            <div className="coupon-section-icon">
              <TicketPercent
                size={19}
              />
            </div>

            <div>
              <h2>
                Branch Availability
              </h2>

              <p>
                Leave all unchecked to
                allow coupon at every
                branch.
              </p>
            </div>
          </div>

          <div className="coupon-branch-grid">
            {branches.map(
              (branch) => {
                const selected =
                  form.restaurantIds.includes(
                    branch._id
                  );

                return (
                  <label
                    key={
                      branch._id
                    }
                    className={`coupon-branch-item ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        selected
                      }
                      onChange={() =>
                        toggleBranch(
                          branch._id
                        )
                      }
                    />

                    <div>
                      <strong>
                        {branch.name}
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
        </section>

        {/* ==================================================
            STATUS
        ================================================== */}

        <section className="coupon-form-section">
          <label className="coupon-active-box">
            <input
              type="checkbox"
              name="isActive"
              checked={
                form.isActive
              }
              onChange={
                handleChange
              }
            />

            <div>
              <strong>
                Active Coupon
              </strong>

              <span>
                Customers can use this
                coupon while all other
                validation rules pass.
              </span>
            </div>
          </label>
        </section>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="coupon-form-actions">
          <Link
            href="/admin/dashboard/coupons"
            className="coupon-cancel-btn"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="coupon-save-btn"
            disabled={
              loading
            }
          >
            <Save size={17} />

            {loading
              ? "Saving..."
              : editing
                ? "Update Coupon"
                : "Create Coupon"}
          </button>
        </div>
      </form>
    </main>
  );
}