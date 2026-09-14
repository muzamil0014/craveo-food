"use client";

// ============================================================
// CRAVEO - CUSTOMER SAVED ADDRESSES MANAGER
// ============================================================

import {
  Check,
  Edit3,
  Home,
  LoaderCircle,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
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
// EMPTY FORM
// ============================================================

const emptyForm = {
  label:
    "Home",

  fullName:
    "",

  phone:
    "",

  address:
    "",

  area:
    "",

  city:
    "",

  isDefault:
    false,
};

// ============================================================
// COMPONENT
// ============================================================

export default function CustomerAddressesManager() {
  const [
    addresses,
    setAddresses,
  ] = useState([]);

  const [
    customer,
    setCustomer,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState(
    emptyForm
  );

  // ==========================================================
  // LOAD ADDRESSES
  // ==========================================================

  async function loadAddresses() {
    try {
      setLoading(true);

      setError("");

      const response =
        await fetch(
          "/api/customer/addresses",
          {
            cache:
              "no-store",
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
            "Unable to load addresses."
        );
      }

      setAddresses(
        Array.isArray(
          result.addresses
        )
          ? result.addresses
          : []
      );

      setCustomer(
        result.customer ||
          null
      );
    } catch (error) {
      setError(
        error?.message ||
          "Unable to load addresses."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // FIRST LOAD
  // ==========================================================

  useEffect(() => {
    loadAddresses();
  }, []);

  // ==========================================================
  // OPEN ADD FORM
  // ==========================================================

  function openAddForm() {
    setEditingId("");

    setForm({
      ...emptyForm,

      fullName:
        customer?.name ||
        "",

      phone:
        customer?.phone ||
        "",

      city:
        customer?.city ||
        "",
    });

    setMessage("");
    setError("");

    setFormOpen(true);
  }

  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  function openEditForm(
    address
  ) {
    setEditingId(
      address.id
    );

    setForm({
      label:
        address.label ||
        "Home",

      fullName:
        address.fullName ||
        "",

      phone:
        address.phone ||
        "",

      address:
        address.address ||
        "",

      area:
        address.area ||
        "",

      city:
        address.city ||
        "",

      isDefault:
        Boolean(
          address.isDefault
        ),
    });

    setError("");
    setMessage("");

    setFormOpen(true);
  }

  // ==========================================================
  // CLOSE FORM
  // ==========================================================

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);

    setEditingId("");

    setForm(
      emptyForm
    );
  }

  // ==========================================================
  // CHANGE
  // ==========================================================

  function handleChange(
    event
  ) {
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
          type ===
          "checkbox"
            ? checked
            : value,
      })
    );
  }

  // ==========================================================
  // SAVE
  // ==========================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      setError("");
      setMessage("");

      const method =
        editingId
          ? "PUT"
          : "POST";

      const payload = {
        ...form,
      };

      if (editingId) {
        payload.addressId =
          editingId;
      }

      const response =
        await fetch(
          "/api/customer/addresses",
          {
            method,

            headers: {
              "Content-Type":
                "application/json",
            },

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

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to save address."
        );
      }

      setAddresses(
        result.addresses ||
          []
      );

      setMessage(
        result.message ||
          "Address saved."
      );

      closeForm();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to save address."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // SET DEFAULT
  // ==========================================================

  async function setDefault(
    addressId
  ) {
    try {
      setSaving(true);

      setError("");

      const response =
        await fetch(
          "/api/customer/addresses",
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                addressId,

                action:
                  "set-default",
              }),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to set default address."
        );
      }

      setAddresses(
        result.addresses ||
          []
      );

      setMessage(
        result.message
      );
    } catch (error) {
      setError(
        error?.message
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function deleteAddress(
    addressId
  ) {
    const confirmed =
      window.confirm(
        "Delete this saved address?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      setError("");

      const response =
        await fetch(
          "/api/customer/addresses",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                addressId,
              }),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to delete address."
        );
      }

      setAddresses(
        result.addresses ||
          []
      );

      setMessage(
        result.message
      );
    } catch (error) {
      setError(
        error?.message
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="customer-address-loading">
        <LoaderCircle
          size={25}
          className="craveo-spin"
        />

        Loading addresses...
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="customer-address-manager">
      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <div className="customer-address-error">
          {error}
        </div>
      )}

      {message && (
        <div className="customer-address-success">
          {message}
        </div>
      )}

      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="customer-address-toolbar">
        <div>
          <span>
            DELIVERY
          </span>

          <h2>
            Saved Addresses
          </h2>

          <p>
            Manage addresses used for
            your CRAVEO deliveries.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openAddForm
          }
        >
          <Plus
            size={16}
          />

          Add Address
        </button>
      </div>

      {/* ======================================================
          FORM
      ====================================================== */}

      {formOpen && (
        <section className="customer-address-form-card">
          <div className="customer-address-form-heading">
            <div>
              <span>
                {editingId
                  ? "EDIT ADDRESS"
                  : "NEW ADDRESS"}
              </span>

              <h3>
                {editingId
                  ? "Update Address"
                  : "Add Delivery Address"}
              </h3>
            </div>

            <button
              type="button"
              onClick={
                closeForm
              }
            >
              <X
                size={18}
              />
            </button>
          </div>

          <form
            className="customer-address-form"
            onSubmit={
              handleSubmit
            }
          >
            <div>
              <label>
                Address Label
              </label>

              <select
                name="label"
                value={
                  form.label
                }
                onChange={
                  handleChange
                }
              >
                <option value="Home">
                  Home
                </option>

                <option value="Work">
                  Work
                </option>

                <option value="Office">
                  Office
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label>
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={
                  form.fullName
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div>
              <label>
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                placeholder="03XX XXXXXXX"
                required
              />
            </div>

            <div>
              <label>
                City
              </label>

              <input
                type="text"
                name="city"
                value={
                  form.city
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="customer-address-full-field">
              <label>
                Area
              </label>

              <input
                type="text"
                name="area"
                value={
                  form.area
                }
                onChange={
                  handleChange
                }
                placeholder="Gulshan-e-Iqbal"
                required
              />
            </div>

            <div className="customer-address-full-field">
              <label>
                Complete Address
              </label>

              <textarea
                name="address"
                value={
                  form.address
                }
                onChange={
                  handleChange
                }
                rows={4}
                placeholder="House, street, block..."
                required
              />
            </div>

            <label className="customer-address-default-check">
              <input
                type="checkbox"
                name="isDefault"
                checked={
                  form.isDefault
                }
                onChange={
                  handleChange
                }
              />

              <span>
                Set as default delivery
                address
              </span>
            </label>

            <div className="customer-address-form-actions">
              <button
                type="button"
                onClick={
                  closeForm
                }
                className="customer-address-cancel"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving
                }
                className="customer-address-save"
              >
                {saving ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="craveo-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Check
                      size={16}
                    />

                    Save Address
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ======================================================
          ADDRESS GRID
      ====================================================== */}

      {addresses.length >
      0 ? (
        <div className="customer-address-grid">
          {addresses.map(
            (item) => (
              <article
                key={
                  item.id
                }
                className={`customer-address-card ${
                  item.isDefault
                    ? "default"
                    : ""
                }`}
              >
                {/* ============================================
                    TOP
                ============================================ */}

                <div className="customer-address-card-top">
                  <div className="customer-address-card-icon">
                    <Home
                      size={19}
                    />
                  </div>

                  <div>
                    <h3>
                      {
                        item.label
                      }
                    </h3>

                    {item.isDefault && (
                      <span>
                        <Star
                          size={11}
                          fill="currentColor"
                        />

                        Default
                      </span>
                    )}
                  </div>
                </div>

                {/* ============================================
                    INFO
                ============================================ */}

                <div className="customer-address-info">
                  <strong>
                    {
                      item.fullName
                    }
                  </strong>

                  <span>
                    {
                      item.phone
                    }
                  </span>

                  <p>
                    {[
                      item.address,
                      item.area,
                      item.city,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ", "
                      )}
                  </p>
                </div>

                {/* ============================================
                    ACTIONS
                ============================================ */}

                <div className="customer-address-actions">
                  {!item.isDefault && (
                    <button
                      type="button"
                      onClick={() =>
                        setDefault(
                          item.id
                        )
                      }
                      disabled={
                        saving
                      }
                    >
                      <Star
                        size={14}
                      />

                      Default
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(
                        item
                      )
                    }
                  >
                    <Edit3
                      size={14}
                    />

                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete"
                    onClick={() =>
                      deleteAddress(
                        item.id
                      )
                    }
                    disabled={
                      saving
                    }
                  >
                    <Trash2
                      size={14}
                    />

                    Delete
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      ) : (
        <div className="customer-address-empty">
          <MapPin
            size={42}
          />

          <h3>
            No saved addresses
          </h3>

          <p>
            Add your home, office or
            another delivery address.
          </p>

          <button
            type="button"
            onClick={
              openAddForm
            }
          >
            <Plus
              size={15}
            />

            Add Address
          </button>
        </div>
      )}
    </div>
  );
}