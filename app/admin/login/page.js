"use client";

// ============================================================
// CRAVEO - SUPER ADMIN LOGIN PAGE
// ============================================================

import Image from "next/image";
import { useState } from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

// ============================================================
// LOGIN PAGE
// ============================================================

export default function AdminLoginPage() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  // ==========================================================
  // SAFE RESPONSE PARSER
  // ==========================================================

  async function parseResponse(response) {
    const text =
      await response.text();

    if (!text) {
      return {
        success: false,
        message:
          `Server returned an empty response. Status: ${response.status}`,
      };
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        success: false,
        message:
          `Server returned invalid JSON. Status: ${response.status}`,
      };
    }
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!formData.email.trim()) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (!formData.password) {
      setError(
        "Please enter your password."
      );

      return;
    }

    try {
      setLoading(true);

      // ======================================================
      // LOGIN REQUEST
      // ======================================================

      const response =
        await fetch(
          "/api/auth/admin-login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              password:
                formData.password,
            }),
          }
        );

      // ======================================================
      // READ RESPONSE SAFELY
      // ======================================================

      const data =
        await parseResponse(
          response
        );

      // ======================================================
      // LOGIN FAILED
      // ======================================================

      if (
        !response.ok ||
        data.success !== true
      ) {
        throw new Error(
          data.message ||
            "Unable to login."
        );
      }

      // ======================================================
      // TEMPORARY DASHBOARD ENTRY COOKIE
      //
      // Sirf login ke turant baad exact /admin/dashboard
      // ko ek dafa allow karne ke liye.
      // ======================================================

      document.cookie =
        "craveo_dashboard_entry=allowed; Path=/; Max-Age=30; SameSite=Lax";

      // ======================================================
      // HARD REDIRECT
      //
      // router.replace ki jagah hard navigation use kar rahe
      // hain taa-ke cookies next request ke sath guaranteed
      // send hon.
      // ======================================================

      window.location.replace(
        "/admin/dashboard"
      );
    } catch (error) {
      console.error(
        "ADMIN LOGIN ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="craveo-login-page">
      <div className="craveo-login-wrapper">
        {/* ====================================================
            LOGO / BRAND
        ==================================================== */}

        <div className="craveo-login-brand">
          <div className="craveo-login-logo-box">
            <Image
              src="/images/craveo-logo.png"
              alt="CRAVEO Logo"
              width={90}
              height={90}
              priority
              className="craveo-login-logo-image"
            />
          </div>

          <div className="craveo-login-brand-text">
            <h1>
              CRAVEO
              <span>.</span>
            </h1>

            <p>
              PREMIUM FOOD • DELIVERED
            </p>
          </div>
        </div>

        {/* ====================================================
            LOGIN CARD
        ==================================================== */}

        <section className="craveo-login-card">
          <div className="craveo-admin-badge">
            ADMIN PORTAL
          </div>

          <div className="craveo-login-heading">
            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to manage your
              CRAVEO restaurant platform.
            </p>
          </div>

          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (
            <div className="craveo-login-error">
              {error}
            </div>
          )}

          {/* ==================================================
              LOGIN FORM
          ================================================== */}

          <form
            className="craveo-login-form"
            onSubmit={handleSubmit}
          >
            {/* ================================================
                EMAIL
            ================================================ */}

            <div className="craveo-form-group">
              <label htmlFor="email">
                Email address
              </label>

              <div className="craveo-input-wrapper">
                <div className="craveo-input-icon">
                  <Mail size={21} />
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@craveo.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* ================================================
                PASSWORD
            ================================================ */}

            <div className="craveo-form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="craveo-input-wrapper">
                <div className="craveo-input-icon">
                  <LockKeyhole
                    size={21}
                  />
                </div>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="craveo-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={21} />
                  ) : (
                    <Eye size={21} />
                  )}
                </button>
              </div>
            </div>

            {/* ================================================
                SUBMIT
            ================================================ */}

            <button
              type="submit"
              className="craveo-login-submit"
              disabled={loading}
            >
              {loading
                ? "Signing In..."
                : "Sign In to Dashboard"}
            </button>
          </form>

          {/* ==================================================
              SECURITY FOOTER
          ================================================== */}

          <div className="craveo-login-security">
            <LockKeyhole
              size={15}
            />

            <span>
              Secure CRAVEO
              administration portal
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}