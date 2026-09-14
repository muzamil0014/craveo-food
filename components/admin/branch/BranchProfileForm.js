"use client";

// ============================================================
// CRAVEO - BRANCH PROFILE FORM
// ============================================================

import {
  useState,
} from "react";

import {
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function BranchProfileForm({
  admin,
}) {
  const [form, setForm] =
    useState({
      name:
        admin?.name || "",

      phone:
        admin?.phone || "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
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
    setSuccess("");
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!form.name.trim()) {
        throw new Error(
          "Name is required."
        );
      }

      const response =
        await fetch(
          "/api/admin/branch/profile",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  form.name.trim(),

                phone:
                  form.phone.trim(),
              }),
          }
        );

      const text =
        await response.text();

      const result =
        text
          ? JSON.parse(text)
          : {};

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
          "Unable to update profile."
        );
      }

      setSuccess(
        "Profile updated successfully."
      );
    } catch (error) {
      setError(
        error.message ||
        "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="branch-profile-card">
      <div className="branch-profile-card-heading">
        <div className="branch-profile-heading-icon">
          <UserRound
            size={20}
          />
        </div>

        <div>
          <span>
            PROFILE
          </span>

          <h2>
            Personal Information
          </h2>

          <p>
            Manage your Branch Admin
            profile information.
          </p>
        </div>
      </div>

      {error && (
        <div className="branch-profile-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="branch-profile-message success">
          {success}
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="branch-profile-form"
      >
        <div className="branch-profile-field">
          <label>
            Full Name
          </label>

          <div className="branch-profile-input">
            <UserRound
              size={17}
            />

            <input
              type="text"
              name="name"
              value={
                form.name
              }
              onChange={
                handleChange
              }
            />
          </div>
        </div>

        <div className="branch-profile-field">
          <label>
            Email Address
          </label>

          <div className="branch-profile-readonly">
            <Mail
              size={17}
            />

            {admin.email}
          </div>
        </div>

        <div className="branch-profile-field">
          <label>
            Phone
          </label>

          <div className="branch-profile-input">
            <Phone
              size={17}
            />

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
        </div>

        <div className="branch-profile-field">
          <label>
            Role
          </label>

          <div className="branch-profile-readonly">
            <ShieldCheck
              size={17}
            />

            Branch Admin
          </div>
        </div>

        <div className="branch-profile-actions">
          <button
            type="submit"
            disabled={
              loading
            }
          >
            <Save
              size={16}
            />

            {loading
              ? "Saving..."
              : "Save Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}