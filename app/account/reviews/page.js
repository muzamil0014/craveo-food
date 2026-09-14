// ============================================================
// CRAVEO - CUSTOMER MY REVIEWS PAGE
// ============================================================

import {
  redirect,
} from "next/navigation";

import {
  MessageSquare,
} from "lucide-react";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CustomerReviewsManager from "@/components/customer/CustomerReviewsManager";

import "../../store.css";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// PAGE
// ============================================================

export default async function CustomerReviewsPage({
  searchParams,
}) {
  // ==========================================================
  // AUTH
  // ==========================================================

  const session =
    await getCustomerSession();

  if (!session?.userId) {
    redirect(
      "/login"
    );
  }

  // ==========================================================
  // OPTIONAL FOOD FILTER
  // ==========================================================

  const resolvedSearchParams =
    await searchParams;

  const foodId =
    resolvedSearchParams
      ?.foodId
      ?.toString()
      .trim() || "";

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="customer-reviews-page">
        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <section className="customer-reviews-page-header">
          <div>
            <span>
              MY CRAVEO
            </span>

            <h1>
              My Reviews
            </h1>

            <p>
              Review foods from your
              delivered orders and manage
              your previous reviews.
            </p>
          </div>

          <div className="customer-reviews-header-icon">
            <MessageSquare
              size={27}
            />
          </div>
        </section>

        {/* ====================================================
            REVIEW MANAGER
        ==================================================== */}

        <CustomerReviewsManager
          initialFoodId={
            foodId
          }
        />
      </main>

      <CustomerFooter />
    </>
  );
}