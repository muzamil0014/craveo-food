// ============================================================
// CRAVEO - CUSTOMER SUPPORT / COMPLAINTS PAGE
// ============================================================

import {
  redirect,
} from "next/navigation";

import {
  Headphones,
} from "lucide-react";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CustomerComplaintsManager from "@/components/customer/CustomerComplaintsManager";

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

export default async function CustomerComplaintsPage() {
  // ==========================================================
  // LOGIN
  // ==========================================================

  const session =
    await getCustomerSession();

  if (!session?.userId) {
    redirect(
      "/login"
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="customer-support-page">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <section className="customer-support-page-header">
          <div>
            <span>
              CRAVEO SUPPORT
            </span>

            <h1>
              Help & Complaints
            </h1>

            <p>
              Send a support request and
              track responses from the
              CRAVEO support team.
            </p>
          </div>

          <div className="customer-support-header-icon">
            <Headphones
              size={28}
            />
          </div>
        </section>

        {/* ====================================================
            MANAGER
        ==================================================== */}

        <CustomerComplaintsManager />
      </main>

      <CustomerFooter />
    </>
  );
}