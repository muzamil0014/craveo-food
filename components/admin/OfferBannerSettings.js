"use client";

// ============================================================
// CRAVEO - OFFER BANNER SETTINGS
// ============================================================

import {
  useState,
} from "react";

import {
  ImageIcon,
  Save,
  Upload,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function OfferBannerSettings({
  initialImage = "",
}) {
  const [image, setImage] =
    useState(
      initialImage || ""
    );

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // UPLOAD IMAGE
  // ==========================================================

  async function handleImageChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "folder",
        "craveo/settings"
      );

      const response =
        await fetch(
          "/api/admin/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const text =
        await response.text();

      const result =
        text
          ? JSON.parse(text)
          : {};

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Image upload failed."
        );
      }

      const uploadedUrl =
        result.url ||
        result.imageUrl ||
        result.secure_url ||
        result.data?.url ||
        result.data?.secure_url;

      if (!uploadedUrl) {
        throw new Error(
          "Upload API did not return image URL."
        );
      }

      setImage(
        uploadedUrl
      );

      setMessage(
        "Image uploaded. Click Save Offer Image."
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to upload image."
      );
    } finally {
      setUploading(false);
    }
  }

  // ==========================================================
  // SAVE SETTINGS
  // ==========================================================

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!image) {
        throw new Error(
          "Please upload an image first."
        );
      }

      const response =
        await fetch(
          "/api/admin/settings/offer-banner",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                offerBannerImage:
                  image,
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
            "Unable to save image."
        );
      }

      setMessage(
        "Offer banner image saved successfully."
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to save image."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="settings-card offer-banner-settings">
      <div className="settings-card-header">
        <div className="settings-card-icon">
          <ImageIcon size={20} />
        </div>

        <div>
          <span>
            HOMEPAGE
          </span>

          <h2>
            Special Offer Banner
          </h2>

          <p>
            Change the image shown on the
            customer homepage special offer.
          </p>
        </div>
      </div>

      {/* ======================================================
          PREVIEW
      ====================================================== */}

      <div className="offer-banner-preview">
        {image ? (
          <img
            src={image}
            alt="Special Offer Banner"
          />
        ) : (
          <div className="offer-banner-empty">
            <ImageIcon size={30} />

            <span>
              No image selected
            </span>
          </div>
        )}
      </div>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <div className="offer-banner-actions">
        <label className="offer-banner-upload-btn">
          <Upload size={16} />

          {uploading
            ? "Uploading..."
            : "Upload New Image"}

          <input
            type="file"
            accept="image/*"
            hidden
            disabled={uploading}
            onChange={
              handleImageChange
            }
          />
        </label>

        <button
          type="button"
          onClick={
            handleSave
          }
          disabled={
            saving ||
            uploading
          }
          className="offer-banner-save-btn"
        >
          <Save size={16} />

          {saving
            ? "Saving..."
            : "Save Offer Image"}
        </button>
      </div>

      {message && (
        <div className="settings-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="settings-error-message">
          {error}
        </div>
      )}
    </section>
  );
}