"use client";

// ============================================================
// CRAVEO - CHANGE PASSWORD FORM
// ============================================================

import { useState } from "react";

import {
  KeyRound,
  LockKeyhole,
  Save,
  ShieldCheck,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function ChangePasswordForm() {
  const [form, setForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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
  // RESPONSE
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
          "Passwords do not match."
        );
      }

      const response =
        await fetch(
          "/api/admin/profile/password",
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
            "Unable to change password."
        );
      }

      setSuccess(
        "Password changed successfully."
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
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
    <section className="super-profile-card">
      <div className="super-profile-card-heading">
        <div className="super-profile-heading-icon danger">
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
            Update the password used for
            Super Admin login.
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
        className="super-password-form"
      >
        <div className="super-profile-field">
          <label>
            Current Password
          </label>

          <div className="super-profile-input">
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

        <div className="super-profile-field">
          <label>
            New Password
          </label>

          <div className="super-profile-input">
            <ShieldCheck
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

        <div className="super-profile-field">
          <label>
            Confirm New Password
          </label>

          <div className="super-profile-input">
            <ShieldCheck
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

        <div className="super-profile-actions">
          <button
            type="submit"
            disabled={
              loading
            }
          >
            <Save size={16} />

            {loading
              ? "Changing..."
              : "Change Password"}
          </button>
        </div>
      </form>
    </section>
  );
}