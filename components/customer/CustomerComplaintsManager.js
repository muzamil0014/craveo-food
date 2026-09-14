"use client";

// ============================================================
// CRAVEO - CUSTOMER COMPLAINTS MANAGER
// CREATE + TRACK SUPPORT REQUESTS
// ============================================================

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Headphones,
  LoaderCircle,
  MessageSquare,
  Package,
  Send,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

// ============================================================
// SAFE RESPONSE
// ============================================================

async function getResponse(
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
// FORMAT DATE
// ============================================================

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-PK",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    new Date(value)
  );
}

// ============================================================
// STATUS LABEL
// ============================================================

function getStatusLabel(
  status
) {
  if (
    status ===
    "in-progress"
  ) {
    return "In Progress";
  }

  if (
    status ===
    "resolved"
  ) {
    return "Resolved";
  }

  if (
    status ===
    "closed"
  ) {
    return "Closed";
  }

  return "Pending";
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CustomerComplaintsManager() {
  // ==========================================================
  // DATA
  // ==========================================================

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    orders,
    setOrders,
  ] = useState([]);

  // ==========================================================
  // UI
  // ==========================================================

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
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  // ==========================================================
  // MESSAGES
  // ==========================================================

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  // ==========================================================
  // FORM
  // ==========================================================

  const [
    form,
    setForm,
  ] = useState({
    category:
      "general",

    subject:
      "",

    message:
      "",

    priority:
      "medium",

    orderId:
      "",
  });

  // ==========================================================
  // LOAD
  // ==========================================================

  async function loadComplaints() {
    try {
      setLoading(true);

      setError("");

      const response =
        await fetch(
          "/api/customer/complaints",
          {
            cache:
              "no-store",
          }
        );

      const result =
        await getResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to load complaints."
        );
      }

      setComplaints(
        Array.isArray(
          result.complaints
        )
          ? result.complaints
          : []
      );

      setOrders(
        Array.isArray(
          result.orders
        )
          ? result.orders
          : []
      );
    } catch (error) {
      setError(
        error?.message ||
          "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // FIRST LOAD
  // ==========================================================

  useEffect(() => {
    loadComplaints();
  }, []);

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
  }

  // ==========================================================
  // OPEN FORM
  // ==========================================================

  function openForm() {
    setFormOpen(
      true
    );

    setSelectedComplaint(
      null
    );

    setError("");
    setMessage("");
  }

  // ==========================================================
  // CLOSE FORM
  // ==========================================================

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(
      false
    );
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      setError("");
      setMessage("");

      const response =
        await fetch(
          "/api/customer/complaints",
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
        await getResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to submit complaint."
        );
      }

      setMessage(
        `${result.message} Reference: ${result.complaint?.complaintNumber || ""}`
      );

      setForm({
        category:
          "general",

        subject:
          "",

        message:
          "",

        priority:
          "medium",

        orderId:
          "",
      });

      setFormOpen(
        false
      );

      await loadComplaints();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to submit complaint."
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
      <div className="customer-support-loading">
        <LoaderCircle
          size={25}
          className="craveo-spin"
        />

        Loading support requests...
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="customer-support-manager">
      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <div className="customer-support-error">
          {error}
        </div>
      )}

      {message && (
        <div className="customer-support-success">
          {message}
        </div>
      )}

      {/* ======================================================
          TOP ACTION
      ====================================================== */}

      <div className="customer-support-toolbar">
        <div>
          <span>
            SUPPORT CENTER
          </span>

          <h2>
            Your Requests
          </h2>

          <p>
            Create and track customer
            support requests.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openForm
          }
        >
          <MessageSquare
            size={16}
          />

          New Complaint
        </button>
      </div>

      {/* ======================================================
          CREATE FORM
      ====================================================== */}

      {formOpen && (
        <section className="customer-support-form-card">
          <div className="customer-support-form-heading">
            <div>
              <span>
                CONTACT CRAVEO
              </span>

              <h3>
                Submit Support Request
              </h3>
            </div>

            <button
              type="button"
              onClick={
                closeForm
              }
              className="customer-support-close-btn"
            >
              <XCircle
                size={19}
              />
            </button>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="customer-support-form"
          >
            {/* ================================================
                CATEGORY
            ================================================ */}

            <div>
              <label>
                Category
              </label>

              <select
                name="category"
                value={
                  form.category
                }
                onChange={
                  handleChange
                }
              >
                <option value="general">
                  General
                </option>

                <option value="order">
                  Order
                </option>

                <option value="delivery">
                  Delivery
                </option>

                <option value="food">
                  Food
                </option>

                <option value="payment">
                  Payment
                </option>

                <option value="refund">
                  Refund
                </option>

                <option value="account">
                  Account
                </option>

                <option value="branch">
                  Branch
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            {/* ================================================
                PRIORITY
            ================================================ */}

            <div>
              <label>
                Priority
              </label>

              <select
                name="priority"
                value={
                  form.priority
                }
                onChange={
                  handleChange
                }
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="urgent">
                  Urgent
                </option>
              </select>
            </div>

            {/* ================================================
                ORDER
            ================================================ */}

            <div className="customer-support-field-full">
              <label>
                Related Order
                (Optional)
              </label>

              <select
                name="orderId"
                value={
                  form.orderId
                }
                onChange={
                  handleChange
                }
              >
                <option value="">
                  No specific order
                </option>

                {orders.map(
                  (
                    order
                  ) => (
                    <option
                      key={
                        order.id
                      }
                      value={
                        order.id
                      }
                    >
                      {order.orderNumber} —{" "}
                      {order.status}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ================================================
                SUBJECT
            ================================================ */}

            <div className="customer-support-field-full">
              <label>
                Subject
              </label>

              <input
                type="text"
                name="subject"
                value={
                  form.subject
                }
                onChange={
                  handleChange
                }
                maxLength={
                  150
                }
                required
                placeholder="Briefly describe the issue"
              />
            </div>

            {/* ================================================
                MESSAGE
            ================================================ */}

            <div className="customer-support-field-full">
              <label>
                Message
              </label>

              <textarea
                name="message"
                value={
                  form.message
                }
                onChange={
                  handleChange
                }
                rows={6}
                maxLength={
                  2000
                }
                required
                placeholder="Explain your problem in detail..."
              />
            </div>

            {/* ================================================
                SUBMIT
            ================================================ */}

            <div className="customer-support-form-actions">
              <button
                type="button"
                onClick={
                  closeForm
                }
                className="customer-support-cancel"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving
                }
                className="customer-support-submit"
              >
                {saving ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="craveo-spin"
                    />

                    Submitting...
                  </>
                ) : (
                  <>
                    <Send
                      size={16}
                    />

                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ======================================================
          COMPLAINT LIST
      ====================================================== */}

      {complaints.length >
      0 ? (
        <div className="customer-support-list">
          {complaints.map(
            (
              complaint
            ) => (
              <article
                key={
                  complaint.id
                }
                className="customer-support-card"
              >
                {/* ============================================
                    HEADER
                ============================================ */}

                <div className="customer-support-card-header">
                  <div>
                    <span>
                      {
                        complaint.complaintNumber
                      }
                    </span>

                    <h3>
                      {
                        complaint.subject
                      }
                    </h3>

                    <small>
                      {formatDate(
                        complaint.createdAt
                      )}
                    </small>
                  </div>

                  <span
                    className={`customer-support-status ${complaint.status}`}
                  >
                    {getStatusLabel(
                      complaint.status
                    )}
                  </span>
                </div>

                {/* ============================================
                    META
                ============================================ */}

                <div className="customer-support-meta">
                  <span>
                    <strong>
                      Category
                    </strong>

                    {
                      complaint.category
                    }
                  </span>

                  <span>
                    <strong>
                      Priority
                    </strong>

                    {
                      complaint.priority
                    }
                  </span>

                  <span>
                    <strong>
                      Branch
                    </strong>

                    {complaint.branchName ||
                      "-"}
                  </span>

                  <span>
                    <strong>
                      Order
                    </strong>

                    {complaint.orderNumber ||
                      "-"}
                  </span>
                </div>

                {/* ============================================
                    MESSAGE
                ============================================ */}

                <div className="customer-support-message">
                  <strong>
                    Your Message
                  </strong>

                  <p>
                    {
                      complaint.message
                    }
                  </p>
                </div>

                {/* ============================================
                    ADMIN RESPONSE
                ============================================ */}

                {complaint.adminReply && (
                  <div className="customer-support-admin-reply">
                    <div>
                      <Headphones
                        size={16}
                      />

                      <strong>
                        CRAVEO Support
                      </strong>
                    </div>

                    <p>
                      {
                        complaint.adminReply
                      }
                    </p>
                  </div>
                )}

                {/* ============================================
                    STATUS INFO
                ============================================ */}

                <div className="customer-support-card-footer">
                  <div>
                    {complaint.status ===
                      "pending" && (
                      <Clock3
                        size={15}
                      />
                    )}

                    {complaint.status ===
                      "in-progress" && (
                      <AlertCircle
                        size={15}
                      />
                    )}

                    {complaint.status ===
                      "resolved" && (
                      <CheckCircle2
                        size={15}
                      />
                    )}

                    {complaint.status ===
                      "closed" && (
                      <XCircle
                        size={15}
                      />
                    )}

                    <span>
                      {getStatusLabel(
                        complaint.status
                      )}
                    </span>
                  </div>

                  {complaint.orderNumber && (
                    <span>
                      <Package
                        size={14}
                      />

                      {
                        complaint.orderNumber
                      }
                    </span>
                  )}
                </div>
              </article>
            )
          )}
        </div>
      ) : (
        <div className="customer-support-empty">
          <Headphones
            size={42}
          />

          <h3>
            No support requests
          </h3>

          <p>
            If you have any problem with
            an order, delivery, payment
            or account, create a support
            request.
          </p>

          <button
            type="button"
            onClick={
              openForm
            }
          >
            Create Request
          </button>
        </div>
      )}
    </div>
  );
}