"use client";

// ============================================================
// CRAVEO - SUPER ADMIN PROFILE FORM
// ============================================================

import { useState } from "react";

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

export default function SuperAdminProfileForm({
  admin,
}) {
  const [form, setForm] =
    useState({
      name:
        admin?.name || "",

      email:
        admin?.email || "",

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
          "Invalid server response.",
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
      setLoading(true);

      setError("");
      setSuccess("");

      if (!form.name.trim()) {
        throw new Error(
          "Name is required."
        );
      }

      if (!form.email.trim()) {
        throw new Error(
          "Email is required."
        );
      }

      const response =
        await fetch(
          "/api/admin/profile",
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
    <section className="super-profile-card">
      <div className="super-profile-card-heading">
        <div className="super-profile-heading-icon">
          <UserRound size={20} />
        </div>

        <div>
          <span>
            PROFILE INFORMATION
          </span>

          <h2>
            Personal Details
          </h2>

          <p>
            Manage your Super Admin
            identity and contact details.
          </p>
        </div>
      </div>

      {error && (
        <div className="super-profile-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="super-profile-message success">
          {success}
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="super-profile-form"
      >
        <div className="super-profile-field">
          <label>
            Full Name
          </label>

          <div className="super-profile-input">
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

        <div className="super-profile-field">
          <label>
            Email Address
          </label>

          <div className="super-profile-input">
            <Mail
              size={17}
            />

            <input
              type="email"
              name="email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
            />
          </div>
        </div>

        <div className="super-profile-field">
          <label>
            Phone
          </label>

          <div className="super-profile-input">
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

        <div className="super-profile-field">
          <label>
            Role
          </label>

          <div className="super-profile-readonly">
            <ShieldCheck
              size={17}
            />

            Super Admin
          </div>
        </div>

        <div className="super-profile-actions">
          <button
            type="submit"
            disabled={
              loading
            }
          >
            <Save size={16} />

            {loading
              ? "Saving..."
              : "Save Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}