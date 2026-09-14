"use client";

// ============================================================
// CRAVEO - SUPER ADMIN PRINT ORDER BUTTON
// ============================================================

import {
  Printer,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function PrintOrderButton() {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      type="button"
      onClick={
        handlePrint
      }
      className="branch-print-now-btn"
    >
      <Printer
        size={16}
      />

      Print Order
    </button>
  );
}