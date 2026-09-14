"use client";

// ============================================================
// CRAVEO - ORDER INVOICE / RECEIPT BUTTON
// ONLY PDF DOWNLOAD
// NO REORDER
// ============================================================

import {
  Download,
} from "lucide-react";

import {
  jsPDF,
} from "jspdf";

// ============================================================
// FORMAT MONEY
// ============================================================

function formatMoney(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// COMPONENT
// ============================================================

export default function OrderInvoiceButton({
  order,
}) {
  // ==========================================================
  // DOWNLOAD RECEIPT
  // ==========================================================

  function downloadInvoice() {
    const doc =
      new jsPDF({
        unit: "mm",
        format: "a4",
      });

    let y = 20;

    // ========================================================
    // BRAND
    // ========================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(24);

    doc.text(
      "CRAVEO",
      20,
      y
    );

    y += 8;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.text(
      "Food Delivery System",
      20,
      y
    );

    y += 13;

    // ========================================================
    // TITLE
    // ========================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(17);

    doc.text(
      "Order Receipt",
      20,
      y
    );

    y += 10;

    // ========================================================
    // ORDER DETAILS
    // ========================================================

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.text(
      `Order: ${
        order?.orderNumber ||
        "-"
      }`,
      20,
      y
    );

    y += 6;

    doc.text(
      `Branch: ${
        order?.branchName ||
        "-"
      }`,
      20,
      y
    );

    y += 6;

    doc.text(
      `Customer: ${
        order?.customerName ||
        "-"
      }`,
      20,
      y
    );

    y += 6;

    doc.text(
      `Phone: ${
        order?.customerPhone ||
        "-"
      }`,
      20,
      y
    );

    y += 6;

    doc.text(
      `Payment: ${
        order?.paymentMethod ||
        "-"
      }`,
      20,
      y
    );

    y += 6;

    doc.text(
      `Status: ${
        order?.status ||
        "-"
      }`,
      20,
      y
    );

    y += 10;

    // ========================================================
    // DIVIDER
    // ========================================================

    doc.line(
      20,
      y,
      190,
      y
    );

    y += 8;

    // ========================================================
    // ITEMS HEADER
    // ========================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Item",
      20,
      y
    );

    doc.text(
      "Qty",
      125,
      y
    );

    doc.text(
      "Amount",
      155,
      y
    );

    y += 7;

    // ========================================================
    // ITEMS
    // ========================================================

    doc.setFont(
      "helvetica",
      "normal"
    );

    const items =
      Array.isArray(
        order?.items
      )
        ? order.items
        : [];

    items.forEach(
      (item) => {
        let name =
          item.name ||
          "Food";

        if (
          item.variantName
        ) {
          name += ` (${item.variantName})`;
        }

        const wrappedName =
          doc.splitTextToSize(
            name,
            90
          );

        doc.text(
          wrappedName,
          20,
          y
        );

        doc.text(
          String(
            item.quantity ||
              0
          ),
          128,
          y
        );

        doc.text(
          formatMoney(
            item.lineTotal
          ),
          155,
          y
        );

        y +=
          Math.max(
            7,
            wrappedName.length *
              5
          );

        if (y > 250) {
          doc.addPage();

          y = 20;
        }
      }
    );

    y += 4;

    // ========================================================
    // DIVIDER
    // ========================================================

    doc.line(
      20,
      y,
      190,
      y
    );

    y += 8;

    // ========================================================
    // TOTALS
    // ========================================================

    doc.text(
      "Subtotal:",
      125,
      y
    );

    doc.text(
      formatMoney(
        order?.subtotal
      ),
      155,
      y
    );

    y += 7;

    doc.text(
      "Delivery:",
      125,
      y
    );

    doc.text(
      formatMoney(
        order?.deliveryFee
      ),
      155,
      y
    );

    y += 7;

    if (
      Number(
        order?.discount ||
          0
      ) > 0
    ) {
      doc.text(
        "Discount:",
        125,
        y
      );

      doc.text(
        `- ${formatMoney(
          order.discount
        )}`,
        155,
        y
      );

      y += 7;
    }

    // ========================================================
    // FINAL TOTAL
    // ========================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(13);

    doc.text(
      "Total:",
      125,
      y
    );

    doc.text(
      formatMoney(
        order?.total
      ),
      155,
      y
    );

    y += 14;

    // ========================================================
    // DELIVERY ADDRESS
    // ========================================================

    doc.setFontSize(11);

    doc.text(
      "Delivery Address",
      20,
      y
    );

    y += 7;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    const address = [
      order
        ?.deliveryAddress
        ?.address,

      order
        ?.deliveryAddress
        ?.area,

      order
        ?.deliveryAddress
        ?.city,
    ]
      .filter(Boolean)
      .join(", ");

    const wrappedAddress =
      doc.splitTextToSize(
        address || "-",
        160
      );

    doc.text(
      wrappedAddress,
      20,
      y
    );

    y +=
      wrappedAddress.length *
        5 +
      12;

    // ========================================================
    // FOOTER
    // ========================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "Thank you for ordering with CRAVEO!",
      20,
      y
    );

    // ========================================================
    // SAVE
    // ========================================================

    doc.save(
      `CRAVEO-${
        order?.orderNumber ||
        "receipt"
      }.pdf`
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <button
      type="button"
      className="customer-order-invoice-btn"
      onClick={
        downloadInvoice
      }
    >
      <Download
        size={16}
      />

      Download Receipt
    </button>
  );
}