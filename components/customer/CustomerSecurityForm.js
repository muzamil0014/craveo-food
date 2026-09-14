"use client";

// ============================================================
// CRAVEO - CUSTOMER SECURITY FORM
// CHANGE PASSWORD
// ============================================================

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

// ============================================================
// SAFE RESPONSE
// ============================================================

async function readResponse(
  response
) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    throw new Error(
      `Invalid server response (${response.status}).`
    );
  }
}

// ============================================================
// PASSWORD SCORE
// ============================================================

function getPasswordStrength(
  password
) {
  let score = 0;

  if (
    password.length >= 8
  ) {
    score++;
  }

  if (
    /[A-Z]/.test(
      password
    )
  ) {
    score++;
  }

  if (
    /[a-z]/.test(
      password
    )
  ) {
    score++;
  }

  if (
    /[0-9]/.test(
      password
    )
  ) {
    score++;
  }

  if (
    /[^A-Za-z0-9]/.test(
      password
    )
  ) {
    score++;
  }

  if (score <= 1) {
    return {
      label: "Weak",
      className: "weak",
      score,
    };
  }

  if (score <= 3) {
    return {
      label: "Medium",
      className: "medium",
      score,
    };
  }

  return {
    label: "Strong",
    className: "strong",
    score,
  };
}

// ============================================================
// COMPONENT
// ============================================================

export default function CustomerSecurityForm() {
  // ==========================================================
  // FORM
  // ==========================================================

  const [
    form,
    setForm,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ==========================================================
  // VISIBILITY
  // ==========================================================

  const [
    showCurrent,
    setShowCurrent,
  ] = useState(false);

  const [
    showNew,
    setShowNew,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  // ==========================================================
  // UI STATES
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // ==========================================================
  // PASSWORD STRENGTH
  // ==========================================================

  const strength =
    useMemo(
      () =>
        getPasswordStrength(
          form.newPassword
        ),
      [
        form.newPassword,
      ]
    );

  // ==========================================================
  // CHANGE
  // ==========================================================

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (
        previous
      ) => ({
        ...previous,

        [name]:
          value,
      })
    );

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
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

      // ======================================================
      // BASIC FRONTEND CHECK
      // ======================================================

      if (
        !form.currentPassword ||
        !form.newPassword ||
        !form.confirmPassword
      ) {
        throw new Error(
          "Please complete all password fields."
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

      // ======================================================
      // API
      // ======================================================

      const response =
        await fetch(
          "/api/customer/security/change-password",
          {
            method:
              "POST",

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
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to change password."
        );
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      setSuccess(
        result.message ||
          "Password changed successfully."
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (error) {
      setError(
        error?.message ||
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
    <div className="customer-security-content">
      {/* ======================================================
          SECURITY INFORMATION
      ====================================================== */}

      <section className="customer-security-info-card">
        <div className="customer-security-info-icon">
          <ShieldCheck
            size={28}
          />
        </div>

        <div>
          <span>
            ACCOUNT SECURITY
          </span>

          <h2>
            Keep Your Account Secure
          </h2>

          <p>
            Use a strong password that
            you do not use on other
            websites or apps.
          </p>
        </div>
      </section>

      {/* ======================================================
          PASSWORD FORM
      ====================================================== */}

      <section className="customer-security-password-card">
        <div className="customer-security-card-heading">
          <div>
            <span>
              PASSWORD
            </span>

            <h2>
              Change Password
            </h2>

            <p>
              Enter your current
              password before creating
              a new password.
            </p>
          </div>

          <div className="customer-security-heading-icon">
            <KeyRound
              size={21}
            />
          </div>
        </div>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {error && (
          <div className="customer-security-error">
            {error}
          </div>
        )}

        {success && (
          <div className="customer-security-success">
            <CheckCircle2
              size={16}
            />

            {success}
          </div>
        )}

        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={
            handleSubmit
          }
          className="customer-security-form"
        >
          {/* ==================================================
              CURRENT PASSWORD
          ================================================== */}

          <div className="customer-security-field">
            <label>
              Current Password
            </label>

            <div className="customer-security-password-input">
              <LockKeyhole
                size={17}
              />

              <input
                type={
                  showCurrent
                    ? "text"
                    : "password"
                }
                name="currentPassword"
                value={
                  form.currentPassword
                }
                onChange={
                  handleChange
                }
                placeholder="Enter current password"
                autoComplete="current-password"
                disabled={
                  loading
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrent(
                    (
                      value
                    ) =>
                      !value
                  )
                }
                aria-label="Show current password"
              >
                {showCurrent ? (
                  <EyeOff
                    size={17}
                  />
                ) : (
                  <Eye
                    size={17}
                  />
                )}
              </button>
            </div>
          </div>

          {/* ==================================================
              NEW PASSWORD
          ================================================== */}

          <div className="customer-security-field">
            <label>
              New Password
            </label>

            <div className="customer-security-password-input">
              <KeyRound
                size={17}
              />

              <input
                type={
                  showNew
                    ? "text"
                    : "password"
                }
                name="newPassword"
                value={
                  form.newPassword
                }
                onChange={
                  handleChange
                }
                placeholder="Create new password"
                autoComplete="new-password"
                disabled={
                  loading
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowNew(
                    (
                      value
                    ) =>
                      !value
                  )
                }
                aria-label="Show new password"
              >
                {showNew ? (
                  <EyeOff
                    size={17}
                  />
                ) : (
                  <Eye
                    size={17}
                  />
                )}
              </button>
            </div>

            {/* ================================================
                PASSWORD STRENGTH
            ================================================ */}

            {form.newPassword && (
              <div className="customer-password-strength">
                <div className="customer-password-strength-bar">
                  {[1, 2, 3, 4, 5].map(
                    (
                      item
                    ) => (
                      <span
                        key={
                          item
                        }
                        className={
                          item <=
                          strength.score
                            ? strength.className
                            : ""
                        }
                      />
                    )
                  )}
                </div>

                <small
                  className={
                    strength.className
                  }
                >
                  {
                    strength.label
                  }
                </small>
              </div>
            )}
          </div>

          {/* ==================================================
              CONFIRM PASSWORD
          ================================================== */}

          <div className="customer-security-field">
            <label>
              Confirm New Password
            </label>

            <div className="customer-security-password-input">
              <KeyRound
                size={17}
              />

              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={
                  form.confirmPassword
                }
                onChange={
                  handleChange
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={
                  loading
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(
                    (
                      value
                    ) =>
                      !value
                  )
                }
                aria-label="Show confirm password"
              >
                {showConfirm ? (
                  <EyeOff
                    size={17}
                  />
                ) : (
                  <Eye
                    size={17}
                  />
                )}
              </button>
            </div>
          </div>

          {/* ==================================================
              REQUIREMENTS
          ================================================== */}

          <div className="customer-security-requirements">
            <strong>
              Password requirements
            </strong>

            <span>
              • Minimum 8 characters
            </span>

            <span>
              • At least one uppercase
              letter
            </span>

            <span>
              • At least one lowercase
              letter
            </span>

            <span>
              • At least one number
            </span>
          </div>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <button
            type="submit"
            disabled={
              loading
            }
            className="customer-security-submit"
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={17}
                  className="craveo-spin"
                />

                Updating Password...
              </>
            ) : (
              <>
                <ShieldCheck
                  size={17}
                />

                Update Password
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}