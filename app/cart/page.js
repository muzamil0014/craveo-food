// ============================================================
// CRAVEO - CUSTOMER CART PAGE
// ============================================================

import {
  redirect,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Restaurant from "@/models/Restaurant";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CartPageClient from "@/components/customer/CartPageClient";

import "../store.css";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

// ============================================================
// PAGE
// ============================================================

export default async function CartPage() {
  // ==========================================================
  // LOGIN
  // ==========================================================

  const session =
    await getCustomerSession();

  if (!session) {
    redirect(
      "/login"
    );
  }

  await connectDB();

  // ==========================================================
  // CUSTOMER
  // ==========================================================

  const user =
    await User.findOne({
      _id:
        session.userId,

      role:
        "customer",

      isActive:
        true,
    })
      .select(
        "selectedRestaurantId"
      )
      .lean();

  if (
    !user ||
    !user.selectedRestaurantId
  ) {
    redirect(
      "/select-branch"
    );
  }

  // ==========================================================
  // BRANCH
  // ==========================================================

  const branch =
    await Restaurant.findOne({
      _id:
        user.selectedRestaurantId,

      isActive:
        true,
    })
      .select(
        "_id name"
      )
      .lean();

  if (!branch) {
    redirect(
      "/select-branch"
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="customer-cart-page">
        <section className="customer-cart-page-header">
          <span>
            YOUR CRAVEO ORDER
          </span>

          <h1>
            Shopping Cart
          </h1>

          <p>
            Your cart is locked to{" "}
            <strong>
              {branch.name}
            </strong>
            .
          </p>
        </section>

        <CartPageClient />
      </main>

      <CustomerFooter />
    </>
  );
}