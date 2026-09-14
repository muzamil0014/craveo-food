"use client";

// ============================================================
// CRAVEO - BRANCH ADMIN CHANGE PASSWORD
// ============================================================

import {
  useState,
} from "react";

import {
  KeyRound,
  LockKeyhole,
  Save,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function BranchChangePasswordForm() {
  const [form, setForm] =
    useState({
      currentPassword:
        "",

      newPassword:
        "",

      confirmPassword:
        "",
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

      if (
        !form.currentPassword ||
        !form.newPassword ||
        !form.confirmPassword
      ) {
        throw new Error(
          "All password fields are required."
        );
      }

      if (
        form.newPassword.length <
        8
      ) {
        throw new Error(
          "New password must contain at least 8 characters."
        );
      }

      if (
        form.newPassword !==
        form.confirmPassword
      ) {
        throw new Error(
          "New passwords do not match."
        );
      }

      const response =
        await fetch(
          "/api/admin/branch/profile/password",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                form
              ),
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
          "Unable to change password."
        );
      }

      setSuccess(
        "Password changed successfully."
      );

      setForm({
        currentPassword:
          "",

        newPassword:
          "",

        confirmPassword:
          "",
      });
    } catch (error) {
      setError(
        error.message ||
        "Unable to change password."
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
        <div className="branch-profile-heading-icon danger">
          <KeyRound
            size={20}
          />
        </div>

        <div>
          <span>
            SECURITY
          </span>

          <h2>
            Change Password
          </h2>

          <p>
            Update your Branch Admin
            login password.
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
        className="branch-password-form"
      >
        <div className="branch-profile-field">
          <label>
            Current Password
          </label>

          <div className="branch-profile-input">
            <LockKeyhole
              size={17}
            />

            <input
              type="password"
              name="currentPassword"
              value={
                form.currentPassword
              }
              onChange={
                handleChange
              }
            />
          </div>
        </div>

        <div className="branch-profile-field">
          <label>
            New Password
          </label>

          <div className="branch-profile-input">
            <KeyRound
              size={17}
            />

            <input
              type="password"
              name="newPassword"
              value={
                form.newPassword
              }
              onChange={
                handleChange
              }
            />
          </div>
        </div>

        <div className="branch-profile-field">
          <label>
            Confirm Password
          </label>

          <div className="branch-profile-input">
            <KeyRound
              size={17}
            />

            <input
              type="password"
              name="confirmPassword"
              value={
                form.confirmPassword
              }
              onChange={
                handleChange
              }
            />
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
              ? "Changing..."
              : "Change Password"}
          </button>
        </div>
      </form>
    </section>
  );
}