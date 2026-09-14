// ============================================================
// CRAVEO - CUSTOMER SECURITY PAGE
// ============================================================

import {
  redirect,
} from "next/navigation";

import {
  ShieldCheck,
} from "lucide-react";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CustomerSecurityForm from "@/components/customer/CustomerSecurityForm";

import "../../store.css";

// ============================================================
// FORCE FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// PAGE
// ============================================================

export default async function CustomerSecurityPage() {
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
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="customer-security-page">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <section className="customer-security-page-header">
          <div>
            <span>
              MY CRAVEO
            </span>

            <h1>
              Account Security
            </h1>

            <p>
              Manage your password and
              keep your CRAVEO account
              protected.
            </p>
          </div>

          <div className="customer-security-page-icon">
            <ShieldCheck
              size={29}
            />
          </div>
        </section>

        {/* ====================================================
            SECURITY FORM
        ==================================================== */}

        <CustomerSecurityForm />
      </main>

      <CustomerFooter />
    </>
  );
}