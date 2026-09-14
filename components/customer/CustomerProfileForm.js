"use client";

// ============================================================
// CRAVEO - CUSTOMER PROFILE FORM
// NAME + PHONE + CITY + AVATAR
// ============================================================

import {
  Camera,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useState } from "react";

// ============================================================
// SAFE RESPONSE
// ============================================================

async function readResponse(response) {
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

export default function CustomerProfileForm({
  user,
  cities = [],
}) {
  const router =
    useRouter();

  // ==========================================================
  // STATE
  // ==========================================================

  const [name, setName] =
    useState(
      user?.name || ""
    );

  const [phone, setPhone] =
    useState(
      user?.phone || ""
    );

  const [city, setCity] =
    useState(
      user?.city || ""
    );

  const [avatar, setAvatar] =
    useState(
      user?.avatar || ""
    );

  const [
    avatarPublicId,
    setAvatarPublicId,
  ] = useState(
    user?.avatarPublicId || ""
  );

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // IMAGE UPLOAD
  // ==========================================================

  async function handleImageChange(event) {
    const input =
      event.target;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    try {
      // ======================================================
      // RESET MESSAGES
      // ======================================================

      setUploading(true);
      setError("");
      setSuccess("");

      // ======================================================
      // IMAGE TYPE CHECK
      // ======================================================

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        throw new Error(
          "Only JPG, PNG or WEBP images are allowed."
        );
      }

      // ======================================================
      // IMAGE SIZE CHECK
      // MAX 5MB
      // ======================================================

      const maxSize =
        5 * 1024 * 1024;

      if (
        file.size >
        maxSize
      ) {
        throw new Error(
          "Image must be less than 5MB."
        );
      }

      // ======================================================
      // FORM DATA
      // ======================================================

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      // ======================================================
      // IMPORTANT
      //
      // CUSTOMER AVATAR MUST USE CUSTOMER API.
      // DO NOT USE /api/admin/upload HERE.
      // ======================================================

      const response =
        await fetch(
          "/api/customer/avatar",
          {
            method:
              "POST",

            body:
              formData,

            credentials:
              "include",

            cache:
              "no-store",
          }
        );

      const result =
        await readResponse(
          response
        );

      // ======================================================
      // API ERROR
      // ======================================================

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to upload profile image."
        );
      }

      // ======================================================
      // SAVE CLOUDINARY IMAGE DATA
      //
      // CUSTOMER AVATAR API RETURNS:
      //
      // {
      //   success: true,
      //   image: {
      //     url,
      //     publicId
      //   }
      // }
      // ======================================================

      const imageUrl =
        result.image?.url || "";

      const publicId =
        result.image?.publicId || "";

      if (!imageUrl) {
        throw new Error(
          "Image URL was not returned by server."
        );
      }

      setAvatar(
        imageUrl
      );

      setAvatarPublicId(
        publicId
      );

      setSuccess(
        "Profile picture uploaded. Press Save Profile to finish."
      );
    } catch (error) {
      console.error(
        "CUSTOMER AVATAR ERROR:",
        error
      );

      setError(
        error?.message ||
          "Unable to upload image."
      );
    } finally {
      setUploading(false);

      // Allow selecting same image again
      input.value = "";
    }
  }

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // ======================================================
      // VALIDATION
      // ======================================================

      if (!name.trim()) {
        throw new Error(
          "Full name is required."
        );
      }

      if (!city) {
        throw new Error(
          "Please select your city."
        );
      }

      // ======================================================
      // UPDATE PROFILE
      // ======================================================

      const response =
        await fetch(
          "/api/customer/profile",
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            cache:
              "no-store",

            body:
              JSON.stringify({
                name:
                  name.trim(),

                phone:
                  phone.trim(),

                city,

                avatar,

                avatarPublicId,
              }),
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
            "Unable to update profile."
        );
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      setSuccess(
        "Profile updated successfully."
      );

      // ======================================================
      // CITY CHANGED
      //
      // API may clear old selected branch.
      // ======================================================

      if (
        result.branchReset ===
        true
      ) {
        window.location.replace(
          "/select-branch"
        );

        return;
      }

      // ======================================================
      // REFRESH SERVER DATA
      // ======================================================

      router.refresh();

      setTimeout(() => {
        window.location.replace(
          "/account"
        );
      }, 700);
    } catch (error) {
      console.error(
        "CUSTOMER PROFILE UPDATE ERROR:",
        error
      );

      setError(
        error?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="customer-profile-form-card">
      {/* ======================================================
          HEADING
      ====================================================== */}

      <div className="customer-profile-form-heading">
        <span>
          PROFILE
        </span>

        <h1>
          Personal Information
        </h1>

        <p>
          Update your personal details,
          city and profile photo.
        </p>
      </div>

      {/* ======================================================
          PROFILE IMAGE
      ====================================================== */}

      <div className="customer-profile-photo-section">
        <div className="customer-profile-photo">
          {avatar ? (
            <img
              src={
                avatar
              }
              alt={
                name ||
                "Profile"
              }
            />
          ) : (
            <UserRound
              size={38}
            />
          )}

          {/* ==================================================
              CAMERA BUTTON
          ================================================== */}

          <label
            className="customer-profile-camera"
            title="Change Photo"
          >
            {uploading ? (
              <LoaderCircle
                size={17}
                className="craveo-spin"
              />
            ) : (
              <Camera
                size={17}
              />
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleImageChange
              }
              disabled={
                uploading
              }
              hidden
            />
          </label>
        </div>

        <div>
          <strong>
            Profile Picture
          </strong>

          <span>
            PNG, JPG or WEBP.
            Max 5MB.
          </span>

          {/* ==================================================
              CHANGE PHOTO BUTTON
          ================================================== */}

          <label className="customer-profile-change-photo">
            {uploading
              ? "Uploading..."
              : "Change Photo"}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleImageChange
              }
              disabled={
                uploading
              }
              hidden
            />
          </label>
        </div>
      </div>

      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="customer-profile-edit-form"
      >
        {/* ====================================================
            NAME
        ==================================================== */}

        <div className="customer-profile-field">
          <label>
            Full Name
          </label>

          <div className="customer-profile-input">
            <UserRound
              size={18}
            />

            <input
              type="text"
              value={
                name
              }
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
            />
          </div>
        </div>

        {/* ====================================================
            PHONE
        ==================================================== */}

        <div className="customer-profile-field">
          <label>
            Phone Number
          </label>

          <div className="customer-profile-input">
            <Phone
              size={18}
            />

            <input
              type="tel"
              value={
                phone
              }
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              placeholder="03XXXXXXXXX"
            />
          </div>
        </div>

        {/* ====================================================
            CITY
        ==================================================== */}

        <div className="customer-profile-field">
          <label>
            City
          </label>

          <div className="customer-profile-input customer-profile-select">
            <MapPin
              size={18}
            />

            <select
              value={
                city
              }
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
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* ====================================================
            EMAIL
        ==================================================== */}

        <div className="customer-profile-field customer-profile-field-full">
          <label>
            Email Address
          </label>

          <div className="customer-profile-input customer-profile-input-disabled">
            <Mail
              size={18}
            />

            <input
              type="email"
              value={
                user?.email ||
                ""
              }
              disabled
            />
          </div>

          <small>
            Email address cannot be
            changed here.
          </small>
        </div>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {error && (
          <div className="customer-profile-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="customer-profile-message success">
            {success}
          </div>
        )}

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="customer-profile-form-actions">
          <button
            type="button"
            className="customer-profile-cancel-btn"
            onClick={() =>
              window.location.href =
                "/account"
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="customer-profile-save-btn"
            disabled={
              saving ||
              uploading
            }
          >
            {saving ? (
              <LoaderCircle
                size={17}
                className="craveo-spin"
              />
            ) : (
              <Save
                size={17}
              />
            )}

            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}