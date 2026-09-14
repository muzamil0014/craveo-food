"use client";

// ============================================================
// CRAVEO - BRANCH ADMIN LOGIN
// ============================================================

import Image from "next/image";

import {
  useState,
} from "react";

import {
  Building2,
  LockKeyhole,
  Mail,
} from "lucide-react";

// ============================================================
// PAGE
// ============================================================

export default function BranchAdminLoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

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
      return JSON.parse(
        text
      );
    } catch {
      return {
        success: false,

        message:
          "Invalid server response.",
      };
    }
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setError("");

      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      if (
        !email.trim() ||
        !password
      ) {
        throw new Error(
          "Email and password are required."
        );
      }

      setLoading(true);

      // ------------------------------------------------------
      // LOGIN REQUEST
      // ------------------------------------------------------

      const response =
        await fetch(
          "/api/auth/branch-login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),

                password,
              }),
          }
        );

      const result =
        await parseResponse(
          response
        );

      // ------------------------------------------------------
      // LOGIN FAILED
      // ------------------------------------------------------

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Branch Admin login failed."
        );
      }

      // ======================================================
      // IMPORTANT:
      // CREATE ONE-TIME DASHBOARD ENTRY COOKIE
      //
      // This cookie allows exact:
      // /admin/branch-dashboard
      //
      // Proxy deletes it immediately after dashboard opens.
      // ======================================================

      document.cookie =
        "craveo_branch_dashboard_entry=allowed; Path=/; Max-Age=30; SameSite=Lax";

      // ======================================================
      // REDIRECT
      // ======================================================

      window.location.replace(
        "/admin/branch-dashboard"
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="branch-login-page">
      <div className="branch-login-wrapper">
        {/* ====================================================
            BRAND
        ==================================================== */}

        <div className="branch-login-brand">
          <div className="branch-login-logo">
            <Image
              src="/images/craveo-logo.png"
              alt="CRAVEO"
              width={72}
              height={72}
              priority
            />
          </div>

          <div>
            <h1>
              CRAVEO
              <span>.</span>
            </h1>

            <p>
              PREMIUM FOOD
            </p>
          </div>
        </div>

        {/* ====================================================
            LOGIN CARD
        ==================================================== */}

        <section className="branch-login-card">
          <div className="branch-login-badge">
            <Building2
              size={15}
            />

            BRANCH ADMIN
          </div>

          <h2>
            Branch Sign In
          </h2>

          <p className="branch-login-subtitle">
            Sign in to manage your
            assigned CRAVEO branch.
          </p>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="branch-login-error">
              {error}
            </div>
          )}

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={
              handleSubmit
            }
            className="branch-login-form"
          >
            {/* ================================================
                EMAIL
            ================================================ */}

            <div className="branch-login-field">
              <label>
                Email Address
              </label>

              <div className="branch-login-input">
                <Mail
                  size={18}
                />

                <input
                  type="email"
                  value={
                    email
                  }
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  placeholder="branch@craveo.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* ================================================
                PASSWORD
            ================================================ */}

            <div className="branch-login-field">
              <label>
                Password
              </label>

              <div className="branch-login-input">
                <LockKeyhole
                  size={18}
                />

                <input
                  type="password"
                  value={
                    password
                  }
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* ================================================
                SUBMIT
            ================================================ */}

            <button
              type="submit"
              className="branch-login-submit"
              disabled={
                loading
              }
            >
              {loading
                ? "Signing In..."
                : "Sign In to Branch"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}