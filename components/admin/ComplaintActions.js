"use client";

// ============================================================
// CRAVEO - COMPLAINT ACTIONS
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  MessageSquareReply,
  RefreshCw,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function ComplaintActions({
  complaintId,
  currentStatus,
  currentPriority,
  currentReply = "",
}) {
  const router =
    useRouter();

  const [
    status,
    setStatus,
  ] = useState(
    currentStatus
  );

  const [
    priority,
    setPriority,
  ] = useState(
    currentPriority
  );

  const [
    adminReply,
    setAdminReply,
  ] = useState(
    currentReply
  );

  const [
    loading,
    setLoading,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
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
      return JSON.parse(text);
    } catch {
      return {
        success: false,
        message:
          `Invalid response. Status: ${response.status}`,
      };
    }
  }

  // ==========================================================
  // UPDATE
  // ==========================================================

  async function updateComplaint(
    payload,
    type
  ) {
    try {
      setLoading(type);

      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/complaints/${complaintId}`,
          {
            method: "PUT",

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
        await parseResponse(
          response
        );

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            "Unable to update complaint."
        );
      }

      setSuccess(
        result.message ||
          "Complaint updated."
      );

      router.refresh();
    } catch (error) {
      setError(
        error.message ||
          "Unable to update complaint."
      );
    } finally {
      setLoading("");
    }
  }

  // ==========================================================
  // SAVE REPLY
  // ==========================================================

  function saveReply() {
    if (!adminReply.trim()) {
      setError(
        "Please enter an admin reply."
      );

      return;
    }

    updateComplaint(
      {
        adminReply:
          adminReply.trim(),
      },
      "reply"
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="complaint-actions-panel">
      {/* ====================================================
          MESSAGES
      ==================================================== */}

      {error && (
        <div className="complaint-action-error">
          {error}
        </div>
      )}

      {success && (
        <div className="complaint-action-success">
          {success}
        </div>
      )}

      {/* ====================================================
          STATUS
      ==================================================== */}

      <div className="complaint-action-block">
        <div>
          <span>
            Complaint Status
          </span>

          <strong>
            Update resolution progress
          </strong>
        </div>

        <div className="complaint-action-row">
          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            disabled={
              loading !== ""
            }
          >
            <option value="open">
              Open
            </option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="resolved">
              Resolved
            </option>

            <option value="closed">
              Closed
            </option>
          </select>

          <button
            type="button"
            onClick={() =>
              updateComplaint(
                {
                  status,
                },
                "status"
              )
            }
            disabled={
              loading !== ""
            }
          >
            <RefreshCw
              size={15}
            />

            {loading ===
            "status"
              ? "Updating..."
              : "Update"}
          </button>
        </div>
      </div>

      {/* ====================================================
          PRIORITY
      ==================================================== */}

      <div className="complaint-action-block">
        <div>
          <span>
            Priority
          </span>

          <strong>
            Set complaint urgency
          </strong>
        </div>

        <div className="complaint-action-row">
          <select
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value
              )
            }
            disabled={
              loading !== ""
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

          <button
            type="button"
            onClick={() =>
              updateComplaint(
                {
                  priority,
                },
                "priority"
              )
            }
            disabled={
              loading !== ""
            }
          >
            <RefreshCw
              size={15}
            />

            {loading ===
            "priority"
              ? "Updating..."
              : "Update"}
          </button>
        </div>
      </div>

      {/* ====================================================
          ADMIN REPLY
      ==================================================== */}

      <div className="complaint-reply-block">
        <div className="complaint-reply-heading">
          <div>
            <span>
              Admin Reply
            </span>

            <strong>
              Reply to customer complaint
            </strong>
          </div>

          <MessageSquareReply
            size={19}
          />
        </div>

        <textarea
          rows="6"
          value={adminReply}
          onChange={(event) => {
            setAdminReply(
              event.target.value
            );

            setError("");
            setSuccess("");
          }}
          placeholder="Write your reply to the customer..."
          disabled={
            loading !== ""
          }
        />

        <button
          type="button"
          className="complaint-reply-save-btn"
          onClick={
            saveReply
          }
          disabled={
            loading !== ""
          }
        >
          <MessageSquareReply
            size={15}
          />

          {loading === "reply"
            ? "Saving Reply..."
            : "Save Reply"}
        </button>
      </div>
    </section>
  );
}