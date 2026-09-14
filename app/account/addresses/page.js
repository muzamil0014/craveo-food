// ============================================================
// CRAVEO - CUSTOMER SAVED ADDRESSES PAGE
// ============================================================

import {
  redirect,
} from "next/navigation";

import {
  MapPin,
} from "lucide-react";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CustomerAddressesManager from "@/components/customer/CustomerAddressesManager";

import "../../store.css";

// ============================================================
// FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// PAGE
// ============================================================

export default async function AddressesPage() {
  const session =
    await getCustomerSession();

  if (!session?.userId) {
    redirect(
      "/login"
    );
  }

  return (
    <>
      <CustomerNavbar />

      <main className="customer-address-page">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <section className="customer-address-page-header">
          <div>
            <span>
              MY CRAVEO
            </span>

            <h1>
              Saved Addresses
            </h1>

            <p>
              Manage your delivery
              locations for faster
              checkout.
            </p>
          </div>

          <div>
            <MapPin
              size={28}
            />
          </div>
        </section>

        {/* ====================================================
            ADDRESS MANAGER
        ==================================================== */}

        <CustomerAddressesManager />
      </main>

      <CustomerFooter />
    </>
  );
}