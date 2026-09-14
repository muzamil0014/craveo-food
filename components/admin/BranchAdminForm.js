"use client";

// ============================================================
// CRAVEO - BRANCH ADMIN FORM
// ============================================================

import Link from "next/link";

import {
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
  ShieldCheck,
  UserCog,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function BranchAdminForm({
  admin = null,
  branches = [],
}) {
  const editing =
    Boolean(admin?._id);

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [form, setForm] =
    useState({
      name:
        admin?.name || "",

      email:
        admin?.email || "",

      phone:
        admin?.phone || "",

      password: "",

      restaurantId:
        admin?.restaurantId ||
        "",

      isActive:
        admin?.isActive !==
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

    try {
      setError("");

      if (!form.name.trim()) {
        throw new Error(
          "Admin name is required."
        );
      }

      if (!form.email.trim()) {
        throw new Error(
          "Email is required."
        );
      }

      if (!form.restaurantId) {
        throw new Error(
          "Please assign a branch."
        );
      }

      if (
        !editing &&
        form.password.length < 8
      ) {
        throw new Error(
          "Password must contain at least 8 characters."
        );
      }

      if (
        editing &&
        form.password &&
        form.password.length < 8
      ) {
        throw new Error(
          "New password must contain at least 8 characters."
        );
      }

      setLoading(true);

      const endpoint =
        editing
          ? `/api/admin/branch-admins/${admin._id}`
          : "/api/admin/branch-admins";

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

                name:
                  form.name.trim(),

                email:
                  form.email
                    .trim()
                    .toLowerCase(),

                phone:
                  form.phone.trim(),
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
            "Unable to save Branch Admin."
        );
      }

      window.location.replace(
        "/admin/dashboard/branch-admins"
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to save Branch Admin."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="branch-admin-form-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="branch-admin-form-header">
        <div>
          <span className="branch-admin-eyebrow">
            ADMINISTRATION
          </span>

          <h1>
            {editing
              ? "Edit Branch Admin"
              : "Add Branch Admin"}
          </h1>

          <p>
            Create secure Branch Admin
            access and assign one CRAVEO
            branch.
          </p>
        </div>

        <Link
          href="/admin/dashboard/branch-admins"
          className="branch-admin-back-btn"
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
        <div className="branch-admin-form-error">
          {error}
        </div>
      )}

      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        className="branch-admin-form-card"
        onSubmit={
          handleSubmit
        }
      >
        {/* ==================================================
            ACCOUNT INFORMATION
        ================================================== */}

        <section className="branch-admin-form-section">
          <div className="branch-admin-section-heading">
            <div className="branch-admin-section-icon">
              <UserCog
                size={20}
              />
            </div>

            <div>
              <span>
                ACCOUNT
              </span>

              <h2>
                Admin Information
              </h2>

              <p>
                Branch Admin login
                credentials.
              </p>
            </div>
          </div>

          <div className="branch-admin-form-grid">
            <div className="branch-admin-field">
              <label>
                Full Name *
              </label>

              <input
                type="text"
                name="name"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
                placeholder="Branch Admin Name"
              />
            </div>

            <div className="branch-admin-field">
              <label>
                Email Address *
              </label>

              <input
                type="email"
                name="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                placeholder="branch@craveo.com"
              />
            </div>

            <div className="branch-admin-field">
              <label>
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                placeholder="+92..."
              />
            </div>

            <div className="branch-admin-field">
              <label>
                {editing
                  ? "New Password"
                  : "Password *"}
              </label>

              <input
                type="password"
                name="password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                placeholder={
                  editing
                    ? "Leave blank to keep current password"
                    : "Minimum 8 characters"
                }
              />
            </div>
          </div>
        </section>

        {/* ==================================================
            ASSIGNED BRANCH
        ================================================== */}

        <section className="branch-admin-form-section">
          <div className="branch-admin-section-heading">
            <div className="branch-admin-section-icon">
              <ShieldCheck
                size={20}
              />
            </div>

            <div>
              <span>
                ACCESS
              </span>

              <h2>
                Assigned Branch
              </h2>

              <p>
                Branch Admin will only
                access this restaurant.
              </p>
            </div>
          </div>

          <div className="branch-admin-field">
            <label>
              CRAVEO Branch *
            </label>

            <select
              name="restaurantId"
              value={
                form.restaurantId
              }
              onChange={
                handleChange
              }
            >
              <option value="">
                Select Branch
              </option>

              {branches.map(
                (branch) => (
                  <option
                    key={
                      branch._id
                    }
                    value={
                      branch._id
                    }
                  >
                    {branch.name}
                    {" — "}
                    {branch.city}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="branch-admin-security-note">
            <ShieldCheck
              size={18}
            />

            <div>
              <strong>
                Branch Restricted Access
              </strong>

              <span>
                This administrator will
                only be allowed to access
                data belonging to the
                selected branch.
              </span>
            </div>
          </div>
        </section>

        {/* ==================================================
            STATUS
        ================================================== */}

        <section className="branch-admin-form-section">
          <label className="branch-admin-active-box">
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
                Active Account
              </strong>

              <span>
                Branch Admin can sign in
                while this account is
                active.
              </span>
            </div>
          </label>
        </section>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="branch-admin-form-actions">
          <Link
            href="/admin/dashboard/branch-admins"
            className="branch-admin-cancel-btn"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="branch-admin-save-btn"
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
                ? "Update Branch Admin"
                : "Create Branch Admin"}
          </button>
        </div>
      </form>
    </main>
  );
}