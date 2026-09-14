"use client";

// ============================================================
// CRAVEO - CUSTOMER AUTH FORM
// LOGIN + REGISTER + REQUIRED CITY
// ============================================================

import Link from "next/link";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import {
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
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid server response (${response.status}).`
    );
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function CustomerAuthForm({
  mode = "login",
  cities = [],
}) {
  // ==========================================================
  // MODE
  // ==========================================================

  const isRegister =
    mode === "register";

  // ==========================================================
  // STATES
  // ==========================================================

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // ======================================================
      // REGISTER VALIDATION
      // ======================================================

      if (
        isRegister &&
        !name.trim()
      ) {
        throw new Error(
          "Full name is required."
        );
      }

      if (!email.trim()) {
        throw new Error(
          "Email address is required."
        );
      }

      if (
        isRegister &&
        !city
      ) {
        throw new Error(
          "Please select your city."
        );
      }

      if (!password) {
        throw new Error(
          "Password is required."
        );
      }

      if (
        isRegister &&
        password.length < 6
      ) {
        throw new Error(
          "Password must be at least 6 characters."
        );
      }

      // ======================================================
      // API URL
      // ======================================================

      const endpoint =
        isRegister
          ? "/api/customer/register"
          : "/api/customer/login";

      // ======================================================
      // REQUEST BODY
      // ======================================================

      const payload =
        isRegister
          ? {
              name:
                name.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              phone:
                phone.trim(),

              city,

              password,
            }
          : {
              email:
                email
                  .trim()
                  .toLowerCase(),

              password,
            };

      // ======================================================
      // REQUEST
      // ======================================================

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            cache: "no-store",

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        await readResponse(
          response
        );

      // ======================================================
      // ERROR
      // ======================================================

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to continue."
        );
      }

      // ======================================================
      // REGISTER SUCCESS
      // ======================================================

      if (isRegister) {
        window.location.replace(
          "/select-branch"
        );

        return;
      }

      // ======================================================
      // LOGIN SUCCESS
      // ======================================================

      if (
        result.needsBranchSelection
      ) {
        window.location.replace(
          "/select-branch"
        );

        return;
      }

      window.location.replace("/");
    } catch (error) {
      setError(
        error?.message ||
          "Something went wrong."
      );

      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="customer-auth-card">
      {/* ======================================================
          HEADING
      ====================================================== */}

      <div className="customer-auth-heading">
        <span>
          CRAVEO CUSTOMER
        </span>

        <h1>
          {isRegister
            ? "Create Account"
            : "Welcome Back"}
        </h1>

        <p>
          {isRegister
            ? "Create your CRAVEO account and select your nearest branch."
            : "Login to continue ordering from CRAVEO."}
        </p>
      </div>

      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="customer-auth-form"
      >
        {/* ====================================================
            NAME
        ==================================================== */}

        {isRegister && (
          <div className="customer-auth-field">
            <label>
              Full Name
            </label>

            <div className="customer-auth-input">
              <UserRound
                size={18}
              />

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>
          </div>
        )}

        {/* ====================================================
            EMAIL
        ==================================================== */}

        <div className="customer-auth-field">
          <label>
            Email Address
          </label>

          <div className="customer-auth-input">
            <Mail size={18} />

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* ====================================================
            PHONE
        ==================================================== */}

        {isRegister && (
          <div className="customer-auth-field">
            <label>
              Phone Number
            </label>

            <div className="customer-auth-input">
              <Phone size={18} />

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="03XXXXXXXXX"
                autoComplete="tel"
              />
            </div>
          </div>
        )}

        {/* ====================================================
            CITY
        ==================================================== */}

        {isRegister && (
          <div className="customer-auth-field">
            <label>
              City
            </label>

            <div className="customer-auth-input customer-auth-select-wrap">
              <MapPin
                size={18}
              />

              <select
                value={city}
                onChange={(e) =>
                  setCity(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Select your city
                </option>

                {cities.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            {cities.length ===
              0 && (
              <small className="customer-auth-city-warning">
                No active CRAVEO cities are currently available.
              </small>
            )}
          </div>
        )}

        {/* ====================================================
            PASSWORD
        ==================================================== */}

        <div className="customer-auth-field">
          <label>
            Password
          </label>

          <div className="customer-auth-input">
            <LockKeyhole
              size={18}
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder={
                isRegister
                  ? "Minimum 6 characters"
                  : "Enter your password"
              }
              autoComplete={
                isRegister
                  ? "new-password"
                  : "current-password"
              }
              required
            />

            <button
              type="button"
              className="customer-auth-password-toggle"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
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

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="customer-auth-error">
            {error}
          </div>
        )}

        {/* ====================================================
            SUBMIT
        ==================================================== */}

        <button
          type="submit"
          className="customer-auth-submit"
          disabled={
            loading ||
            (
              isRegister &&
              cities.length === 0
            )
          }
        >
          {loading && (
            <LoaderCircle
              size={18}
              className="craveo-spin"
            />
          )}

          {loading
            ? isRegister
              ? "Creating Account..."
              : "Signing In..."
            : isRegister
              ? "Create Account"
              : "Login"}
        </button>
      </form>

      {/* ======================================================
          FOOTER LINK
      ====================================================== */}

      <div className="customer-auth-footer">
        {isRegister ? (
          <p>
            Already have an
            account?{" "}
            <Link href="/login">
              Login
            </Link>
          </p>
        ) : (
          <p>
            Don&apos;t have an
            account?{" "}
            <Link href="/register">
              Create Account
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}