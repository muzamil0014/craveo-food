"use client";

// ============================================================
// CRAVEO - SETTINGS FORM
// ============================================================

import { useState } from "react";

import {
  Building2,
  CreditCard,
  Mail,
  PackageCheck,
  Save,
  Settings as SettingsIcon,
  ShieldAlert,
  Truck,
} from "lucide-react";

// ============================================================
// SETTINGS FORM COMPONENT
// ============================================================

export default function SettingsForm({
  initialSettings = {},
}) {
  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [form, setForm] =
    useState({
      // ------------------------------------------------------
      // GENERAL
      // ------------------------------------------------------

      siteName:
        initialSettings.siteName ||
        "CRAVEO",

      siteTagline:
        initialSettings.siteTagline ||
        "Premium Food Delivery",

      currency:
        initialSettings.currency ||
        "PKR",

      timezone:
        initialSettings.timezone ||
        "Asia/Karachi",

      // ------------------------------------------------------
      // DELIVERY
      // ------------------------------------------------------

      deliveryEnabled:
        initialSettings.deliveryEnabled !==
        false,

      defaultDeliveryFee:
        initialSettings.defaultDeliveryFee ??
        150,

      freeDeliveryMinimum:
        initialSettings.freeDeliveryMinimum ??
        0,

      minimumOrderAmount:
        initialSettings.minimumOrderAmount ??
        0,

      estimatedDeliveryMinutes:
        initialSettings.estimatedDeliveryMinutes ??
        45,

      // ------------------------------------------------------
      // ORDERS
      // ------------------------------------------------------

      ordersEnabled:
        initialSettings.ordersEnabled !==
        false,

      allowOrderCancellation:
        initialSettings.allowOrderCancellation !==
        false,

      cancellationMinutes:
        initialSettings.cancellationMinutes ??
        10,

      autoConfirmOrders:
        initialSettings.autoConfirmOrders ===
        true,

      // ------------------------------------------------------
      // PAYMENT
      // ------------------------------------------------------

      cashOnDeliveryEnabled:
        initialSettings.cashOnDeliveryEnabled !==
        false,

      cardPaymentEnabled:
        initialSettings.cardPaymentEnabled ===
        true,

      bankTransferEnabled:
        initialSettings.bankTransferEnabled ===
        true,

      walletPaymentEnabled:
        initialSettings.walletPaymentEnabled ===
        true,

      // ------------------------------------------------------
      // CONTACT
      // ------------------------------------------------------

      supportEmail:
        initialSettings.supportEmail ||
        "",

      supportPhone:
        initialSettings.supportPhone ||
        "",

      businessAddress:
        initialSettings.businessAddress ||
        "",

      // ------------------------------------------------------
      // SOCIAL
      // ------------------------------------------------------

      facebookUrl:
        initialSettings.facebookUrl ||
        "",

      instagramUrl:
        initialSettings.instagramUrl ||
        "",

      youtubeUrl:
        initialSettings.youtubeUrl ||
        "",

      tiktokUrl:
        initialSettings.tiktokUrl ||
        "",

      // ------------------------------------------------------
      // MAINTENANCE
      // ------------------------------------------------------

      maintenanceMode:
        initialSettings.maintenanceMode ===
        true,

      maintenanceMessage:
        initialSettings.maintenanceMessage ||
        "CRAVEO is temporarily unavailable. Please try again shortly.",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================================
  // HANDLE CHANGE
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
    setSuccess("");
  }

  // ==========================================================
  // SAFE API RESPONSE
  // ==========================================================

  async function parseResponse(response) {
    const text =
      await response.text();

    if (!text) {
      return {
        success: false,

        message:
          `Empty API response. Status: ${response.status}`,
      };
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        success: false,

        message:
          `Invalid JSON response. Status: ${response.status}`,
      };
    }
  }

  // ==========================================================
  // SAVE SETTINGS
  // ==========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);

      setError("");
      setSuccess("");

      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      if (!form.siteName.trim()) {
        throw new Error(
          "Site name is required."
        );
      }

      if (
        Number(
          form.defaultDeliveryFee
        ) < 0
      ) {
        throw new Error(
          "Delivery fee cannot be negative."
        );
      }

      if (
        Number(
          form.minimumOrderAmount
        ) < 0
      ) {
        throw new Error(
          "Minimum order cannot be negative."
        );
      }

      if (
        Number(
          form.estimatedDeliveryMinutes
        ) <= 0
      ) {
        throw new Error(
          "Estimated delivery time must be greater than 0."
        );
      }

      if (
        form.maintenanceMode &&
        !form.maintenanceMessage.trim()
      ) {
        throw new Error(
          "Maintenance message is required."
        );
      }

      // ------------------------------------------------------
      // API REQUEST
      // ------------------------------------------------------

      const response =
        await fetch(
          "/api/admin/settings",
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
          "Unable to save settings."
        );
      }

      setSuccess(
        "CRAVEO settings saved successfully."
      );
    } catch (error) {
      setError(
        error.message ||
        "Unable to save settings."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <form
      className="settings-form"
      onSubmit={
        handleSubmit
      }
    >
      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="settings-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="settings-message success">
          {success}
        </div>
      )}

      {/* ======================================================
          GENERAL SETTINGS
      ====================================================== */}

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <SettingsIcon
              size={19}
            />
          </div>

          <div>
            <span>
              GENERAL
            </span>

            <h2>
              General Settings
            </h2>

            <p>
              CRAVEO website identity
              and regional settings.
            </p>
          </div>
        </div>

        <div className="settings-grid">
          <div className="settings-field">
            <label>
              Site Name
            </label>

            <input
              type="text"
              name="siteName"
              value={
                form.siteName
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="settings-field">
            <label>
              Tagline
            </label>

            <input
              type="text"
              name="siteTagline"
              value={
                form.siteTagline
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="settings-field">
            <label>
              Currency
            </label>

            <select
              name="currency"
              value={
                form.currency
              }
              onChange={
                handleChange
              }
            >
              <option value="PKR">
                PKR
              </option>

              <option value="USD">
                USD
              </option>

              <option value="AED">
                AED
              </option>
            </select>
          </div>

          <div className="settings-field">
            <label>
              Timezone
            </label>

            <select
              name="timezone"
              value={
                form.timezone
              }
              onChange={
                handleChange
              }
            >
              <option value="Asia/Karachi">
                Asia/Karachi
              </option>

              <option value="UTC">
                UTC
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* ======================================================
          DELIVERY
      ====================================================== */}

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Truck
              size={19}
            />
          </div>

          <div>
            <span>
              DELIVERY
            </span>

            <h2>
              Delivery Settings
            </h2>

            <p>
              Manage CRAVEO delivery
              charges and limits.
            </p>
          </div>
        </div>

        <label className="settings-toggle-row">
          <input
            type="checkbox"
            name="deliveryEnabled"
            checked={
              form.deliveryEnabled
            }
            onChange={
              handleChange
            }
          />

          <div>
            <strong>
              Delivery Enabled
            </strong>

            <span>
              Allow customers to request
              delivery.
            </span>
          </div>
        </label>

        <div className="settings-grid settings-grid-4">
          <div className="settings-field">
            <label>
              Delivery Fee
            </label>

            <input
              type="number"
              min="0"
              name="defaultDeliveryFee"
              value={
                form.defaultDeliveryFee
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="settings-field">
            <label>
              Free Delivery Above
            </label>

            <input
              type="number"
              min="0"
              name="freeDeliveryMinimum"
              value={
                form.freeDeliveryMinimum
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="settings-field">
            <label>
              Minimum Order
            </label>

            <input
              type="number"
              min="0"
              name="minimumOrderAmount"
              value={
                form.minimumOrderAmount
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="settings-field">
            <label>
              Delivery Minutes
            </label>

            <input
              type="number"
              min="1"
              name="estimatedDeliveryMinutes"
              value={
                form.estimatedDeliveryMinutes
              }
              onChange={
                handleChange
              }
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          ORDER SETTINGS
      ====================================================== */}

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <PackageCheck
              size={19}
            />
          </div>

          <div>
            <span>
              ORDERS
            </span>

            <h2>
              Order Settings
            </h2>

            <p>
              Manage order availability
              and cancellation.
            </p>
          </div>
        </div>

        <div className="settings-toggle-grid">
          <label className="settings-toggle-row">
            <input
              type="checkbox"
              name="ordersEnabled"
              checked={
                form.ordersEnabled
              }
              onChange={
                handleChange
              }
            />

            <div>
              <strong>
                Accept Orders
              </strong>

              <span>
                Customer orders are
                enabled.
              </span>
            </div>
          </label>

          <label className="settings-toggle-row">
            <input
              type="checkbox"
              name="allowOrderCancellation"
              checked={
                form.allowOrderCancellation
              }
              onChange={
                handleChange
              }
            />

            <div>
              <strong>
                Order Cancellation
              </strong>

              <span>
                Customers can cancel
                eligible orders.
              </span>
            </div>
          </label>

          <label className="settings-toggle-row">
            <input
              type="checkbox"
              name="autoConfirmOrders"
              checked={
                form.autoConfirmOrders
              }
              onChange={
                handleChange
              }
            />

            <div>
              <strong>
                Auto Confirm
              </strong>

              <span>
                Automatically confirm
                new orders.
              </span>
            </div>
          </label>
        </div>

        <div className="settings-grid">
          <div className="settings-field">
            <label>
              Cancellation Time
              (Minutes)
            </label>

            <input
              type="number"
              min="0"
              name="cancellationMinutes"
              value={
                form.cancellationMinutes
              }
              onChange={
                handleChange
              }
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          PAYMENT SETTINGS
      ====================================================== */}

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <CreditCard
              size={19}
            />
          </div>

          <div>
            <span>
              PAYMENTS
            </span>

            <h2>
              Payment Methods
            </h2>

            <p>
              Enable available payment
              methods.
            </p>
          </div>
        </div>

        <div className="settings-toggle-grid">
          <label className="settings-toggle-row">
            <input
              type="checkbox"
              name="cashOnDeliveryEnabled"
              checked={
                form.cashOnDeliveryEnabled
              }
              onChange={
                handleChange
              }
            />

            <div>
              <strong>
                Cash on Delivery
              </strong>

              <span>
                Pay when food arrives.
              </span>
            </div>
          </label>

          <label className="settings-toggle-row">
            <input
              type="checkbox"
              name="cardPaymentEnabled"
              checked={
                form.cardPaymentEnabled
              }
              onChange={
                handleChange
              }
            />

            <div>
              <strong>
                Card Payment
              </strong>

              <span>
                Credit/debit card.
              </span>
            </div>
          </label>

          <label className="settings-toggle-row">
            <input
              type="checkbox"
              name="bankTransferEnabled"
              checked={
                form.bankTransferEnabled
              }
              onChange={
                handleChange
              }
            />

            <div>
              <strong>
                Bank Transfer
              </strong>

              <span>
                Direct bank transfer.
              </span>
            </div>
          </label>

          <label className="settings-toggle-row">
            <input
              type="checkbox"
              name="walletPaymentEnabled"
              checked={
                form.walletPaymentEnabled
              }
              onChange={
                handleChange
              }
            />

            <div>
              <strong>
                Wallet
              </strong>

              <span>
                Digital wallet payment.
              </span>
            </div>
          </label>
        </div>
      </section>

      {/* ======================================================
          CONTACT
      ====================================================== */}

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Mail
              size={19}
            />
          </div>

          <div>
            <span>
              CONTACT
            </span>

            <h2>
              Contact Information
            </h2>

            <p>
              Customer support contact
              information.
            </p>
          </div>
        </div>

        <div className="settings-grid">
          <div className="settings-field">
            <label>
              Support Email
            </label>

            <input
              type="email"
              name="supportEmail"
              value={
                form.supportEmail
              }
              onChange={
                handleChange
              }
              placeholder="support@craveo.com"
            />
          </div>

          <div className="settings-field">
            <label>
              Support Phone
            </label>

            <input
              type="text"
              name="supportPhone"
              value={
                form.supportPhone
              }
              onChange={
                handleChange
              }
              placeholder="+92..."
            />
          </div>

          <div className="settings-field settings-field-full">
            <label>
              Business Address
            </label>

            <textarea
              rows="4"
              name="businessAddress"
              value={
                form.businessAddress
              }
              onChange={
                handleChange
              }
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          SOCIAL MEDIA
      ====================================================== */}

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Building2
              size={19}
            />
          </div>

          <div>
            <span>
              SOCIAL MEDIA
            </span>

            <h2>
              Social Links
            </h2>

            <p>
              CRAVEO official social
              media links.
            </p>
          </div>
        </div>

        <div className="settings-grid">
          <div className="settings-field">
            <label>
              Facebook
            </label>

            <input
              type="url"
              name="facebookUrl"
              value={
                form.facebookUrl
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="settings-field">
            <label>
              Instagram
            </label>

            <input
              type="url"
              name="instagramUrl"
              value={
                form.instagramUrl
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="settings-field">
            <label>
              YouTube
            </label>

            <input
              type="url"
              name="youtubeUrl"
              value={
                form.youtubeUrl
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="settings-field">
            <label>
              TikTok
            </label>

            <input
              type="url"
              name="tiktokUrl"
              value={
                form.tiktokUrl
              }
              onChange={
                handleChange
              }
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          MAINTENANCE MODE
      ====================================================== */}

      <section
        className={`settings-card settings-maintenance-card ${
          form.maintenanceMode
            ? "enabled"
            : ""
        }`}
      >
        <div className="settings-card-header">
          <div className="settings-card-icon danger">
            <ShieldAlert
              size={19}
            />
          </div>

          <div>
            <span>
              SYSTEM
            </span>

            <h2>
              Maintenance Mode
            </h2>

            <p>
              Temporarily stop customer
              access to CRAVEO.
            </p>
          </div>
        </div>

        <label className="settings-toggle-row">
          <input
            type="checkbox"
            name="maintenanceMode"
            checked={
              form.maintenanceMode
            }
            onChange={
              handleChange
            }
          />

          <div>
            <strong>
              Maintenance Mode
            </strong>

            <span>
              Enable while updating the
              customer website.
            </span>
          </div>
        </label>

        <div className="settings-field settings-maintenance-message">
          <label>
            Maintenance Message
          </label>

          <textarea
            rows="4"
            name="maintenanceMessage"
            value={
              form.maintenanceMessage
            }
            onChange={
              handleChange
            }
          />
        </div>
      </section>

      {/* ======================================================
          SAVE BAR
      ====================================================== */}

      <div className="settings-save-bar">
        <span>

        </span>

        <button
          type="submit"
          className="settings-save-btn"
          disabled={
            loading
          }
        >
          <Save
            size={17}
          />

          {loading
            ? "Saving..."
            : "Save Settings"}
        </button>
      </div>
    </form>
  );
}