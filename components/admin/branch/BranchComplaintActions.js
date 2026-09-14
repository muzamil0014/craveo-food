"use client";

// ============================================================
// CRAVEO - BRANCH COMPLAINT ACTIONS
// ============================================================

import { useState } from "react";

import {
  MessageSquareReply,
  Save,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function BranchComplaintActions({
  complaintId,
  initialStatus,
  initialPriority,
  initialReply,
}) {
  const [status, setStatus] =
    useState(
      initialStatus
    );

  const [priority, setPriority] =
    useState(
      initialPriority
    );

  const [adminReply, setAdminReply] =
    useState(
      initialReply
    );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // ==========================================================
  // SAVE
  // ==========================================================

  async function handleSave() {
    try {
      setLoading(true);
      setMessage("");

      const response =
        await fetch(
          `/api/admin/branch/complaints/${complaintId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status,
                priority,
                adminReply,
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
            "Unable to update complaint."
        );
      }

      setMessage(
        "Complaint updated successfully."
      );
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to update complaint."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="branch-detail-card">
      <div className="branch-detail-heading">
        <MessageSquareReply
          size={18}
        />

        <div>
          <span>
            MANAGEMENT
          </span>

          <h2>
            Manage Complaint
          </h2>
        </div>
      </div>

      <div className="branch-complaint-form">
        <div>
          <label>
            Status
          </label>

          <select
            value={status}
            onChange={(
              event
            ) =>
              setStatus(
                event.target.value
              )
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
        </div>

        <div>
          <label>
            Priority
          </label>

          <select
            value={priority}
            onChange={(
              event
            ) =>
              setPriority(
                event.target.value
              )
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

        <div>
          <label>
            Branch Admin Reply
          </label>

          <textarea
            rows="6"
            value={
              adminReply
            }
            onChange={(
              event
            ) =>
              setAdminReply(
                event.target.value
              )
            }
            placeholder="Write your reply..."
          />
        </div>

        <button
          type="button"
          onClick={
            handleSave
          }
          disabled={
            loading
          }
        >
          <Save size={15} />

          {loading
            ? "Saving..."
            : "Save Complaint"}
        </button>

        {message && (
          <small>
            {message}
          </small>
        )}
      </div>
    </article>
  );
}